import type { Profile } from '../entities/profile.entity';
import type { IProfilesRepository } from '../repositories/profiles.repository.interface';
import { NotFoundError } from '@/src/shared/errors/common';

export type IGetProfileUseCase = ReturnType<typeof getProfileUseCase>;

export const getProfileUseCase =
  (profilesRepository: IProfilesRepository) =>
  async (userId: string): Promise<Profile> => {
    const profile = await profilesRepository.findByUserId(userId);
    if (!profile) throw new NotFoundError('Profile');
    return profile;
  };
