import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('purchase-orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PurchaseOrdersController {
  constructor(private ordersService: OrdersService) {}

  @Get()
  async findAllPurchaseOrders(
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.ordersService.findAllPurchaseOrders({
      status,
      search,
      page,
      limit,
    });
  }

  @Get(':id')
  async findOnePurchaseOrder(@Param('id') id: string) {
    return this.ordersService.findOnePurchaseOrder(id);
  }

  @Post()
  @Roles('Admin', 'Warehouse Staff', 'Manager')
  async createPurchaseOrder(@Body() data: any, @Req() req: any) {
    return this.ordersService.createPurchaseOrder(data, req.user.id);
  }

  @Put(':id')
  @Roles('Admin', 'Warehouse Staff', 'Manager')
  async updatePurchaseOrder(
    @Param('id') id: string,
    @Body() data: any,
    @Req() req: any,
  ) {
    return this.ordersService.updatePurchaseOrder(id, data, req.user.id);
  }
}
