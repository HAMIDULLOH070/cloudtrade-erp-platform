import { Module } from '@nestjs/common';
import { CloudMonitoringService } from './cloud-monitoring.service';
import { CloudMonitoringController } from './cloud-monitoring.controller';

@Module({
  providers: [CloudMonitoringService],
  controllers: [CloudMonitoringController],
  exports: [CloudMonitoringService],
})
export class CloudMonitoringModule {}
