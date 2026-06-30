import type { ContactRequestWithUsers } from '../entities/contact-request.entity';
import type { IContactRequestsRepository } from '../repositories/contact-requests.repository.interface';
import { NotFoundError } from '@/src/shared/errors/common';
import { UnauthorizedError } from '@/src/shared/errors/auth';

export type IGetContactRequestDetailUseCase = ReturnType<typeof getContactRequestDetailUseCase>;

export const getContactRequestDetailUseCase =
  (contactRequestsRepository: IContactRequestsRepository) =>
  async (id: string, userId: string): Promise<ContactRequestWithUsers> => {
    const request = await contactRequestsRepository.findById(id);
    if (!request) throw new NotFoundError('ContactRequest');

    // Only the owner or the sender can view the detail
    if (request.propietarioId !== userId && request.remitenteId !== userId) {
      throw new UnauthorizedError('No tienes permiso para ver esta solicitud');
    }

    return request;
  };
