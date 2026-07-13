import type { Profile } from '../entities/profile.entity';

export interface IProfilesRepository {
  findById(id: string): Promise<Profile | null>;
  findByUserId(userId: string): Promise<Profile | null>;
  findBySlug(slug: string): Promise<Profile | null>;
  upsert(userId: string, data: Partial<Profile>): Promise<Profile>;
}
