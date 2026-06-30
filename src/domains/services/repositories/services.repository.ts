import { eq, like, and, desc } from 'drizzle-orm';
import { db } from '@/src/shared/database';
import { services, locations, categories, profiles } from '@/src/shared/database/schema';
import type { IServicesRepository, IListServicesFilters } from './services.repository.interface';
import type { Service, ServiceWithDetails } from '../entities/service.entity';
import { ServicePortfolioRepository } from './service-portfolio.repository';

export class ServicesRepository implements IServicesRepository {
  private portfolioRepo = new ServicePortfolioRepository();

  private async enrichWithDetails(rows: any[]): Promise<ServiceWithDetails[]> {
    const result: ServiceWithDetails[] = [];
    for (const row of rows) {
      const portfolio = await this.portfolioRepo.findByServiceId(row.id);
      result.push({
        ...(row as Service),
        portfolio,
      });
    }
    return result;
  }

  async findById(id: string): Promise<ServiceWithDetails | null> {
    try {
      const result = await db
        .select({
          service: services,
          locationName: locations.name,
          categoryName: categories.name,
          profileName: profiles.name,
          profileSlug: profiles.id,
        })
        .from(services)
        .where(eq(services.id, id))
        .leftJoin(locations, eq(services.locationId, locations.id))
        .leftJoin(categories, eq(services.categoryId, categories.id))
        .leftJoin(profiles, eq(services.profileId, profiles.id))
        .limit(1);

      if (!result[0]) return null;

      const { service, locationName, categoryName, profileName, profileSlug } = result[0];
      const enriched = await this.enrichWithDetails([service]);
      return {
        ...enriched[0],
        locationName: locationName ?? null,
        categoryName: categoryName ?? null,
        profileName: profileName ?? null,
        profileSlug: profileSlug ?? null,
      };
    } catch (error) {
      console.error('[ServicesRepository.findById] Error:', error);
      throw error;
    }
  }

  async findBySlug(slug: string): Promise<ServiceWithDetails | null> {
    try {
      const result = await db
        .select({
          service: services,
          locationName: locations.name,
          categoryName: categories.name,
          profileName: profiles.name,
          profileSlug: profiles.id,
        })
        .from(services)
        .where(eq(services.slug, slug))
        .leftJoin(locations, eq(services.locationId, locations.id))
        .leftJoin(categories, eq(services.categoryId, categories.id))
        .leftJoin(profiles, eq(services.profileId, profiles.id))
        .limit(1);

      if (!result[0]) return null;

      const { service, locationName, categoryName, profileName, profileSlug } = result[0];
      const enriched = await this.enrichWithDetails([service]);
      return {
        ...enriched[0],
        locationName: locationName ?? null,
        categoryName: categoryName ?? null,
        profileName: profileName ?? null,
        profileSlug: profileSlug ?? null,
      };
    } catch (error) {
      console.error('[ServicesRepository.findBySlug] Error:', error);
      throw error;
    }
  }

  async findByProfileId(profileId: string): Promise<ServiceWithDetails[]> {
    try {
      const result = await db
        .select({
          service: services,
          locationName: locations.name,
          categoryName: categories.name,
          profileName: profiles.name,
          profileSlug: profiles.id,
        })
        .from(services)
        .where(eq(services.profileId, profileId))
        .leftJoin(locations, eq(services.locationId, locations.id))
        .leftJoin(categories, eq(services.categoryId, categories.id))
        .leftJoin(profiles, eq(services.profileId, profiles.id))
        .orderBy(desc(services.createdAt));

      return this.enrichWithDetails(
        result.map((r) => ({
          ...r.service,
          locationName: r.locationName,
          categoryName: r.categoryName,
          profileName: r.profileName,
          profileSlug: r.profileSlug,
        }))
      );
    } catch (error) {
      console.error('[ServicesRepository.findByProfileId] Error:', error);
      throw error;
    }
  }

  async list(filters?: IListServicesFilters): Promise<ServiceWithDetails[]> {
    try {
      const conditions = [];

      if (filters?.profileId) conditions.push(eq(services.profileId, filters.profileId));
      if (filters?.categoryId) conditions.push(eq(services.categoryId, filters.categoryId));
      if (filters?.locationId) conditions.push(eq(services.locationId, filters.locationId));
      if (filters?.serviceStatus) conditions.push(eq(services.serviceStatus, filters.serviceStatus));
      if (filters?.search) conditions.push(like(services.title, `%${filters.search}%`));

      const query = db
        .select({
          service: services,
          locationName: locations.name,
          categoryName: categories.name,
          profileName: profiles.name,
          profileSlug: profiles.id,
        })
        .from(services)
        .leftJoin(locations, eq(services.locationId, locations.id))
        .leftJoin(categories, eq(services.categoryId, categories.id))
        .leftJoin(profiles, eq(services.profileId, profiles.id))
        .orderBy(desc(services.createdAt));

      if (conditions.length > 0) {
        query.where(and(...conditions));
      }

      const result = await query;
      return this.enrichWithDetails(
        result.map((r) => ({
          ...r.service,
          locationName: r.locationName,
          categoryName: r.categoryName,
          profileName: r.profileName,
          profileSlug: r.profileSlug,
        }))
      );
    } catch (error) {
      console.error('[ServicesRepository.list] Error:', error);
      throw error;
    }
  }

  async create(data: {
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
  }): Promise<Service> {
    try {
      const result = await db
        .insert(services)
        .values({
          id: crypto.randomUUID(),
          profileId: data.profileId,
          slug: data.slug,
          title: data.title,
          marca: data.marca ?? null,
          description: data.description ?? null,
          yearsExperience: data.yearsExperience ?? null,
          priceMin: data.priceMin ?? null,
          priceMax: data.priceMax ?? null,
          availability: data.availability ?? null,
          contactInfo: (data.contactInfo ?? []) as any,
          bannerUrl: data.bannerUrl ?? null,
          logoUrl: data.logoUrl ?? null,
          thumbnailUrl: data.thumbnailUrl ?? null,
          locationId: data.locationId ?? null,
          categoryId: data.categoryId ?? null,
          serviceStatus: data.serviceStatus ?? 'draft',
        })
        .returning();
      return result[0] as Service;
    } catch (error) {
      console.error('[ServicesRepository.create] Error:', error);
      throw error;
    }
  }

  async update(
    id: string,
    data: Partial<{
      slug: string;
      title: string;
      marca: string | null;
      description: string | null;
      yearsExperience: number | null;
      priceMin: number | null;
      priceMax: number | null;
      availability: string | null;
      contactInfo: Service['contactInfo'];
      bannerUrl: string | null;
      logoUrl: string | null;
      thumbnailUrl: string | null;
      locationId: string | null;
      categoryId: string | null;
      serviceStatus: string;
    }>
  ): Promise<Service> {
    try {
      const updateData: any = { ...data, updatedAt: new Date() };
      if (data.contactInfo) updateData.contactInfo = data.contactInfo;
      const result = await db
        .update(services)
        .set(updateData)
        .where(eq(services.id, id))
        .returning();
      return result[0] as Service;
    } catch (error) {
      console.error('[ServicesRepository.update] Error:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await db.delete(services).where(eq(services.id, id));
    } catch (error) {
      console.error('[ServicesRepository.delete] Error:', error);
      throw error;
    }
  }
}
