import { ProductsService } from './products.service';
export declare class ProductsController {
    private productsService;
    constructor(productsService: ProductsService);
    findAll(category?: string, search?: string, page?: string, limit?: string): Promise<{
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
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getCategories(): Promise<string[]>;
    findOne(id: string): Promise<({
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
    }) | null>;
    create(data: any): Promise<{
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
    }>;
    update(id: string, data: any): Promise<{
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
    }>;
    remove(id: string): Promise<{
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
    }>;
}
