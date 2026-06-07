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
exports.CustomersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let CustomersService = class CustomersService {
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
                { contactName: { contains: query.search } },
                { email: { contains: query.search } },
            ];
        }
        const [items, total] = await Promise.all([
            this.prisma.customer.findMany({
                where,
                skip,
                take: limit,
                orderBy: { name: 'asc' },
            }),
            this.prisma.customer.count({ where }),
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
        return this.prisma.customer.findUnique({
            where: { id },
            include: {
                leads: { orderBy: { createdAt: 'desc' } },
                orders: { orderBy: { orderDate: 'desc' }, take: 10 },
            },
        });
    }
    async create(data) {
        return this.prisma.customer.create({
            data: {
                name: data.name,
                contactName: data.contactName,
                email: data.email,
                phone: data.phone,
                address: data.address,
                category: data.category,
                creditLimit: data.creditLimit !== undefined ? Number(data.creditLimit) : 10000,
                debt: data.debt !== undefined ? Number(data.debt) : 0,
            },
        });
    }
    async update(id, data) {
        return this.prisma.customer.update({
            where: { id },
            data: {
                name: data.name,
                contactName: data.contactName,
                email: data.email,
                phone: data.phone,
                address: data.address,
                category: data.category,
                creditLimit: data.creditLimit !== undefined ? Number(data.creditLimit) : undefined,
                debt: data.debt !== undefined ? Number(data.debt) : undefined,
            },
        });
    }
    async remove(id) {
        return this.prisma.customer.delete({
            where: { id },
        });
    }
    async getCategories() {
        const categories = await this.prisma.customer.findMany({
            select: { category: true },
            distinct: ['category'],
        });
        return categories.map(c => c.category);
    }
};
exports.CustomersService = CustomersService;
exports.CustomersService = CustomersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CustomersService);
//# sourceMappingURL=customers.service.js.map