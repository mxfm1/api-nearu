import type { Notification, NotificationSettings, NotificationType } from '../entities/notification.entity';

export interface INotificationsRepository {
  findByUserId(userId: string): Promise<Notification[]>;
  create(data: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: Record<string, unknown> | null;
  }): Promise<Notification>;
  markRead(id: string, userId: string): Promise<Notification>;
  markAllRead(userId: string): Promise<void>;
  findSettingsByUserId(userId: string): Promise<NotificationSettings | null>;
  upsertSettings(userId: string, emailNotificationsEnabled: boolean): Promise<NotificationSettings>;
}
