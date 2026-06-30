import type { Profile } from '../entities/profile.entity';

export interface IProfilesRepository {
  findByUserId(userId: string): Promise<Profile | null>;
  upsert(userId: string, data: Partial<Profile>): Promise<Profile>;
}
