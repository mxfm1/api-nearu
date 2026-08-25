import { and, asc, desc, eq, inArray, ne, isNotNull, or } from 'drizzle-orm';
import { db } from '@/src/shared/database';
import {
  categories,
  events,
  locations,
  profiles,
  services,
  statuses,
} from '@/src/shared/database/schema';
import type { RecommendationResult } from '../entities/recommendation.entity';
import type { IRecommendationsRepository } from './recommendations.repository.interface';

export class RecommendationsRepository implements IRecommendationsRepository {
  async findForProfile(profileId: string, limit: number): Promise<RecommendationResult> {
    const current = await db
      .select({ regionId: profiles.regionId, categoryId: profiles.categoryId })
      .from(profiles)
      .where(eq(profiles.id, profileId))
      .limit(1);
    const profile = current[0];
    if (!profile) return { profiles: [], services: [], events: [] };

    const serviceCategoryRows = await db
      .select({ categoryId: services.categoryId })
      .from(services)
      .where(and(eq(services.profileId, profileId), isNotNull(services.categoryId)));
    const eventCategoryRows = await db
      .select({ categoryId: events.categoryId })
      .from(events)
      .where(and(eq(events.profileId, profileId), isNotNull(events.categoryId)));
    const categoryIds = Array.from(new Set([
      profile.categoryId,
      ...serviceCategoryRows.map((row) => row.categoryId),
      ...eventCategoryRows.map((row) => row.categoryId),
    ].filter((id): id is string => Boolean(id))));

    const profileConditions = [ne(profiles.id, profileId)];
    if (profile.regionId) profileConditions.push(eq(profiles.regionId, profile.regionId));
    if (categoryIds.length > 0) {
      const matchingServiceProfiles = await db
        .select({ profileId: services.profileId })
        .from(services)
        .where(inArray(services.categoryId, categoryIds));
      const matchingEventProfiles = await db
        .select({ profileId: events.profileId })
        .from(events)
        .where(inArray(events.categoryId, categoryIds));
      const matchingProfileIds = Array.from(new Set([
        ...matchingServiceProfiles.map((row) => row.profileId),
        ...matchingEventProfiles.map((row) => row.profileId),
      ]));
      profileConditions.push(or(
        inArray(profiles.categoryId, categoryIds),
        matchingProfileIds.length > 0 ? inArray(profiles.id, matchingProfileIds) : undefined,
      )!);
    }

    const recommendedProfiles = await db
      .select({
        id: profiles.id,
        userId: profiles.userId,
        name: profiles.name,
        slug: profiles.slug,
        description: profiles.description,
        regionId: profiles.regionId,
        categoryId: profiles.categoryId,
        employees: profiles.employees,
        isVerified: profiles.isVerified,
        createdAt: profiles.createdAt,
      })
      .from(profiles)
      .where(and(...profileConditions))
      .orderBy(desc(profiles.isVerified), desc(profiles.createdAt))
      .limit(limit);

    const publishedStatus = await db
      .select({ id: statuses.id })
      .from(statuses)
      .where(eq(statuses.slug, 'published'))
      .limit(1);
    const publishedStatusId = publishedStatus[0]?.id;

    if (!profile.regionId || categoryIds.length === 0 || !publishedStatusId) {
      return { profiles: recommendedProfiles, services: [], events: [] };
    }

    const recommendedServices = await db
      .select({
        id: services.id,
        slug: services.slug,
        title: services.title,
        description: services.description,
        profileId: services.profileId,
        profileName: profiles.name,
        categoryId: services.categoryId,
        locationId: services.locationId,
        priceMin: services.priceMin,
        priceMax: services.priceMax,
        modality: services.modality,
        availability: services.availability,
        createdAt: services.createdAt,
      })
      .from(services)
      .innerJoin(profiles, eq(services.profileId, profiles.id))
      .innerJoin(locations, eq(services.locationId, locations.id))
      .where(and(
        eq(services.statusId, publishedStatusId),
        eq(locations.regionId, profile.regionId),
        inArray(services.categoryId, categoryIds),
        ne(services.profileId, profileId),
      ))
      .orderBy(desc(profiles.isVerified), desc(services.createdAt))
      .limit(limit);

    const recommendedEvents = await db
      .select({
        id: events.id,
        slug: events.slug,
        title: events.title,
        description: events.description,
        profileId: events.profileId,
        profileName: profiles.name,
        categoryId: events.categoryId,
        locationId: events.locationId,
        startAt: events.startAt,
        applicationDeadline: events.applicationDeadline,
        createdAt: events.createdAt,
      })
      .from(events)
      .innerJoin(profiles, eq(events.profileId, profiles.id))
      .innerJoin(locations, eq(events.locationId, locations.id))
      .where(and(
        eq(events.statusId, publishedStatusId),
        eq(locations.regionId, profile.regionId),
        inArray(events.categoryId, categoryIds),
        ne(events.profileId, profileId),
      ))
      .orderBy(asc(events.startAt), desc(events.createdAt))
      .limit(limit);

    return {
      profiles: recommendedProfiles,
      services: recommendedServices,
      events: recommendedEvents,
    };
  }
}
