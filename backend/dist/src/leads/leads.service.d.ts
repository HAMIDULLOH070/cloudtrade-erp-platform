import { PrismaService } from '../prisma.service';
export declare class LeadsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(query: {
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
        } & {
            id: string;
            customerId: string;
            status: string;
            value: number;
            source: string;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOne(id: string): Promise<({
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
    } & {
        id: string;
        customerId: string;
        status: string;
        value: number;
        source: string;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
    }) | null>;
    create(data: any): Promise<{
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
    } & {
        id: string;
        customerId: string;
        status: string;
        value: number;
        source: string;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, data: any): Promise<{
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
    } & {
        id: string;
        customerId: string;
        status: string;
        value: number;
        source: string;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
        customerId: string;
        status: string;
        value: number;
        source: string;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getPipeline(): Promise<{
        stage: string;
        count: number;
        value: number;
    }[]>;
}
