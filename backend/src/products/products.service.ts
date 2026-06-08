import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: {
    category?: string;
    search?: string;
    page?: string;
    limit?: string;
  }) {
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

  async findOne(id: string) {
    return this.prisma.product.findUnique({
      where: { id },
      include: { supplier: true },
    });
  }

  async create(data: any) {
    if (data.price === undefined || isNaN(Number(data.price))) {
      throw new BadRequestException("Mahsulot narxi to'g'ri raqam bo'lishi shart.");
    }
    if (data.cost === undefined || isNaN(Number(data.cost))) {
      throw new BadRequestException("Mahsulot tannarxi to'g'ri raqam bo'lishi shart.");
    }
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

  async update(id: string, data: any) {
    if (data.price !== undefined && isNaN(Number(data.price))) {
      throw new BadRequestException("Mahsulot narxi to'g'ri raqam bo'lishi shart.");
    }
    if (data.cost !== undefined && isNaN(Number(data.cost))) {
      throw new BadRequestException("Mahsulot tannarxi to'g'ri raqam bo'lishi shart.");
    }
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
        quantityInStock:
          data.quantityInStock !== undefined
            ? Number(data.quantityInStock)
            : undefined,
        supplierId: data.supplierId,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.product.delete({
      where: { id },
    });
  }

  async getCategories() {
    const categories = await this.prisma.product.findMany({
      select: { category: true },
      distinct: ['category'],
    });
    return categories.map((c) => c.category);
  }
}
