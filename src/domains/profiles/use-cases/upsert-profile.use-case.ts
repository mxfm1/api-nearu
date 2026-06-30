import type { Profile, SocialLink } from '../entities/profile.entity';
import type { IProfilesRepository } from '../repositories/profiles.repository.interface';
import type { IProfileSocialLinksRepository } from '../repositories/profile-social-links.repository.interface';

export type IUpsertProfileUseCase = ReturnType<typeof upsertProfileUseCase>;

export type UpsertProfileInput = {
  userId: string;
  bannerUrl?: string | null;
  logoUrl?: string | null;
  name?: string | null;
  industry?: string;
  description?: string | null;
  tags?: string[];
  location?: string | null;
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
  ) =>
  async (input: UpsertProfileInput): Promise<Profile> => {
    const { userId, socialLinks, ...profileData } = input;

    const profile = await profilesRepository.upsert(userId, profileData);

    if (socialLinks !== undefined) {
      // Replace all social links
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

      // Re-fetch profile with updated social links
      const updated = await profilesRepository.findByUserId(userId);
      if (!updated) return profile;
      return updated;
    }

    return profile;
  };
