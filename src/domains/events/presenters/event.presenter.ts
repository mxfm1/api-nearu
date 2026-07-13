import type { Event, EventWithDetails } from '../entities/event.entity';

export function presentEvent(event: EventWithDetails) {
  return {
    id: event.id,
    profileId: event.profileId,
    slug: event.slug,
    title: event.title,
    description: event.description,
    requirements: event.requirements,
    startAt: event.startAt instanceof Date ? event.startAt.toISOString() : event.startAt,
    applicationDeadline: event.applicationDeadline instanceof Date ? event.applicationDeadline.toISOString() : event.applicationDeadline,
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
    bannerUrl: event.bannerUrl,
    requiredCandidates: event.requiredCandidates,
    selectedCandidates: event.selectedCandidates,
    applicationCount: event.applicationCount,
    requiresVerifiedProfile: event.requiresVerifiedProfile,
    autoCloseWhenFilled: event.autoCloseWhenFilled,
    profile: {
      id: event.profileId,
      name: event.profileName,
      slug: event.profileSlug,
      region: event.profileRegion,
    },
    status: {
      id: event.statusId,
      name: event.statusName,
      slug: event.statusSlug,
    },
    createdAt: event.createdAt?.toISOString?.() ?? event.createdAt,
    updatedAt: event.updatedAt?.toISOString?.() ?? event.updatedAt,
  };
}

export function presentEvents(events: EventWithDetails[]) {
  return events.map(presentEvent);
}
