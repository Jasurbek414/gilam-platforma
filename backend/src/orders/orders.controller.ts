import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, UserRole } from '../users/entities/user.entity';

@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto, @CurrentUser() user: User) {
    // Force companyId from authenticated user for security
    createOrderDto.companyId = user.companyId;
    return this.ordersService.create(createOrderDto);
  }

  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @Get('company/:companyId')
  findAllByCompany(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @CurrentUser() user: User,
  ) {
    // Security: Only allow users to see their own company's orders
    const targetCompanyId =
      user.role === UserRole.SUPER_ADMIN ? companyId : user.companyId;
    return this.ordersService.findAllByCompany(targetCompanyId);
  }

  @Get('company/:companyId/stats')
  getCompanyStats(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @CurrentUser() user: User,
  ) {
    const targetCompanyId =
      user.role === UserRole.SUPER_ADMIN ? companyId : user.companyId;
    return this.ordersService.getCompanyStats(targetCompanyId);
  }

  @Get('driver/:driverId')
  getDriverActiveOrders(@Param('driverId', ParseUUIDPipe) driverId: string) {
    return this.ordersService.getDriverActiveOrders(driverId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(id, updateOrderStatusDto);
  }
}
