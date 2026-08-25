import type { INotificationsRepository } from '../repositories/notifications.repository.interface';

export type ICountUnreadNotificationsUseCase = ReturnType<typeof countUnreadNotificationsUseCase>;

export const countUnreadNotificationsUseCase = (notificationsRepository: INotificationsRepository) =>
  async (userId: string): Promise<number> => notificationsRepository.countUnreadByUserId(userId);
