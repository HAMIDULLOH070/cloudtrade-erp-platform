import { OrdersService } from './orders.service';
export declare class PurchaseOrdersController {
    private ordersService;
    constructor(ordersService: OrdersService);
    findAllPurchaseOrders(status?: string, search?: string, page?: string, limit?: string): Promise<{
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
    createPurchaseOrder(data: any, req: any): Promise<{
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
    updatePurchaseOrder(id: string, data: any, req: any): Promise<{
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
}
