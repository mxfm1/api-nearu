import type { Profile } from '../entities/profile.entity';
import type { IProfilesRepository } from '../repositories/profiles.repository.interface';
import type { IProfileSocialLinksRepository } from '../repositories/profile-social-links.repository.interface';
import type { ITagsRepository } from '../repositories/tags.repository.interface';
import { slugifyUnique } from '@/src/shared/utils/slugify';

export type IUpsertProfileUseCase = ReturnType<typeof upsertProfileUseCase>;

export type UpsertProfileInput = {
  userId: string;
  bannerUrl?: string | null;
  logoUrl?: string | null;
  name?: string | null;
  industry?: string;
  description?: string | null;
  tags?: string[];
  locationId?: string | null;
  founded?: string | null;
  employees?: string | null;
  website?: string | null;
  whatsapp?: string | null;
  socialLinks?: Array<{ platform: string; url: string; orden?: number }>;
};

export const upsertProfileUseCase =
  (
    profilesRepository: IProfilesRepository,
    socialLinksRepository: IProfileSocialLinksRepository,
    tagsRepository: ITagsRepository,
  ) =>
  async (input: UpsertProfileInput): Promise<Profile> => {
    const { userId, socialLinks, tags, ...profileData } = input;

    if (profileData.name) {
      (profileData as any).slug = await slugifyUnique(profileData.name, async (s) => {
        const existing = await profilesRepository.findBySlug(s);
        return existing !== null;
      });
    }

    const profile = await profilesRepository.upsert(userId, profileData);

    let needsRefetch = false;

    if (tags !== undefined) {
      const resolved = await Promise.all(
        tags.map((name) => tagsRepository.findOrCreateByName(name)),
      );
      await tagsRepository.setProfileTags(
        profile.id,
        resolved.map((t) => t.id),
      );
      needsRefetch = true;
    }

    if (socialLinks !== undefined) {
      await socialLinksRepository.deleteByProfileId(profile.id);

      if (socialLinks.length > 0) {
        await socialLinksRepository.createMany(
          socialLinks.map((link, i) => ({
            id: crypto.randomUUID(),
            profileId: profile.id,
            platform: link.platform,
            url: link.url,
            orden: link.orden ?? i,
          })),
        );
      }
      needsRefetch = true;
    }

    if (needsRefetch) {
      const updated = await profilesRepository.findByUserId(userId);
      if (updated) return updated;
    }

    return profile;
  };
