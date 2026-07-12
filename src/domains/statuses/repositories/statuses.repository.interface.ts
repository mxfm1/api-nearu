import type { Status } from '../entities/status.entity';

export interface IStatusesRepository {
  findBySlug(slug: string): Promise<Status>;
}
