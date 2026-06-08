import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Fetch orders, customers, products
    const [orders, customers, products, zones, recentLogs] = await Promise.all([
      this.prisma.order.findMany({
        include: { items: { include: { product: true } } },
      }),
      this.prisma.customer.findMany(),
      this.prisma.product.findMany(),
      this.prisma.warehouseZone.findMany(),
      this.prisma.activityLog.findMany({
        take: 8,
        orderBy: { timestamp: 'desc' },
        include: { user: { select: { firstName: true, lastName: true } } },
      }),
    ]);

    // Calculations
    const completedOrders = orders.filter((o) => o.status === 'COMPLETED');
    const totalRevenue = completedOrders.reduce(
      (sum, o) => sum + o.totalAmount,
      0,
    );

    // Monthly & Yearly Revenue
    const monthlyOrders = completedOrders.filter((o) => {
      const d = new Date(o.orderDate);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
    const monthlyRevenue = monthlyOrders.reduce(
      (sum, o) => sum + o.totalAmount,
      0,
    );

    const yearlyOrders = completedOrders.filter((o) => {
      const d = new Date(o.orderDate);
      return d.getFullYear() === currentYear;
    });
    const yearlyRevenue = yearlyOrders.reduce(
      (sum, o) => sum + o.totalAmount,
      0,
    );

    // Low stock count
    const lowStockCount = products.filter((p) => p.quantityInStock < 15).length;

    // Active customers (having at least 1 completed order)
    const activeCustomerIds = new Set(completedOrders.map((o) => o.customerId));
    const activeCustomersCount = activeCustomerIds.size;

    // Warehouse capacity
    const totalCapacity = zones.reduce((sum, z) => sum + z.capacity, 0);
    const totalUsage = zones.reduce((sum, z) => sum + z.currentUsage, 0);
    const warehouseUsagePercentage =
      totalCapacity > 0 ? Math.round((totalUsage / totalCapacity) * 100) : 0;

    // 1. Chart: Sales by Month (last 12 months)
    const salesByMonth = this.aggregateSalesByMonth(completedOrders);

    // 2. Chart: Orders by Status
    const ordersByStatus = [
      {
        status: 'COMPLETED',
        count: orders.filter((o) => o.status === 'COMPLETED').length,
      },
      {
        status: 'PENDING',
        count: orders.filter((o) => o.status === 'PENDING').length,
      },
      {
        status: 'CANCELLED',
        count: orders.filter((o) => o.status === 'CANCELLED').length,
      },
    ];

    // 3. Top Selling Products
    const productSalesMap: Record<
      string,
      { name: string; sku: string; qty: number; revenue: number }
    > = {};
    completedOrders.forEach((order) => {
      order.items.forEach((item) => {
        if (!productSalesMap[item.productId]) {
          productSalesMap[item.productId] = {
            name: item.product.name,
            sku: item.product.sku,
            qty: 0,
            revenue: 0,
          };
        }
        productSalesMap[item.productId].qty += item.quantity;
        productSalesMap[item.productId].revenue += item.quantity * item.price;
      });
    });

    const topSellingProducts = Object.values(productSalesMap)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5)
      .map((p) => ({
        ...p,
        revenue: Math.round(p.revenue * 100) / 100,
      }));

    // 4. Top Customers
    const customerSalesMap: Record<
      string,
      { name: string; amount: number; orderCount: number }
    > = {};
    completedOrders.forEach((order) => {
      if (!customerSalesMap[order.customerId]) {
        const cust = customers.find((c) => c.id === order.customerId);
        customerSalesMap[order.customerId] = {
          name: cust ? cust.name : 'Unknown Customer',
          amount: 0,
          orderCount: 0,
        };
      }
      customerSalesMap[order.customerId].amount += order.totalAmount;
      customerSalesMap[order.customerId].orderCount += 1;
    });

    const topCustomers = Object.values(customerSalesMap)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)
      .map((c) => ({
        ...c,
        amount: Math.round(c.amount * 100) / 100,
      }));

    return {
      metrics: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        monthlyRevenue: Math.round(monthlyRevenue * 100) / 100,
        yearlyRevenue: Math.round(yearlyRevenue * 100) / 100,
        totalOrders: orders.length,
        pendingOrders: orders.filter((o) => o.status === 'PENDING').length,
        completedOrders: completedOrders.length,
        totalCustomers: customers.length,
        activeCustomers: activeCustomersCount,
        totalProducts: products.length,
        lowStockProducts: lowStockCount,
        warehouseCapacityUsage: warehouseUsagePercentage,
        totalCapacity,
        totalUsage,
      },
      charts: {
        salesByMonth,
        ordersByStatus,
        topSellingProducts,
        topCustomers,
      },
      recentActivities: recentLogs.map((l) => ({
        id: l.id,
        user: l.user ? `${l.user.firstName} ${l.user.lastName}` : 'System',
        action: l.action,
        details: l.details,
        timestamp: l.timestamp,
      })),
    };
  }

  async getFinancialReport() {
    // Aggregates P&L, stock valuations, invoice collections
    const [orders, products, expenses, invoices] = await Promise.all([
      this.prisma.order.findMany({
        where: { status: 'COMPLETED' },
        include: { items: { include: { product: true } } },
      }),
      this.prisma.product.findMany(),
      this.prisma.expense.findMany(),
      this.prisma.invoice.findMany(),
    ]);

    // Stock valuation
    const stockValuationCost = products.reduce(
      (sum, p) => sum + p.cost * p.quantityInStock,
      0,
    );
    const stockValuationRetail = products.reduce(
      (sum, p) => sum + p.price * p.quantityInStock,
      0,
    );

    // COGS (Cost of goods sold for completed orders)
    let totalCOGS = 0;
    orders.forEach((order) => {
      order.items.forEach((item) => {
        totalCOGS += item.quantity * item.product.cost;
      });
    });

    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const grossProfit = totalRevenue - totalCOGS;
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = grossProfit - totalExpenses;

    // Invoice Status Summary
    const invoiceSummary = {
      unpaidAmount: invoices
        .filter((i) => i.status === 'UNPAID')
        .reduce((sum, i) => sum + i.amount, 0),
      paidAmount: invoices
        .filter((i) => i.status === 'PAID')
        .reduce((sum, i) => sum + i.amount, 0),
      overdueAmount: invoices
        .filter((i) => i.status === 'OVERDUE')
        .reduce((sum, i) => sum + i.amount, 0),
      totalAmount: invoices.reduce((sum, i) => sum + i.amount, 0),
    };

    // Monthly P&L Chart Data (grouped by month for the last 12 months)
    const monthlyPL = this.aggregateMonthlyPL(orders, expenses);

    return {
      summary: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalCOGS: Math.round(totalCOGS * 100) / 100,
        grossProfit: Math.round(grossProfit * 100) / 100,
        grossProfitMargin:
          totalRevenue > 0
            ? Math.round((grossProfit / totalRevenue) * 1000) / 10
            : 0,
        totalExpenses: Math.round(totalExpenses * 100) / 100,
        netProfit: Math.round(netProfit * 100) / 100,
        netProfitMargin:
          totalRevenue > 0
            ? Math.round((netProfit / totalRevenue) * 1000) / 10
            : 0,
      },
      stockValuation: {
        totalCost: Math.round(stockValuationCost * 100) / 100,
        totalRetailValue: Math.round(stockValuationRetail * 100) / 100,
        potentialProfit:
          Math.round((stockValuationRetail - stockValuationCost) * 100) / 100,
      },
      invoiceSummary: {
        unpaid: Math.round(invoiceSummary.unpaidAmount * 100) / 100,
        paid: Math.round(invoiceSummary.paidAmount * 100) / 100,
        overdue: Math.round(invoiceSummary.overdueAmount * 100) / 100,
        total: Math.round(invoiceSummary.totalAmount * 100) / 100,
      },
      monthlyPL,
    };
  }

  async getCRMReport() {
    const [customers, leads] = await Promise.all([
      this.prisma.customer.findMany(),
      this.prisma.lead.findMany(),
    ]);

    // Outstanding debt
    const totalOutstandingDebt = customers.reduce((sum, c) => sum + c.debt, 0);

    // Customer growth rate (by checking creation dates)
    // Group by category
    const categoryCounts: Record<string, number> = {};
    customers.forEach((c) => {
      categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
    });

    const customerCategories = Object.keys(categoryCounts).map((cat) => ({
      name: cat,
      value: categoryCounts[cat],
    }));

    // Pipeline status counts
    const pipelineCounts: Record<string, { count: number; value: number }> = {};
    leads.forEach((l) => {
      if (!pipelineCounts[l.status]) {
        pipelineCounts[l.status] = { count: 0, value: 0 };
      }
      pipelineCounts[l.status].count++;
      pipelineCounts[l.status].value += l.value;
    });

    const pipelineFunnel = Object.keys(pipelineCounts).map((status) => ({
      status,
      count: pipelineCounts[status].count,
      value: Math.round(pipelineCounts[status].value * 100) / 100,
    }));

    return {
      debtMetrics: {
        totalOutstandingDebt: Math.round(totalOutstandingDebt * 100) / 100,
        customersWithDebt: customers.filter((c) => c.debt > 0).length,
      },
      customerCategories,
      pipelineFunnel,
    };
  }

  async getWMSReport() {
    const [movements, products] = await Promise.all([
      this.prisma.inventoryMovement.findMany({
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.product.findMany(),
    ]);

    // Count movement types
    const movementSummary = {
      incoming: movements.filter((m) => m.type === 'INCOMING').length,
      outgoing: movements.filter((m) => m.type === 'OUTGOING').length,
      transfer: movements.filter((m) => m.type === 'TRANSFER').length,
      total: movements.length,
    };

    // Movement history aggregated by month (last 12 months)
    const monthlyMovements = this.aggregateMonthlyMovements(movements);

    return {
      summary: movementSummary,
      monthlyMovements,
    };
  }

  // ==========================================
  // HELPER METHODS
  // ==========================================

  private aggregateSalesByMonth(orders: any[]) {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const monthlyStats: Record<
      string,
      { month: string; revenue: number; ordersCount: number; key: number }
    > = {};

    // Get current date context to determine the last 12 months
    const today = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const label = `${months[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
      const key = d.getFullYear() * 12 + d.getMonth();
      monthlyStats[key] = { month: label, revenue: 0, ordersCount: 0, key };
    }

    orders.forEach((order) => {
      const d = new Date(order.orderDate);
      const key = d.getFullYear() * 12 + d.getMonth();
      if (monthlyStats[key]) {
        monthlyStats[key].revenue += order.totalAmount;
        monthlyStats[key].ordersCount += 1;
      }
    });

    return Object.values(monthlyStats)
      .sort((a, b) => a.key - b.key)
      .map((item) => ({
        month: item.month,
        revenue: Math.round(item.revenue * 100) / 100,
        ordersCount: item.ordersCount,
      }));
  }

  private aggregateMonthlyPL(orders: any[], expenses: any[]) {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const monthlyData: Record<
      string,
      {
        month: string;
        revenue: number;
        expenses: number;
        cogs: number;
        profit: number;
        key: number;
      }
    > = {};

    const today = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const label = `${months[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
      const key = d.getFullYear() * 12 + d.getMonth();
      monthlyData[key] = {
        month: label,
        revenue: 0,
        expenses: 0,
        cogs: 0,
        profit: 0,
        key,
      };
    }

    // Revenue & COGS
    orders.forEach((order) => {
      const d = new Date(order.orderDate);
      const key = d.getFullYear() * 12 + d.getMonth();
      if (monthlyData[key]) {
        monthlyData[key].revenue += order.totalAmount;
        order.items.forEach((item: any) => {
          monthlyData[key].cogs += item.quantity * item.product.cost;
        });
      }
    });

    // Expenses
    expenses.forEach((exp) => {
      const d = new Date(exp.date);
      const key = d.getFullYear() * 12 + d.getMonth();
      if (monthlyData[key]) {
        monthlyData[key].expenses += exp.amount;
      }
    });

    return Object.values(monthlyData)
      .sort((a, b) => a.key - b.key)
      .map((item) => {
        const grossProfit = item.revenue - item.cogs;
        const netProfit = grossProfit - item.expenses;
        return {
          month: item.month,
          revenue: Math.round(item.revenue * 100) / 100,
          expenses: Math.round(item.expenses * 100) / 100,
          cogs: Math.round(item.cogs * 100) / 100,
          profit: Math.round(netProfit * 100) / 100,
        };
      });
  }

  private aggregateMonthlyMovements(movements: any[]) {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const monthlyData: Record<
      string,
      {
        month: string;
        incoming: number;
        outgoing: number;
        transfer: number;
        key: number;
      }
    > = {};

    const today = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const label = `${months[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
      const key = d.getFullYear() * 12 + d.getMonth();
      monthlyData[key] = {
        month: label,
        incoming: 0,
        outgoing: 0,
        transfer: 0,
        key,
      };
    }

    movements.forEach((m) => {
      const d = new Date(m.createdAt);
      const key = d.getFullYear() * 12 + d.getMonth();
      if (monthlyData[key]) {
        if (m.type === 'INCOMING') monthlyData[key].incoming += m.quantity;
        else if (m.type === 'OUTGOING') monthlyData[key].outgoing += m.quantity;
        else if (m.type === 'TRANSFER') monthlyData[key].transfer += m.quantity;
      }
    });

    return Object.values(monthlyData)
      .sort((a, b) => a.key - b.key)
      .map((item) => ({
        month: item.month,
        incoming: item.incoming,
        outgoing: item.outgoing,
        transfer: item.transfer,
      }));
  }
}
