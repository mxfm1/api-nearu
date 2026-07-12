import { eq, asc } from 'drizzle-orm';
import { db } from '@/src/shared/database';
import { servicePortfolio } from '@/src/shared/database/schema';
import type { IServicePortfolioRepository } from './service-portfolio.repository.interface';
import type { ServicePortfolioItem } from '../entities/service.entity';

export class ServicePortfolioRepository implements IServicePortfolioRepository {
  async findByServiceId(serviceId: string): Promise<ServicePortfolioItem[]> {
    try {
      const result = await db
        .select()
        .from(servicePortfolio)
        .where(eq(servicePortfolio.serviceId, serviceId))
        .orderBy(asc(servicePortfolio.orden));
      return result as ServicePortfolioItem[];
    } catch (error) {
      console.error('[ServicePortfolioRepository.findByServiceId] Error:', error);
      throw error;
    }
  }

  async create(data: {
    serviceId: string;
    url: string;
    title?: string | null;
    description?: string | null;
    orden?: number;
  }): Promise<ServicePortfolioItem> {
    try {
      const result = await db
        .insert(servicePortfolio)
        .values({
          id: crypto.randomUUID(),
          serviceId: data.serviceId,
          url: data.url,
          title: data.title ?? null,
          description: data.description ?? null,
          orden: data.orden ?? 0,
        })
        .returning();
      return result[0] as ServicePortfolioItem;
    } catch (error) {
      console.error('[ServicePortfolioRepository.create] Error:', error);
      throw error;
    }
  }

  async update(
    id: string,
    data: { title?: string | null; description?: string | null; url?: string; orden?: number }
  ): Promise<ServicePortfolioItem> {
    try {
      const result = await db
        .update(servicePortfolio)
        .set(data)
        .where(eq(servicePortfolio.id, id))
        .returning();
      return result[0] as ServicePortfolioItem;
    } catch (error) {
      console.error('[ServicePortfolioRepository.update] Error:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await db.delete(servicePortfolio).where(eq(servicePortfolio.id, id));
    } catch (error) {
      console.error('[ServicePortfolioRepository.delete] Error:', error);
      throw error;
    }
  }

  async deleteByServiceId(serviceId: string): Promise<void> {
    try {
      await db.delete(servicePortfolio).where(eq(servicePortfolio.serviceId, serviceId));
    } catch (error) {
      console.error('[ServicePortfolioRepository.deleteByServiceId] Error:', error);
      throw error;
    }
  }
}
