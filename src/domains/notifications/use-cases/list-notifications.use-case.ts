import type { Notification } from '../entities/notification.entity';
import type { INotificationsRepository } from '../repositories/notifications.repository.interface';

export type IListNotificationsUseCase = ReturnType<typeof listNotificationsUseCase>;

export const listNotificationsUseCase =
  (notificationsRepository: INotificationsRepository) =>
  async (userId: string): Promise<Notification[]> => {
    return notificationsRepository.findByUserId(userId);
  };
