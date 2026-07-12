import type { Tag } from '../entities/tag.entity';

export interface ITagsRepository {
  findOrCreateByName(name: string): Promise<Tag>;
  setProfileTags(profileId: string, tagIds: string[]): Promise<void>;
}
