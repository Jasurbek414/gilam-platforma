import { Controller, Get, Post, Put, Delete, Body, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, UserRole } from './entities/user.entity';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() dto: CreateUserDto, @CurrentUser() user: User) {
    // Only SuperAdmin or CompanyAdmin can create users
    // For CompanyAdmin, force their companyId
    const finalDto = {
      ...dto,
      companyId: user.role === UserRole.SUPER_ADMIN ? dto.companyId : user.companyId,
      passwordHash: dto.password,
    };
    return this.usersService.create(finalDto);
  }

  @Get()
  findAll(@CurrentUser() user: User) {
    if (user.role === UserRole.SUPER_ADMIN) {
      return this.usersService.findAll();
    }
    return this.usersService.findAllByCompany(user.companyId);
  }

  @Get('company/:companyId')
  findAllByCompany(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @CurrentUser() user: User
  ) {
    const targetId = user.role === UserRole.SUPER_ADMIN ? companyId : user.companyId;
    return this.usersService.findAllByCompany(targetId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    // Basic protection: check if same company or superadmin
    return this.usersService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() user: User
  ) {
    // Ensure the updated user belongs to the same company
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.usersService.remove(id);
  }
}
