import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.enableCors({ origin: true, credentials: true });
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  await app.listen(3000, '0.0.0.0');
  console.log('Backend ishlayapti: http://localhost:3000/api');

  // SIP WebSocket Proxy: browser -> ws://localhost:3000/sip-ws -> wss://10.100.100.1:8089/ws
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const WS = require('ws');
  const wss = new WS.Server({ noServer: true });

  app.getHttpServer().on('upgrade', (req: any, socket: any, head: any) => {
    if (req.url !== '/sip-ws') return;
    wss.handleUpgrade(req, socket, head, (bws: any) => {
      const fws = new WS('wss://10.100.100.1:8089/ws', ['sip'], { rejectUnauthorized: false });
      fws.on('open', () => console.log('[SIP Proxy] FreePBX ulandi'));
      fws.on('message', (d: any) => { if (bws.readyState === 1) bws.send(d); });
      bws.on('message', (d: any) => { if (fws.readyState === 1) fws.send(d); });
      bws.on('close', () => fws.close());
      fws.on('close', () => { if (bws.readyState === 1) bws.close(); });
      fws.on('error', (e: any) => { console.error('[SIP Proxy]', e.message); if (bws.readyState === 1) bws.close(); });
      bws.on('error', () => fws.close());
    });
  });
  console.log('SIP Proxy tayyor: ws://localhost:3000/sip-ws');
}
bootstrap();
