import type { Event } from '../entities/event.entity';
import type { IEventsRepository } from '../repositories/events.repository.interface';
import type { IStatusesRepository } from '@/src/domains/statuses/repositories/statuses.repository.interface';
import { NotFoundError } from '@/src/shared/errors/common';
import { UnauthorizedError } from '@/src/shared/errors/auth';

export type IUpdateEventUseCase = ReturnType<typeof updateEventUseCase>;

export const updateEventUseCase =
  (eventsRepository: IEventsRepository, statusesRepository: IStatusesRepository) =>
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
      status: string;
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

    const updateData: Record<string, unknown> = {};
    for (const key of Object.keys(data)) {
      if (key !== 'status') updateData[key] = (data as any)[key];
    }
    if (data.status) {
      const status = await statusesRepository.findBySlug(data.status);
      updateData.statusId = status.id;
    }
    return eventsRepository.update(id, updateData as any);
  };
