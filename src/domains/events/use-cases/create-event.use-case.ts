import type { Event } from '../entities/event.entity';
import type { IEventsRepository } from '../repositories/events.repository.interface';
import { slugifyUnique } from '@/src/shared/utils/slugify';

export type ICreateEventUseCase = ReturnType<typeof createEventUseCase>;

export interface CreateEventInput {
  profileId: string;
  slug?: string;
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
    const slug = input.slug ?? await slugifyUnique(input.title, async (s) => {
      const existing = await eventsRepository.findBySlug(s);
      return existing !== null;
    });

    return eventsRepository.create({ ...input, slug });
  };
