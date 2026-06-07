import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { CustomersModule } from './customers/customers.module';
import { LeadsModule } from './leads/leads.module';
import { OrdersModule } from './orders/orders.module';
import { WarehouseModule } from './warehouse/warehouse.module';
import { InvoicesModule } from './invoices/invoices.module';
import { CloudMonitoringModule } from './cloud-monitoring/cloud-monitoring.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    ProductsModule,
    SuppliersModule,
    CustomersModule,
    LeadsModule,
    OrdersModule,
    WarehouseModule,
    InvoicesModule,
    CloudMonitoringModule,
    ReportsModule,
  ],
})
export class AppModule {}
