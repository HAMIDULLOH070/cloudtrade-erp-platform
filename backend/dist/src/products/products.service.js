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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let ProductsService = class ProductsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;
        const where = {};
        if (query.category) {
            where.category = query.category;
        }
        if (query.search) {
            where.OR = [
                { name: { contains: query.search } },
                { sku: { contains: query.search } },
            ];
        }
        const [items, total] = await Promise.all([
            this.prisma.product.findMany({
                where,
                include: { supplier: true },
                skip,
                take: limit,
                orderBy: { name: 'asc' },
            }),
            this.prisma.product.count({ where }),
        ]);
        return {
            items,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findOne(id) {
        return this.prisma.product.findUnique({
            where: { id },
            include: { supplier: true },
        });
    }
    async create(data) {
        return this.prisma.product.create({
            data: {
                name: data.name,
                sku: data.sku,
                description: data.description,
                category: data.category,
                size: data.size,
                color: data.color,
                price: Number(data.price),
                cost: Number(data.cost),
                quantityInStock: Number(data.quantityInStock || 0),
                supplierId: data.supplierId,
            },
        });
    }
    async update(id, data) {
        return this.prisma.product.update({
            where: { id },
            data: {
                name: data.name,
                sku: data.sku,
                description: data.description,
                category: data.category,
                size: data.size,
                color: data.color,
                price: data.price !== undefined ? Number(data.price) : undefined,
                cost: data.cost !== undefined ? Number(data.cost) : undefined,
                quantityInStock: data.quantityInStock !== undefined ? Number(data.quantityInStock) : undefined,
                supplierId: data.supplierId,
            },
        });
    }
    async remove(id) {
        return this.prisma.product.delete({
            where: { id },
        });
    }
    async getCategories() {
        const categories = await this.prisma.product.findMany({
            select: { category: true },
            distinct: ['category'],
        });
        return categories.map(c => c.category);
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductsService);
//# sourceMappingURL=products.service.js.map