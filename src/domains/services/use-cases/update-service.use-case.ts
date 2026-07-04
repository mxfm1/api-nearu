import type { ServiceWithDetails } from '../entities/service.entity';
import type { IServicesRepository } from '../repositories/services.repository.interface';
import type { IServicePortfolioRepository } from '../repositories/service-portfolio.repository.interface';
import { NotFoundError, UnauthorizedError } from '@/src/shared/errors/common';
import { UnauthorizedError as AuthError } from '@/src/shared/errors/auth';

export type IUpdateServiceUseCase = ReturnType<typeof updateServiceUseCase>;

export interface PortfolioInput {
  url: string;
  title?: string | null;
  description?: string | null;
}

export const updateServiceUseCase =
  (servicesRepository: IServicesRepository, portfolioRepository: IServicePortfolioRepository) =>
  async (
    id: string,
    userId: string,
    data: Partial<{
      slug: string;
      title: string;
      marca: string | null;
      description: string | null;
      yearsExperience: number | null;
      priceMin: number | null;
      priceMax: number | null;
      availability: string | null;
      contactInfo: ServiceWithDetails['contactInfo'];
      bannerUrl: string | null;
      logoUrl: string | null;
      thumbnailUrl: string | null;
      locationId: string | null;
      categoryId: string | null;
      serviceStatus: string;
      portfolio: PortfolioInput[];
    }>
  ): Promise<ServiceWithDetails> => {
    const existing = await servicesRepository.findById(id);
    if (!existing) throw new NotFoundError('Service');

    if (existing.profileId !== userId) {
      const { eq } = await import('drizzle-orm');
      const { db } = await import('@/src/shared/database');
      const { profiles } = await import('@/src/shared/database/schema');
      const profile = await db
        .select()
        .from(profiles)
        .where(eq(profiles.userId, userId))
        .limit(1);

      if (!profile[0] || profile[0].id !== existing.profileId) {
        throw new AuthError('No tienes permiso para modificar este servicio');
      }
    }

    const { portfolio, ...serviceData } = data;
    await servicesRepository.update(id, serviceData);

    if (portfolio !== undefined) {
      await portfolioRepository.deleteByServiceId(id);
      for (const item of portfolio) {
        await portfolioRepository.create({
          serviceId: id,
          url: item.url,
          title: item.title,
          description: item.description,
        });
      }
    }

    const enriched = await servicesRepository.findById(id);
    return enriched!;
  };
