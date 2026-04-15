import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import * as https from 'https';

// ─── FCM HTTP v1 API (to'g'ridan-to'g'ri Firebase, Expo account kerak emas) ─
const FCM_FIREBASE_PROJECT = 'gilam-service';
const FIREBASE_API_KEY = 'AIzaSyDgofVJlPKD5WWAZUtwrrFZpdnWMSXHaIA'; // google-services.json dan

// FCM Legacy API endpoint (Server Key o'rniga API Key bilan ishlaydi ba'zi case larda)
// Lekin asosiy yo'l: firebase-admin bilan FCM v1

let firebaseAdmin: any = null;

function getFirebaseAdmin() {
  if (firebaseAdmin) return firebaseAdmin;
  try {
    const admin = require('firebase-admin');
    if (!admin.apps.length) {
      // Service account fayl yo'q bo'lsa app default credetials ishlatamiz
      // Google Cloud da ishlasa bu o'z-o'zidan ishlaydi
      // Aks holda SERVICE_ACCOUNT_PATH env orqali yuklaymiz
      const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
      if (serviceAccountPath) {
        const serviceAccount = require(serviceAccountPath);
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
      } else {
        // Inline credential — environment variable dan
        const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
        if (serviceAccountJson) {
          admin.initializeApp({
            credential: admin.credential.cert(JSON.parse(serviceAccountJson)),
          });
        } else {
          // Application Default Credentials (GCP ichida yoki GOOGLE_APPLICATION_CREDENTIALS env)
          admin.initializeApp({
            credential: admin.credential.applicationDefault(),
            projectId: FCM_FIREBASE_PROJECT,
          });
        }
      }
    }
    firebaseAdmin = admin;
    console.log('[FCM] ✅ Firebase Admin initialized');
    return admin;
  } catch (e: any) {
    console.error('[FCM] Firebase Admin init xatoligi:', e?.message);
    return null;
  }
}

// Expo push token uchun Expo SDK (eski tokenlar uchun)
let expoSdk: any = null;
function getExpo() {
  if (expoSdk) return expoSdk;
  try {
    const { Expo } = require('expo-server-sdk');
    expoSdk = new Expo();
    return expoSdk;
  } catch { return null; }
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
  ) {}

  async sendPushNotification(
    pushToken: string,
    title: string,
    body: string,
    payload?: any,
  ): Promise<boolean> {
    if (!pushToken) return false;

    const channelId = payload?.channelId || 'default';
    
    // Token tipini aniqlash
    const isExpoToken = pushToken.startsWith('ExponentPushToken[');
    const isFcmToken = !isExpoToken && pushToken.length > 100;

    console.log(`[Push] Yuborilmoqda → type=${isExpoToken ? 'Expo' : 'FCM'} title="${title}"`);

    if (isFcmToken) {
      return this.sendFcmNotification(pushToken, title, body, channelId, payload);
    } else if (isExpoToken) {
      return this.sendExpoNotification(pushToken, title, body, channelId, payload);
    } else {
      console.warn('[Push] Noma\'lum token formati:', pushToken.substring(0, 30));
      // Ikkalasini ham sinab ko'ramiz
      const fcmResult = await this.sendFcmNotification(pushToken, title, body, channelId, payload);
      if (!fcmResult) {
        return this.sendExpoNotification(pushToken, title, body, channelId, payload);
      }
      return fcmResult;
    }
  }

  // ─── Firebase FCM HTTP v1 ─────────────────────────────────────────────────
  private async sendFcmNotification(
    fcmToken: string,
    title: string,
    body: string,
    channelId: string,
    data?: any,
  ): Promise<boolean> {
    try {
      const admin = getFirebaseAdmin();
      if (!admin) {
        console.warn('[FCM] firebase-admin ishlamayapti, FCM Legacy API sinab ko\'riladi');
        return this.sendFcmLegacy(fcmToken, title, body, channelId, data);
      }

      const message = {
        token: fcmToken,
        notification: { title, body },
        android: {
          priority: 'high' as const,
          notification: {
            channelId,
            sound: 'default',
            priority: 'max' as const,
            defaultVibrateTimings: true,
          },
        },
        data: {
          type: data?.type || 'default',
          orderId: data?.orderId || '',
          senderId: data?.senderId || '',
          companyId: data?.companyId || '',
          channelId,
        },
      };

      const response = await admin.messaging().send(message);
      console.log('[FCM] ✅ Yuborildi:', response);
      return true;
    } catch (e: any) {
      console.error('[FCM] Xatolik:', e?.message || e);
      // Fallback Legacy API
      return this.sendFcmLegacy(fcmToken, title, body, channelId, data);
    }
  }

  // ─── FCM Legacy HTTP API (Server Key bilan, fallback) ────────────────────
  private sendFcmLegacy(
    fcmToken: string,
    title: string,
    body: string,
    channelId: string,
    data?: any,
  ): Promise<boolean> {
    return new Promise((resolve) => {
      const serverKey = process.env.FCM_SERVER_KEY || '';
      if (!serverKey) {
        console.warn('[FCM Legacy] FCM_SERVER_KEY env o\'zgaruvchisi yo\'q');
        resolve(false);
        return;
      }

      const payload = JSON.stringify({
        to: fcmToken,
        priority: 'high',
        notification: {
          title,
          body,
          sound: 'default',
          android_channel_id: channelId,
        },
        data: {
          type: data?.type || 'default',
          orderId: data?.orderId || '',
          senderId: data?.senderId || '',
          channelId,
        },
      });

      const options = {
        hostname: 'fcm.googleapis.com',
        path: '/fcm/send',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `key=${serverKey}`,
          'Content-Length': Buffer.byteLength(payload),
        },
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          console.log('[FCM Legacy] Javob:', data.substring(0, 100));
          resolve(res.statusCode === 200);
        });
      });
      req.on('error', (e) => {
        console.error('[FCM Legacy] Xatolik:', e.message);
        resolve(false);
      });
      req.write(payload);
      req.end();
    });
  }

  // ─── Expo Push (eski ExponentPushToken lar uchun) ─────────────────────────
  private async sendExpoNotification(
    expoToken: string,
    title: string,
    body: string,
    channelId: string,
    data?: any,
  ): Promise<boolean> {
    try {
      const expo = getExpo();
      if (!expo) return false;
      const { Expo } = require('expo-server-sdk');
      if (!Expo.isExpoPushToken(expoToken)) return false;

      await expo.sendPushNotificationsAsync([{
        to: expoToken,
        sound: 'default',
        title,
        body,
        data: data || {},
        channelId,
        priority: 'high',
      }]);
      console.log('[Expo Push] ✅ Yuborildi');
      return true;
    } catch (e: any) {
      console.error('[Expo Push] Xatolik:', e?.message);
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
    await this.notificationRepo.update({ companyId: IsNull() }, { isRead: true });
    return { success: true };
  }
}
