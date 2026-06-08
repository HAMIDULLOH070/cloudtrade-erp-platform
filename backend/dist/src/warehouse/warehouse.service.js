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
exports.WarehouseService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let WarehouseService = class WarehouseService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getZones() {
        return this.prisma.warehouseZone.findMany({
            orderBy: { code: 'asc' },
        });
    }
    async getMovements(query) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;
        const where = {};
        if (query.type) {
            where.type = query.type;
        }
        if (query.productId) {
            where.productId = query.productId;
        }
        const [items, total] = await Promise.all([
            this.prisma.inventoryMovement.findMany({
                where,
                include: {
                    product: true,
                    user: {
                        select: { firstName: true, lastName: true, email: true },
                    },
                },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.inventoryMovement.count({ where }),
        ]);
        return {
            items,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async getLowStockAlerts() {
        return this.prisma.product.findMany({
            where: {
                quantityInStock: {
                    lt: 15,
                },
            },
            include: { supplier: true },
            orderBy: { quantityInStock: 'asc' },
        });
    }
    async createTransfer(data, userId) {
        const { productId, quantity, fromZone, toZone } = data;
        const qty = Number(quantity);
        if (qty <= 0)
            throw new common_1.BadRequestException('Transfer quantity must be greater than 0');
        if (fromZone === toZone)
            throw new common_1.BadRequestException('Source and destination zones must be different');
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
        });
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        if (product.quantityInStock < qty) {
            throw new common_1.BadRequestException(`Insufficient stock in ${fromZone}. Available: ${product.quantityInStock}`);
        }
        const result = await this.prisma.$transaction(async (tx) => {
            const movement = await tx.inventoryMovement.create({
                data: {
                    productId,
                    quantity: qty,
                    type: 'TRANSFER',
                    fromZone,
                    toZone,
                    referenceId: `TR-${Date.now().toString().slice(-6)}`,
                    userId,
                },
            });
            const zonesToUpdate = [fromZone, toZone];
            for (const zCode of zonesToUpdate) {
                const zone = await tx.warehouseZone.findUnique({
                    where: { code: zCode },
                });
                if (zone) {
                    const delta = zCode === fromZone ? -qty : qty;
                    await tx.warehouseZone.update({
                        where: { code: zCode },
                        data: { currentUsage: { increment: delta } },
                    });
                }
            }
            return movement;
        });
        return result;
    }
};
exports.WarehouseService = WarehouseService;
exports.WarehouseService = WarehouseService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WarehouseService);
//# sourceMappingURL=warehouse.service.js.map