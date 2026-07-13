import type { Notification } from '../entities/notification.entity';
import type { INotificationsRepository } from '../repositories/notifications.repository.interface';
import { NotFoundError } from '@/src/shared/errors/common';

export type IMarkNotificationReadUseCase = ReturnType<typeof markNotificationReadUseCase>;
export type IMarkAllNotificationsReadUseCase = ReturnType<typeof markAllNotificationsReadUseCase>;

export const markNotificationReadUseCase =
  (notificationsRepository: INotificationsRepository) =>
  async (id: string, userId: string): Promise<Notification> => {
    const notification = await notificationsRepository.markRead(id, userId);
    if (!notification) {
      throw new NotFoundError('Notification');
    }
    return notification;
  };

export const markAllNotificationsReadUseCase =
  (notificationsRepository: INotificationsRepository) =>
  async (userId: string): Promise<void> => {
    await notificationsRepository.markAllRead(userId);
  };
