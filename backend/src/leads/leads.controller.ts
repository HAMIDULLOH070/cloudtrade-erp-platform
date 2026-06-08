import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { LeadsService } from './leads.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('leads')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LeadsController {
  constructor(private leadsService: LeadsService) {}

  @Get()
  async findAll(
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.leadsService.findAll({ status, search, page, limit });
  }

  @Get('pipeline')
  async getPipeline() {
    return this.leadsService.getPipeline();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.leadsService.findOne(id);
  }

  @Post()
  @Roles('Admin', 'Sales Staff', 'Manager')
  async create(@Body() data: any) {
    return this.leadsService.create(data);
  }

  @Put(':id')
  @Roles('Admin', 'Sales Staff', 'Manager')
  async update(@Param('id') id: string, @Body() data: any) {
    return this.leadsService.update(id, data);
  }

  @Delete(':id')
  @Roles('Admin', 'Manager')
  async remove(@Param('id') id: string) {
    return this.leadsService.remove(id);
  }
}
