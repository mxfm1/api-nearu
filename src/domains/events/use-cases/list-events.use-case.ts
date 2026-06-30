import type { EventWithDetails } from '../entities/event.entity';
import type { IEventsRepository, IListEventsFilters } from '../repositories/events.repository.interface';

export type IListEventsUseCase = ReturnType<typeof listEventsUseCase>;

export const listEventsUseCase =
  (eventsRepository: IEventsRepository) =>
  async (filters?: IListEventsFilters): Promise<EventWithDetails[]> => {
    return eventsRepository.list(filters);
  };
