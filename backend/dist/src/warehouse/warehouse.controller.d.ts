import { WarehouseService } from './warehouse.service';
export declare class WarehouseController {
    private warehouseService;
    constructor(warehouseService: WarehouseService);
    getZones(): Promise<{
        id: string;
        name: string;
        code: string;
        capacity: number;
        currentUsage: number;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getMovements(type?: string, productId?: string, page?: string, limit?: string): Promise<{
        items: ({
            user: {
                email: string;
                firstName: string;
                lastName: string;
            } | null;
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
            productId: string;
            quantity: number;
            type: string;
            fromZone: string | null;
            toZone: string | null;
            referenceId: string | null;
            userId: string | null;
            createdAt: Date;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getLowStockAlerts(): Promise<({
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
    } & {
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
    })[]>;
    createTransfer(data: any, req: any): Promise<{
        id: string;
        productId: string;
        quantity: number;
        type: string;
        fromZone: string | null;
        toZone: string | null;
        referenceId: string | null;
        userId: string | null;
        createdAt: Date;
    }>;
}
