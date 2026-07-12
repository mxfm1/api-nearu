export type NotificationType = 'new_contact_request' | 'new_message' | 'profile_update' | 'account_change';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data: Record<string, unknown> | null;
  readAt: Date | null;
  createdAt: Date;
}

export interface NotificationSettings {
  id: string;
  userId: string;
  emailNotificationsEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}
