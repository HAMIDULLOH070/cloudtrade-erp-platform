import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class InvoicesController {
  constructor(private invoicesService: InvoicesService) {}

  // Invoices
  @Get('invoices')
  @Roles('Admin', 'Accountant', 'Manager')
  async findAllInvoices(
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.invoicesService.findAllInvoices({ status, search, page, limit });
  }

  @Get('invoices/:id')
  @Roles('Admin', 'Accountant', 'Manager')
  async findOneInvoice(@Param('id') id: string) {
    return this.invoicesService.findOneInvoice(id);
  }

  @Post('invoices/:id/payments')
  @Roles('Admin', 'Accountant')
  async recordPayment(@Param('id') id: string, @Body() data: any) {
    return this.invoicesService.recordPayment(id, data);
  }

  // Payments
  @Get('payments')
  @Roles('Admin', 'Accountant', 'Manager')
  async findAllPayments(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.invoicesService.findAllPayments({ page, limit });
  }

  // Expenses
  @Get('expenses')
  @Roles('Admin', 'Accountant', 'Manager')
  async findAllExpenses(
    @Query('category') category?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.invoicesService.findAllExpenses({ category, page, limit });
  }

  @Post('expenses')
  @Roles('Admin', 'Accountant')
  async createExpense(@Body() data: any) {
    return this.invoicesService.createExpense(data);
  }
}
