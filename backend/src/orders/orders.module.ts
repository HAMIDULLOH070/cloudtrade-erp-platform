import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PurchaseOrdersController } from './purchase-orders.controller';

@Module({
  providers: [OrdersService],
  controllers: [OrdersController, PurchaseOrdersController],
  exports: [OrdersService],
})
export class OrdersModule {}
