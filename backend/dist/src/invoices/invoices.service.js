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
exports.InvoicesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let InvoicesService = class InvoicesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAllInvoices(query) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;
        const where = {};
        if (query.status) {
            where.status = query.status;
        }
        if (query.search) {
            where.OR = [
                { invoiceNumber: { contains: query.search } },
                { order: { orderNumber: { contains: query.search } } },
                { order: { customer: { name: { contains: query.search } } } },
            ];
        }
        const [items, total] = await Promise.all([
            this.prisma.invoice.findMany({
                where,
                include: { order: { include: { customer: true } }, payments: true },
                skip,
                take: limit,
                orderBy: { issuedDate: 'desc' },
            }),
            this.prisma.invoice.count({ where }),
        ]);
        return {
            items,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findOneInvoice(id) {
        const invoice = await this.prisma.invoice.findUnique({
            where: { id },
            include: {
                order: {
                    include: { customer: true, items: { include: { product: true } } },
                },
                payments: true,
            },
        });
        if (!invoice)
            throw new common_1.NotFoundException('Invoice not found');
        return invoice;
    }
    async recordPayment(invoiceId, data) {
        const invoice = await this.prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: { order: { include: { customer: true } } },
        });
        if (!invoice)
            throw new common_1.NotFoundException('Invoice not found');
        if (invoice.status === 'PAID')
            throw new common_1.BadRequestException('Invoice is already paid');
        if (data.amount === undefined || isNaN(Number(data.amount))) {
            throw new common_1.BadRequestException("To'lov miqdori to'g'ri raqam bo'lishi shart.");
        }
        const paymentAmount = Number(data.amount);
        if (paymentAmount <= 0)
            throw new common_1.BadRequestException("To'lov miqdori 0 dan katta bo'lishi shart.");
        const result = await this.prisma.$transaction(async (tx) => {
            const latestPayment = await tx.payment.findFirst({
                orderBy: { createdAt: 'desc' },
            });
            let nextPaymentNum = 3001;
            if (latestPayment && latestPayment.paymentNumber.startsWith('PAY-')) {
                const lastPaymentNum = parseInt(latestPayment.paymentNumber.replace('PAY-', ''), 10);
                if (!isNaN(lastPaymentNum)) {
                    nextPaymentNum = lastPaymentNum + 1;
                }
            }
            const paymentNumber = `PAY-${nextPaymentNum}`;
            const payment = await tx.payment.create({
                data: {
                    paymentNumber,
                    invoiceId,
                    amount: paymentAmount,
                    paymentMethod: data.paymentMethod || 'Bank Transfer',
                    reference: data.reference,
                },
            });
            const updatedInvoice = await tx.invoice.update({
                where: { id: invoiceId },
                data: {
                    status: 'PAID',
                },
            });
            await tx.customer.update({
                where: { id: invoice.order.customer.id },
                data: {
                    debt: { decrement: paymentAmount },
                },
            });
            return payment;
        });
        return result;
    }
    async findAllPayments(query) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            this.prisma.payment.findMany({
                include: {
                    invoice: { include: { order: { include: { customer: true } } } },
                },
                skip,
                take: limit,
                orderBy: { paymentDate: 'desc' },
            }),
            this.prisma.payment.count(),
        ]);
        return {
            items,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findAllExpenses(query) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;
        const where = {};
        if (query.category) {
            where.category = query.category;
        }
        const [items, total] = await Promise.all([
            this.prisma.expense.findMany({
                where,
                skip,
                take: limit,
                orderBy: { date: 'desc' },
            }),
            this.prisma.expense.count({ where }),
        ]);
        return {
            items,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async createExpense(data) {
        if (data.amount === undefined || isNaN(Number(data.amount))) {
            throw new common_1.BadRequestException("Xarajat miqdori to'g'ri raqam bo'lishi shart.");
        }
        return this.prisma.expense.create({
            data: {
                title: data.title,
                category: data.category,
                amount: Number(data.amount),
                description: data.description,
                date: data.date ? new Date(data.date) : new Date(),
            },
        });
    }
};
exports.InvoicesService = InvoicesService;
exports.InvoicesService = InvoicesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InvoicesService);
//# sourceMappingURL=invoices.service.js.map