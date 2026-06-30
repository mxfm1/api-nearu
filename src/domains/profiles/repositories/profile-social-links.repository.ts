import { eq } from 'drizzle-orm';
import { db } from '@/src/shared/database';
import { profileSocialLinks } from '@/src/shared/database/schema';
import type { IProfileSocialLinksRepository, CreateSocialLinkInput } from './profile-social-links.repository.interface';
import type { SocialLink } from '../entities/profile.entity';

export class ProfileSocialLinksRepository implements IProfileSocialLinksRepository {
  async findByProfileId(profileId: string): Promise<SocialLink[]> {
    try {
      const result = await db
        .select()
        .from(profileSocialLinks)
        .where(eq(profileSocialLinks.profileId, profileId))
        .orderBy(profileSocialLinks.orden);
      return result as SocialLink[];
    } catch (error) {
      console.error('[ProfileSocialLinksRepository.findByProfileId] Error:', error);
      throw error;
    }
  }

  async deleteByProfileId(profileId: string): Promise<void> {
    try {
      await db
        .delete(profileSocialLinks)
        .where(eq(profileSocialLinks.profileId, profileId));
    } catch (error) {
      console.error('[ProfileSocialLinksRepository.deleteByProfileId] Error:', error);
      throw error;
    }
  }

  async createMany(links: CreateSocialLinkInput[]): Promise<SocialLink[]> {
    try {
      if (links.length === 0) return [];
      const result = await db
        .insert(profileSocialLinks)
        .values(links)
        .returning();
      return result as SocialLink[];
    } catch (error) {
      console.error('[ProfileSocialLinksRepository.createMany] Error:', error);
      throw error;
    }
  }
}
