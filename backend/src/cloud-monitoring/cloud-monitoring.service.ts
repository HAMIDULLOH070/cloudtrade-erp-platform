import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CloudMonitoringService {
  private simulateHighLoad = false;

  constructor(private prisma: PrismaService) {}

  async getResources() {
    return this.prisma.cloudResource.findMany();
  }

  async getMetrics(limit = 30) {
    // Fetch recent metrics
    const dbMetrics = await this.prisma.cloudMetric.findMany({
      orderBy: { timestamp: 'desc' },
      take: limit,
    });

    const metrics = dbMetrics.reverse();

    // If simulated high load is toggled, skew the most recent metrics to show a spike
    if (this.simulateHighLoad && metrics.length > 0) {
      const last = metrics[metrics.length - 1];
      last.cpuUsage = Math.round((85 + Math.random() * 10) * 100) / 100;
      last.memoryUsage = Math.round((88 + Math.random() * 5) * 100) / 100;
      last.apiResponseTime = Math.round((480 + Math.random() * 150) * 10) / 10;
      last.errorsCount = Math.floor(Math.random() * 8) + 2;
    }

    return metrics;
  }

  async getScalingLogs() {
    return [
      {
        id: '1',
        timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
        event: 'Scale Out',
        details:
          "ERP asosiy serverining auto-scaling guruhiga 1 ta namuna qo'shildi. Sababi: 5 daqiqa davomida CPU yuklanishi > 80%.",
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 3 * 3600000).toISOString(),
        event: 'Scale In',
        details:
          'ERP asosiy serverining auto-scaling guruhidan 1 ta namuna olib tashlandi. Sababi: 15 daqiqa davomida CPU yuklanishi < 25%.',
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 12 * 3600000).toISOString(),
        event: 'Scale Out',
        details:
          "CDN tugunlari ro'yxatiga 2 ta namuna qo'shildi. Sababi: Yevropa CDN keshlaridan yuqori trafik yuklanishi.",
      },
      {
        id: '4',
        timestamp: new Date(Date.now() - 24 * 3600000).toISOString(),
        event: 'Scale In',
        details:
          "CDN tugunlari ro'yxatidan 1 ta namuna olib tashlandi. Sababi: Past trafik chegarasiga erishildi.",
      },
    ];
  }

  async getSecurityLogs() {
    return [
      {
        id: '1',
        timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
        severity: 'LOW',
        message:
          "IP 192.168.4.15 manzildan mijozlar fikr-mulohazalari formasida SQL-in'ektsiya urinishi to'sildi.",
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 40 * 60000).toISOString(),
        severity: 'MEDIUM',
        message:
          "DDoS hujumini yumshatish faol. /auth/login manziliga murojaat qilayotgan 14 ta IP uchun so'rovlar chastotasi cheklandi.",
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
        severity: 'LOW',
        message:
          'IP 203.0.113.120 manzildan SSH orqali "root" foydalanuvchisi sifatida kirish urinishi muvaffaqiyatsiz tugadi.',
      },
      {
        id: '4',
        timestamp: new Date(Date.now() - 8 * 3600000).toISOString(),
        severity: 'HIGH',
        message:
          "Yopiq tarmoqdagi ma'lumotlar bazasi serveriga nisbatan portlarni skanerlash urinishi bloklandi.",
      },
    ];
  }

  async toggleSimulation(highLoad: boolean) {
    this.simulateHighLoad = highLoad;

    // Save a new metric log representing the state
    const baseCpu = highLoad ? 88 : 22;
    const baseMem = highLoad ? 87 : 58;
    const respTime = highLoad ? 450 : 135;
    const reqs = highLoad ? 450 : 80;
    const errs = highLoad ? 6 : 0;

    await this.prisma.cloudMetric.create({
      data: {
        timestamp: new Date(),
        cpuUsage: Math.round((baseCpu + Math.random() * 8) * 100) / 100,
        memoryUsage: Math.round((baseMem + Math.random() * 2) * 100) / 100,
        diskUsage: 42.8,
        apiResponseTime: Math.round((respTime + Math.random() * 50) * 10) / 10,
        apiUptime: 99.98,
        requestsCount: reqs,
        errorsCount: errs,
        activeConnections: reqs * 2,
      },
    });

    return { simulateHighLoad: this.simulateHighLoad };
  }

  async getStatus() {
    const resources = await this.prisma.cloudResource.findMany();
    const metrics = await this.getMetrics(1);
    const lastMetric = metrics[metrics.length - 1];

    const alertsCount =
      lastMetric && (lastMetric.cpuUsage > 80 || lastMetric.errorsCount > 3)
        ? 1
        : 0;

    return {
      status: alertsCount > 0 ? 'WARNING' : 'HEALTHY',
      alertsCount,
      cpuUsage: lastMetric ? lastMetric.cpuUsage : 0,
      apiResponseTime: lastMetric ? lastMetric.apiResponseTime : 0,
      uptime: 99.98,
      resourcesCount: resources.length,
      simulateHighLoad: this.simulateHighLoad,
    };
  }
}
