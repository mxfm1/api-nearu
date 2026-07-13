import { eq } from 'drizzle-orm';
import { db } from '@/src/shared/database';
import { statuses } from '@/src/shared/database/schema';
import type { IStatusesRepository } from './statuses.repository.interface';
import type { Status } from '../entities/status.entity';

export class StatusesRepository implements IStatusesRepository {
  async findBySlug(slug: string): Promise<Status> {
    try {
      const result = await db
        .select()
        .from(statuses)
        .where(eq(statuses.slug, slug))
        .limit(1);
      if (!result[0]) throw new Error(`Status "${slug}" no encontrado. Asegurate de haber seedeado la tabla statuses.`);
      return result[0] as Status;
    } catch (error) {
      console.error('[StatusesRepository.findBySlug] Error:', error);
      throw error;
    }
  }
}
