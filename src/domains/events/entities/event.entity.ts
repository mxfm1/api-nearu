export interface Event {
  id: string;
  profileId: string;
  slug: string;
  title: string;
  description: string | null;
  startAt: Date | string | null;
  locationId: string | null;
  categoryId: string | null;
  thumbnailUrl: string | null;
  eventStatus: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventWithDetails extends Event {
  locationName: string | null;
  categoryName: string | null;
  profileName: string | null;
  profileSlug: string | null;
}
