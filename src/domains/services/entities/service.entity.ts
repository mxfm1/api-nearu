export interface ServiceContact {
  id: string;
  serviceId: string;
  type: string;
  value: string;
  readAt: Date | null;
  respondedAt: Date | null;
  createdAt: Date;
}

export interface ServicePortfolioItem {
  id: string;
  serviceId: string;
  url: string;
  title: string | null;
  description: string | null;
  orden: number;
  createdAt: Date;
}

export interface Service {
  id: string;
  profileId: string;
  slug: string;
  title: string;
  marca: string | null;
  description: string | null;
  yearsExperience: number | null;
  priceMin: number | null;
  priceMax: number | null;
  availability: string | null;
  bannerUrl: string | null;
  logoUrl: string | null;
  thumbnailUrl: string | null;
  locationId: string | null;
  categoryId: string | null;
  statusId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceWithDetails extends Service {
  locationName: string | null;
  categoryName: string | null;
  profileName: string | null;
  profileSlug: string | null;
  statusName: string | null;
  statusSlug: string | null;
  portfolio: ServicePortfolioItem[];
  contacts: ServiceContact[];
}
