export interface ServiceContactInfo {
  type: 'email' | 'telefono' | 'whatsapp' | 'website' | 'instagram' | 'facebook' | 'twitter';
  value: string;
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
  contactInfo: ServiceContactInfo[];
  bannerUrl: string | null;
  logoUrl: string | null;
  thumbnailUrl: string | null;
  locationId: string | null;
  categoryId: string | null;
  serviceStatus: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceWithDetails extends Service {
  locationName: string | null;
  categoryName: string | null;
  profileName: string | null;
  profileSlug: string | null;
  portfolio: ServicePortfolioItem[];
}
