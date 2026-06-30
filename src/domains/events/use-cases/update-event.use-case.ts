import type { Event } from '../entities/event.entity';
import type { IEventsRepository } from '../repositories/events.repository.interface';
import { NotFoundError } from '@/src/shared/errors/common';
import { UnauthorizedError } from '@/src/shared/errors/auth';

export type IUpdateEventUseCase = ReturnType<typeof updateEventUseCase>;

export const updateEventUseCase =
  (eventsRepository: IEventsRepository) =>
  async (
    id: string,
    userId: string,
    data: Partial<{
      slug: string;
      title: string;
      description: string | null;
      startAt: Date | string | null;
      locationId: string | null;
      categoryId: string | null;
      thumbnailUrl: string | null;
      eventStatus: string;
    }>
  ): Promise<Event> => {
    const existing = await eventsRepository.findById(id);
    if (!existing) throw new NotFoundError('Event');

    // Verify ownership via profiles
    const { eq } = await import('drizzle-orm');
    const { db } = await import('@/src/shared/database');
    const { profiles } = await import('@/src/shared/database/schema');
    const profile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId))
      .limit(1);

    if (!profile[0] || profile[0].id !== existing.profileId) {
      throw new UnauthorizedError('No tienes permiso para modificar este evento');
    }

    return eventsRepository.update(id, data);
  };
