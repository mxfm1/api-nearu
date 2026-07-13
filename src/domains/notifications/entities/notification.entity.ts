export type NotificationType =
  | 'new_application'
  | 'application_reviewing'
  | 'application_accepted'
  | 'application_rejected'
  | 'email_changed'
  | 'password_changed'
  | 'profile_updated'
  | 'account_change'
  | 'profile_verified'
  | 'profile_revalidation_required'
  | 'event_closed'
  | 'event_filled'
  | 'new_message'
  | 'system'
  | 'new_contact_request';

export type EntityType = 'application' | 'event' | 'message' | 'conversation' | 'profile' | 'account' | 'system' | 'service';

export interface Notification {
  id: string;
  userId: string;
  actorProfileId: string | null;
  type: NotificationType;
  title: string;
  body: string;
  entityType: EntityType | null;
  entityId: string | null;
  actionUrl: string | null;
  isRead: boolean;
  readAt: Date | null;
  emailSentAt: Date | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
}

export interface NotificationPreferences {
  id: string;
  userId: string;
  type: NotificationType;
  emailEnabled: boolean;
  inAppEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationSettings {
  id: string;
  userId: string;
  emailNotificationsEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}
