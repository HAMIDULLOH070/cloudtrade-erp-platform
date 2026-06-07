import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  // ==========================================
  // SALES ORDERS
  // ==========================================

  async findAllOrders(query: { status?: string; search?: string; page?: string; limit?: string }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
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

  async findOneOrder(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        items: { include: { product: true } },
        invoices: true,
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async createOrder(data: any, userId: string) {
    // Check if customer exists
    const customer = await this.prisma.customer.findUnique({
      where: { id: data.customerId },
    });
    if (!customer) throw new NotFoundException('Customer not found');

    // Generate random order number
    const count = await this.prisma.order.count();
    const orderNumber = `SO-${7000 + count + 1}`;

    // Calculate subtotal
    let subtotal = 0;
    for (const item of data.items) {
      const product = await this.prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) throw new NotFoundException(`Product ${item.productId} not found`);
      subtotal += product.price * item.quantity;
    }

    const discount = data.discount !== undefined ? Number(data.discount) : 0;
    const tax = Math.round((subtotal - discount) * 0.12 * 100) / 100;
    const finalTotal = Math.round((subtotal - discount + tax) * 100) / 100;

    // Create Order in transaction
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
            create: data.items.map((item: any) => ({
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

  async updateOrder(id: string, data: any, userId: string) {
    const existingOrder = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true, customer: true },
    });
    if (!existingOrder) throw new NotFoundException('Order not found');

    if (existingOrder.status === 'COMPLETED') {
      throw new BadRequestException('Cannot modify a completed order');
    }

    const order = await this.prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id },
        data: {
          status: data.status,
        },
        include: { items: true },
      });

      // If status changed to completed, trigger inventory reduction and invoice
      if (existingOrder.status !== 'COMPLETED' && data.status === 'COMPLETED') {
        const items = existingOrder.items.map(i => ({
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

  private async completeSalesOrderOperations(tx: any, order: any, items: any[], customerId: string, userId: string) {
    for (const item of items) {
      // Find product category to get zone
      const product = await tx.product.findUnique({ where: { id: item.productId } });
      let zone = 'ZONE-A';
      if (product.category === 'Jeans') zone = 'ZONE-B';
      else if (product.category === 'Jackets' || product.category === 'Hoodies') zone = 'ZONE-C';
      else if (product.category === 'Shirts') zone = 'ZONE-D';

      // Decrement stock
      await tx.product.update({
        where: { id: item.productId },
        data: { quantityInStock: { decrement: item.quantity } },
      });

      // Create stock movement
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

    // Create Invoice
    const invoiceCount = await tx.invoice.count();
    const invoiceNumber = `INV-${5000 + invoiceCount + 1}`;
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

    // Update customer debt
    await tx.customer.update({
      where: { id: customerId },
      data: { debt: { increment: order.totalAmount } },
    });
  }

  // ==========================================
  // PURCHASE ORDERS
  // ==========================================

  async findAllPurchaseOrders(query: { status?: string; search?: string; page?: string; limit?: string }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
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

  async findOnePurchaseOrder(id: string) {
    const po = await this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        supplier: true,
        items: { include: { product: true } },
      },
    });
    if (!po) throw new NotFoundException('Purchase order not found');
    return po;
  }

  async createPurchaseOrder(data: any, userId: string) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id: data.supplierId },
    });
    if (!supplier) throw new NotFoundException('Supplier not found');

    const count = await this.prisma.purchaseOrder.count();
    const poNumber = `PO-${4000 + count + 1}`;

    let totalAmount = 0;
    for (const item of data.items) {
      const product = await this.prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) throw new NotFoundException(`Product ${item.productId} not found`);
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
            create: data.items.map((item: any) => ({
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

  async updatePurchaseOrder(id: string, data: any, userId: string) {
    const existingPO = await this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!existingPO) throw new NotFoundException('Purchase order not found');

    if (existingPO.status === 'RECEIVED') {
      throw new BadRequestException('Cannot modify a received purchase order');
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
        const items = existingPO.items.map(i => ({
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

  private async receivePurchaseOrderOperations(tx: any, po: any, items: any[], userId: string) {
    for (const item of items) {
      const product = await tx.product.findUnique({ where: { id: item.productId } });
      let zone = 'ZONE-A';
      if (product.category === 'Jeans') zone = 'ZONE-B';
      else if (product.category === 'Jackets' || product.category === 'Hoodies') zone = 'ZONE-C';
      else if (product.category === 'Shirts') zone = 'ZONE-D';

      // Increment stock
      await tx.product.update({
        where: { id: item.productId },
        data: { quantityInStock: { increment: item.quantity } },
      });

      // Create stock movement
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
}
