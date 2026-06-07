import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: { category?: string; search?: string; page?: string; limit?: string }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
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

  async findOne(id: string) {
    return this.prisma.customer.findUnique({
      where: { id },
      include: {
        leads: { orderBy: { createdAt: 'desc' } },
        orders: { orderBy: { orderDate: 'desc' }, take: 10 },
      },
    });
  }

  async create(data: any) {
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

  async update(id: string, data: any) {
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

  async remove(id: string) {
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
}
