import { PrismaService } from '../prisma.service';
export declare class CustomersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(query: {
        category?: string;
        search?: string;
        page?: string;
        limit?: string;
    }): Promise<{
        items: {
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
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOne(id: string): Promise<({
        leads: {
            id: string;
            customerId: string;
            status: string;
            value: number;
            source: string;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
        orders: {
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
        }[];
    } & {
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
    }) | null>;
    create(data: any): Promise<{
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
    }>;
    update(id: string, data: any): Promise<{
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
    }>;
    remove(id: string): Promise<{
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
    }>;
    getCategories(): Promise<string[]>;
}
