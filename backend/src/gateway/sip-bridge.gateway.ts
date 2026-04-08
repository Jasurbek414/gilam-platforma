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
import { ConfigService } from '@nestjs/config';
import * as dgram from 'dgram';
import * as crypto from 'crypto';
import * as os from 'os';
import { CallsService } from '../calls/calls.service';

// SIP session per operator socket
interface SipSession {
  socketId: string;
  operatorId: string;
  companyId: string;
  extension: string;
  password: string;
  registered: boolean;
  cseq: number;
  regCallId: string;
  regFromTag: string;
  authRetryCount: number;
  activeCall: {
    id: string;
    target: string;
    fromTag: string;
    toTag: string | null;
    branch: string;
    status: 'calling' | 'in_call' | 'idle';
  } | null;
}

function getLocalWireguardIp(): string {
  const ifaces = os.networkInterfaces();
  for (const name of Object.keys(ifaces)) {
    const addrs = ifaces[name] || [];
    for (const addr of addrs) {
      if (
        !addr.internal &&
        addr.family === 'IPv4' &&
        addr.address.startsWith('10.100.100.')
      ) {
        return addr.address;
      }
    }
  }
  // fallback: env or default
  return process.env.SIP_LOCAL_IP || '10.100.100.70';
}

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/sip',
})
export class SipBridgeGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, OnModuleInit
{
  @WebSocketServer() server: Server;
  private logger = new Logger('SipBridgeGateway');

  // SIP config from env
  private readonly SIP_SERVER: string;
  private readonly SIP_PORT: number;
  private readonly LOCAL_PORT: number;
  private readonly LOCAL_IP: string;
  private readonly DEFAULT_EXTENSION: string;
  private readonly DEFAULT_PASSWORD: string;
  private readonly DOMAIN: string;

  // Shared UDP socket for all sessions
  private udpSocket: dgram.Socket;

  // Sessions per socket id
  private sessions: Map<string, SipSession> = new Map();

  // Global registered state (shared UDP socket, shared registration)
  private globalRegistered = false;
  private globalCseq = 100;
  private globalRegCallId = Math.random().toString(36).substring(10) + '@sip';
  private globalRegFromTag = Math.random().toString(36).substring(7);
  private globalAuthRetry = 0;
  private readonly MAX_AUTH_RETRIES = 5;

  constructor(
    private callsService: CallsService,
    private configService: ConfigService,
  ) {
    this.SIP_SERVER = this.configService.get<string>('SIP_SERVER') || '10.100.100.1';
    this.SIP_PORT = parseInt(this.configService.get<string>('SIP_PORT') || '5060');
    this.LOCAL_PORT = parseInt(this.configService.get<string>('SIP_LOCAL_PORT') || '55060');
    this.LOCAL_IP = getLocalWireguardIp();
    this.DEFAULT_EXTENSION = this.configService.get<string>('SIP_EXTENSION') || '101';
    this.DEFAULT_PASSWORD = this.configService.get<string>('SIP_PASSWORD') || 'a1234567a';
    this.DOMAIN = this.configService.get<string>('SIP_DOMAIN') || this.SIP_SERVER;

    this.udpSocket = dgram.createSocket('udp4');
    this.logger.log(`SIP config: server=${this.SIP_SERVER}, localIp=${this.LOCAL_IP}, port=${this.LOCAL_PORT}`);
  }

  onModuleInit() {
    this.logger.log('SIP Bridge initializing...');
    this.initUdpSocket();

    // Heartbeat every 5s to all connected WS clients
    setInterval(() => {
      this.server.emit('sip:status', { registered: this.globalRegistered });
    }, 5000);

    // Re-register every 55 seconds (keep-alive)
    setInterval(() => {
      if (this.globalRegistered) {
        this.doRegister(false, '');
      }
    }, 55000);
  }

  afterInit() {
    this.logger.log('WS Gateway /sip initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`SIP WS client connected: ${client.id}`);
    // Send current SIP status immediately
    client.emit('sip:status', { registered: this.globalRegistered });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`SIP WS client disconnected: ${client.id}`);
    this.sessions.delete(client.id);
  }

  // ─── UDP SOCKET ──────────────────────────────────────────────────────────────

