import type { ServiceWithDetails } from '../entities/service.entity';
import type { IServicesRepository } from '../repositories/services.repository.interface';
import type { IServicePortfolioRepository } from '../repositories/service-portfolio.repository.interface';
import type { IServiceContactsRepository } from '../repositories/service-contacts.repository.interface';
import type { IStatusesRepository } from '@/src/domains/statuses/repositories/statuses.repository.interface';

export type ICreateServiceUseCase = ReturnType<typeof createServiceUseCase>;

export interface PortfolioInput {
  url: string;
  title?: string | null;
  description?: string | null;
}

export interface ContactInput {
  type: string;
  value: string;
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
  bannerUrl?: string | null;
  logoUrl?: string | null;
  thumbnailUrl?: string | null;
  locationId?: string | null;
  categoryId?: string | null;
  status?: string;
  contacts?: ContactInput[];
  portfolio?: PortfolioInput[];
}

export const createServiceUseCase =
  (
    servicesRepository: IServicesRepository,
    portfolioRepository: IServicePortfolioRepository,
    contactsRepository: IServiceContactsRepository,
    statusesRepository: IStatusesRepository,
  ) =>
  async (input: CreateServiceInput): Promise<ServiceWithDetails> => {
    const existing = await servicesRepository.findBySlug(input.slug);
    if (existing) {
      throw new Error('Ya existe un servicio con ese slug');
    }

    const status = await statusesRepository.findBySlug(input.status ?? 'draft');
    const { portfolio, contacts, status: _status, ...serviceData } = input;
    const service = await servicesRepository.create({ ...serviceData, statusId: status.id });

    if (contacts && contacts.length > 0) {
      await contactsRepository.replaceByServiceId(service.id, contacts);
    }

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
