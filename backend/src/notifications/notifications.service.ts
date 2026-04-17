import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import * as https from 'https';

// ─── Firebase service account (embedded fallback) ────────────────────────────
// ENV var > fayl > embedded (bu yerda base64 format)
const EMBEDDED_SA_B64 =
  'ewogICJ0eXBlIjogInNlcnZpY2VfYWNjb3VudCIsCiAgInByb2plY3RfaWQiOiAiZ2lsYW0tZHJpdmVyIiwKICAicHJpdmF0ZV9rZXlfaWQiOiAiZTRlZThlM2M4ZGZkNzg1MTgxOTdmZTMwOWVjNDg1YWE1MzJlOTBiMCIsCiAgInByaXZhdGVfa2V5IjogIi0tLS0tQkVHSU4gUFJJVkFURSBLRVktLS0tLVxuTUlJRXZRSUJBREFOQmdrcWhraUc5dzBCQVFFRkFBU0NCS2N3Z2dTakFnRUFBb0lCQVFDaXNEVkJ1a25mcXBSZFxucVhwNk5ienFtcW5tMzl0U3lyQVVUSFRSZ3Y0YkVNRXRwVkthMVQzWmdoMkhEdDE1dlZybjRHWGM0THM0N1FablxuMmQxa0VWbUNKZVhVQVBHZUxqSllOMU1RQ3NKeXlzaVJhVVJRRVc0MkdBRUFMV3RlNGZpM2M3N09jdEY2MlJZS1xuUU51NFI0ZWZ0bmpSMXJCWlJ0bm1uYXo5Y1Iwcno0NEthTThrWnYrak1mSzhiRXowUXFyVVBBajQzcFRlVnhHTlxuTERPWmErQTNRajFnTE1wT0c0dk01M3hSdkFjZWtqU0ZnM3BMOTJTS09pdU1veDEyT3RQS0xYRDhSbVhaK2JkRVxuSFdkc0pvUkZ6bTNrRmJvOW1DYnYwcTkxa2trUXZrMkxpdGVLbmhqSHNnWkNUdk1aUlJ2R0o1K20rSWhSNElSa1xuNWVPbjgxUDdBZ01CQUFFQ2dnRUFFaHc2ZVh3aTRCNnRrSFdlMkQ3bUxsbVVRMHExTUJTM0lETllwOEFFeUgrSFxuZWF6WE1ydzlPOXJUcmFhMmVlaGQxOFV2b2JSMHN3UVR1L2pSUCtQOGlsUHNyenFCcXlHcVlnNmFsUVVWbTFDK1xubmcxUldQWnZ4ZDdMTWJsY28vM1V3WnRGYU5iNFFjd3J1MjEzNkI0eVYxR3BSbmEzUCtEMnZjamNxb1B1Z3VOVlxuQ1RGeDltNTZ4QVZHODJTL0N0SHlGOS9iTVVTRm1oamlQL200UHc0c2Vha2NlcU02dmNUOWJNQllPRFRXMEdIc1xuRFFjcDV0ZnNyVHhvSk1TMThOUUo0dmlrK1JQNlJaZDcvbWVUemlSNUJNWEVQVG5XYitaT2JFNjd1c0JIalJ5Q1xuMERsUllkY1pla3hFYkxGWnNhT01vcWNVdFBta1p0ZHIyK25CRmxualpRS0JnUURWbjhqeXJKZGg5cE1Gd1ZyVlxuZWpIZUJFLzBTcGZvQ2d1SXJVZDZoTW9oYS9MU3E2TC9XNmowam43Unc4cG55a3ZJdFRIVzFKOEZuMXBnS0FRS1xuQmlpOE4wZkVQdXhkK2Z0MlkzVzNEenhFY3JDUnMvcnVnbWd3YW5jRTE3WElWdnlEU3QxY3I0R1YyQ0FRWlNiQlxuRUZ5Vi9wZWRjcCtRbkVOSXNqQkN5NDVIcFFLQmdRREM5YzlpbzdGM2NaQUg3SWkwaUFPdDYvR0VkTDBBNnlnaVxuVkNGcnpXL1BtN0Njano5bjdEcUNqTGgyVWk3c2tvUkZFM1RSb0lNVEluMDJpTnRuODNMbDhFRGJ3S3RmKzkwQVxucGlQSEhIWlhTcGFvVHJOWUs4eng0cEhLckFtVlFkV1ZZWkh1TVF3Mzd5enlGOVhwditDUXBvQURMMTY2Q2dNY1xuUHQ5OXFXMWJId0tCZ0RkM0hUMmxBa2sxTkVjeVJOdFl0c25tWkx3UkFoQUZTNmxaRkU0RFhGZ0JKekw3elg1dlxuMWhacFNSUTl1YmZwRm5RdVY1cG42a0lUZGV1eGVCc0NMbUZ3R1BvalBFdktORGd3NnNkMDlUandibGZtV3lqQ1xuUXpzTzZZZ2dXZHFDZTEyN2VtNHVRMzhjZG5iTFRKeWtHdVgzREhhYzVFRXYwV2gybTRFOFNOemhBb0dCQUpNRFxuNGRzMExVTXc4N2ZGK21DSW9KMnFhbm5EdmpMUElYaWhrSUpHYktaVmRSemFPS29aVFJYZEg4eTV0SURaQzcwN1xuS3NCWkZmNTc1NGdVTTc5enFaVVRVeFZqZU5mc2lYOVB5WE1BVjQwRHhoQXRLTGk0YnRlSVR3QlNNdmZHcVZUNFxuT3A4dmhWTTRuT0FDY1dEUFBIeFgwZmlVNUEzT053STV0elovYU9OcEFvR0FEOFZudzFUZWRYRVF1UVYxL3ZTQlxuaUVlNld0cGxIZmNnTWNJa0NYQ3dmamYycVRrUnNWOG9UMTErek56WVhZTW85b3BDa2FNNW41dHBwUm5BTEVmTVxuRkg3N3NNZDJYREpSNzQxZmJ6cEVveEpTSkE5SW9pT0x2R2ppakN1NTNIaHhUN2tLcDBCWGlvVjI3RUxkK1FVTVxuTld4VFFWMnhVQkRuaTNDN2FZaUQrMDQ9XG4tLS0tLUVORCBQUklWQVRFIEtFWS0tLS0tXG4iLAogICJjbGllbnRfZW1haWwiOiAiZmlyZWJhc2UtYWRtaW5zZGstZmJzdmNAZ2lsYW0tZHJpdmVyLmlhbS5nc2VydmljZWFjY291bnQuY29tIiwKICAiY2xpZW50X2lkIjogIjEwNTYzNzQwMzgwNDIyMjQxNTcwMyIsCiAgImF1dGhfdXJpIjogImh0dHBzOi8vYWNjb3VudHMuZ29vZ2xlLmNvbS9vL29hdXRoMi9hdXRoIiwKICAidG9rZW5fdXJpIjogImh0dHBzOi8vb2F1dGgyLmdvb2dsZWFwaXMuY29tL3Rva2VuIiwKICAiYXV0aF9wcm92aWRlcl94NTA5X2NlcnRfdXJsIjogImh0dHBzOi8vd3d3Lmdvb2dsZWFwaXMuY29tL29hdXRoMi92MS9jZXJ0cyIsCiAgImNsaWVudF94NTA5X2NlcnRfdXJsIjogImh0dHBzOi8vd3d3Lmdvb2dsZWFwaXMuY29tL3JvYm90L3YxL21ldGFkYXRhL3g1MDkvZmlyZWJhc2UtYWRtaW5zZGstZmJzdmMlNDBnaWxhbS1kcml2ZXIuaWFtLmdzZXJ2aWNlYWNjb3VudC5jb20iLAogICJ1bml2ZXJzZV9kb21haW4iOiAiZ29vZ2xlYXBpcy5jb20iCn0=';

