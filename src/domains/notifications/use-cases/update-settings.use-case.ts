import type { NotificationSettings } from '../entities/notification.entity';
import type { INotificationsRepository } from '../repositories/notifications.repository.interface';

export type IUpdateNotificationSettingsUseCase = ReturnType<typeof updateNotificationSettingsUseCase>;

export const updateNotificationSettingsUseCase =
  (notificationsRepository: INotificationsRepository) =>
  async (userId: string, emailNotificationsEnabled: boolean): Promise<NotificationSettings> => {
    return notificationsRepository.upsertSettings(userId, emailNotificationsEnabled);
  };
