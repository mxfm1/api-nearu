import type { RequestStatus, UserRequest } from '../entities/request.entity';
import type { IRequestsRepository } from '../repositories/requests.repository.interface';

export type IListRequestsUseCase = ReturnType<typeof listRequestsUseCase>;

export const listRequestsUseCase = (requestsRepository: IRequestsRepository) =>
  async (status?: RequestStatus): Promise<UserRequest[]> => requestsRepository.list(status);
