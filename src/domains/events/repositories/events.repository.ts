import { eq, like, and, desc, gte, sql } from 'drizzle-orm';
import { db } from '@/src/shared/database';
import { events, locations, categories, profiles, statuses, regions } from '@/src/shared/database/schema';
import type { IEventsRepository, IListEventsFilters } from './events.repository.interface';
import type { Event, EventWithDetails } from '../entities/event.entity';

export class EventsRepository implements IEventsRepository {
  async findById(id: string): Promise<EventWithDetails | null> {
    try {
      const result = await db
        .select({
          event: events,
          locationName: locations.name,
          categoryName: categories.name,
          profileName: profiles.name,
          profileSlug: profiles.slug,
          profileLocationName: sql<string>`(
            SELECT l.name FROM locations l 
            WHERE l.id = profiles.location_id
          )`,
          profileRegionName: sql<string>`(
            SELECT r.name FROM regions r 
            JOIN locations l ON l.region_id = r.id 
            WHERE l.id = profiles.location_id
          )`,
          statusName: statuses.name,
          statusSlug: statuses.slug,
        })
        .from(events)
        .where(eq(events.id, id))
        .leftJoin(locations, eq(events.locationId, locations.id))
        .leftJoin(categories, eq(events.categoryId, categories.id))
        .leftJoin(profiles, eq(events.profileId, profiles.id))
        .leftJoin(statuses, eq(events.statusId, statuses.id))
        .limit(1);

      if (!result[0]) return null;

      const { event, locationName, categoryName, profileName, profileSlug, profileLocationName, profileRegionName, statusName, statusSlug } = result[0];
      return {
        ...(event as Event),
        locationName: locationName ?? null,
        categoryName: categoryName ?? null,
        profileName: profileName ?? null,
        profileSlug: profileSlug ?? null,
        statusName,
        statusSlug,
        profileRegion: profileRegionName ?? null,
      };
    } catch (error) {
      console.error('[EventsRepository.findById] Error:', error);
      throw error;
    }
  }

  async findBySlug(slug: string): Promise<EventWithDetails | null> {
    try {
      const result = await db
        .select({
          event: events,
          locationName: locations.name,
          categoryName: categories.name,
          profileName: profiles.name,
          profileSlug: profiles.slug,
          profileLocationName: sql<string>`(
            SELECT l.name FROM locations l 
            WHERE l.id = profiles.location_id
          )`,
          profileRegionName: sql<string>`(
            SELECT r.name FROM regions r 
            JOIN locations l ON l.region_id = r.id 
            WHERE l.id = profiles.location_id
          )`,
          statusName: statuses.name,
          statusSlug: statuses.slug,
        })
        .from(events)
        .where(eq(events.slug, slug))
        .leftJoin(locations, eq(events.locationId, locations.id))
        .leftJoin(categories, eq(events.categoryId, categories.id))
        .leftJoin(profiles, eq(events.profileId, profiles.id))
        .leftJoin(statuses, eq(events.statusId, statuses.id))
        .limit(1);

      if (!result[0]) return null;

      const { event, locationName, categoryName, profileName, profileSlug, profileLocationName, profileRegionName, statusName, statusSlug } = result[0];
      return {
        ...(event as Event),
        locationName: locationName ?? null,
        categoryName: categoryName ?? null,
        profileName: profileName ?? null,
        profileSlug: profileSlug ?? null,
        statusName,
        statusSlug,
        profileRegion: profileRegionName ?? null,
      };
    } catch (error) {
      console.error('[EventsRepository.findBySlug] Error:', error);
      throw error;
    }
  }

  async findByProfileId(profileId: string): Promise<EventWithDetails[]> {
    try {
      const result = await db
        .select({
          event: events,
          locationName: locations.name,
          categoryName: categories.name,
          profileName: profiles.name,
          profileSlug: profiles.slug,
          statusName: statuses.name,
          statusSlug: statuses.slug,
        })
        .from(events)
        .where(eq(events.profileId, profileId))
        .leftJoin(locations, eq(events.locationId, locations.id))
        .leftJoin(categories, eq(events.categoryId, categories.id))
        .leftJoin(profiles, eq(events.profileId, profiles.id))
        .leftJoin(statuses, eq(events.statusId, statuses.id))
        .orderBy(desc(events.createdAt));

      return result.map(({ event, locationName, categoryName, profileName, profileSlug, statusName, statusSlug }) => ({
        ...(event as Event),
        locationName: locationName ?? null,
        categoryName: categoryName ?? null,
        profileName: profileName ?? null,
        profileSlug: profileSlug ?? null,
        statusName,
        statusSlug,
      }));
    } catch (error) {
      console.error('[EventsRepository.findByProfileId] Error:', error);
      throw error;
    }
  }

