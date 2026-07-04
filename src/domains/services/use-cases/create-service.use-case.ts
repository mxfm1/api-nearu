import type { ServiceWithDetails } from '../entities/service.entity';
import type { IServicesRepository } from '../repositories/services.repository.interface';
import type { IServicePortfolioRepository } from '../repositories/service-portfolio.repository.interface';

export type ICreateServiceUseCase = ReturnType<typeof createServiceUseCase>;

export interface PortfolioInput {
  url: string;
  title?: string | null;
  description?: string | null;
}

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
  contactInfo?: ServiceWithDetails['contactInfo'];
  bannerUrl?: string | null;
  logoUrl?: string | null;
  thumbnailUrl?: string | null;
  locationId?: string | null;
  categoryId?: string | null;
  serviceStatus?: string;
  portfolio?: PortfolioInput[];
}

export const createServiceUseCase =
  (servicesRepository: IServicesRepository, portfolioRepository: IServicePortfolioRepository) =>
  async (input: CreateServiceInput): Promise<ServiceWithDetails> => {
    const existing = await servicesRepository.findBySlug(input.slug);
    if (existing) {
      throw new Error('Ya existe un servicio con ese slug');
    }

    const { portfolio, ...serviceData } = input;
    const service = await servicesRepository.create(serviceData);

    if (portfolio && portfolio.length > 0) {
      for (const item of portfolio) {
        await portfolioRepository.create({
          serviceId: service.id,
          url: item.url,
          title: item.title,
          description: item.description,
        });
      }
    }

    const enriched = await servicesRepository.findById(service.id);
    return enriched!;
  };
