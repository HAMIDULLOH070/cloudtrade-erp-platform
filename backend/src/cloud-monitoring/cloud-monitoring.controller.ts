import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { CloudMonitoringService } from './cloud-monitoring.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('cloud')
@UseGuards(JwtAuthGuard)
export class CloudMonitoringController {
  constructor(private cloudService: CloudMonitoringService) {}

  @Get('resources')
  async getResources() {
    return this.cloudService.getResources();
  }

  @Get('metrics')
  async getMetrics(@Query('limit') limit?: string) {
    const lim = limit ? Number(limit) : 30;
    return this.cloudService.getMetrics(lim);
  }

  @Get('logs/scaling')
  async getScalingLogs() {
    return this.cloudService.getScalingLogs();
  }

  @Get('logs/security')
  async getSecurityLogs() {
    return this.cloudService.getSecurityLogs();
  }

  @Get('status')
  async getStatus() {
    return this.cloudService.getStatus();
  }

  @Post('simulation')
  async toggleSimulation(@Body('highLoad') highLoad: boolean) {
    return this.cloudService.toggleSimulation(highLoad);
  }
}
