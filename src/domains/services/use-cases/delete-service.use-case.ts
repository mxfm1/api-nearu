import type { IServicesRepository } from '../repositories/services.repository.interface';
import { NotFoundError } from '@/src/shared/errors/common';
import { UnauthorizedError } from '@/src/shared/errors/auth';

export type IDeleteServiceUseCase = ReturnType<typeof deleteServiceUseCase>;

export const deleteServiceUseCase =
  (servicesRepository: IServicesRepository) =>
  async (id: string, userId: string): Promise<void> => {
    const existing = await servicesRepository.findById(id);
    if (!existing) throw new NotFoundError('Service');

    // Verify ownership
    const { eq } = await import('drizzle-orm');
    const { db } = await import('@/src/shared/database');
    const { profiles } = await import('@/src/shared/database/schema');
    const profile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId))
      .limit(1);

    if (!profile[0] || profile[0].id !== existing.profileId) {
      throw new UnauthorizedError('No tienes permiso para eliminar este servicio');
    }

    await servicesRepository.delete(id);
  };
