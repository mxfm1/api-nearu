import { eq, sql } from 'drizzle-orm';
import { db } from '@/src/shared/database';
import { profiles, profileSocialLinks, profilesToTags, tags, locations } from '@/src/shared/database/schema';
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

      const [socialLinks, profileTags, location] = await Promise.all([
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
        profile.locationId
          ? db
              .select({ name: locations.name })
              .from(locations)
              .where(eq(locations.id, profile.locationId))
              .limit(1)
          : Promise.resolve([]),
      ]);

      return {
        ...profile,
        socialLinks: socialLinks as SocialLink[],
        tags: profileTags as Tag[],
        locationName: location[0]?.name ?? null,
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
          industry: data.industry ?? '',
          description: data.description ?? null,
          locationId: data.locationId ?? null,
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
