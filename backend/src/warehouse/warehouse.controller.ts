import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { WarehouseService } from './warehouse.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('warehouse')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WarehouseController {
  constructor(private warehouseService: WarehouseService) {}

  @Get('zones')
  async getZones() {
    return this.warehouseService.getZones();
  }

  @Get('movements')
  async getMovements(
    @Query('type') type?: string,
    @Query('productId') productId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.warehouseService.getMovements({ type, productId, page, limit });
  }

  @Get('low-stock')
  async getLowStockAlerts() {
    return this.warehouseService.getLowStockAlerts();
  }

  @Post('transfers')
  @Roles('Admin', 'Warehouse Staff', 'Manager')
  async createTransfer(@Body() data: any, @Req() req: any) {
    return this.warehouseService.createTransfer(data, req.user.id);
  }
}
