import { PrismaService } from '../prisma.service';
export declare class CloudMonitoringService {
    private prisma;
    private simulateHighLoad;
    constructor(prisma: PrismaService);
    getResources(): Promise<{
        id: string;
        name: string;
        type: string;
        status: string;
        ipAddress: string | null;
        zone: string | null;
        createdAt: Date;
    }[]>;
    getMetrics(limit?: number): Promise<{
        id: string;
        timestamp: Date;
        cpuUsage: number;
        memoryUsage: number;
        diskUsage: number;
        apiResponseTime: number;
        apiUptime: number;
        requestsCount: number;
        errorsCount: number;
        activeConnections: number;
    }[]>;
    getScalingLogs(): Promise<{
        id: string;
        timestamp: string;
        event: string;
        details: string;
    }[]>;
    getSecurityLogs(): Promise<{
        id: string;
        timestamp: string;
        severity: string;
        message: string;
    }[]>;
    toggleSimulation(highLoad: boolean): Promise<{
        simulateHighLoad: boolean;
    }>;
    getStatus(): Promise<{
        status: string;
        alertsCount: number;
        cpuUsage: number;
        apiResponseTime: number;
        uptime: number;
        resourcesCount: number;
        simulateHighLoad: boolean;
    }>;
}
