import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { TelephonyService } from './telephony.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('telephony')
@UseGuards(JwtAuthGuard)
export class TelephonyController {
  constructor(private readonly telephonyService: TelephonyService) {}

  @Get('config/:companyId')
  async getConfig(@Param('companyId') companyId: string) {
    return this.telephonyService.getSipConfig(companyId);
  }

  @Post('config')
  async updateConfig(@Body() body: any, @Request() req: any) {
    // Determine the companyId from JWT if possible or passed.
    const companyId = req.user.companyId || body.companyId;
    return this.telephonyService.updateSipConfig(companyId, body.credentials);
  }
}
