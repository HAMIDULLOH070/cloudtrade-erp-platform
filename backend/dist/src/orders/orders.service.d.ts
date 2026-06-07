import { PrismaService } from '../prisma.service';
export declare class OrdersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAllOrders(query: {
        status?: string;
        search?: string;
        page?: string;
        limit?: string;
    }): Promise<{
        items: ({
            customer: {
                id: string;
                name: string;
                contactName: string | null;
                email: string | null;
                phone: string | null;
                address: string | null;
                category: string;
                debt: number;
                creditLimit: number;
                createdAt: Date;
                updatedAt: Date;
            };
            items: ({
                product: {
                    id: string;
                    name: string;
                    sku: string;
                    description: string | null;
                    category: string;
                    size: string;
                    color: string;
                    price: number;
                    cost: number;
                    quantityInStock: number;
                    lowStockThreshold: number;
                    supplierId: string;
                    createdAt: Date;
                    updatedAt: Date;
                };
            } & {
                id: string;
                orderId: string;
                productId: string;
                quantity: number;
                price: number;
                createdAt: Date;
            })[];
        } & {
            id: string;
            orderNumber: string;
            customerId: string;
            status: string;
            subtotal: number;
            discount: number;
            tax: number;
            totalAmount: number;
            orderDate: Date;
            createdAt: Date;
            updatedAt: Date;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOneOrder(id: string): Promise<{
        customer: {
            id: string;
            name: string;
            contactName: string | null;
            email: string | null;
            phone: string | null;
            address: string | null;
            category: string;
            debt: number;
            creditLimit: number;
            createdAt: Date;
            updatedAt: Date;
        };
        items: ({
            product: {
                id: string;
                name: string;
                sku: string;
                description: string | null;
                category: string;
                size: string;
                color: string;
                price: number;
                cost: number;
                quantityInStock: number;
                lowStockThreshold: number;
                supplierId: string;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: string;
            orderId: string;
            productId: string;
            quantity: number;
            price: number;
            createdAt: Date;
        })[];
        invoices: {
            id: string;
            invoiceNumber: string;
            orderId: string;
            amount: number;
            status: string;
            dueDate: Date;
            issuedDate: Date;
            createdAt: Date;
        }[];
    } & {
        id: string;
        orderNumber: string;
        customerId: string;
        status: string;
        subtotal: number;
        discount: number;
        tax: number;
        totalAmount: number;
        orderDate: Date;
        createdAt: Date;
        updatedAt: Date;
    }>;
    createOrder(data: any, userId: string): Promise<{
        items: {
            id: string;
            orderId: string;
            productId: string;
            quantity: number;
            price: number;
            createdAt: Date;
        }[];
    } & {
        id: string;
        orderNumber: string;
        customerId: string;
        status: string;
        subtotal: number;
        discount: number;
        tax: number;
        totalAmount: number;
        orderDate: Date;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateOrder(id: string, data: any, userId: string): Promise<{
        items: {
            id: string;
            orderId: string;
            productId: string;
            quantity: number;
            price: number;
            createdAt: Date;
        }[];
    } & {
        id: string;
        orderNumber: string;
        customerId: string;
        status: string;
        subtotal: number;
        discount: number;
        tax: number;
        totalAmount: number;
        orderDate: Date;
        createdAt: Date;
        updatedAt: Date;
    }>;
    private completeSalesOrderOperations;
    findAllPurchaseOrders(query: {
        status?: string;
        search?: string;
        page?: string;
        limit?: string;
    }): Promise<{
        items: ({
            supplier: {
                id: string;
                name: string;
                contactName: string | null;
                email: string | null;
                phone: string | null;
                address: string | null;
                createdAt: Date;
                updatedAt: Date;
            };
            items: ({
                product: {
                    id: string;
                    name: string;
                    sku: string;
                    description: string | null;
                    category: string;
                    size: string;
                    color: string;
                    price: number;
                    cost: number;
                    quantityInStock: number;
                    lowStockThreshold: number;
                    supplierId: string;
                    createdAt: Date;
                    updatedAt: Date;
                };
            } & {
                id: string;
                purchaseOrderId: string;
                productId: string;
                quantity: number;
                cost: number;
                createdAt: Date;
            })[];
        } & {
            id: string;
            poNumber: string;
            supplierId: string;
            status: string;
            totalAmount: number;
            poDate: Date;
            createdAt: Date;
            updatedAt: Date;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOnePurchaseOrder(id: string): Promise<{
        supplier: {
            id: string;
            name: string;
            contactName: string | null;
            email: string | null;
            phone: string | null;
            address: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        items: ({
            product: {
                id: string;
                name: string;
                sku: string;
                description: string | null;
                category: string;
                size: string;
                color: string;
                price: number;
                cost: number;
                quantityInStock: number;
                lowStockThreshold: number;
                supplierId: string;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: string;
            purchaseOrderId: string;
            productId: string;
            quantity: number;
            cost: number;
            createdAt: Date;
        })[];
    } & {
        id: string;
        poNumber: string;
        supplierId: string;
        status: string;
        totalAmount: number;
        poDate: Date;
        createdAt: Date;
        updatedAt: Date;
    }>;
    createPurchaseOrder(data: any, userId: string): Promise<{
        items: {
            id: string;
            purchaseOrderId: string;
            productId: string;
            quantity: number;
            cost: number;
            createdAt: Date;
        }[];
    } & {
        id: string;
        poNumber: string;
        supplierId: string;
        status: string;
        totalAmount: number;
        poDate: Date;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updatePurchaseOrder(id: string, data: any, userId: string): Promise<{
        items: {
            id: string;
            purchaseOrderId: string;
            productId: string;
            quantity: number;
            cost: number;
            createdAt: Date;
        }[];
    } & {
        id: string;
        poNumber: string;
        supplierId: string;
        status: string;
        totalAmount: number;
        poDate: Date;
        createdAt: Date;
        updatedAt: Date;
    }>;
    private receivePurchaseOrderOperations;
}
