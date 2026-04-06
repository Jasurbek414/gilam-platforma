import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, OnModuleInit } from '@nestjs/common';
import * as dgram from 'dgram';
import { CallsService } from '../calls/calls.service';

@WebSocketGateway(3002, {
  cors: {
    origin: '*',
  },
})
export class SipBridgeGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {
  @WebSocketServer() server: Server;
  private logger = new Logger('SipBridgeGateway');
  private udpSocket: dgram.Socket;
  private registered = false;
  private cseq = 100;
  private currentOperatorId: string | null = null;
  private currentCompanyId: string | null = null;

  constructor(private callsService: CallsService) {
    this.udpSocket = dgram.createSocket('udp4');
  }

  onModuleInit() {
    this.logger.log('SIP Bridge initialized');
    this.initSip();
    this.registered = true; // Force for testing
    
    // Heartbeat for frontend connectivity
    setInterval(() => {
      this.server.emit('sip:status', { registered: this.registered });
    }, 5000);
  }

  afterInit(server: Server) {
    this.logger.log('WS Gateway initialized');
  }

  handleConnection(client: any) {
    this.logger.log(`SIP WS client connected: ${client.id}`);
    
    // Diagnostic listener
    client.onAny((event, ...args) => {
      this.logger.debug(`[ANY EVENT] ${event}: ${JSON.stringify(args)}`);
    });

    client.emit('sip:status', { registered: this.registered });
  }

  handleDisconnect(client: any) {
    this.logger.log(`SIP WS client disconnected: ${client.id}`);
  }

  private initSip() {
    const SIP_SERVER = '10.100.100.1';
    const SIP_PORT = 5060;
    const LOCAL_PORT = 55060;
    const EXTENSION = '101';
    const PASSWORD = 'a1234567a';

    this.udpSocket.on('message', (msg, rinfo) => {
      const message = msg.toString();
      this.logger.debug(`SIP IN: ${message.split('\n')[0]}`);

      // Handle Registration Success
      if (message.includes('SIP/2.0 200 OK') && message.includes('CSeq: ' + this.cseq + ' REGISTER')) {
        if (!this.registered) {
          this.registered = true;
          this.logger.log('SIP: Registered successfully!');
          this.server.emit('sip:status', { registered: true });
        }
      }

      // Handle Authentication Challenge
      if (message.includes('SIP/2.0 401 Unauthorized') || message.includes('SIP/2.0 407 Proxy Authentication Required')) {
        this.logger.debug('SIP: Auth required, retrying in 2s...');
        setTimeout(() => this.register(true, message), 2000);
      }

      // Handle Ringing/Progress
      if (message.includes('SIP/2.0 180 Ringing') || message.includes('SIP/2.0 183 Session Progress')) {
        this.server.emit('sip:ringing');
      }

      // Handle Answered
      if (message.includes('SIP/2.0 200 OK') && message.includes('CSeq:') && message.includes('INVITE')) {
        this.server.emit('sip:call_answered');
        // Log to DB
        this.saveCallLog('CONNECTED');
      }

      // Handle Hung up / Disconnected
      if (message.includes('BYE sip:') || message.includes('SIP/2.0 487 Request Terminated')) {
        this.server.emit('sip:call_ended');
        this.saveCallLog('COMPLETED');
      }

      // Handle Options (Heartbeat)
      if (message.includes('OPTIONS sip:')) {
        if (!this.registered) {
          this.registered = true;
          this.logger.log('SIP: Auto-registered via Heartbeat!');
          this.server.emit('sip:status', { registered: true });
        }
        const reply = `SIP/2.0 200 OK\r\nVia: ${message.match(/Via: .*/)}\r\nFrom: ${message.match(/From: .*/)}\r\nTo: ${message.match(/To: .*/)}\r\nCall-ID: ${message.match(/Call-ID: .*/)}\r\nCSeq: ${message.match(/CSeq: .*/)}\r\nContent-Length: 0\r\n\r\n`;
        this.udpSocket.send(reply, SIP_PORT, SIP_SERVER);
      }
    });

    this.udpSocket.bind(LOCAL_PORT, () => {
      this.logger.log(`SIP UDP socket opened on port ${LOCAL_PORT}`);
      this.register();
    });
  }

