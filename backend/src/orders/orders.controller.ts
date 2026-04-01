import { Controller, Get, Post, Body, Param, Patch, ParseUUIDPipe } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @Get('company/:companyId')
  findAllByCompany(@Param('companyId', ParseUUIDPipe) companyId: string) {
    return this.ordersService.findAllByCompany(companyId);
  }

  @Get('company/:companyId/stats')
  getCompanyStats(@Param('companyId', ParseUUIDPipe) companyId: string) {
    return this.ordersService.getCompanyStats(companyId);
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
