import type { Service, ServiceWithDetails } from '../entities/service.entity';

export interface IListServicesFilters {
  profileId?: string;
  categoryId?: string;
  locationId?: string;
  status?: string;
  search?: string;
  priceMin?: number;
  priceMax?: number;
  modality?: 'in_person' | 'online' | 'hybrid';
  availability?: 'immediate' | 'not_immediate';
  sort?: 'relevance' | 'newest' | 'oldest';
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
    availability?: 'immediate' | 'not_immediate' | null;
    availabilityDetails?: string | null;
    modality?: 'in_person' | 'online' | 'hybrid' | null;
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
    availability: 'immediate' | 'not_immediate' | null;
    availabilityDetails: string | null;
    modality: 'in_person' | 'online' | 'hybrid' | null;
    bannerUrl: string | null;
    logoUrl: string | null;
    thumbnailUrl: string | null;
    locationId: string | null;
    categoryId: string | null;
    statusId: string;
  }>): Promise<Service>;
  delete(id: string): Promise<void>;
}
