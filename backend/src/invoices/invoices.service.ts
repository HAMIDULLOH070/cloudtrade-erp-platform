import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  // ==========================================
  // INVOICES
  // ==========================================

  async findAllInvoices(query: {
    status?: string;
    search?: string;
    page?: string;
    limit?: string;
  }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
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

  async findOneInvoice(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        order: {
          include: { customer: true, items: { include: { product: true } } },
        },
        payments: true,
      },
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    return invoice;
  }

  async recordPayment(invoiceId: string, data: any) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { order: { include: { customer: true } } },
    });

    if (!invoice) throw new NotFoundException('Invoice not found');
    if (invoice.status === 'PAID')
      throw new BadRequestException('Invoice is already paid');

    if (data.amount === undefined || isNaN(Number(data.amount))) {
      throw new BadRequestException("To'lov miqdori to'g'ri raqam bo'lishi shart.");
    }
    const paymentAmount = Number(data.amount);
    if (paymentAmount <= 0)
      throw new BadRequestException("To'lov miqdori 0 dan katta bo'lishi shart.");

    const result = await this.prisma.$transaction(async (tx) => {
      // Generate safe sequential payment number
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

      // Create Payment
      const payment = await tx.payment.create({
        data: {
          paymentNumber,
          invoiceId,
          amount: paymentAmount,
          paymentMethod: data.paymentMethod || 'Bank Transfer',
          reference: data.reference,
        },
      });

      // Update Invoice status
      const updatedInvoice = await tx.invoice.update({
        where: { id: invoiceId },
        data: {
          status: 'PAID', // mark as PAID
        },
      });

      // Decrement customer debt
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

  // ==========================================
  // PAYMENTS
  // ==========================================

  async findAllPayments(query: { page?: string; limit?: string }) {
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

  // ==========================================
  // EXPENSES
  // ==========================================

  async findAllExpenses(query: {
    category?: string;
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

  async createExpense(data: any) {
    if (data.amount === undefined || isNaN(Number(data.amount))) {
      throw new BadRequestException("Xarajat miqdori to'g'ri raqam bo'lishi shart.");
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
}
