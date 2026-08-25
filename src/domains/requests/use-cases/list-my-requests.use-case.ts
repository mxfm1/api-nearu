import { NotFoundError } from '@/src/shared/errors/common';
import type { IProfilesRepository } from '@/src/domains/profiles/repositories/profiles.repository.interface';
import type { RequestStatus, UserRequest } from '../entities/request.entity';
import type { IRequestsRepository } from '../repositories/requests.repository.interface';

export type IListMyRequestsUseCase = ReturnType<typeof listMyRequestsUseCase>;

export const listMyRequestsUseCase = (
  requestsRepository: IRequestsRepository,
  profilesRepository: IProfilesRepository,
) => async (userId: string, status?: RequestStatus): Promise<UserRequest[]> => {
  const profile = await profilesRepository.findByUserId(userId);
  if (!profile) throw new NotFoundError('Profile');
  return requestsRepository.listByProfile(profile.id, status);
};
