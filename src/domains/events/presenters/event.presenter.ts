import type { Event, EventWithDetails } from '../entities/event.entity';

export function presentEvent(event: EventWithDetails) {
  return {
    id: event.id,
    profileId: event.profileId,
    slug: event.slug,
    title: event.title,
    description: event.description,
    startAt: event.startAt instanceof Date ? event.startAt.toISOString() : event.startAt,
    location: event.locationId
      ? {
          id: event.locationId,
          name: event.locationName,
        }
      : null,
    category: event.categoryId
      ? {
          id: event.categoryId,
          name: event.categoryName,
        }
      : null,
    thumbnailUrl: event.thumbnailUrl,
    profile: {
      id: event.profileId,
      name: event.profileName,
      slug: event.profileSlug,
    },
    eventStatus: event.eventStatus,
    createdAt: event.createdAt?.toISOString?.() ?? event.createdAt,
    updatedAt: event.updatedAt?.toISOString?.() ?? event.updatedAt,
  };
}

export function presentEvents(events: EventWithDetails[]) {
  return events.map(presentEvent);
}