// ─── Get service account JSON ────────────────────────────────────────────────
function getServiceAccount(): any {
  // 1. ENV var (base64)
  const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_B64 || EMBEDDED_SA_B64;
  if (b64) {
    try {
      const json = Buffer.from(b64, 'base64').toString('utf-8');
      const sa = JSON.parse(json);
      console.log('[FCM] ✅ Service account yuklandi:', sa.client_email);
      return sa;
    } catch (e) {
      console.error('[FCM] ❌ Base64 parse xatolik:', e);
    }
  }

  // 2. Fayl
  try {
    const filePath =
      process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
      '/app/firebase-service-account.json';
    const sa = require(filePath);
    console.log('[FCM] ✅ Service account fayldan:', filePath);
    return sa;
  } catch (_) {}

  return null;
}

// ─── FCM HTTP v1 via raw JWT (no firebase-admin needed) ──────────────────────
// This generates an OAuth2 access token from the service account private key
// and calls FCM v1 API directly via HTTPS.

let _cachedToken: { token: string; expiry: number } | null = null;

async function getFcmAccessToken(): Promise<string | null> {
  // Return cached token if valid (5 min buffer)
  if (_cachedToken && Date.now() < _cachedToken.expiry - 300_000) {
    return _cachedToken.token;
  }

  const sa = getServiceAccount();
  if (!sa) return null;

  try {
    const jwt = require('jsonwebtoken');
    const now = Math.floor(Date.now() / 1000);
    const jwtPayload = {
      iss: sa.client_email,
      sub: sa.client_email,
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
      scope: 'https://www.googleapis.com/auth/firebase.messaging',
    };

    // Private key PEM
    const privateKey = sa.private_key;
    const signedJwt = jwt.sign(jwtPayload, privateKey, { algorithm: 'RS256' });

    // Exchange JWT for access token
    const tokenRes = await httpPost('oauth2.googleapis.com', '/token', {
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: signedJwt,
    }, 'application/x-www-form-urlencoded');

    const tokenData = JSON.parse(tokenRes);
    if (!tokenData.access_token) {
      console.error('[FCM] Token alish muvaffaqiyatsiz:', tokenRes);
      return null;
    }

    _cachedToken = {
      token: tokenData.access_token,
      expiry: Date.now() + (tokenData.expires_in || 3600) * 1000,
    };
    console.log('[FCM] ✅ Access token olindi');
    return _cachedToken.token;
  } catch (e: any) {
    console.error('[FCM] ❌ Token xatolik:', e?.message);
    return null;
  }
}

