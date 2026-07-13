import { eq, desc, and, isNull, sql } from 'drizzle-orm';
import { db } from '@/src/shared/database';
import { notifications, userNotificationSettings, notificationPreferences } from '@/src/shared/database/schema';
import type { INotificationsRepository } from './notifications.repository.interface';
import type { Notification, NotificationPreferences, NotificationSettings, NotificationType } from '../entities/notification.entity';

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

  async findByEntityId(entityId: string): Promise<Notification[]> {
    try {
      const result = await db
        .select()
        .from(notifications)
        .where(eq(notifications.entityId, entityId));
      return result as unknown as Notification[];
    } catch (error) {
      console.error('[NotificationsRepository.findByEntityId] Error:', error);
      throw error;
    }
  }

  async create(data: {
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    actorProfileId?: string | null;
    entityType?: string | null;
    entityId?: string | null;
    actionUrl?: string | null;
    metadata?: Record<string, unknown> | null;
  }): Promise<Notification> {
    try {
      const result = await db
        .insert(notifications)
        .values({
          id: crypto.randomUUID(),
          userId: data.userId,
          type: data.type as any,
          title: data.title,
          body: data.body,
          actorProfileId: data.actorProfileId ?? null,
          entityType: data.entityType as any ?? null,
          entityId: data.entityId ?? null,
          actionUrl: data.actionUrl ?? null,
          metadata: data.metadata ?? null,
          isRead: false,
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
        .set({ readAt: new Date(), isRead: true })
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
        .set({ readAt: new Date(), isRead: true })
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

  async findPreferencesByUserId(userId: string): Promise<NotificationPreferences[]> {
    try {
      const result = await db
        .select()
        .from(notificationPreferences)
        .where(eq(notificationPreferences.userId, userId));
      return result as unknown as NotificationPreferences[];
    } catch (error) {
      console.error('[NotificationsRepository.findPreferencesByUserId] Error:', error);
      throw error;
    }
  }

  async upsertPreference(
    userId: string,
    type: NotificationType,
    emailEnabled: boolean,
    inAppEnabled: boolean
  ): Promise<NotificationPreferences> {
    try {
      const result = await db
        .insert(notificationPreferences)
        .values({
          id: crypto.randomUUID(),
          userId,
          type: type as any,
          emailEnabled,
          inAppEnabled,
        })
        .onConflictDoUpdate({
          target: [notificationPreferences.userId, notificationPreferences.type],
          set: { emailEnabled, inAppEnabled, updatedAt: new Date() },
        })
        .returning();
      return result[0] as unknown as NotificationPreferences;
    } catch (error) {
      console.error('[NotificationsRepository.upsertPreference] Error:', error);
      throw error;
    }
  }

  async isEmailEnabled(userId: string, type: NotificationType): Promise<boolean> {
    try {
      const result = await db
        .select({ emailEnabled: notificationPreferences.emailEnabled })
        .from(notificationPreferences)
        .where(and(
          eq(notificationPreferences.userId, userId),
          eq(notificationPreferences.type, type as any)
        ))
        .limit(1);
      if (!result[0]) return true;
      return result[0].emailEnabled;
    } catch (error) {
      console.error('[NotificationsRepository.isEmailEnabled] Error:', error);
      throw error;
    }
  }
}
