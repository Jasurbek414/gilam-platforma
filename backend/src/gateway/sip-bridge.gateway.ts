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
import * as net from 'net';
import * as crypto from 'crypto';
import * as os from 'os';
import { CallsService } from '../calls/calls.service';

// ─── SESSION ─────────────────────────────────────────────────────────────────
interface SipSession {
  socketId: string;
  operatorId: string;
  companyId: string;
  extension: string;
  activeCall: {
    id: string;
    target: string;
    fromTag: string;
    toTag: string | null;
    branch: string;
    amiActionId: string | null;
  } | null;
}

// ─── UTILS ───────────────────────────────────────────────────────────────────
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
  return process.env.SIP_LOCAL_IP || '10.100.100.70';
}

// ─── GATEWAY ─────────────────────────────────────────────────────────────────
@WebSocketGateway({ cors: { origin: '*' }, namespace: '/sip' })
export class SipBridgeGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, OnModuleInit
{
  @WebSocketServer() server: Server;
  private logger = new Logger('SipBridgeGateway');

  // ── SIP (UDP) config ──
  private readonly SIP_SERVER: string;
  private readonly SIP_PORT: number;
  private readonly LOCAL_PORT: number;
  private readonly LOCAL_IP: string;
  private readonly DEFAULT_EXTENSION: string;
  private readonly DEFAULT_PASSWORD: string;
  private readonly DOMAIN: string;

  // ── AMI config ──
  private readonly AMI_HOST: string;
  private readonly AMI_PORT: number;
  private readonly AMI_USER: string;
  private readonly AMI_SECRET: string;
  // Outbound context & trunk name in Asterisk (for non-internal numbers)
  private readonly AMI_CONTEXT: string;
  private readonly SIP_TRUNK: string;

  // ── State ──
  private udpSocket: dgram.Socket;
  private sessions: Map<string, SipSession> = new Map();
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

    this.AMI_HOST = this.configService.get<string>('AMI_HOST') || this.SIP_SERVER;
    this.AMI_PORT = parseInt(this.configService.get<string>('AMI_PORT') || '5038');
    this.AMI_USER = this.configService.get<string>('AMI_USER') || 'admin';
    this.AMI_SECRET = this.configService.get<string>('AMI_SECRET') || 'admin';
    this.AMI_CONTEXT = this.configService.get<string>('AMI_CONTEXT') || 'from-internal';
    this.SIP_TRUNK = this.configService.get<string>('SIP_TRUNK') || '';

