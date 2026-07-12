import type { ApplicationWithDetails } from '../entities/application.entity';
import type { IApplicationsRepository } from '../repositories/applications.repository.interface';
import type { IProfilesRepository } from '@/src/domains/profiles/repositories/profiles.repository.interface';
import { NotFoundError } from '@/src/shared/errors/common';

export type IListMyApplicationsUseCase = ReturnType<typeof listMyApplicationsUseCase>;

export const listMyApplicationsUseCase =
  (
    applicationsRepository: IApplicationsRepository,
    profilesRepository: IProfilesRepository,
  ) =>
  async (userId: string): Promise<ApplicationWithDetails[]> => {
    // Get user's profile
    const profile = await profilesRepository.findByUserId(userId);
    if (!profile) {
      throw new NotFoundError('Perfil no encontrado');
    }

    // List applications for this profile
    const applications = await applicationsRepository.findByApplicantProfileId(profile.id);
    return applications;
  };
