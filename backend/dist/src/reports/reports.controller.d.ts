import { ReportsService } from './reports.service';
export declare class ReportsController {
    private reportsService;
    constructor(reportsService: ReportsService);
    getDashboardStats(): Promise<{
        metrics: {
            totalRevenue: number;
            monthlyRevenue: number;
            yearlyRevenue: number;
            totalOrders: number;
            pendingOrders: number;
            completedOrders: number;
            totalCustomers: number;
            activeCustomers: number;
            totalProducts: number;
            lowStockProducts: number;
            warehouseCapacityUsage: number;
            totalCapacity: number;
            totalUsage: number;
        };
        charts: {
            salesByMonth: {
                month: string;
                revenue: number;
                ordersCount: number;
            }[];
            ordersByStatus: {
                status: string;
                count: number;
            }[];
            topSellingProducts: {
                revenue: number;
                name: string;
                sku: string;
                qty: number;
            }[];
            topCustomers: {
                amount: number;
                name: string;
                orderCount: number;
            }[];
        };
        recentActivities: {
            id: string;
            user: string;
            action: string;
            details: string | null;
            timestamp: Date;
        }[];
    }>;
    getFinancialReport(): Promise<{
        summary: {
            totalRevenue: number;
            totalCOGS: number;
            grossProfit: number;
            grossProfitMargin: number;
            totalExpenses: number;
            netProfit: number;
            netProfitMargin: number;
        };
        stockValuation: {
            totalCost: number;
            totalRetailValue: number;
            potentialProfit: number;
        };
        invoiceSummary: {
            unpaid: number;
            paid: number;
            overdue: number;
            total: number;
        };
        monthlyPL: {
            month: string;
            revenue: number;
            expenses: number;
            cogs: number;
            profit: number;
        }[];
    }>;
    getCRMReport(): Promise<{
        debtMetrics: {
            totalOutstandingDebt: number;
            customersWithDebt: number;
        };
        customerCategories: {
            name: string;
            value: number;
        }[];
        pipelineFunnel: {
            status: string;
            count: number;
            value: number;
        }[];
    }>;
    getWMSReport(): Promise<{
        summary: {
            incoming: number;
            outgoing: number;
            transfer: number;
            total: number;
        };
        monthlyMovements: {
            month: string;
            incoming: number;
            outgoing: number;
            transfer: number;
        }[];
    }>;
}