  private initUdpSocket() {
    this.udpSocket.on('message', (msg, _rinfo) => {
      const message = msg.toString();
      const firstLine = message.split('\n')[0].trim();
      this.logger.debug(`SIP IN: ${firstLine}`);
      this.handleSipMessage(message);
    });

    this.udpSocket.on('error', (err) => {
      this.logger.error(`UDP socket error: ${err.message}`);
    });

    this.udpSocket.bind(this.LOCAL_PORT, '0.0.0.0', () => {
      this.logger.log(`SIP UDP bound on ${this.LOCAL_IP}:${this.LOCAL_PORT}`);
      // Start registration immediately
      this.doRegister(false, '');
    });
  }

  // ─── SIP MESSAGE HANDLER ─────────────────────────────────────────────────────

  private handleSipMessage(message: string) {
    const firstLine = message.split('\n')[0].trim();

    // Log all non-heartbeat SIP messages fully
    if (!firstLine.startsWith('OPTIONS ')) {
      this.logger.debug(`SIP FULL MSG:\n${message}`);
    }

    // ── OPTIONS heartbeat → Reply 200 OK ──
    if (firstLine.startsWith('OPTIONS ')) {
      const viaMatch = message.match(/Via: (.*)/);
      const fromMatch = message.match(/From: (.*)/);
      const toMatch = message.match(/To: (.*)/);
      const callIdMatch = message.match(/Call-ID: (.*)/);
      const cseqMatch = message.match(/CSeq: (.*)/);

      if (!this.globalRegistered) {
        this.globalRegistered = true;
        this.logger.log('SIP: Auto-registered via OPTIONS heartbeat');
        this.server.emit('sip:status', { registered: true });
      }

      const reply = [
        'SIP/2.0 200 OK',
        `Via: ${viaMatch ? viaMatch[1].trim() : ''}`,
        `From: ${fromMatch ? fromMatch[1].trim() : ''}`,
        `To: ${toMatch ? toMatch[1].trim() : ''}`,
        `Call-ID: ${callIdMatch ? callIdMatch[1].trim() : ''}`,
        `CSeq: ${cseqMatch ? cseqMatch[1].trim() : ''}`,
        'Content-Length: 0',
        '',
        '',
      ].join('\r\n');

      this.udpSend(reply);
      return;
    }

    // ── REGISTER 200 OK ──
    if (
      message.includes('SIP/2.0 200 OK') &&
      /CSeq:\s*\d+\s+REGISTER/i.test(message)
    ) {
      this.globalRegistered = true;
      this.globalAuthRetry = 0;
      this.logger.log('SIP: ✅ Registered! (200 OK for REGISTER)');
      this.server.emit('sip:status', { registered: true });
      return;
    }

    // ── Auth challenge for REGISTER (401/407) ──
    const isRegisterChallenge =
      (message.includes('SIP/2.0 401') || message.includes('SIP/2.0 407')) &&
      message.toUpperCase().includes('REGISTER');

    if (isRegisterChallenge) {
      if (this.globalAuthRetry < this.MAX_AUTH_RETRIES) {
        this.globalAuthRetry++;
        this.logger.debug(`SIP: Auth retry ${this.globalAuthRetry}/${this.MAX_AUTH_RETRIES}`);
        setTimeout(() => this.doRegister(true, message), 500);
      } else {
        this.logger.warn('SIP: Max auth retries — marking registered (trusted IP mode)');
        this.globalRegistered = true;
        this.server.emit('sip:status', { registered: true });
      }
      return;
    }

    // ── Auth challenge for INVITE (401/407) ──
    const isInviteChallenge =
      (message.includes('SIP/2.0 401') || message.includes('SIP/2.0 407')) &&
      message.toUpperCase().includes('INVITE');

    if (isInviteChallenge) {
      this.logger.warn('SIP: INVITE auth rejected (401/407) — check credentials');
      this.server.emit('sip:call_failed', {
        reason: "Autentifikatsiya xatosi — Ruxsat yo'q (401)",
        code: '401',
      });
      return;
    }

    // ── 180 Ringing ──
    if (
      message.includes('SIP/2.0 180 Ringing') ||
      message.includes('SIP/2.0 183 Session Progress')
    ) {
      this.server.emit('sip:ringing');
      // Capture To-Tag
      this.captureToTag(message);
      return;
    }

    // ── 200 OK for INVITE (call answered) ──
    if (
      message.includes('SIP/2.0 200 OK') &&
      /CSeq:\s*\d+\s+INVITE/i.test(message)
    ) {
      this.captureToTag(message);
      // Send ACK
      this.sendAck(message);
      this.server.emit('sip:call_answered');
      this.saveCallLog('CONNECTED');
      return;
    }

    // ── INVITE error responses (4xx/5xx) excluding 401/407 ──
    const inviteErrorMatch = message.match(/SIP\/2\.0 ([4-9]\d\d) (.+)/);
    if (
      inviteErrorMatch &&
      /CSeq:\s*\d+\s+INVITE/i.test(message) &&
      !message.includes('401') &&
      !message.includes('407')
    ) {
      const code = inviteErrorMatch[1];
      const reason = inviteErrorMatch[2].trim();
      const errorMap: Record<string, string> = {
        '404': "404: Raqam topilmadi — Asterisk dial plan da bunday extension yo'q",
        '480': '480: Abonent vaqtincha mavjud emas (telefon offline)',
        '486': '486: Band (Busy Here) — abonent boshqa qo\'ng\'iroqda',
        '503': '503: Xizmat mavjud emas — Asterisk bu raqamga route topa olmadi yoki extension hech kimda ro\'yxatdan o\'tmagan',
        '488': "488: Muvofiq media formati yo'q (codec muammo)",
        '403': "403: Ruxsat yo'q — qo'ng'iroqqa ruxsat berilmagan",
        '408': '408: Vaqt tugadi — kontakt javob bermadi',
        '487': "487: Qo'ng'iroq bekor qilindi",
        '500': '500: Asterisk ichki xatosi',
        '502': '502: Gateway xatosi — SIP trunk muammo',
      };
      const friendlyReason = errorMap[code] || `${code} ${reason}`;
      this.logger.warn(`SIP: INVITE xato ${code} ${reason}`);
      this.server.emit('sip:call_failed', { reason: friendlyReason, code });
      // Reset active call state
      this.sessions.forEach((s) => {
        if (s.activeCall) s.activeCall = null;
      });
      return;
    }

    // ── BYE / CANCEL / 487 ──
    if (
      /^BYE sip:/im.test(message) ||
      message.includes('SIP/2.0 487 Request Terminated') ||
      message.includes('SIP/2.0 603 Declined')
    ) {
      this.server.emit('sip:call_ended');
      this.saveCallLog('COMPLETED');
      this.sessions.forEach((s) => { s.activeCall = null; });
      return;
    }
  }