  async list(filters?: IListEventsFilters): Promise<EventWithDetails[]> {
    try {
      const conditions = [];

      if (filters?.profileId) conditions.push(eq(events.profileId, filters.profileId));
      if (filters?.categoryId) conditions.push(eq(events.categoryId, filters.categoryId));
      if (filters?.locationId) conditions.push(eq(events.locationId, filters.locationId));
      if (filters?.status) conditions.push(eq(statuses.slug, filters.status));
      if (filters?.search) conditions.push(like(events.title, `%${filters.search}%`));
      if (filters?.upcoming) conditions.push(gte(events.startAt, new Date()));

      const query = db
        .select({
          event: events,
          locationName: locations.name,
          categoryName: categories.name,
          profileName: profiles.name,
          profileSlug: profiles.slug,
          statusName: statuses.name,
          statusSlug: statuses.slug,
        })
        .from(events)
        .leftJoin(locations, eq(events.locationId, locations.id))
        .leftJoin(categories, eq(events.categoryId, categories.id))
        .leftJoin(profiles, eq(events.profileId, profiles.id))
        .leftJoin(statuses, eq(events.statusId, statuses.id))
        .orderBy(desc(events.createdAt));

      if (conditions.length > 0) {
        query.where(and(...conditions));
      }

      const result = await query;
      return result.map(({ event, locationName, categoryName, profileName, profileSlug, statusName, statusSlug }) => ({
        ...(event as Event),
        locationName: locationName ?? null,
        categoryName: categoryName ?? null,
        profileName: profileName ?? null,
        profileSlug: profileSlug ?? null,
        statusName,
        statusSlug,
      }));
    } catch (error) {
      console.error('[EventsRepository.list] Error:', error);
      throw error;
    }
  }

  async create(data: {
    profileId: string;
    slug: string;
    title: string;
    description?: string | null;
    requirements?: string | null;
    startAt?: Date | string | null;
    applicationDeadline?: Date | string | null;
    locationId?: string | null;
    categoryId?: string | null;
    thumbnailUrl?: string | null;
    bannerUrl?: string | null;
    requiredCandidates?: number;
    selectedCandidates?: number;
    requiresVerifiedProfile?: boolean;
    autoCloseWhenFilled?: boolean;
    statusId?: string;
  }): Promise<Event> {
    try {
      const result = await db
        .insert(events)
        .values({
          id: crypto.randomUUID(),
          profileId: data.profileId,
          slug: data.slug,
          title: data.title,
          description: data.description ?? null,
          requirements: data.requirements ?? null,
          startAt: data.startAt ? new Date(data.startAt) : null,
          applicationDeadline: data.applicationDeadline ? new Date(data.applicationDeadline) : null,
          locationId: data.locationId ?? null,
          categoryId: data.categoryId ?? null,
          thumbnailUrl: data.thumbnailUrl ?? null,
          bannerUrl: data.bannerUrl ?? null,
          requiredCandidates: data.requiredCandidates ?? 1,
          selectedCandidates: data.selectedCandidates ?? 0,
          requiresVerifiedProfile: data.requiresVerifiedProfile ?? true,
          autoCloseWhenFilled: data.autoCloseWhenFilled ?? true,
          statusId: data.statusId ?? (await this.resolveDefaultStatusId()),
        })
        .returning();
      return result[0] as Event;
    } catch (error) {
      console.error('[EventsRepository.create] Error:', error);
      throw error;
    }
  }

  async update(
    id: string,
    data: Partial<{
      slug: string;
      title: string;
      description: string | null;
      requirements: string | null;
      startAt: Date | string | null;
      applicationDeadline: Date | string | null;
      locationId: string | null;
      categoryId: string | null;
      thumbnailUrl: string | null;
      bannerUrl: string | null;
      requiredCandidates: number;
      selectedCandidates: number;
      requiresVerifiedProfile: boolean;
      autoCloseWhenFilled: boolean;
      statusId: string;
    }>
  ): Promise<Event> {
    try {
      const result = await db
        .update(events)
        .set({
          ...data,
          startAt: data.startAt ? new Date(data.startAt) : undefined,
          applicationDeadline: data.applicationDeadline ? new Date(data.applicationDeadline) : undefined,
          updatedAt: new Date(),
        })
        .where(eq(events.id, id))
        .returning();
      return result[0] as Event;
    } catch (error) {
      console.error('[EventsRepository.update] Error:', error);
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

  async incrementApplicationCount(eventId: string, delta: number): Promise<void> {
    try {
      await db
        .update(events)
        .set({
          applicationCount: sql`greatest(${events.applicationCount} + ${delta}, 0)`,
          updatedAt: new Date(),
        })
        .where(eq(events.id, eventId));
    } catch (error) {
      console.error('[EventsRepository.incrementApplicationCount] Error:', error);
      throw error;
    }
  }

  async incrementSelectedCandidates(eventId: string): Promise<void> {
    try {
      await db
        .update(events)
        .set({
          selectedCandidates: sql`${events.selectedCandidates} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(events.id, eventId));
    } catch (error) {
      console.error('[EventsRepository.incrementSelectedCandidates] Error:', error);
      throw error;
    }
  }

  async decrementSelectedCandidates(eventId: string): Promise<void> {
    try {
      await db
        .update(events)
        .set({
          selectedCandidates: sql`greatest(${events.selectedCandidates} - 1, 0)`,
          updatedAt: new Date(),
        })
        .where(eq(events.id, eventId));
    } catch (error) {
      console.error('[EventsRepository.decrementSelectedCandidates] Error:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await db.delete(events).where(eq(events.id, id));
    } catch (error) {
      console.error('[EventsRepository.delete] Error:', error);
      throw error;
    }
  }
}
