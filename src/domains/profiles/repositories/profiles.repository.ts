import { eq, sql } from 'drizzle-orm';
import { db } from '@/src/shared/database';
import { profiles, profileSocialLinks } from '@/src/shared/database/schema';
import type { IProfilesRepository } from './profiles.repository.interface';
import type { Profile } from '../entities/profile.entity';
import type { SocialLink } from '../entities/profile.entity';

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

      const socialLinks = await db
        .select()
        .from(profileSocialLinks)
        .where(eq(profileSocialLinks.profileId, profile.id))
        .orderBy(profileSocialLinks.orden);

      return {
        ...profile,
        socialLinks: socialLinks as SocialLink[],
      };
    } catch (error) {
      console.error('[ProfilesRepository.findByUserId] Error:', error);
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
        // Update
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

      // Create
      const result = await db
        .insert(profiles)
        .values({
          id: crypto.randomUUID(),
          userId,
          bannerUrl: data.bannerUrl ?? null,
          logoUrl: data.logoUrl ?? null,
          name: data.name ?? null,
          industry: data.industry ?? '',
          description: data.description ?? null,
          tags: data.tags ?? [],
          location: data.location ?? null,
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