  private captureToTag(message: string) {
    const toTagMatch = message.match(/To:.*?;tag=([^\s;,\r\n]+)/);
    if (toTagMatch) {
      this.sessions.forEach((s) => {
        if (s.activeCall && !s.activeCall.toTag) {
          s.activeCall.toTag = toTagMatch[1];
        }
      });
    }
  }

  private sendAck(message: string) {
    // Extract needed headers from 200 OK to build ACK
    const toMatch = message.match(/To: (.*)/);
    const callIdMatch = message.match(/Call-ID: (.*)/);

    this.sessions.forEach((s) => {
      if (!s.activeCall) return;
      s.cseq++;
      const ack = [
        `ACK sip:${s.activeCall.target}@${this.SIP_SERVER} SIP/2.0`,
        `Via: SIP/2.0/UDP ${this.LOCAL_IP}:${this.LOCAL_PORT};branch=${s.activeCall.branch}`,
        `From: <sip:${s.extension}@${this.DOMAIN}>;tag=${s.activeCall.fromTag}`,
        `To: ${toMatch ? toMatch[1].trim() : `<sip:${s.activeCall.target}@${this.DOMAIN}>`}`,
        `Call-ID: ${callIdMatch ? callIdMatch[1].trim() : s.activeCall.id}`,
        `CSeq: ${s.cseq} ACK`,
        'Max-Forwards: 70',
        'Content-Length: 0',
        '',
        '',
      ].join('\r\n');
      this.udpSend(ack);
    });
  }

  // ─── REGISTER ────────────────────────────────────────────────────────────────

