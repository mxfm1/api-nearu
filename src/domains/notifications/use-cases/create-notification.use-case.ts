import type { Notification, NotificationType } from '../entities/notification.entity';
import type { INotificationsRepository } from '../repositories/notifications.repository.interface';

export type ICreateNotificationUseCase = ReturnType<typeof createNotificationUseCase>;

export const createNotificationUseCase =
  (notificationsRepository: INotificationsRepository) =>
  async (input: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: Record<string, unknown> | null;
  }): Promise<Notification> => {
    return notificationsRepository.create(input);
  };
