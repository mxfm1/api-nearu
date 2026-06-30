import type { Event } from '../entities/event.entity';
import type { IEventsRepository } from '../repositories/events.repository.interface';

export type ICreateEventUseCase = ReturnType<typeof createEventUseCase>;

export interface CreateEventInput {
  profileId: string;
  slug: string;
  title: string;
  description?: string | null;
  startAt?: Date | string | null;
  locationId?: string | null;
  categoryId?: string | null;
  thumbnailUrl?: string | null;
  eventStatus?: string;
}

export const createEventUseCase =
  (eventsRepository: IEventsRepository) =>
  async (input: CreateEventInput): Promise<Event> => {
    const existing = await eventsRepository.findBySlug(input.slug);
    if (existing) {
      throw new Error('Ya existe un evento con ese slug');
    }

    return eventsRepository.create(input);
  };
