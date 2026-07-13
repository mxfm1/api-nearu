export interface Event {
  id: string;
  profileId: string;
  slug: string;
  title: string;
  description: string | null;
  requirements: string | null;
  startAt: Date | string | null;
  applicationDeadline: Date | string | null;
  locationId: string | null;
  categoryId: string | null;
  thumbnailUrl: string | null;
  bannerUrl: string | null;
  requiredCandidates: number;
  selectedCandidates: number;
  applicationCount: number;
  requiresVerifiedProfile: boolean;
  autoCloseWhenFilled: boolean;
  statusId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventWithDetails extends Event {
  locationName: string | null;
  categoryName: string | null;
  profileName: string | null;
  profileSlug: string | null;
  profileRegion: string | null;  // Region where the company is located
  statusName: string | null;
  statusSlug: string | null;
}
