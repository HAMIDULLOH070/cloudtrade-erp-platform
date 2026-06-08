"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let OrdersService = class OrdersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAllOrders(query) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;
        const where = {};
        if (query.status) {
            where.status = query.status;
        }
        if (query.search) {
            where.OR = [
                { orderNumber: { contains: query.search } },
                { customer: { name: { contains: query.search } } },
            ];
        }
        const [items, total] = await Promise.all([
            this.prisma.order.findMany({
                where,
                include: { customer: true, items: { include: { product: true } } },
                skip,
                take: limit,
                orderBy: { orderDate: 'desc' },
            }),
            this.prisma.order.count({ where }),
        ]);
        return {
            items,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findOneOrder(id) {
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: {
                customer: true,
                items: { include: { product: true } },
                invoices: true,
            },
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        return order;
    }
    async createOrder(data, userId) {
        if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
            throw new common_1.BadRequestException("Buyurtma uchun kamida bitta mahsulot tanlanishi kerak (Items array is required and cannot be empty).");
        }
        const customer = await this.prisma.customer.findUnique({
            where: { id: data.customerId },
        });
        if (!customer)
            throw new common_1.NotFoundException('Customer not found');
        const latestOrder = await this.prisma.order.findFirst({
            orderBy: { createdAt: 'desc' },
        });
        let nextNum = 7001;
        if (latestOrder && latestOrder.orderNumber.startsWith('SO-')) {
            const lastNum = parseInt(latestOrder.orderNumber.replace('SO-', ''), 10);
            if (!isNaN(lastNum)) {
                nextNum = lastNum + 1;
            }
        }
        const orderNumber = `SO-${nextNum}`;
        let subtotal = 0;
        for (const item of data.items) {
            const product = await this.prisma.product.findUnique({
                where: { id: item.productId },
            });
            if (!product)
                throw new common_1.NotFoundException(`Product ${item.productId} not found`);
            subtotal += product.price * item.quantity;
        }
        const discount = data.discount !== undefined ? Number(data.discount) : 0;
        const tax = Math.round((subtotal - discount) * 0.12 * 100) / 100;
        const finalTotal = Math.round((subtotal - discount + tax) * 100) / 100;
        const order = await this.prisma.$transaction(async (tx) => {
            const createdOrder = await tx.order.create({
                data: {
                    orderNumber,
                    customerId: data.customerId,
                    status: data.status || 'PENDING',
                    subtotal: Math.round(subtotal * 100) / 100,
                    discount: Math.round(discount * 100) / 100,
                    tax: Math.round(tax * 100) / 100,
                    totalAmount: finalTotal,
                    items: {
                        create: data.items.map((item) => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            price: item.price,
                        })),
                    },
                },
                include: { items: true },
            });
            if (data.status === 'COMPLETED') {
                await this.completeSalesOrderOperations(tx, createdOrder, data.items, customer.id, userId);
            }
            return createdOrder;
        });
        return order;
    }
    async updateOrder(id, data, userId) {
        const existingOrder = await this.prisma.order.findUnique({
            where: { id },
            include: { items: true, customer: true },
        });
        if (!existingOrder)
            throw new common_1.NotFoundException('Order not found');
        if (existingOrder.status === 'COMPLETED') {
            throw new common_1.BadRequestException('Cannot modify a completed order');
        }
        const order = await this.prisma.$transaction(async (tx) => {
            const updatedOrder = await tx.order.update({
                where: { id },
                data: {
                    status: data.status,
                },
                include: { items: true },
            });
            if (existingOrder.status !== 'COMPLETED' && data.status === 'COMPLETED') {
                const items = existingOrder.items.map((i) => ({
                    productId: i.productId,
                    quantity: i.quantity,
                    price: i.price,
                }));
                await this.completeSalesOrderOperations(tx, updatedOrder, items, existingOrder.customerId, userId);
            }
            return updatedOrder;
        });
        return order;
    }
    async completeSalesOrderOperations(tx, order, items, customerId, userId) {
        for (const item of items) {
            const product = await tx.product.findUnique({
                where: { id: item.productId },
            });
            let zone = 'ZONE-A';
            if (product.category === 'Jeans')
                zone = 'ZONE-B';
            else if (product.category === 'Jackets' || product.category === 'Hoodies')
                zone = 'ZONE-C';
            else if (product.category === 'Shirts')
                zone = 'ZONE-D';
            await tx.product.update({
                where: { id: item.productId },
                data: { quantityInStock: { decrement: item.quantity } },
            });
            await tx.inventoryMovement.create({
                data: {
                    productId: item.productId,
                    quantity: item.quantity,
                    type: 'OUTGOING',
                    fromZone: zone,
                    referenceId: order.id,
                    userId,
                },
            });
        }
        const latestInvoice = await tx.invoice.findFirst({
            orderBy: { createdAt: 'desc' },
        });
        let nextInvoiceNum = 5001;
        if (latestInvoice && latestInvoice.invoiceNumber.startsWith('INV-')) {
            const lastInvoiceNum = parseInt(latestInvoice.invoiceNumber.replace('INV-', ''), 10);
            if (!isNaN(lastInvoiceNum)) {
                nextInvoiceNum = lastInvoiceNum + 1;
            }
        }
        const invoiceNumber = `INV-${nextInvoiceNum}`;
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30);
        await tx.invoice.create({
            data: {
                invoiceNumber,
                orderId: order.id,
                amount: order.totalAmount,
                status: 'UNPAID',
                dueDate,
            },
        });
        await tx.customer.update({
            where: { id: customerId },
            data: { debt: { increment: order.totalAmount } },
        });
    }
    async findAllPurchaseOrders(query) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;
        const where = {};
        if (query.status) {
            where.status = query.status;
        }
        if (query.search) {
            where.OR = [
                { poNumber: { contains: query.search } },
                { supplier: { name: { contains: query.search } } },
            ];
        }
        const [items, total] = await Promise.all([
            this.prisma.purchaseOrder.findMany({
                where,
                include: { supplier: true, items: { include: { product: true } } },
                skip,
                take: limit,
                orderBy: { poDate: 'desc' },
            }),
            this.prisma.purchaseOrder.count({ where }),
        ]);
        return {
            items,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findOnePurchaseOrder(id) {
        const po = await this.prisma.purchaseOrder.findUnique({
            where: { id },
            include: {
                supplier: true,
                items: { include: { product: true } },
            },
        });
        if (!po)
            throw new common_1.NotFoundException('Purchase order not found');
        return po;
    }
    async createPurchaseOrder(data, userId) {
        if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
            throw new common_1.BadRequestException("Xarid buyurtmasi uchun kamida bitta mahsulot tanlanishi kerak (Items array is required and cannot be empty).");
        }
        const supplier = await this.prisma.supplier.findUnique({
            where: { id: data.supplierId },
        });
        if (!supplier)
            throw new common_1.NotFoundException('Supplier not found');
        const latestPO = await this.prisma.purchaseOrder.findFirst({
            orderBy: { createdAt: 'desc' },
        });
        let nextPoNum = 4001;
        if (latestPO && latestPO.poNumber.startsWith('PO-')) {
            const lastPoNum = parseInt(latestPO.poNumber.replace('PO-', ''), 10);
            if (!isNaN(lastPoNum)) {
                nextPoNum = lastPoNum + 1;
            }
        }
        const poNumber = `PO-${nextPoNum}`;
        let totalAmount = 0;
        for (const item of data.items) {
            const product = await this.prisma.product.findUnique({
                where: { id: item.productId },
            });
            if (!product)
                throw new common_1.NotFoundException(`Product ${item.productId} not found`);
            totalAmount += product.cost * item.quantity;
        }
        const po = await this.prisma.$transaction(async (tx) => {
            const createdPO = await tx.purchaseOrder.create({
                data: {
                    poNumber,
                    supplierId: data.supplierId,
                    status: data.status || 'PENDING',
                    totalAmount: Math.round(totalAmount * 100) / 100,
                    items: {
                        create: data.items.map((item) => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            cost: item.cost,
                        })),
                    },
                },
                include: { items: true },
            });
            if (data.status === 'RECEIVED') {
                await this.receivePurchaseOrderOperations(tx, createdPO, data.items, userId);
            }
            return createdPO;
        });
        return po;
    }
    async updatePurchaseOrder(id, data, userId) {
        const existingPO = await this.prisma.purchaseOrder.findUnique({
            where: { id },
            include: { items: true },
        });
        if (!existingPO)
            throw new common_1.NotFoundException('Purchase order not found');
        if (existingPO.status === 'RECEIVED') {
            throw new common_1.BadRequestException('Cannot modify a received purchase order');
        }
        const po = await this.prisma.$transaction(async (tx) => {
            const updatedPO = await tx.purchaseOrder.update({
                where: { id },
                data: {
                    status: data.status,
                },
                include: { items: true },
            });
            if (existingPO.status !== 'RECEIVED' && data.status === 'RECEIVED') {
                const items = existingPO.items.map((i) => ({
                    productId: i.productId,
                    quantity: i.quantity,
                    cost: i.cost,
                }));
                await this.receivePurchaseOrderOperations(tx, updatedPO, items, userId);
            }
            return updatedPO;
        });
        return po;
    }
    async receivePurchaseOrderOperations(tx, po, items, userId) {
        for (const item of items) {
            const product = await tx.product.findUnique({
                where: { id: item.productId },
            });
            let zone = 'ZONE-A';
            if (product.category === 'Jeans')
                zone = 'ZONE-B';
            else if (product.category === 'Jackets' || product.category === 'Hoodies')
                zone = 'ZONE-C';
            else if (product.category === 'Shirts')
                zone = 'ZONE-D';
            await tx.product.update({
                where: { id: item.productId },
                data: { quantityInStock: { increment: item.quantity } },
            });
            await tx.inventoryMovement.create({
                data: {
                    productId: item.productId,
                    quantity: item.quantity,
                    type: 'INCOMING',
                    toZone: zone,
                    referenceId: po.id,
                    userId,
                },
            });
        }
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map