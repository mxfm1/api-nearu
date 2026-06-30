import type { Service } from '../entities/service.entity';
import type { IServicesRepository } from '../repositories/services.repository.interface';
import type { IServicePortfolioRepository } from '../repositories/service-portfolio.repository.interface';

export type ICreateServiceUseCase = ReturnType<typeof createServiceUseCase>;

export interface CreateServiceInput {
  profileId: string;
  slug: string;
  title: string;
  marca?: string | null;
  description?: string | null;
  yearsExperience?: number | null;
  priceMin?: number | null;
  priceMax?: number | null;
  availability?: string | null;
  contactInfo?: Service['contactInfo'];
  bannerUrl?: string | null;
  logoUrl?: string | null;
  thumbnailUrl?: string | null;
  locationId?: string | null;
  categoryId?: string | null;
  serviceStatus?: string;
}

export const createServiceUseCase =
  (servicesRepository: IServicesRepository) =>
  async (input: CreateServiceInput): Promise<Service> => {
    const existing = await servicesRepository.findBySlug(input.slug);
    if (existing) {
      throw new Error('Ya existe un servicio con ese slug');
    }

    return servicesRepository.create(input);
  };
