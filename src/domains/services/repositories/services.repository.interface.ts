import type { Service, ServiceWithDetails } from '../entities/service.entity';

export interface IListServicesFilters {
  profileId?: string;
  categoryId?: string;
  locationId?: string;
  status?: string;
  search?: string;
}

export interface IServicesRepository {
  findById(id: string): Promise<ServiceWithDetails | null>;
  findBySlug(slug: string): Promise<ServiceWithDetails | null>;
  findByProfileId(profileId: string): Promise<ServiceWithDetails[]>;
  list(filters?: IListServicesFilters): Promise<ServiceWithDetails[]>;
  create(data: {
    profileId: string;
    slug: string;
    title: string;
    marca?: string | null;
    description?: string | null;
    yearsExperience?: number | null;
    priceMin?: number | null;
    priceMax?: number | null;
    availability?: string | null;
    bannerUrl?: string | null;
    logoUrl?: string | null;
    thumbnailUrl?: string | null;
    locationId?: string | null;
    categoryId?: string | null;
    statusId?: string;
  }): Promise<Service>;
  update(id: string, data: Partial<{
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
  }>): Promise<Service>;
  delete(id: string): Promise<void>;
}