    this.udpSocket = dgram.createSocket('udp4');
    this.logger.log(
      `SIP: server=${this.SIP_SERVER} localIp=${this.LOCAL_IP}:${this.LOCAL_PORT} ext=${this.DEFAULT_EXTENSION}`,
    );
    this.logger.log(
      `AMI: ${this.AMI_HOST}:${this.AMI_PORT} user=${this.AMI_USER} context=${this.AMI_CONTEXT}`,
    );
  }

  // ─── LIFECYCLE ───────────────────────────────────────────────────────────────

  onModuleInit() {
    this.initUdpSocket();
    setInterval(() => this.server.emit('sip:status', { registered: this.globalRegistered }), 5000);
    setInterval(() => { if (this.globalRegistered) this.doRegister(false, ''); }, 55000);
  }

  afterInit() { this.logger.log('WS /sip gateway ready'); }

  handleConnection(client: Socket) {
    this.logger.log(`WS connected: ${client.id}`);
    client.emit('sip:status', { registered: this.globalRegistered });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`WS disconnected: ${client.id}`);
    this.sessions.delete(client.id);
  }

  // ─── SIP UDP ─────────────────────────────────────────────────────────────────

  private initUdpSocket() {
    this.udpSocket.on('message', (msg) => {
      const message = msg.toString();
      const firstLine = message.split('\n')[0].trim();
      if (!firstLine.startsWith('OPTIONS ')) {
        this.logger.debug(`SIP IN:\n${message}`);
      }
      this.handleSipMessage(message);
    });

    this.udpSocket.on('error', (err) => this.logger.error(`UDP error: ${err.message}`));

    this.udpSocket.bind(this.LOCAL_PORT, '0.0.0.0', () => {
      this.logger.log(`SIP UDP bound ${this.LOCAL_IP}:${this.LOCAL_PORT}`);
      this.doRegister(false, '');
    });
  }

  private handleSipMessage(message: string) {
    const firstLine = message.split('\n')[0].trim();

    // ── OPTIONS heartbeat → 200 OK ──
    if (firstLine.startsWith('OPTIONS ')) {
      if (!this.globalRegistered) {
        this.globalRegistered = true;
        this.logger.log('SIP: auto-registered via OPTIONS');
        this.server.emit('sip:status', { registered: true });
      }
      const via = message.match(/Via: (.*)/)?.[1]?.trim() || '';
      const from = message.match(/From: (.*)/)?.[1]?.trim() || '';
      const to = message.match(/To: (.*)/)?.[1]?.trim() || '';
      const callId = message.match(/Call-ID: (.*)/)?.[1]?.trim() || '';
      const cseq = message.match(/CSeq: (.*)/)?.[1]?.trim() || '';
      this.udpSend([
        'SIP/2.0 200 OK',
        `Via: ${via}`, `From: ${from}`, `To: ${to}`,
        `Call-ID: ${callId}`, `CSeq: ${cseq}`,
        'Content-Length: 0', '', '',
      ].join('\r\n'));
      return;
    }

    // ── REGISTER 200 OK ──
    if (message.includes('SIP/2.0 200 OK') && /CSeq:\s*\d+\s+REGISTER/i.test(message)) {
      this.globalRegistered = true;
      this.globalAuthRetry = 0;
      this.logger.log('SIP: ✅ REGISTER 200 OK — registered');
      this.server.emit('sip:status', { registered: true });
      return;
    }

    // ── REGISTER 401/407 ──
    if (
      (message.includes('SIP/2.0 401') || message.includes('SIP/2.0 407')) &&
      /CSeq:\s*\d+\s+REGISTER/i.test(message)
    ) {
      if (this.globalAuthRetry < this.MAX_AUTH_RETRIES) {
        this.globalAuthRetry++;
        setTimeout(() => this.doRegister(true, message), 500);
      } else {
        this.logger.warn('SIP: max auth retries, marking trusted');
        this.globalRegistered = true;
        this.server.emit('sip:status', { registered: true });
      }
      return;
    }

    // ── INVITE 401/407 ──
    if (
      (message.includes('SIP/2.0 401') || message.includes('SIP/2.0 407')) &&
      /CSeq:\s*\d+\s+INVITE/i.test(message)
    ) {
      this.logger.warn('SIP: INVITE 401 — sending to AMI fallback');
      // Will be handled by AMI originate path
      this.server.emit('sip:call_failed', { reason: "Autentifikatsiya xatosi (401)", code: '401' });
      return;
    }

    // ── 180 Ringing ──
    if (message.includes('SIP/2.0 180') || message.includes('SIP/2.0 183')) {
      this.captureToTag(message);
      this.server.emit('sip:ringing');
      return;
    }

    // ── 200 OK INVITE ──
    if (message.includes('SIP/2.0 200 OK') && /CSeq:\s*\d+\s+INVITE/i.test(message)) {
      this.captureToTag(message);
      this.sendAck(message);
      this.server.emit('sip:call_answered');
      this.saveCallLog();
      return;
    }

    // ── INVITE error (4xx/5xx) — not 401/407 ──
    const errMatch = message.match(/SIP\/2\.0 ([4-9]\d\d) (.+)/);
    if (errMatch && /CSeq:\s*\d+\s+INVITE/i.test(message) && !message.includes('401') && !message.includes('407')) {
      const code = errMatch[1];
      const reason = errMatch[2].trim();
      const map: Record<string, string> = {
        '404': '404 — Raqam topilmadi',
        '480': '480 — Abonent mavjud emas',
        '486': '486 — Band',
        '488': '488 — Codec mos emas',
        '403': '403 — Ruxsat yoq',
        '408': '408 — Vaqt tugadi',
        '487': '487 — Bekor qilindi',
        '500': '500 — Server xatosi',
        '503': '503 — Route topilmadi (Asterisk trunksiz)',
      };
      this.logger.warn(`SIP INVITE error: ${code} ${reason}`);
      this.server.emit('sip:call_failed', { reason: map[code] || `${code} ${reason}`, code });
      this.sessions.forEach(s => { s.activeCall = null; });
      return;
    }

    // ── BYE / 487 ──
    if (/^BYE sip:/im.test(message) || message.includes('SIP/2.0 487') || message.includes('SIP/2.0 603')) {
      this.server.emit('sip:call_ended');
      this.sessions.forEach(s => { s.activeCall = null; });
      return;
    }
  }

  // ─── REGISTER ────────────────────────────────────────────────────────────────

  private doRegister(withAuth: boolean, challengeMsg: string) {
    this.globalCseq++;
    const ext = this.DEFAULT_EXTENSION;
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
      'User-Agent: GilamSaaS/2.0',
    ];

    if (withAuth && challengeMsg) {
      const realm = challengeMsg.match(/realm="([^"]+)"/)?.[1] || this.DOMAIN;
      const nonce = challengeMsg.match(/nonce="([^"]+)"/)?.[1] || '';
      const ha1 = crypto.createHash('md5').update(`${ext}:${realm}:${this.DEFAULT_PASSWORD}`).digest('hex');
      const ha2 = crypto.createHash('md5').update(`REGISTER:sip:${this.DOMAIN}`).digest('hex');
      const resp = crypto.createHash('md5').update(`${ha1}:${nonce}:${ha2}`).digest('hex');
      headers.push(`Authorization: Digest username="${ext}", realm="${realm}", nonce="${nonce}", uri="sip:${this.DOMAIN}", response="${resp}", algorithm=MD5`);
    }

    headers.push('Content-Length: 0', '', '');
    this.udpSend(headers.join('\r\n'));
  }

  // ─── AMI ORIGINATE ────────────────────────────────────────────────────────────
  // Bu Asterisk Manager Interface orqali istalgan raqamga qo'ng'iroq boshlatadi.
  // Asterisk o'zi dial plan + trunk orqali tashqi raqamga qo'ng'iroq qiladi.
  private amiOriginate(
    target: string,
    ext: string,
    operatorId: string,
    companyId: string,
    socketId: string,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const client = new net.Socket();
      const actionId = `gilam-${Date.now()}`;
      let buffer = '';
      let loggedIn = false;
      let originated = false;
      let done = false;

      const timeout = setTimeout(() => {
        if (!done) {
          done = true;
          client.destroy();
          reject(new Error('AMI timeout'));
        }
      }, 15000);

      const finish = (err?: Error) => {
        if (done) return;
        done = true;
        clearTimeout(timeout);
        client.destroy();
        if (err) reject(err); else resolve();
      };

      client.connect(this.AMI_PORT, this.AMI_HOST, () => {
        this.logger.log(`AMI: Connected to ${this.AMI_HOST}:${this.AMI_PORT}`);
      });

      client.on('data', (data) => {
        buffer += data.toString();
        const messages = buffer.split('\r\n\r\n');
        buffer = messages.pop() || '';

        for (const msg of messages) {
          this.logger.debug(`AMI IN: ${msg.substring(0, 200)}`);

          // Welcome banner → login
          if (msg.includes('Asterisk Call Manager') && !loggedIn) {
            const loginAction = [
              'Action: Login',
              `Username: ${this.AMI_USER}`,
              `Secret: ${this.AMI_SECRET}`,
              '',
              '',
            ].join('\r\n');
            this.logger.log('AMI: Sending Login...');
            client.write(loginAction);
            loggedIn = true;
            continue;
          }

          // Login success → originate
          if (msg.includes('Response: Success') && msg.includes('Authentication accepted') && !originated) {
            originated = true;
            this.logger.log(`AMI: Logged in. Originating call to ${target}...`);

            // Channel format: if trunk configured use SIP/trunk/target, else use Local/target@context
            let channel: string;
            if (this.SIP_TRUNK) {
              channel = `SIP/${this.SIP_TRUNK}/${target}`;
            } else {
              channel = `Local/${target}@${this.AMI_CONTEXT}`;
            }

            const originateAction = [
              'Action: Originate',
              `ActionID: ${actionId}`,
              `Channel: ${channel}`,
              `Context: ${this.AMI_CONTEXT}`,
              `Exten: ${target}`,
              'Priority: 1',
              `CallerID: ${ext} <${ext}>`,
              'Timeout: 30000',
              'Async: true',
              'Variable: GILAM_OPERATOR_ID=' + operatorId,
              '',
              '',
            ].join('\r\n');

            this.logger.log(`AMI OUT: Originate Channel=${channel}`);
            client.write(originateAction);
            continue;
          }

          // Login failed
          if (msg.includes('Response: Error') && msg.includes('Authentication')) {
            this.logger.error('AMI: Login failed — check AMI_USER/AMI_SECRET in .env');
            finish(new Error('AMI authentication failed'));
            continue;
          }

          // Originate response
          if (msg.includes(`ActionID: ${actionId}`)) {
            if (msg.includes('Response: Success') || msg.includes('Response: Error') || msg.includes('Event: OriginateResponse')) {
              if (msg.includes('Reason: 4') || msg.includes('Reason: 0') || msg.includes('Response: Success')) {
                // Success or in progress
                const session = this.sessions.get(socketId);
                if (session) {
                  session.activeCall = {
                    id: actionId,
                    target,
                    fromTag: '',
                    toTag: null,
                    branch: '',
                    amiActionId: actionId,
                  };
                }
                this.server.emit('sip:ringing');
                finish();
              } else if (msg.includes('Reason: 8')) {
                finish(new Error('Congestion — no available channel'));
              } else if (msg.includes('Reason: 1')) {
                finish(new Error('No such extension in dial plan'));
              } else {
                // Unknown, still proceed
                this.logger.warn(`AMI Originate response: ${msg.substring(0, 300)}`);
                finish();
              }
            }
            continue;
          }

          // AMI events for call state
          if (msg.includes('Event: Hangup') || msg.includes('Event: HangupRequest')) {
            const causeMatch = msg.match(/Cause-txt: (.+)/);
            const cause = causeMatch?.[1]?.trim() || '';
            this.logger.log(`AMI: Hangup — ${cause}`);
            // Only emit if we have active session
            for (const s of this.sessions.values()) {
              if (s.socketId === socketId && s.activeCall) {
                s.activeCall = null;
                this.server.emit('sip:call_ended');
                break;
              }
            }
          }

          if (msg.includes('Event: Bridge') || msg.includes('Event: BridgeEnter')) {
            this.server.emit('sip:call_answered');
          }
        }
      });

      client.on('error', (err) => {
        this.logger.error(`AMI error: ${err.message}`);
        finish(err);
      });

      client.on('close', () => {
        this.logger.log('AMI: Connection closed');
        if (!done) finish();
      });
    });
  }

  // ─── CALL via AMI ─────────────────────────────────────────────────────────────

  @SubscribeMessage('sip:call')
  async handleCall(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    const rawTarget = (data.target || '').toString().trim();
    const target = rawTarget.replace(/[^0-9]/g, '');

    this.logger.log(`CALL REQUEST: "${rawTarget}" → "${target}"`);

    if (!target) {
      client.emit('sip:error', { message: "Raqam noto'g'ri" });
      return;
    }

    if (!this.globalRegistered) {
      client.emit('sip:error', { message: 'SIP serverga ulanilmagan — WireGuard ishlayaptimi?' });
      return;
    }

    let userData: { id?: string; companyId?: string } = {};
    try { userData = { id: data.operatorId, companyId: data.companyId }; } catch {}

    const ext = this.DEFAULT_EXTENSION;
    const session: SipSession = {
      socketId: client.id,
      operatorId: userData.id || 'unknown',
      companyId: userData.companyId || 'unknown',
      extension: ext,
      activeCall: null,
    };
    this.sessions.set(client.id, session);

    // Determine if internal (short) or external (long) number
    const isInternal = target.length <= 4;

    if (isInternal) {
      // Internal extension → SIP INVITE directly
      this.logger.log(`CALL: Internal extension ${target} — using SIP INVITE`);
      this.sendSipInvite(target, ext, session, client);
    } else {
      // External number → AMI Originate (Asterisk handles routing)
      this.logger.log(`CALL: External number ${target} — using AMI Originate`);
      client.emit('sip:calling', { target, method: 'AMI' });

      try {
        await this.amiOriginate(target, ext, session.operatorId, session.companyId, client.id);
        this.logger.log(`AMI Originate OK for ${target}`);
      } catch (err: any) {
        this.logger.error(`AMI Originate failed: ${err.message}`);

        // Fallback: try SIP INVITE directly
        this.logger.log(`CALL: Falling back to direct SIP INVITE for ${target}`);
        this.sendSipInvite(target, ext, session, client);
      }
    }
  }

  // ─── SIP INVITE ──────────────────────────────────────────────────────────────

  private sendSipInvite(target: string, ext: string, session: SipSession, client: Socket) {
    this.globalCseq++;
    const branch = 'z9hG4bK-' + Math.random().toString(36).substring(7);
    const callId = `${Date.now().toString(36)}.${Math.random().toString(36).substring(7)}@${this.LOCAL_IP}`;
    const fromTag = Math.random().toString(36).substring(7);

    session.activeCall = { id: callId, target, fromTag, toTag: null, branch, amiActionId: null };

    const sdp = [
      'v=0',
      `o=GilamSaaS ${Date.now()} ${Date.now()} IN IP4 ${this.LOCAL_IP}`,
      's=GilamSaaS',
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
      `CSeq: ${this.globalCseq} INVITE`,
      `Contact: <sip:${ext}@${this.LOCAL_IP}:${this.LOCAL_PORT}>`,
      'Max-Forwards: 70',
      'Allow: INVITE, ACK, CANCEL, BYE, OPTIONS',
      'User-Agent: GilamSaaS/2.0',
      'Content-Type: application/sdp',
      `Content-Length: ${Buffer.byteLength(sdp)}`,
      '',
      sdp,
    ].join('\r\n');

    this.logger.log(`SIP INVITE → sip:${target}@${this.SIP_SERVER}`);
    this.udpSend(invite);
    client.emit('sip:calling', { target, method: 'SIP' });
  }

  // ─── HANGUP ──────────────────────────────────────────────────────────────────

  @SubscribeMessage('sip:hangup')
  async handleHangup(@ConnectedSocket() client: Socket) {
    const session = this.sessions.get(client.id);
    if (!session?.activeCall) {
      this.logger.warn('Hangup: no active call');
      return;
    }

    const { target, id: callId, fromTag, toTag, branch, amiActionId } = session.activeCall;
    session.activeCall = null;

    if (amiActionId) {
      // AMI call — use AMI to hang up
      this.amiHangup(amiActionId);
    } else {
      // SIP call — BYE or CANCEL
      this.globalCseq++;
      const ext = session.extension;
      const method = toTag ? 'BYE' : 'CANCEL';
      const req = [
        `${method} sip:${target}@${this.SIP_SERVER} SIP/2.0`,
        `Via: SIP/2.0/UDP ${this.LOCAL_IP}:${this.LOCAL_PORT};branch=${branch};rport`,
        `From: "${ext}" <sip:${ext}@${this.DOMAIN}>;tag=${fromTag}`,
        `To: <sip:${target}@${this.DOMAIN}>${toTag ? `;tag=${toTag}` : ''}`,
        `Call-ID: ${callId}`,
        `CSeq: ${this.globalCseq} ${method}`,
        'Max-Forwards: 70',
        'Content-Length: 0',
        '', '',
      ].join('\r\n');
      this.udpSend(req);
    }

    client.emit('sip:call_ended');
    this.server.emit('sip:call_ended');
  }

  private amiHangup(actionId: string) {
    const client = new net.Socket();
    let buffer = '';
    let loggedIn = false;

    client.connect(this.AMI_PORT, this.AMI_HOST, () => {
      this.logger.log(`AMI Hangup: connected`);
    });

    client.on('data', (data) => {
      buffer += data.toString();
      const messages = buffer.split('\r\n\r\n');
      buffer = messages.pop() || '';

      for (const msg of messages) {
        if (msg.includes('Asterisk Call Manager') && !loggedIn) {
          loggedIn = true;
          client.write(`Action: Login\r\nUsername: ${this.AMI_USER}\r\nSecret: ${this.AMI_SECRET}\r\n\r\n`);
        }
        if (msg.includes('Authentication accepted') && loggedIn) {
          // Hangup all channels related to this action
          client.write(`Action: HangupRequest\r\nActionID: hangup-${actionId}\r\n\r\n`);
          setTimeout(() => client.destroy(), 1000);
        }
      }
    });

    client.on('error', (err) => this.logger.error(`AMI Hangup error: ${err.message}`));
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
      amiHost: this.AMI_HOST,
      amiPort: this.AMI_PORT,
      amiUser: this.AMI_USER,
      amiContext: this.AMI_CONTEXT,
      sipTrunk: this.SIP_TRUNK,
    });
  }

  @SubscribeMessage('client:log')
  handleClientLog(@MessageBody() data: { message: string }) {
    this.logger.debug(`CLIENT: ${data.message}`);
  }

  // ─── HELPERS ─────────────────────────────────────────────────────────────────

  private captureToTag(message: string) {
    const toTagMatch = message.match(/To:.*?;tag=([^\s;,\r\n]+)/);
    if (toTagMatch) {
      this.sessions.forEach((s) => {
        if (s.activeCall && !s.activeCall.toTag) s.activeCall.toTag = toTagMatch[1];
      });
    }
  }

  private sendAck(message: string) {
    const to = message.match(/To: (.*)/)?.[1]?.trim() || '';
    const callId = message.match(/Call-ID: (.*)/)?.[1]?.trim() || '';
    this.sessions.forEach((s) => {
      if (!s.activeCall || s.activeCall.amiActionId) return;
      this.globalCseq++;
      const ack = [
        `ACK sip:${s.activeCall.target}@${this.SIP_SERVER} SIP/2.0`,
        `Via: SIP/2.0/UDP ${this.LOCAL_IP}:${this.LOCAL_PORT};branch=${s.activeCall.branch};rport`,
        `From: <sip:${s.extension}@${this.DOMAIN}>;tag=${s.activeCall.fromTag}`,
        `To: ${to || `<sip:${s.activeCall.target}@${this.DOMAIN}>`}`,
        `Call-ID: ${callId || s.activeCall.id}`,
        `CSeq: ${this.globalCseq} ACK`,
        'Max-Forwards: 70',
        'Content-Length: 0',
        '', '',
      ].join('\r\n');
      this.udpSend(ack);
    });
  }

  private udpSend(msg: string) {
    const buf = Buffer.from(msg, 'utf8');
    this.udpSocket.send(buf, 0, buf.length, this.SIP_PORT, this.SIP_SERVER, (err) => {
      if (err) this.logger.error(`UDP send error: ${err.message}`);
    });
  }

  private async saveCallLog() {
    for (const session of this.sessions.values()) {
      if (session.operatorId && session.operatorId !== 'unknown') {
        try {
          await this.callsService.createOutgoing(session.operatorId, session.companyId, {
            callerPhone: session.extension,
          });
        } catch (e) {
          this.logger.error(`Save call log failed: ${e}`);
        }
        break;
      }
    }
  }
}
