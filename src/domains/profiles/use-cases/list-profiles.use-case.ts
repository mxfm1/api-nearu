import type { Profile } from '../entities/profile.entity';
import type { IProfilesRepository } from '../repositories/profiles.repository.interface';

export type IListProfilesUseCase = ReturnType<typeof listProfilesUseCase>;

export const listProfilesUseCase = (profilesRepository: IProfilesRepository) =>
  async (filters?: Parameters<IProfilesRepository['search']>[0]): Promise<Profile[]> =>
    profilesRepository.search(filters);
