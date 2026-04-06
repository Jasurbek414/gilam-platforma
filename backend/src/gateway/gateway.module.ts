import { Module } from '@nestjs/common';
import { CallsGateway } from './calls.gateway';
import { SipBridgeGateway } from './sip-bridge.gateway';

@Module({
  providers: [CallsGateway, SipBridgeGateway],
  exports: [CallsGateway, SipBridgeGateway],
})
export class GatewayModule {}
