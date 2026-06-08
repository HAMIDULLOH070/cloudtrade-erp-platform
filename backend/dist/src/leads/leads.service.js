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
exports.LeadsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let LeadsService = class LeadsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;
        const where = {};
        if (query.status) {
            where.status = query.status;
        }
        if (query.search) {
            where.OR = [
                { source: { contains: query.search } },
                { notes: { contains: query.search } },
                { customer: { name: { contains: query.search } } },
            ];
        }
        const [items, total] = await Promise.all([
            this.prisma.lead.findMany({
                where,
                include: { customer: true },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.lead.count({ where }),
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
        return this.prisma.lead.findUnique({
            where: { id },
            include: { customer: true },
        });
    }
    async create(data) {
        return this.prisma.lead.create({
            data: {
                customerId: data.customerId,
                status: data.status || 'NEW',
                value: Number(data.value),
                source: data.source,
                notes: data.notes,
            },
            include: { customer: true },
        });
    }
    async update(id, data) {
        return this.prisma.lead.update({
            where: { id },
            data: {
                customerId: data.customerId,
                status: data.status,
                value: data.value !== undefined ? Number(data.value) : undefined,
                source: data.source,
                notes: data.notes,
            },
            include: { customer: true },
        });
    }
    async remove(id) {
        return this.prisma.lead.delete({
            where: { id },
        });
    }
    async getPipeline() {
        const leads = await this.prisma.lead.findMany({
            select: {
                status: true,
                value: true,
            },
        });
        const stages = [
            'NEW',
            'CONTACTED',
            'PROPOSAL',
            'NEGOTIATION',
            'WON',
            'LOST',
        ];
        const summary = stages.reduce((acc, stage) => {
            acc[stage] = { count: 0, value: 0 };
            return acc;
        }, {});
        leads.forEach((l) => {
            if (summary[l.status]) {
                summary[l.status].count++;
                summary[l.status].value += l.value;
            }
        });
        return Object.keys(summary).map((key) => ({
            stage: key,
            count: summary[key].count,
            value: Math.round(summary[key].value * 100) / 100,
        }));
    }
};
exports.LeadsService = LeadsService;
exports.LeadsService = LeadsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LeadsService);
//# sourceMappingURL=leads.service.js.map