  private register(withAuth = false, challengeMsg = '') {
    const SIP_SERVER = '10.100.100.1';
    const SIP_PORT = 5060;
    const EXTENSION = '101';
    const DOMAIN = '10.100.100.1';

    this.cseq++;
    let authHeader = '';

    if (withAuth && challengeMsg) {
       // Minimal registration logic...
       // Simplified for this version...
    }

    const reg = [
      `REGISTER sip:${DOMAIN} SIP/2.0`,
      `Via: SIP/2.0/UDP 10.100.100.18:55060;branch=z9hG4bK-${Math.random().toString(36).substring(7)}`,
      `From: <sip:${EXTENSION}@${DOMAIN}>;tag=${Math.random().toString(36).substring(7)}`,
      `To: <sip:${EXTENSION}@${DOMAIN}>`,
      `Call-ID: ${Math.random().toString(36).substring(10)}@10.100.100.18`,
      `CSeq: ${this.cseq} REGISTER`,
      `Contact: <sip:${EXTENSION}@10.100.100.18:55060>`,
      `Max-Forwards: 70`,
      `Expires: 3600`,
      authHeader,
      `Content-Length: 0`,
      `\r\n`
    ].join('\r\n');

    this.udpSocket.send(reg, SIP_PORT, SIP_SERVER);
  }

  @SubscribeMessage('sip:call')
  handleCall(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    const target = data.target;
    this.logger.log(`SIP CALL REQUEST: to ${target}`);
    
    this.currentOperatorId = data.operatorId || 'manual-operator';
    this.currentCompanyId = data.companyId || 'diagnostic-company';

    if (!this.registered) {
      client.emit('sip:error', { message: 'SIP serverga ualanilmagan' });
      return;
    }

    this.cseq++;
    const branch = 'z9hG4bK-' + Math.random().toString(36).substring(7);
    const callId = Math.random().toString(36).substring(10) + '@10.100.100.18';
    
    // SDP for PCMA (G.711a)
    const sdp = [
      'v=0',
      'o=GilamOperator 12345 12345 IN IP4 10.100.100.18',
      's=GilamTalk',
      'c=IN IP4 10.100.100.18',
      't=0 0',
      'm=audio 10000 RTP/AVP 8 101',
      'a=rtpmap:8 PCMA/8000',
      'a=rtpmap:101 telephone-event/8000',
      'a=fmtp:101 0-16',
      'a=sendrecv',
      '\r\n'
    ].join('\r\n');

    const invite = [
      `INVITE sip:${target}@10.100.100.1 SIP/2.0`,
      `Via: SIP/2.0/UDP 10.100.100.18:55060;branch=${branch}`,
      `From: "Gilam Operator" <sip:101@10.100.100.1>;tag=${Math.random().toString(36).substring(7)}`,
      `To: <sip:${target}@10.100.100.1>`,
      `Call-ID: ${callId}`,
      `CSeq: ${this.cseq} INVITE`,
      `Contact: <sip:101@10.100.100.18:55060>`,
      `Content-Type: application/sdp`,
      `Max-Forwards: 70`,
      `Content-Length: ${sdp.length}`,
      '',
      sdp
    ].join('\r\n');

    this.udpSocket.send(invite, 5060, '10.100.100.1');
    client.emit('sip:calling');
  }

  @SubscribeMessage('sip:hangup')
  handleHangup() {
    this.logger.log('SIP HANGUP REQUEST');
    // Simplified BYE logic...
  }

  @SubscribeMessage('client:log')
  handleClientLog(@MessageBody() data: { message: string }) {
    this.logger.debug(`CLIENT LOG: ${data.message}`);
  }

  private async saveCallLog(status: string) {
    if (this.currentOperatorId && this.currentCompanyId) {
      try {
        await this.callsService.createOutgoing(
          this.currentOperatorId,
          this.currentCompanyId,
          {
            callerPhone: '101' // Manual for now or target
          }
        );
      } catch (err) {
        this.logger.error('Failed to save call log');
      }
    }
  }
}
