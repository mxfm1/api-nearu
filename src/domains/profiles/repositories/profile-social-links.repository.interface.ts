import type { SocialLink } from '../entities/profile.entity';

export type CreateSocialLinkInput = {
  id: string;
  profileId: string;
  platform: string;
  url: string;
  orden: number;
};

export interface IProfileSocialLinksRepository {
  findByProfileId(profileId: string): Promise<SocialLink[]>;
  deleteByProfileId(profileId: string): Promise<void>;
  createMany(links: CreateSocialLinkInput[]): Promise<SocialLink[]>;
}
