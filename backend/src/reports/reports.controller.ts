import { Controller, Get, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('dashboard')
  async getDashboardStats() {
    return this.reportsService.getDashboardStats();
  }

  @Get('erp')
  @Roles('Admin', 'Accountant', 'Manager')
  async getFinancialReport() {
    return this.reportsService.getFinancialReport();
  }

  @Get('crm')
  @Roles('Admin', 'Sales Staff', 'Manager')
  async getCRMReport() {
    return this.reportsService.getCRMReport();
  }

  @Get('wms')
  @Roles('Admin', 'Warehouse Staff', 'Manager')
  async getWMSReport() {
    return this.reportsService.getWMSReport();
  }
}