  private doRegister(withAuth: boolean, challengeMsg: string) {
    this.globalCseq++;
    const ext = this.DEFAULT_EXTENSION;
    const password = this.DEFAULT_PASSWORD;

    const headers = [
      `REGISTER sip:${this.DOMAIN} SIP/2.0`,
      `Via: SIP/2.0/UDP ${this.LOCAL_IP}:${this.LOCAL_PORT};branch=z9hG4bK-${Math.random().toString(36).substring(7)};rport`,
      `From: <sip:${ext}@${this.DOMAIN}>;tag=${this.globalRegFromTag}`,
      `To: <sip:${ext}@${this.DOMAIN}>`,
      `Call-ID: ${this.globalRegCallId}`,
      `CSeq: ${this.globalCseq} REGISTER`,
      `Contact: <sip:${ext}@${this.LOCAL_IP}:${this.LOCAL_PORT}>`,
      'Max-Forwards: 70',
      'Expires: 3600',
      'Allow: INVITE, ACK, CANCEL, BYE, OPTIONS, REGISTER',
      'User-Agent: GilamSaaS/1.0',
    ];

    if (withAuth && challengeMsg) {
      const realmMatch = challengeMsg.match(/realm="([^"]+)"/);
      const nonceMatch = challengeMsg.match(/nonce="([^"]+)"/);
      const realm = realmMatch ? realmMatch[1] : this.DOMAIN;
      const nonce = nonceMatch ? nonceMatch[1] : '';

      const ha1 = crypto.createHash('md5').update(`${ext}:${realm}:${password}`).digest('hex');
      const ha2 = crypto.createHash('md5').update(`REGISTER:sip:${this.DOMAIN}`).digest('hex');
      const response = crypto.createHash('md5').update(`${ha1}:${nonce}:${ha2}`).digest('hex');

