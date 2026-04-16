import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';

// ─── Firebase Admin SDK ───────────────────────────────────────────────────────
let firebaseAdmin: any = null;

function getFirebaseAdmin() {
  if (firebaseAdmin) return firebaseAdmin;
  try {
    const admin = require('firebase-admin');
    if (!admin.apps.length) {
      const serviceAccountPath =
        process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
        '/app/firebase-service-account.json';
      const serviceAccount = require(serviceAccountPath);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('[FCM] ✅ Firebase Admin initialized →', serviceAccount.project_id);
    }
    firebaseAdmin = admin;
    return admin;
  } catch (e: any) {
    console.error('[FCM] ❌ Firebase Admin init xatolik:', e?.message);
    return null;
  }
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
  ) {}

  // ─── Asosiy push yuborish ─────────────────────────────────────────────────
  async sendPushNotification(
    pushToken: string,
    title: string,
    body: string,
    payload?: any,
  ): Promise<boolean> {
    if (!pushToken?.trim()) return false;

    const channelId = payload?.channelId || 'default';
    console.log(`[Push] → title="${title}" token="${pushToken.substring(0, 20)}..."`);

    return this.sendFcmNotification(pushToken, title, body, channelId, payload);
  }

  // ─── Firebase Admin FCM ───────────────────────────────────────────────────
  private async sendFcmNotification(
    fcmToken: string,
    title: string,
    body: string,
    channelId: string,
    data?: any,
  ): Promise<boolean> {
    const admin = getFirebaseAdmin();
    if (!admin) {
      console.warn('[FCM] Firebase Admin tayyor emas. Push yuborilmadi.');
      return false;
    }

    // data ni string-string formatga o'tkazish (FCM talabi)
    const safeData: Record<string, string> = {};
    if (data) {
      Object.keys(data).forEach((k) => {
        if (data[k] !== undefined && data[k] !== null) {
          safeData[k] = String(data[k]);
        }
      });
    }
    safeData.channelId = channelId;

    const message = {
      token: fcmToken,
      notification: { title, body },
      data: safeData,
      android: {
        priority: 'high' as const,
        notification: {
          channelId,
          sound: 'default',
          priority: 'high' as const,
          defaultSound: true,
        },
      },
    };

    try {
      const result = await admin.messaging().send(message);
      console.log('[FCM] ✅ Push yuborildi:', result);
      return true;
    } catch (e: any) {
      console.error('[FCM] ❌ Push xatolik:', e?.message);
      // Token eskirgan yoki yo'q bo'lsa
      if (e?.code === 'messaging/registration-token-not-registered') {
        console.warn('[FCM] Token eskirgan — DB dan o\'chirish kerak');
      }
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