// ─── HTTP helper ─────────────────────────────────────────────────────────────
function httpPost(
  hostname: string,
  path: string,
  data: Record<string, string>,
  contentType: string,
): Promise<string> {
  return new Promise((resolve, reject) => {
    let body: string;
    if (contentType === 'application/x-www-form-urlencoded') {
      body = Object.entries(data)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join('&');
    } else {
      body = JSON.stringify(data);
    }

    const options = {
      hostname,
      path,
      method: 'POST',
      headers: {
        'Content-Type': contentType,
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let raw = '';
      res.on('data', (chunk) => (raw += chunk));
      res.on('end', () => resolve(raw));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function httpPostJson(
  hostname: string,
  path: string,
  body: any,
  authToken: string,
): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    const bodyStr = JSON.stringify(body);
    const options = {
      hostname,
      path,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(bodyStr),
      },
    };

    const req = https.request(options, (res) => {
      let raw = '';
      res.on('data', (chunk) => (raw += chunk));
      res.on('end', () => resolve({ status: res.statusCode || 0, body: raw }));
    });
    req.on('error', reject);
    req.write(bodyStr);
    req.end();
  });
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
  ) {}

  // ─── Push notification ────────────────────────────────────────────────────
  async sendPushNotification(
    pushToken: string,
    title: string,
    body: string,
    payload?: any,
  ): Promise<boolean> {
    if (!pushToken?.trim()) return false;
    const channelId = payload?.channelId || 'default';
    console.log(`[Push] → "${title}" → token="${pushToken.substring(0, 25)}..."`);
    return this.sendFcmV1(pushToken, title, body, channelId, payload);
  }

  // ─── FCM HTTP v1 API (direct HTTP, no firebase-admin package needed) ──────
  private async sendFcmV1(
    fcmToken: string,
    title: string,
    body: string,
    channelId: string,
    data?: any,
  ): Promise<boolean> {
    try {
      const accessToken = await getFcmAccessToken();
      if (!accessToken) {
        console.warn('[FCM] Access token yo\'q. Push yuborilmadi.');
        return false;
      }

      const sa = getServiceAccount();
      const projectId = sa?.project_id || 'gilam-driver';

      // data ni string-string formatga
      const safeData: Record<string, string> = { channelId };
      if (data) {
        Object.keys(data).forEach((k) => {
          if (data[k] !== undefined && data[k] !== null) {
            safeData[k] = String(data[k]);
          }
        });
      }

      const message = {
        message: {
          token: fcmToken,
          notification: { title, body },
          data: safeData,
          android: {
            priority: 'high',
            notification: {
              channel_id: channelId,
              sound: 'default',
              default_sound: true,
              notification_priority: 'PRIORITY_HIGH',
            },
          },
        },
      };

      const result = await httpPostJson(
        'fcm.googleapis.com',
        `/v1/projects/${projectId}/messages:send`,
        message,
        accessToken,
      );

      if (result.status === 200) {
        console.log('[FCM] ✅ Push yuborildi! Status:', result.status);
        return true;
      } else {
        console.error('[FCM] ❌ Push xatolik:', result.status, result.body);
        // Token eskirgan
        if (result.body.includes('UNREGISTERED') || result.body.includes('INVALID_ARGUMENT')) {
          console.warn('[FCM] Token yaroqsiz');
        }
        return false;
      }
    } catch (e: any) {
      console.error('[FCM] ❌ Request xatolik:', e?.message);
      return false;
    }
  }

  // ─── DB notifications ─────────────────────────────────────────────────────
  async create(dto: CreateNotificationDto) {
    const notification = this.notificationRepo.create(dto);
    return this.notificationRepo.save(notification);
  }

  async getForSuperAdmin() {
    return this.notificationRepo.find({
      where: { companyId: IsNull(), userId: IsNull() },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async getByCompany(companyId: string) {
    return this.notificationRepo.find({
      where: { companyId },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async getByUser(userId: string, companyId?: string) {
    return this.notificationRepo.find({
      where: [
        { userId },
        { companyId, userId: IsNull() },
      ],
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async markAsRead(id: string) {
    await this.notificationRepo.update(id, { isRead: true });
    return { success: true };
  }

  async markAllAsReadForCompany(companyId: string) {
    await this.notificationRepo.update({ companyId }, { isRead: true });
    return { success: true };
  }

  async markAllAsReadForSuperAdmin() {
    await this.notificationRepo.update(
      { companyId: IsNull() },
      { isRead: true },
    );
    return { success: true };
  }
}
