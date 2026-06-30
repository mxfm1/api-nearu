import { eq, like, and, desc, gte } from 'drizzle-orm';
import { db } from '@/src/shared/database';
import { events, locations, categories, profiles } from '@/src/shared/database/schema';
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
          profileSlug: profiles.id,
        })
        .from(events)
        .where(eq(events.id, id))
        .leftJoin(locations, eq(events.locationId, locations.id))
        .leftJoin(categories, eq(events.categoryId, categories.id))
        .leftJoin(profiles, eq(events.profileId, profiles.id))
        .limit(1);

      if (!result[0]) return null;

      const { event, locationName, categoryName, profileName, profileSlug } = result[0];
      return {
        ...(event as Event),
        locationName: locationName ?? null,
        categoryName: categoryName ?? null,
        profileName: profileName ?? null,
        profileSlug: profileSlug ?? null,
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
          profileSlug: profiles.id,
        })
        .from(events)
        .where(eq(events.slug, slug))
        .leftJoin(locations, eq(events.locationId, locations.id))
        .leftJoin(categories, eq(events.categoryId, categories.id))
        .leftJoin(profiles, eq(events.profileId, profiles.id))
        .limit(1);

      if (!result[0]) return null;

      const { event, locationName, categoryName, profileName, profileSlug } = result[0];
      return {
        ...(event as Event),
        locationName: locationName ?? null,
        categoryName: categoryName ?? null,
        profileName: profileName ?? null,
        profileSlug: profileSlug ?? null,
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
          profileSlug: profiles.id,
        })
        .from(events)
        .where(eq(events.profileId, profileId))
        .leftJoin(locations, eq(events.locationId, locations.id))
        .leftJoin(categories, eq(events.categoryId, categories.id))
        .leftJoin(profiles, eq(events.profileId, profiles.id))
        .orderBy(desc(events.createdAt));

      return result.map(({ event, locationName, categoryName, profileName, profileSlug }) => ({
        ...(event as Event),
        locationName: locationName ?? null,
        categoryName: categoryName ?? null,
        profileName: profileName ?? null,
        profileSlug: profileSlug ?? null,
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
      if (filters?.eventStatus) conditions.push(eq(events.eventStatus, filters.eventStatus));
      if (filters?.search) conditions.push(like(events.title, `%${filters.search}%`));
      if (filters?.upcoming) conditions.push(gte(events.startAt, new Date()));

      const query = db
        .select({
          event: events,
          locationName: locations.name,
          categoryName: categories.name,
          profileName: profiles.name,
          profileSlug: profiles.id,
        })
        .from(events)
        .leftJoin(locations, eq(events.locationId, locations.id))
        .leftJoin(categories, eq(events.categoryId, categories.id))
        .leftJoin(profiles, eq(events.profileId, profiles.id))
        .orderBy(desc(events.createdAt));

      if (conditions.length > 0) {
        query.where(and(...conditions));
      }

      const result = await query;
      return result.map(({ event, locationName, categoryName, profileName, profileSlug }) => ({
        ...(event as Event),
        locationName: locationName ?? null,
        categoryName: categoryName ?? null,
        profileName: profileName ?? null,
        profileSlug: profileSlug ?? null,
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
    startAt?: Date | string | null;
    locationId?: string | null;
    categoryId?: string | null;
    thumbnailUrl?: string | null;
    eventStatus?: string;
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
          startAt: data.startAt ?? null,
          locationId: data.locationId ?? null,
          categoryId: data.categoryId ?? null,
          thumbnailUrl: data.thumbnailUrl ?? null,
          eventStatus: data.eventStatus ?? 'draft',
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
      startAt: Date | string | null;
      locationId: string | null;
      categoryId: string | null;
      thumbnailUrl: string | null;
      eventStatus: string;
    }>
  ): Promise<Event> {
    try {
      const result = await db
        .update(events)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(events.id, id))
        .returning();
      return result[0] as Event;
    } catch (error) {
      console.error('[EventsRepository.update] Error:', error);
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
