import { LeadsService } from './leads.service';
export declare class LeadsController {
    private leadsService;
    constructor(leadsService: LeadsService);
    findAll(status?: string, search?: string, page?: string, limit?: string): Promise<{
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
    getPipeline(): Promise<{
        stage: string;
        count: number;
        value: number;
    }[]>;
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
}
