import { Controller, Get, Post, Body, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, UserRole } from '../users/entities/user.entity';

@Controller('facility-stages')
@UseGuards(JwtAuthGuard)
export class StagesController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('company/:companyId')
  async getStages(@Param('companyId', ParseUUIDPipe) companyId: string) {
    return this.ordersService.getFacilityStages(companyId);
  }

  @Post()
  async createStage(
    @Body('companyId') companyId: string,
    @Body('name') name: string,
    @Body('icon') icon: string,
  ) {
    return this.ordersService.createFacilityStage(companyId, name, icon);
  }
}
