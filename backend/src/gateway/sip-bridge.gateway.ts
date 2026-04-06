import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, Inject, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as dgram from 'dgram';
import * as crypto from 'crypto';
import { CallsService } from '../calls/calls.service';
import { CallStatus } from '../calls/entities/call.entity';

const SIP_SERVER = '10.100.100.1';
const SIP_PORT = 5060;
const SIP_USER = '101';
const SIP_PASS = 'a1234567a';
const SIP_DOMAIN = '10.100.100.1';
const LOCAL_PORT = 55060;

function md5(s: string) {
  return crypto.createHash('md5').update(s).digest('hex');
}

function digestAuth(method: string, uri: string, realm: string, nonce: string) {
  const ha1 = md5(`${SIP_USER}:${realm}:${SIP_PASS}`);
  const ha2 = md5(`${method}:${uri}`);
  const response = md5(`${ha1}:${nonce}:${ha2}`);
  return `Digest username="${SIP_USER}", realm="${realm}", nonce="${nonce}", uri="${uri}", response="${response}", algorithm=MD5`;
}

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/sip',
})
export class SipBridgeGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(SipBridgeGateway.name);

  private udp: dgram.Socket;
  private cseq = 1;
  private callId = '';
  private registered = false;
  private lastDialedTarget = '';
  private activeCallId = '';
  private activeBranch = '';
  private activeTag = '';
  private remoteTag = '';
  private remoteContact = '';
  private localTag = '';
  private activeCallDbId: string | null = null;
  private currentOperatorId: string | null = null;
  private currentCompanyId: string | null = null;

  constructor(
    @Inject(forwardRef(() => CallsService))
    private callsService: CallsService,
    private configService: ConfigService,
  ) {}

  afterInit() {
    this.udp = dgram.createSocket('udp4');
    this.udp.bind(LOCAL_PORT, () => {
      this.logger.log(`SIP UDP socket opened on port ${LOCAL_PORT}`);
    });

    this.udp.on('message', (msg) => {
      this.handleSipMessage(msg.toString());
    });

    this.udp.on('error', (err) => {
      this.logger.error('UDP error: ' + err.message);
    });

    setTimeout(() => this.register(), 1000);
  }

  handleConnection(client: Socket) {
    this.logger.log(`SIP WS client connected: ${client.id}`);
    // Emit individually first
    client.emit('sip:status', { registered: this.registered });
    // Then broadcast to ensure everyone is synced
    this.server.emit('sip:status', { registered: this.registered });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`SIP WS client disconnected: ${client.id}`);
  }

  private sendUdp(message: string) {
    const firstLine = message.split('\r\n')[0];
    this.logger.debug(`SIP OUT: ${firstLine}`);
    const buf = Buffer.from(message);
    this.udp.send(buf, SIP_PORT, SIP_SERVER, (err) => {
      if (err) this.logger.error('UDP send error: ' + err.message);
    });
  }

  private register(auth?: { realm: string; nonce: string }) {
    const branch = 'z9hG4bK' + Math.random().toString(36).slice(2);
    this.localTag = Math.random().toString(36).slice(2, 10);
    const callId = this.callId || (Math.random().toString(36).slice(2) + '@' + SIP_DOMAIN);
    if (!this.callId) this.callId = callId;

    const authHeader = auth
      ? `Authorization: ${digestAuth('REGISTER', `sip:${SIP_DOMAIN}`, auth.realm, auth.nonce)}\r\n`
      : '';

    const msg = [
      `REGISTER sip:${SIP_DOMAIN} SIP/2.0`,
      `Via: SIP/2.0/UDP 10.100.100.18:${LOCAL_PORT};branch=${branch}`,
      `From: <sip:${SIP_USER}@${SIP_DOMAIN}>;tag=${this.localTag}`,
      `To: <sip:${SIP_USER}@${SIP_DOMAIN}>`,
      `Call-ID: ${callId}`,
      `CSeq: ${this.cseq++} REGISTER`,
      `Contact: <sip:${SIP_USER}@10.100.100.18:${LOCAL_PORT}>`,
      `Max-Forwards: 70`,
      `Expires: 300`,
      `Content-Length: 0`,
      authHeader.trimEnd(),
      '\r\n',
    ].filter(Boolean).join('\r\n');

    this.sendUdp(msg);
  }

  private handleSipMessage(msg: string) {
    const firstLine = msg.split('\r\n')[0];
    this.logger.debug(`SIP IN: ${firstLine}`);

    if (msg.startsWith('SIP/2.0 401') || msg.startsWith('SIP/2.0 407')) {
      const realmMatch = msg.match(/realm="([^"]+)"/);
      const nonceMatch = msg.match(/nonce="([^"]+)"/);
      if (realmMatch && nonceMatch) {
        const realm = realmMatch[1];
        const nonce = nonceMatch[1];
        
        if (this.activeCallId && msg.includes('INVITE')) {
          this.retryInviteWithAuth(realm, nonce);
        } else {
          this.register({ realm, nonce });
        }
      }
      return;
    }

    if (msg.startsWith('SIP/2.0 200') && msg.includes('CSeq:') && msg.includes('REGISTER')) {
      if (!this.registered) {
        this.registered = true;
        this.logger.log('SIP: Registered successfully!');
        this.server.emit('sip:status', { registered: true });
      }
      setTimeout(() => this.register(), 240000);
      return;
    }

    if (msg.startsWith('SIP/2.0 200') && this.activeCallId) {
      const toTagMatch = msg.match(/To:.*?tag=([^\s;]+)/);
      if (toTagMatch) this.remoteTag = toTagMatch[1];
      const contactMatch = msg.match(/^Contact:\s*<([^>]+)>/im);
      if (contactMatch) this.remoteContact = contactMatch[1];

      this.sendAck();
      this.server.emit('sip:call_answered', { callId: this.activeCallId });
      return;
    }

    if (msg.startsWith('SIP/2.0 180')) {
      this.server.emit('sip:ringing', { callId: this.activeCallId });
      return;
    }

    if (msg.match(/^SIP\/2\.0 [4-6]\d\d/) && this.activeCallId) {
      const statusLine = firstLine;
      this.sendAck();
      if (this.activeCallDbId && this.currentOperatorId && this.currentCompanyId) {
        this.callsService.completeCall(this.activeCallDbId, this.currentOperatorId, this.currentCompanyId, { notes: `SIP Error: ${statusLine}` }).catch(() => {});
      }
      this.server.emit('sip:call_failed', { callId: this.activeCallId, reason: statusLine });
      this.activeCallId = '';
      this.activeCallDbId = null;
      return;
    }

    if (firstLine.startsWith('INVITE')) {
      const fromMatch = msg.match(/^From:.*?<sip:([^@>]+)@/im);
      const caller = fromMatch ? fromMatch[1] : 'Unknown';
      const callIdMatch = msg.match(/^Call-ID:\s*(.+)/im);
      const incomingCallId = callIdMatch ? callIdMatch[1].trim() : '';

      const viaMatch = msg.match(/^Via:.*$/im);
      const fromTagMatch = msg.match(/^From:.*?tag=([^\s;]+)/im);
      const toMatch = msg.match(/^To:.*$/im);
      const cseqMatch = msg.match(/^CSeq:.*$/im);

      const ringTag = Math.random().toString(36).slice(2, 10);
      const ringing = [
        `SIP/2.0 180 Ringing`,
        viaMatch ? viaMatch[0] : '',
        toMatch ? toMatch[0] + ';tag=' + ringTag : '',
        fromMatch ? `From: ${msg.match(/^From:.*$/im)?.[0]?.replace('From: ', '') || ''}` : '',
        `Call-ID: ${incomingCallId}`,
        cseqMatch ? cseqMatch[0] : '',
        `Contact: <sip:${SIP_USER}@10.100.100.18:${LOCAL_PORT}>`,
        `Content-Length: 0`,
        '\r\n',
      ].filter(Boolean).join('\r\n');

      this.sendUdp(ringing);
      this.server.emit('sip:incoming_call', { caller, callId: incomingCallId });
      return;
    }

    if (firstLine.startsWith('BYE') || firstLine.startsWith('CANCEL')) {
      const okBye = msg.replace(firstLine.split(' ')[0], 'SIP/2.0 200 OK').split('\r\n').slice(0, 8).join('\r\n') + '\r\nContent-Length: 0\r\n\r\n';
      this.sendUdp(okBye);
      if (this.activeCallDbId && this.currentOperatorId && this.currentCompanyId) {
        this.callsService.completeCall(this.activeCallDbId, this.currentOperatorId, this.currentCompanyId, { notes: 'Finished' }).catch(() => {});
      }
      this.server.emit('sip:call_ended', { callId: this.activeCallId });
      this.activeCallId = '';
      this.activeCallDbId = null;
      return;
    }
  }

  private sendAck() {
    if (!this.activeCallId) return;
    const contact = this.remoteContact || `sip:${SIP_SERVER}`;
    const ack = [
      `ACK ${contact} SIP/2.0`,
      `Via: SIP/2.0/UDP 10.100.100.18:${LOCAL_PORT};branch=${this.activeBranch}`,
      `From: <sip:${SIP_USER}@${SIP_DOMAIN}>;tag=${this.activeTag}`,
      `To: <sip:${SIP_USER}@${SIP_DOMAIN}>;tag=${this.remoteTag}`,
      `Call-ID: ${this.activeCallId}`,
      `CSeq: ${this.cseq - 1} ACK`,
      `Max-Forwards: 70`,
      `Content-Length: 0`,
      '\r\n',
    ].join('\r\n');
    this.sendUdp(ack);
  }

  @SubscribeMessage('sip:call')
  async handleCall(@MessageBody() data: { target: string, operatorId?: string, companyId?: string }, @ConnectedSocket() client: any) {
    this.logger.log(`SIP CALL REQUEST: to ${data.target}`);
    
    if (!this.registered) {
      this.logger.warn('SIP CALL FAILED: Not registered');
      client.emit('sip:error', { message: 'SIP serverga ulanilmagan' });
      return;
    }

    this.currentOperatorId = data.operatorId || client.user?.id || 'manual-operator';
    this.currentCompanyId = data.companyId || client.user?.company?.id || null;

    if (!this.currentCompanyId) {
       this.logger.warn('SIP CALL CAUTION: Missing CompanyId');
    }

    const cleanTarget = data.target.replace(/\D/g, '');
    this.logger.log(`SIP OUT: Dialing ${cleanTarget} (Operator: ${this.currentOperatorId}, Company: ${this.currentCompanyId})`);
    
    try {
      if (this.currentOperatorId && this.currentCompanyId) {
        this.logger.debug(`Saving call log to DB for operator ${this.currentOperatorId}...`);
        const dbCall = await this.callsService.createOutgoing(this.currentOperatorId, this.currentCompanyId, {
          callerPhone: cleanTarget,
          campaignId: undefined
        });
        this.activeCallDbId = dbCall.id;
        this.logger.log(`Call log saved to DB with ID: ${this.activeCallDbId}`);
      } else {
        this.logger.warn(`SKIPPING DB LOG: Missing OperatorId (${this.currentOperatorId}) or CompanyId (${this.currentCompanyId})`);
      }
    } catch (e) {
      this.logger.error(`DATABASE LOG ERROR: ${e.message}`, e.stack);
    }

    const branch = 'z9hG4bK' + Math.random().toString(36).slice(2);
    const tag = Math.random().toString(36).slice(2, 10);
    const callId = Math.random().toString(36).slice(2) + '@gilam';
    this.cseq = 1;
    this.activeCallId = callId;
    this.activeBranch = branch;
    this.activeTag = tag;
    this.lastDialedTarget = cleanTarget;

    const sdp = [
      'v=0',
      `o=- ${Math.floor(Date.now()/1000)} 1 IN IP4 10.100.100.18`,
      's=Gilam Call',
      `c=IN IP4 10.100.100.18`,
      't=0 0',
      'm=audio 10000 RTP/AVP 8 0 101',
      'a=rtpmap:8 PCMA/8000',
      'a=rtpmap:0 PCMU/8000',
      'a=rtpmap:101 telephone-event/8000',
      'a=fmtp:101 0-16',
      'a=sendrecv',
      'a=ptime:20',
      '',
    ].join('\r\n');

    const invite = [
      `INVITE sip:${cleanTarget}@${SIP_DOMAIN} SIP/2.0`,
      `Via: SIP/2.0/UDP 10.100.100.18:${LOCAL_PORT};branch=${branch}`,
      `From: "Gilam Operator" <sip:${SIP_USER}@${SIP_DOMAIN}>;tag=${tag}`,
      `To: <sip:${cleanTarget}@${SIP_DOMAIN}>`,
      `Call-ID: ${callId}`,
      `CSeq: ${this.cseq++} INVITE`,
      `Contact: <sip:${SIP_USER}@10.100.100.18:${LOCAL_PORT}>`,
      `Max-Forwards: 70`,
      `User-Agent: Gilam/1.1`,
      `Content-Type: application/sdp`,
      `Content-Length: ${sdp.length}`,
      '',
      sdp,
    ].join('\r\n');

    this.sendUdp(invite);
    this.logger.log(`Outgoing call to ${cleanTarget}`);
    client.emit('sip:calling', { target: cleanTarget, callId });
  }

  private retryInviteWithAuth(realm: string, nonce: string) {
    if (!this.activeCallId || !this.lastDialedTarget) return;

    const authHeader = `Authorization: ${digestAuth('INVITE', `sip:${this.lastDialedTarget}@${SIP_DOMAIN}`, realm, nonce)}\r\n`;
    
    const sdp = [
      'v=0',
      `o=- ${Math.floor(Date.now()/1000)} 2 IN IP4 10.100.100.18`,
      's=Gilam Call',
      `c=IN IP4 10.100.100.18`,
      't=0 0',
      'm=audio 10000 RTP/AVP 8 0 101',
      'a=rtpmap:8 PCMA/8000',
      'a=rtpmap:0 PCMU/8000',
      'a=rtpmap:101 telephone-event/8000',
      'a=fmtp:101 0-16',
      'a=sendrecv',
      'a=ptime:20',
      '',
    ].join('\r\n');

    const invite = [
      `INVITE sip:${this.lastDialedTarget}@${SIP_DOMAIN} SIP/2.0`,
      `Via: SIP/2.0/UDP 10.100.100.18:${LOCAL_PORT};branch=z9hG4bK${Math.random().toString(36).slice(2)}`,
      `From: "Gilam Operator" <sip:${SIP_USER}@${SIP_DOMAIN}>;tag=${this.activeTag}`,
      `To: <sip:${this.lastDialedTarget}@${SIP_DOMAIN}>`,
      `Call-ID: ${this.activeCallId}`,
      `CSeq: ${this.cseq++} INVITE`,
      authHeader.trimEnd(),
      `Contact: <sip:${SIP_USER}@10.100.100.18:${LOCAL_PORT}>`,
      `Max-Forwards: 70`,
      `User-Agent: Gilam/1.1`,
      `Content-Type: application/sdp`,
      `Content-Length: ${sdp.length}`,
      '',
      sdp,
    ].join('\r\n');

    this.sendUdp(invite);
    this.logger.log(`Retrying call to ${this.lastDialedTarget} with Auth`);
  }

  @SubscribeMessage('sip:hangup')
  handleHangup(@ConnectedSocket() client: Socket) {
    if (!this.activeCallId) return;

    const bye = [
      `BYE ${this.remoteContact || `sip:${SIP_SERVER}`} SIP/2.0`,
      `Via: SIP/2.0/UDP 10.100.100.18:${LOCAL_PORT};branch=z9hG4bK${Math.random().toString(36).slice(2)}`,
      `From: <sip:${SIP_USER}@${SIP_DOMAIN}>;tag=${this.activeTag}`,
      `To: <sip:${SIP_USER}@${SIP_DOMAIN}>;tag=${this.remoteTag}`,
      `Call-ID: ${this.activeCallId}`,
      `CSeq: ${this.cseq++} BYE`,
      `Max-Forwards: 70`,
      `Content-Length: 0`,
      '\r\n',
    ].join('\r\n');

    if (this.activeCallDbId && this.currentOperatorId && this.currentCompanyId) {
      this.callsService.completeCall(this.activeCallDbId, this.currentOperatorId, this.currentCompanyId, { notes: 'Hangup by operator' }).catch(() => {});
    }

    this.sendUdp(bye);
    this.activeCallId = '';
    client.emit('sip:call_ended', {});
  }

  @SubscribeMessage('sip:accept')
  handleAccept(@MessageBody() data: { callId: string }, @ConnectedSocket() client: Socket) {
    // 200 OK for incoming INVITE
    client.emit('sip:call_answered', { callId: data.callId });
  }

  @SubscribeMessage('sip:reject')
  handleReject(@MessageBody() data: { callId: string }) {
    // 486 Busy Here
  }

  @SubscribeMessage('sip:status')
  handleStatus(@ConnectedSocket() client: Socket) {
    client.emit('sip:status', { registered: this.registered });
  }
}
