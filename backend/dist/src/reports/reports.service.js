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
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let ReportsService = class ReportsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboardStats() {
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
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
        const completedOrders = orders.filter(o => o.status === 'COMPLETED');
        const totalRevenue = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
        const monthlyOrders = completedOrders.filter(o => {
            const d = new Date(o.orderDate);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });
        const monthlyRevenue = monthlyOrders.reduce((sum, o) => sum + o.totalAmount, 0);
        const yearlyOrders = completedOrders.filter(o => {
            const d = new Date(o.orderDate);
            return d.getFullYear() === currentYear;
        });
        const yearlyRevenue = yearlyOrders.reduce((sum, o) => sum + o.totalAmount, 0);
        const lowStockCount = products.filter(p => p.quantityInStock < 15).length;
        const activeCustomerIds = new Set(completedOrders.map(o => o.customerId));
        const activeCustomersCount = activeCustomerIds.size;
        const totalCapacity = zones.reduce((sum, z) => sum + z.capacity, 0);
        const totalUsage = zones.reduce((sum, z) => sum + z.currentUsage, 0);
        const warehouseUsagePercentage = totalCapacity > 0 ? Math.round((totalUsage / totalCapacity) * 100) : 0;
        const salesByMonth = this.aggregateSalesByMonth(completedOrders);
        const ordersByStatus = [
            { status: 'COMPLETED', count: orders.filter(o => o.status === 'COMPLETED').length },
            { status: 'PENDING', count: orders.filter(o => o.status === 'PENDING').length },
            { status: 'CANCELLED', count: orders.filter(o => o.status === 'CANCELLED').length },
        ];
        const productSalesMap = {};
        completedOrders.forEach(order => {
            order.items.forEach(item => {
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
            .map(p => ({
            ...p,
            revenue: Math.round(p.revenue * 100) / 100,
        }));
        const customerSalesMap = {};
        completedOrders.forEach(order => {
            if (!customerSalesMap[order.customerId]) {
                const cust = customers.find(c => c.id === order.customerId);
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
            .map(c => ({
            ...c,
            amount: Math.round(c.amount * 100) / 100,
        }));
        return {
            metrics: {
                totalRevenue: Math.round(totalRevenue * 100) / 100,
                monthlyRevenue: Math.round(monthlyRevenue * 100) / 100,
                yearlyRevenue: Math.round(yearlyRevenue * 100) / 100,
                totalOrders: orders.length,
                pendingOrders: orders.filter(o => o.status === 'PENDING').length,
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
            recentActivities: recentLogs.map(l => ({
                id: l.id,
                user: l.user ? `${l.user.firstName} ${l.user.lastName}` : 'System',
                action: l.action,
                details: l.details,
                timestamp: l.timestamp,
            })),
        };
    }
    async getFinancialReport() {
        const [orders, products, expenses, invoices] = await Promise.all([
            this.prisma.order.findMany({
                where: { status: 'COMPLETED' },
                include: { items: { include: { product: true } } },
            }),
            this.prisma.product.findMany(),
            this.prisma.expense.findMany(),
            this.prisma.invoice.findMany(),
        ]);
        const stockValuationCost = products.reduce((sum, p) => sum + (p.cost * p.quantityInStock), 0);
        const stockValuationRetail = products.reduce((sum, p) => sum + (p.price * p.quantityInStock), 0);
        let totalCOGS = 0;
        orders.forEach(order => {
            order.items.forEach(item => {
                totalCOGS += item.quantity * item.product.cost;
            });
        });
        const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
        const grossProfit = totalRevenue - totalCOGS;
        const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
        const netProfit = grossProfit - totalExpenses;
        const invoiceSummary = {
            unpaidAmount: invoices.filter(i => i.status === 'UNPAID').reduce((sum, i) => sum + i.amount, 0),
            paidAmount: invoices.filter(i => i.status === 'PAID').reduce((sum, i) => sum + i.amount, 0),
            overdueAmount: invoices.filter(i => i.status === 'OVERDUE').reduce((sum, i) => sum + i.amount, 0),
            totalAmount: invoices.reduce((sum, i) => sum + i.amount, 0),
        };
        const monthlyPL = this.aggregateMonthlyPL(orders, expenses);
        return {
            summary: {
                totalRevenue: Math.round(totalRevenue * 100) / 100,
                totalCOGS: Math.round(totalCOGS * 100) / 100,
                grossProfit: Math.round(grossProfit * 100) / 100,
                grossProfitMargin: totalRevenue > 0 ? Math.round((grossProfit / totalRevenue) * 1000) / 10 : 0,
                totalExpenses: Math.round(totalExpenses * 100) / 100,
                netProfit: Math.round(netProfit * 100) / 100,
                netProfitMargin: totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 1000) / 10 : 0,
            },
            stockValuation: {
                totalCost: Math.round(stockValuationCost * 100) / 100,
                totalRetailValue: Math.round(stockValuationRetail * 100) / 100,
                potentialProfit: Math.round((stockValuationRetail - stockValuationCost) * 100) / 100,
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
        const totalOutstandingDebt = customers.reduce((sum, c) => sum + c.debt, 0);
        const categoryCounts = {};
        customers.forEach(c => {
            categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
        });
        const customerCategories = Object.keys(categoryCounts).map(cat => ({
            name: cat,
            value: categoryCounts[cat],
        }));
        const pipelineCounts = {};
        leads.forEach(l => {
            if (!pipelineCounts[l.status]) {
                pipelineCounts[l.status] = { count: 0, value: 0 };
            }
            pipelineCounts[l.status].count++;
            pipelineCounts[l.status].value += l.value;
        });
        const pipelineFunnel = Object.keys(pipelineCounts).map(status => ({
            status,
            count: pipelineCounts[status].count,
            value: Math.round(pipelineCounts[status].value * 100) / 100,
        }));
        return {
            debtMetrics: {
                totalOutstandingDebt: Math.round(totalOutstandingDebt * 100) / 100,
                customersWithDebt: customers.filter(c => c.debt > 0).length,
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
        const movementSummary = {
            incoming: movements.filter(m => m.type === 'INCOMING').length,
            outgoing: movements.filter(m => m.type === 'OUTGOING').length,
            transfer: movements.filter(m => m.type === 'TRANSFER').length,
            total: movements.length,
        };
        const monthlyMovements = this.aggregateMonthlyMovements(movements);
        return {
            summary: movementSummary,
            monthlyMovements,
        };
    }
    aggregateSalesByMonth(orders) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthlyStats = {};
        const today = new Date();
        for (let i = 11; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const label = `${months[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
            const key = d.getFullYear() * 12 + d.getMonth();
            monthlyStats[key] = { month: label, revenue: 0, ordersCount: 0, key };
        }
        orders.forEach(order => {
            const d = new Date(order.orderDate);
            const key = d.getFullYear() * 12 + d.getMonth();
            if (monthlyStats[key]) {
                monthlyStats[key].revenue += order.totalAmount;
                monthlyStats[key].ordersCount += 1;
            }
        });
        return Object.values(monthlyStats)
            .sort((a, b) => a.key - b.key)
            .map(item => ({
            month: item.month,
            revenue: Math.round(item.revenue * 100) / 100,
            ordersCount: item.ordersCount,
        }));
    }
    aggregateMonthlyPL(orders, expenses) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthlyData = {};
        const today = new Date();
        for (let i = 11; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const label = `${months[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
            const key = d.getFullYear() * 12 + d.getMonth();
            monthlyData[key] = { month: label, revenue: 0, expenses: 0, cogs: 0, profit: 0, key };
        }
        orders.forEach(order => {
            const d = new Date(order.orderDate);
            const key = d.getFullYear() * 12 + d.getMonth();
            if (monthlyData[key]) {
                monthlyData[key].revenue += order.totalAmount;
                order.items.forEach((item) => {
                    monthlyData[key].cogs += item.quantity * item.product.cost;
                });
            }
        });
        expenses.forEach(exp => {
            const d = new Date(exp.date);
            const key = d.getFullYear() * 12 + d.getMonth();
            if (monthlyData[key]) {
                monthlyData[key].expenses += exp.amount;
            }
        });
        return Object.values(monthlyData)
            .sort((a, b) => a.key - b.key)
            .map(item => {
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
    aggregateMonthlyMovements(movements) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthlyData = {};
        const today = new Date();
        for (let i = 11; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const label = `${months[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
            const key = d.getFullYear() * 12 + d.getMonth();
            monthlyData[key] = { month: label, incoming: 0, outgoing: 0, transfer: 0, key };
        }
        movements.forEach(m => {
            const d = new Date(m.createdAt);
            const key = d.getFullYear() * 12 + d.getMonth();
            if (monthlyData[key]) {
                if (m.type === 'INCOMING')
                    monthlyData[key].incoming += m.quantity;
                else if (m.type === 'OUTGOING')
                    monthlyData[key].outgoing += m.quantity;
                else if (m.type === 'TRANSFER')
                    monthlyData[key].transfer += m.quantity;
            }
        });
        return Object.values(monthlyData)
            .sort((a, b) => a.key - b.key)
            .map(item => ({
            month: item.month,
            incoming: item.incoming,
            outgoing: item.outgoing,
            transfer: item.transfer,
        }));
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map