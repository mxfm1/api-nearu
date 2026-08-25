import { eq, sql, and, asc, desc, gte, lte } from 'drizzle-orm';
import { db } from '@/src/shared/database';
import { profiles, profileSocialLinks, profilesToTags, tags, regions } from '@/src/shared/database/schema';
import type { IProfilesRepository } from './profiles.repository.interface';
import type { Profile } from '../entities/profile.entity';
import type { SocialLink } from '../entities/profile.entity';
import type { Tag } from '../entities/profile.entity';

export class ProfilesRepository implements IProfilesRepository {
  async findByUserId(userId: string): Promise<Profile | null> {
    try {
      const result = await db
        .select()
        .from(profiles)
        .where(eq(profiles.userId, userId))
        .limit(1);

      const profile = result[0] as Profile | undefined;
      if (!profile) return null;

      const [socialLinks, profileTags, region] = await Promise.all([
        db
          .select()
          .from(profileSocialLinks)
          .where(eq(profileSocialLinks.profileId, profile.id))
          .orderBy(profileSocialLinks.orden),
        db
          .select({ id: tags.id, name: tags.name, slug: tags.slug })
          .from(tags)
          .innerJoin(profilesToTags, eq(profilesToTags.tagId, tags.id))
          .where(eq(profilesToTags.profileId, profile.id)),
        profile.regionId
          ? db
              .select({ name: regions.name })
              .from(regions)
              .where(eq(regions.id, profile.regionId))
              .limit(1)
          : Promise.resolve([]),
      ]);

      return {
        ...profile,
        socialLinks: socialLinks as SocialLink[],
        tags: profileTags as Tag[],
        regionName: region[0]?.name ?? null,
      };
    } catch (error) {
      console.error('[ProfilesRepository.findByUserId] Error:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<Profile | null> {
    try {
      const result = await db
        .select()
        .from(profiles)
        .where(eq(profiles.id, id))
        .limit(1);
      return (result[0] as Profile) ?? null;
    } catch (error) {
      console.error('[ProfilesRepository.findById] Error:', error);
      throw error;
    }
  }

  async findBySlug(slug: string): Promise<Profile | null> {
    try {
      const result = await db
        .select({ id: profiles.id })
        .from(profiles)
        .where(eq(profiles.slug, slug))
        .limit(1);
      return result[0] ? (result[0] as Profile) : null;
    } catch (error) {
      console.error('[ProfilesRepository.findBySlug] Error:', error);
      throw error;
    }
  }

  async search(filters?: {
    search?: string;
    regionId?: string;
    categoryId?: string;
    verified?: boolean;
    employeesMin?: number;
    employeesMax?: number;
    sort?: 'relevance' | 'newest' | 'oldest';
  }): Promise<Profile[]> {
    const conditions = [];
    if (filters?.search) {
      const query = sql`websearch_to_tsquery('spanish', ${filters.search})`;
      conditions.push(sql`(${profiles.searchVector} @@ ${query}
        OR ${profiles.name} % ${filters.search}
        OR ${profiles.description} % ${filters.search})`);
    }
    if (filters?.regionId) conditions.push(eq(profiles.regionId, filters.regionId));
    if (filters?.categoryId) conditions.push(eq(profiles.categoryId, filters.categoryId));
    if (filters?.verified !== undefined) conditions.push(eq(profiles.isVerified, filters.verified));
    if (filters?.employeesMin !== undefined) conditions.push(gte(profiles.employees, filters.employeesMin));
    if (filters?.employeesMax !== undefined) conditions.push(lte(profiles.employees, filters.employeesMax));

    const query = db.select().from(profiles);
    if (conditions.length > 0) query.where(and(...conditions));
    if (filters?.search) {
      query.orderBy(sql`ts_rank_cd(${profiles.searchVector}, websearch_to_tsquery('spanish', ${filters.search})) DESC`, desc(profiles.createdAt));
    } else if (filters?.sort === 'oldest') {
      query.orderBy(asc(profiles.createdAt));
    } else {
      query.orderBy(desc(profiles.createdAt));
    }
    return (await query) as Profile[];
  }

  async upsert(userId: string, data: Partial<Profile>): Promise<Profile> {
    try {
      // Check if profile exists
      const existing = await db
        .select({ id: profiles.id })
        .from(profiles)
        .where(eq(profiles.userId, userId))
        .limit(1);

      if (existing[0]) {
        const result = await db
          .update(profiles)
          .set({ ...data, updatedAt: new Date() })
          .where(eq(profiles.userId, userId))
          .returning();

        const profile = result[0] as Profile;

        const socialLinks = await db
          .select()
          .from(profileSocialLinks)
          .where(eq(profileSocialLinks.profileId, profile.id))
          .orderBy(profileSocialLinks.orden);

        return { ...profile, socialLinks: socialLinks as SocialLink[] };
      }

      const result = await db
        .insert(profiles)
        .values({
          id: crypto.randomUUID(),
          userId,
          bannerUrl: data.bannerUrl ?? null,
          logoUrl: data.logoUrl ?? null,
          name: data.name ?? null,
          slug: data.slug ?? null,
           description: data.description ?? null,
          regionId: data.regionId ?? null,
          categoryId: data.categoryId ?? null,
          founded: data.founded ?? null,
          employees: data.employees ?? null,
          website: data.website ?? null,
          whatsapp: data.whatsapp ?? null,
        })
        .returning();

      const profile = result[0] as Profile;
      return { ...profile, socialLinks: [] };
    } catch (error) {
      console.error('[ProfilesRepository.upsert] Error:', error);
      throw error;
    }
  }
}
