import type { NotificationSettings } from '../entities/notification.entity';
import type { INotificationsRepository } from '../repositories/notifications.repository.interface';

export type IGetNotificationSettingsUseCase = ReturnType<typeof getNotificationSettingsUseCase>;

export const getNotificationSettingsUseCase =
  (notificationsRepository: INotificationsRepository) =>
  async (userId: string): Promise<NotificationSettings> => {
    const settings = await notificationsRepository.findSettingsByUserId(userId);
    if (settings) return settings;
    return {
      id: '',
      userId,
      emailNotificationsEnabled: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as NotificationSettings;
  };
