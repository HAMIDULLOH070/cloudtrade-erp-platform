import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class LeadsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: { status?: string; search?: string; page?: string; limit?: string }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
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

  async findOne(id: string) {
    return this.prisma.lead.findUnique({
      where: { id },
      include: { customer: true },
    });
  }

  async create(data: any) {
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

  async update(id: string, data: any) {
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

  async remove(id: string) {
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

    // Aggregate values by stage
    const stages = ['NEW', 'CONTACTED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'];
    const summary = stages.reduce((acc, stage) => {
      acc[stage] = { count: 0, value: 0 };
      return acc;
    }, {} as Record<string, { count: number; value: number }>);

    leads.forEach(l => {
      if (summary[l.status]) {
        summary[l.status].count++;
        summary[l.status].value += l.value;
      }
    });

    return Object.keys(summary).map(key => ({
      stage: key,
      count: summary[key].count,
      value: Math.round(summary[key].value * 100) / 100,
    }));
  }
}
