import { PrismaService } from '../prisma.service';
export declare class InvoicesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAllInvoices(query: {
        status?: string;
        search?: string;
        page?: string;
        limit?: string;
    }): Promise<{
        items: ({
            order: {
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
            };
            payments: {
                id: string;
                paymentNumber: string;
                invoiceId: string;
                amount: number;
                paymentMethod: string;
                paymentDate: Date;
                reference: string | null;
                createdAt: Date;
            }[];
        } & {
            id: string;
            invoiceNumber: string;
            orderId: string;
            amount: number;
            status: string;
            dueDate: Date;
            issuedDate: Date;
            createdAt: Date;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOneInvoice(id: string): Promise<{
        order: {
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
        };
        payments: {
            id: string;
            paymentNumber: string;
            invoiceId: string;
            amount: number;
            paymentMethod: string;
            paymentDate: Date;
            reference: string | null;
            createdAt: Date;
        }[];
    } & {
        id: string;
        invoiceNumber: string;
        orderId: string;
        amount: number;
        status: string;
        dueDate: Date;
        issuedDate: Date;
        createdAt: Date;
    }>;
    recordPayment(invoiceId: string, data: any): Promise<{
        id: string;
        paymentNumber: string;
        invoiceId: string;
        amount: number;
        paymentMethod: string;
        paymentDate: Date;
        reference: string | null;
        createdAt: Date;
    }>;
    findAllPayments(query: {
        page?: string;
        limit?: string;
    }): Promise<{
        items: ({
            invoice: {
                order: {
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
                };
            } & {
                id: string;
                invoiceNumber: string;
                orderId: string;
                amount: number;
                status: string;
                dueDate: Date;
                issuedDate: Date;
                createdAt: Date;
            };
        } & {
            id: string;
            paymentNumber: string;
            invoiceId: string;
            amount: number;
            paymentMethod: string;
            paymentDate: Date;
            reference: string | null;
            createdAt: Date;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findAllExpenses(query: {
        category?: string;
        page?: string;
        limit?: string;
    }): Promise<{
        items: {
            id: string;
            title: string;
            category: string;
            amount: number;
            description: string | null;
            date: Date;
            createdAt: Date;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    createExpense(data: any): Promise<{
        id: string;
        title: string;
        category: string;
        amount: number;
        description: string | null;
        date: Date;
        createdAt: Date;
    }>;
}
