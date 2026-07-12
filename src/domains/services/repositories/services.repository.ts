import { eq, like, and, desc } from 'drizzle-orm';
import { db } from '@/src/shared/database';
import { services, locations, categories, profiles, serviceContacts, statuses } from '@/src/shared/database/schema';
import type { IServicesRepository, IListServicesFilters } from './services.repository.interface';
import type { Service, ServiceWithDetails } from '../entities/service.entity';
import type { ServiceContact } from '../entities/service-contact.entity';
import { ServicePortfolioRepository } from './service-portfolio.repository';

export class ServicesRepository implements IServicesRepository {
  private portfolioRepo = new ServicePortfolioRepository();

  private async enrichWithDetails(rows: any[]): Promise<ServiceWithDetails[]> {
    const result: ServiceWithDetails[] = [];
    for (const row of rows) {
      const [portfolio, contacts] = await Promise.all([
        this.portfolioRepo.findByServiceId(row.id),
        db
          .select()
          .from(serviceContacts)
          .where(eq(serviceContacts.serviceId, row.id)),
      ]);
      result.push({
        ...(row as Service),
        portfolio,
        contacts: contacts as ServiceContact[],
      } as ServiceWithDetails);
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
          statusName: statuses.name,
          statusSlug: statuses.slug,
        })
        .from(services)
        .where(eq(services.id, id))
        .leftJoin(locations, eq(services.locationId, locations.id))
        .leftJoin(categories, eq(services.categoryId, categories.id))
        .leftJoin(profiles, eq(services.profileId, profiles.id))
        .leftJoin(statuses, eq(services.statusId, statuses.id))
        .limit(1);

      if (!result[0]) return null;

      const { service, locationName, categoryName, profileName, profileSlug, statusName, statusSlug } = result[0];
      const enriched = await this.enrichWithDetails([service]);
      return {
        ...enriched[0],
        locationName: locationName ?? null,
        categoryName: categoryName ?? null,
        profileName: profileName ?? null,
        profileSlug: profileSlug ?? null,
        statusName,
        statusSlug,
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
          statusName: statuses.name,
          statusSlug: statuses.slug,
        })
        .from(services)
        .where(eq(services.slug, slug))
        .leftJoin(locations, eq(services.locationId, locations.id))
        .leftJoin(categories, eq(services.categoryId, categories.id))
        .leftJoin(profiles, eq(services.profileId, profiles.id))
        .leftJoin(statuses, eq(services.statusId, statuses.id))
        .limit(1);

      if (!result[0]) return null;

      const { service, locationName, categoryName, profileName, profileSlug, statusName, statusSlug } = result[0];
      const enriched = await this.enrichWithDetails([service]);
      return {
        ...enriched[0],
        locationName: locationName ?? null,
        categoryName: categoryName ?? null,
        profileName: profileName ?? null,
        profileSlug: profileSlug ?? null,
        statusName,
        statusSlug,
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
          statusName: statuses.name,
          statusSlug: statuses.slug,
        })
        .from(services)
        .where(eq(services.profileId, profileId))
        .leftJoin(locations, eq(services.locationId, locations.id))
        .leftJoin(categories, eq(services.categoryId, categories.id))
        .leftJoin(profiles, eq(services.profileId, profiles.id))
        .leftJoin(statuses, eq(services.statusId, statuses.id))
        .orderBy(desc(services.createdAt));

      return this.enrichWithDetails(
        result.map((r) => ({
          ...r.service,
          locationName: r.locationName,
          categoryName: r.categoryName,
          profileName: r.profileName,
          profileSlug: r.profileSlug,
          statusName: r.statusName,
          statusSlug: r.statusSlug,
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
      if (filters?.status) conditions.push(eq(statuses.slug, filters.status));
      if (filters?.search) conditions.push(like(services.title, `%${filters.search}%`));

      const query = db
        .select({
          service: services,
          locationName: locations.name,
          categoryName: categories.name,
          profileName: profiles.name,
          profileSlug: profiles.id,
          statusName: statuses.name,
          statusSlug: statuses.slug,
        })
        .from(services)
        .leftJoin(locations, eq(services.locationId, locations.id))
        .leftJoin(categories, eq(services.categoryId, categories.id))
        .leftJoin(profiles, eq(services.profileId, profiles.id))
        .leftJoin(statuses, eq(services.statusId, statuses.id))
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
          statusName: r.statusName,
          statusSlug: r.statusSlug,
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
    bannerUrl?: string | null;
    logoUrl?: string | null;
    thumbnailUrl?: string | null;
    locationId?: string | null;
    categoryId?: string | null;
    statusId?: string;
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
          bannerUrl: data.bannerUrl ?? null,
          logoUrl: data.logoUrl ?? null,
          thumbnailUrl: data.thumbnailUrl ?? null,
          locationId: data.locationId ?? null,
          categoryId: data.categoryId ?? null,
          statusId: data.statusId ?? (await this.resolveDefaultStatusId()),
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
      bannerUrl: string | null;
      logoUrl: string | null;
      thumbnailUrl: string | null;
      locationId: string | null;
      categoryId: string | null;
      statusId: string;
    }>
  ): Promise<Service> {
    try {
      const result = await db
        .update(services)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(services.id, id))
        .returning();
      return result[0] as Service;
    } catch (error) {
      console.error('[ServicesRepository.update] Error:', error);
      throw error;
    }
  }

  private async resolveDefaultStatusId(): Promise<string> {
    const result = await db
      .select({ id: statuses.id })
      .from(statuses)
      .where(eq(statuses.slug, 'draft'))
      .limit(1);
    if (!result[0]) throw new Error('Default status "draft" not found. Seed the statuses table first.');
    return result[0].id;
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