      headers.push(
        `Authorization: Digest username="${ext}", realm="${realm}", nonce="${nonce}", uri="sip:${this.DOMAIN}", response="${response}", algorithm=MD5`,
      );
    }

    headers.push('Content-Length: 0', '', '');
    const msg = headers.join('\r\n');
    this.logger.debug(`SIP OUT: ${msg.split('\r\n')[0]}`);
    this.udpSend(msg);
  }

  // ─── CALL ────────────────────────────────────────────────────────────────────

  @SubscribeMessage('sip:call')
  handleCall(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    const rawTarget = (data.target || '').toString().trim();
    // Keep only digits (remove +, spaces, dashes)
    const target = rawTarget.replace(/[^0-9]/g, '');

    this.logger.log(`CALL REQUEST: ${rawTarget} → sanitized: ${target}`);

    if (!target) {
      client.emit('sip:error', { message: "Raqam noto'g'ri" });
      return;
    }

    if (!this.globalRegistered) {
      client.emit('sip:error', { message: 'SIP serverga ulanilmagan' });
      return;
    }

    // Upsert session for this socket
    let session = this.sessions.get(client.id);
    if (!session) {
      session = {
        socketId: client.id,
        operatorId: data.operatorId || 'unknown',
        companyId: data.companyId || 'unknown',
        extension: data.extension || this.DEFAULT_EXTENSION,
        password: data.password || this.DEFAULT_PASSWORD,
        registered: this.globalRegistered,
        cseq: this.globalCseq + 1,
        regCallId: this.globalRegCallId,
        regFromTag: this.globalRegFromTag,
        authRetryCount: 0,
        activeCall: null,
      };
      this.sessions.set(client.id, session);
    }

    // Update operator info
    session.operatorId = data.operatorId || session.operatorId;
    session.companyId = data.companyId || session.companyId;
    const ext = session.extension;

    this.globalCseq++;
    session.cseq = this.globalCseq;

    const branch = 'z9hG4bK-' + Math.random().toString(36).substring(7);
    const callId = `${Date.now().toString(36)}.${Math.random().toString(36).substring(7)}@${this.LOCAL_IP}`;
    const fromTag = Math.random().toString(36).substring(7);

    session.activeCall = {
      id: callId,
      target,
      fromTag,
      toTag: null,
      branch,
      status: 'calling',
    };

    // SDP — PCMA (G.711a) / PCMU
    const sdp = [
      'v=0',
      `o=GilamSaaS ${Date.now()} ${Date.now()} IN IP4 ${this.LOCAL_IP}`,
      's=GilamSaaS Call',
      `c=IN IP4 ${this.LOCAL_IP}`,
      't=0 0',
      'm=audio 20000 RTP/AVP 8 0 101',
      'a=rtpmap:8 PCMA/8000',
      'a=rtpmap:0 PCMU/8000',
      'a=rtpmap:101 telephone-event/8000',
      'a=fmtp:101 0-16',
      'a=sendrecv',
      '',
    ].join('\r\n');

    const invite = [
      `INVITE sip:${target}@${this.SIP_SERVER} SIP/2.0`,
      `Via: SIP/2.0/UDP ${this.LOCAL_IP}:${this.LOCAL_PORT};branch=${branch};rport`,
      `From: "${ext}" <sip:${ext}@${this.DOMAIN}>;tag=${fromTag}`,
      `To: <sip:${target}@${this.DOMAIN}>`,
      `Call-ID: ${callId}`,
      `CSeq: ${session.cseq} INVITE`,
      `Contact: <sip:${ext}@${this.LOCAL_IP}:${this.LOCAL_PORT}>`,
      'Max-Forwards: 70',
      'Allow: INVITE, ACK, CANCEL, BYE, OPTIONS',
      'User-Agent: GilamSaaS/1.0',
      'Content-Type: application/sdp',
      `Content-Length: ${Buffer.byteLength(sdp)}`,
      '',
      sdp,
    ].join('\r\n');

    this.logger.log(`SIP INVITE → sip:${target}@${this.SIP_SERVER} FROM:${ext}`);
    this.udpSend(invite);
    client.emit('sip:calling', { target });
  }

  // ─── HANGUP ──────────────────────────────────────────────────────────────────

  @SubscribeMessage('sip:hangup')
  handleHangup(@ConnectedSocket() client: Socket) {
    const session = this.sessions.get(client.id);
    if (!session?.activeCall) {
      this.logger.warn('Hangup: no active call');
      return;
    }

    this.globalCseq++;
    const { target, id: callId, fromTag, toTag, branch } = session.activeCall;
    const ext = session.extension;
    const method = toTag ? 'BYE' : 'CANCEL';

    const request = [
      `${method} sip:${target}@${this.SIP_SERVER} SIP/2.0`,
      `Via: SIP/2.0/UDP ${this.LOCAL_IP}:${this.LOCAL_PORT};branch=${branch};rport`,
      `From: "${ext}" <sip:${ext}@${this.DOMAIN}>;tag=${fromTag}`,
      `To: <sip:${target}@${this.DOMAIN}>${toTag ? `;tag=${toTag}` : ''}`,
      `Call-ID: ${callId}`,
      `CSeq: ${this.globalCseq} ${method}`,
      'Max-Forwards: 70',
      'Content-Length: 0',
      '',
      '',
    ].join('\r\n');

    this.logger.log(`SIP ${method} → sip:${target}@${this.SIP_SERVER}`);
    this.udpSend(request);
    session.activeCall = null;
    client.emit('sip:call_ended');
    this.server.emit('sip:call_ended');
  }

  // ─── DIAGNOSTICS ─────────────────────────────────────────────────────────────

  @SubscribeMessage('sip:ping')
  handlePing(@ConnectedSocket() client: Socket) {
    client.emit('sip:pong', {
      registered: this.globalRegistered,
      localIp: this.LOCAL_IP,
      localPort: this.LOCAL_PORT,
      sipServer: this.SIP_SERVER,
      extension: this.DEFAULT_EXTENSION,
    });
  }

  @SubscribeMessage('client:log')
  handleClientLog(@MessageBody() data: { message: string }) {
    this.logger.debug(`CLIENT: ${data.message}`);
  }

  // ─── HELPERS ─────────────────────────────────────────────────────────────────

  private udpSend(msg: string) {
    const buf = Buffer.from(msg, 'utf8');
    this.udpSocket.send(buf, 0, buf.length, this.SIP_PORT, this.SIP_SERVER, (err) => {
      if (err) this.logger.error(`UDP send error: ${err.message}`);
    });
  }

  private async saveCallLog(status: string) {
    // Find the most recent active session
    for (const session of this.sessions.values()) {
      if (session.operatorId && session.companyId && session.operatorId !== 'unknown') {
        try {
          await this.callsService.createOutgoing(session.operatorId, session.companyId, {
            callerPhone: session.extension,
          });
        } catch (err) {
          this.logger.error(`Failed to save call log: ${err}`);
        }
        break;
      }
    }
  }
}
