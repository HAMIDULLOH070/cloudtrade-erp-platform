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

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Get()
  async findAllOrders(
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.ordersService.findAllOrders({ status, search, page, limit });
  }

  @Get(':id')
  async findOneOrder(@Param('id') id: string) {
    return this.ordersService.findOneOrder(id);
  }

  @Post()
  @Roles('Admin', 'Sales Staff', 'Manager')
  async createOrder(@Body() data: any, @Req() req: any) {
    return this.ordersService.createOrder(data, req.user.id);
  }

  @Put(':id')
  @Roles('Admin', 'Sales Staff', 'Manager')
  async updateOrder(
    @Param('id') id: string,
    @Body() data: any,
    @Req() req: any,
  ) {
    return this.ordersService.updateOrder(id, data, req.user.id);
  }
}
