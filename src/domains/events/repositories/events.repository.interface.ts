import type { Event, EventWithDetails } from '../entities/event.entity';

export interface IListEventsFilters {
  profileId?: string;
  categoryId?: string;
  locationId?: string;
  status?: string;
  search?: string;
  upcoming?: boolean;
}

export interface IEventsRepository {
  findById(id: string): Promise<EventWithDetails | null>;
  findBySlug(slug: string): Promise<EventWithDetails | null>;
  findByProfileId(profileId: string): Promise<EventWithDetails[]>;
  list(filters?: IListEventsFilters): Promise<EventWithDetails[]>;
  create(data: {
    profileId: string;
    slug: string;
    title: string;
    description?: string | null;
    startAt?: Date | string | null;
    locationId?: string | null;
    categoryId?: string | null;
    thumbnailUrl?: string | null;
    statusId?: string;
  }): Promise<Event>;
  update(id: string, data: Partial<{
    slug: string;
    title: string;
    description: string | null;
    startAt: Date | string | null;
    locationId: string | null;
    categoryId: string | null;
    thumbnailUrl: string | null;
    statusId: string;
  }>): Promise<Event>;
  delete(id: string): Promise<void>;
}
