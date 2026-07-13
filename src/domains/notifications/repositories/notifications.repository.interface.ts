import type { Notification, NotificationPreferences, NotificationSettings, NotificationType } from '../entities/notification.entity';

export interface INotificationsRepository {
  findByUserId(userId: string): Promise<Notification[]>;
  findByEntityId(entityId: string): Promise<Notification[]>;
  create(data: {
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    actorProfileId?: string | null;
    entityType?: string | null;
    entityId?: string | null;
    actionUrl?: string | null;
    metadata?: Record<string, unknown> | null;
  }): Promise<Notification>;
  markRead(id: string, userId: string): Promise<Notification>;
  markAllRead(userId: string): Promise<void>;
  findSettingsByUserId(userId: string): Promise<NotificationSettings | null>;
  upsertSettings(userId: string, emailNotificationsEnabled: boolean): Promise<NotificationSettings>;
  findPreferencesByUserId(userId: string): Promise<NotificationPreferences[]>;
  upsertPreference(userId: string, type: NotificationType, emailEnabled: boolean, inAppEnabled: boolean): Promise<NotificationPreferences>;
  isEmailEnabled(userId: string, type: NotificationType): Promise<boolean>;
}
