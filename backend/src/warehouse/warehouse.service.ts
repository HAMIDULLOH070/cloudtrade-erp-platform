import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class WarehouseService {
  constructor(private prisma: PrismaService) {}

  async getZones() {
    return this.prisma.warehouseZone.findMany({
      orderBy: { code: 'asc' },
    });
  }

  async getMovements(query: { type?: string; productId?: string; page?: string; limit?: string }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
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
          lt: 15, // Low stock threshold
        },
      },
      include: { supplier: true },
      orderBy: { quantityInStock: 'asc' },
    });
  }

  async createTransfer(data: any, userId: string) {
    const { productId, quantity, fromZone, toZone } = data;
    const qty = Number(quantity);

    if (qty <= 0) throw new BadRequestException('Transfer quantity must be greater than 0');
    if (fromZone === toZone) throw new BadRequestException('Source and destination zones must be different');

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException('Product not found');
    if (product.quantityInStock < qty) {
      throw new BadRequestException(`Insufficient stock in ${fromZone}. Available: ${product.quantityInStock}`);
    }

    const result = await this.prisma.$transaction(async (tx) => {
      // Log transfer movement
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

      // Update zone usages
      const zonesToUpdate = [fromZone, toZone];
      for (const zCode of zonesToUpdate) {
        const zone = await tx.warehouseZone.findUnique({ where: { code: zCode } });
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
}
