import type { ContactRequest } from '../entities/contact-request.entity';
import type { IContactRequestsRepository } from '../repositories/contact-requests.repository.interface';
import { NotFoundError, InputParseError } from '@/src/shared/errors/common';
import { UnauthorizedError } from '@/src/shared/errors/auth';

export type IUpdateContactRequestStatusUseCase = ReturnType<typeof updateContactRequestStatusUseCase>;

const VALID_STATUSES = ['pendiente', 'leido', 'respondido', 'archivado'];

export const updateContactRequestStatusUseCase =
  (contactRequestsRepository: IContactRequestsRepository) =>
  async (id: string, userId: string, estado: string): Promise<ContactRequest> => {
    if (!VALID_STATUSES.includes(estado)) {
      throw new InputParseError(`Estado inválido. Valores: ${VALID_STATUSES.join(', ')}`);
    }

    const request = await contactRequestsRepository.findById(id);
    if (!request) throw new NotFoundError('ContactRequest');

    // Only the owner can update the status
    if (request.propietarioId !== userId) {
      throw new UnauthorizedError('Solo el propietario puede cambiar el estado');
    }

    return contactRequestsRepository.updateEstado(id, estado);
  };
