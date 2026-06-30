import type { Service } from '../entities/service.entity';
import type { IServicesRepository } from '../repositories/services.repository.interface';
import { NotFoundError, UnauthorizedError } from '@/src/shared/errors/common';
import { UnauthorizedError as AuthError } from '@/src/shared/errors/auth';

export type IUpdateServiceUseCase = ReturnType<typeof updateServiceUseCase>;

export const updateServiceUseCase =
  (servicesRepository: IServicesRepository) =>
  async (
    id: string,
    userId: string,
    data: Partial<{
      slug: string;
      title: string;
      marca: string | null;
      description: string | null;
      yearsExperience: number | null;
      priceMin: number | null;
      priceMax: number | null;
      availability: string | null;
      contactInfo: Service['contactInfo'];
      bannerUrl: string | null;
      logoUrl: string | null;
      thumbnailUrl: string | null;
      locationId: string | null;
      categoryId: string | null;
      serviceStatus: string;
    }>
  ): Promise<Service> => {
    const existing = await servicesRepository.findById(id);
    if (!existing) throw new NotFoundError('Service');

    // Verify ownership: the service's profileId must correspond to the user
    // We check userId matches the profile's user (we need to verify profile ownership)
    // For now, we check if the profile belongs to this user via the profileId
    // This is a simplified check - in production, verify via profiles table
    if (existing.profileId !== userId) {
      // Check if the profile belongs to the user
      const { eq } = await import('drizzle-orm');
      const { db } = await import('@/src/shared/database');
      const { profiles } = await import('@/src/shared/database/schema');
      const profile = await db
        .select()
        .from(profiles)
        .where(eq(profiles.userId, userId))
        .limit(1);

      if (!profile[0] || profile[0].id !== existing.profileId) {
        throw new AuthError('No tienes permiso para modificar este servicio');
      }
    }

    return servicesRepository.update(id, data);
  };
