import { eq, desc, and, isNull } from 'drizzle-orm';
import { db } from '@/src/shared/database';
import { notifications, userNotificationSettings } from '@/src/shared/database/schema';
import type { INotificationsRepository } from './notifications.repository.interface';
import type { Notification, NotificationSettings, NotificationType } from '../entities/notification.entity';

export class NotificationsRepository implements INotificationsRepository {
  async findByUserId(userId: string): Promise<Notification[]> {
    try {
      const result = await db
        .select()
        .from(notifications)
        .where(eq(notifications.userId, userId))
        .orderBy(desc(notifications.createdAt));
      return result as unknown as Notification[];
    } catch (error) {
      console.error('[NotificationsRepository.findByUserId] Error:', error);
      throw error;
    }
  }

  async create(data: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: Record<string, unknown> | null;
  }): Promise<Notification> {
    try {
      const result = await db
        .insert(notifications)
        .values({
          id: crypto.randomUUID(),
          userId: data.userId,
          type: data.type,
          title: data.title,
          message: data.message,
          data: data.data ?? null,
        })
        .returning();
      return result[0] as unknown as Notification;
    } catch (error) {
      console.error('[NotificationsRepository.create] Error:', error);
      throw error;
    }
  }

  async markRead(id: string, userId: string): Promise<Notification> {
    try {
      const result = await db
        .update(notifications)
        .set({ readAt: new Date() })
        .where(and(eq(notifications.id, id), eq(notifications.userId, userId)))
        .returning();
      return result[0] as unknown as Notification;
    } catch (error) {
      console.error('[NotificationsRepository.markRead] Error:', error);
      throw error;
    }
  }

  async markAllRead(userId: string): Promise<void> {
    try {
      await db
        .update(notifications)
        .set({ readAt: new Date() })
        .where(and(eq(notifications.userId, userId), isNull(notifications.readAt)));
    } catch (error) {
      console.error('[NotificationsRepository.markAllRead] Error:', error);
      throw error;
    }
  }

  async findSettingsByUserId(userId: string): Promise<NotificationSettings | null> {
    try {
      const result = await db
        .select()
        .from(userNotificationSettings)
        .where(eq(userNotificationSettings.userId, userId))
        .limit(1);
      return (result[0] as unknown as NotificationSettings) ?? null;
    } catch (error) {
      console.error('[NotificationsRepository.findSettingsByUserId] Error:', error);
      throw error;
    }
  }

  async upsertSettings(userId: string, emailNotificationsEnabled: boolean): Promise<NotificationSettings> {
    try {
      const result = await db
        .insert(userNotificationSettings)
        .values({
          id: crypto.randomUUID(),
          userId,
          emailNotificationsEnabled,
        })
        .onConflictDoUpdate({
          target: userNotificationSettings.userId,
          set: { emailNotificationsEnabled },
        })
        .returning();
      return result[0] as unknown as NotificationSettings;
    } catch (error) {
      console.error('[NotificationsRepository.upsertSettings] Error:', error);
      throw error;
    }
  }
}
