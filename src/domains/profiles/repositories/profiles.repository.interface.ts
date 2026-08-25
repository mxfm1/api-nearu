import type { Profile } from '../entities/profile.entity';

export interface IProfilesRepository {
  findById(id: string): Promise<Profile | null>;
  findByUserId(userId: string): Promise<Profile | null>;
  findBySlug(slug: string): Promise<Profile | null>;
  search(filters?: {
    search?: string;
    regionId?: string;
    categoryId?: string;
    verified?: boolean;
    employeesMin?: number;
    employeesMax?: number;
    sort?: 'relevance' | 'newest' | 'oldest';
  }): Promise<Profile[]>;
  upsert(userId: string, data: Partial<Profile>): Promise<Profile>;
}
