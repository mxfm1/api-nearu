import type { Notification, NotificationType } from '../entities/notification.entity';
import type { INotificationsRepository } from '../repositories/notifications.repository.interface';

export type ICreateNotificationUseCase = ReturnType<typeof createNotificationUseCase>;

export const createNotificationUseCase =
  (notificationsRepository: INotificationsRepository) =>
  async (input: {
    userId: string;
    type: NotificationType;
    title: string;
    body?: string;
    actorProfileId?: string | null;
    entityType?: string | null;
    entityId?: string | null;
    actionUrl?: string | null;
    metadata?: Record<string, unknown> | null;
  }): Promise<Notification> => {
    return notificationsRepository.create({
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body ?? input.title,
      actorProfileId: input.actorProfileId,
      entityType: input.entityType,
      entityId: input.entityId,
      actionUrl: input.actionUrl,
      metadata: input.metadata,
    });
  };
