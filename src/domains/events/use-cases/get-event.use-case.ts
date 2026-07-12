import type { EventWithDetails } from '../entities/event.entity';
import type { IEventsRepository } from '../repositories/events.repository.interface';
import { NotFoundError } from '@/src/shared/errors/common';

export type IGetEventUseCase = ReturnType<typeof getEventUseCase>;

export const getEventUseCase =
  (eventsRepository: IEventsRepository) =>
  async (slugOrId: string): Promise<EventWithDetails> => {
    let event = await eventsRepository.findBySlug(slugOrId);
    if (!event) {
      event = await eventsRepository.findById(slugOrId);
    }
    if (!event) throw new NotFoundError('Event');

    return event;
  };
