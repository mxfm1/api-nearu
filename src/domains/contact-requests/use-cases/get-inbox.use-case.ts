import type { ContactRequestWithUsers } from '../entities/contact-request.entity';
import type { IContactRequestsRepository } from '../repositories/contact-requests.repository.interface';
import { InputParseError } from '@/src/shared/errors/common';

export type IGetInboxUseCase = ReturnType<typeof getInboxUseCase>;

export const getInboxUseCase =
  (contactRequestsRepository: IContactRequestsRepository) =>
  async (userId: string, tipo?: string): Promise<ContactRequestWithUsers[]> => {
    if (tipo === 'enviados') {
      return contactRequestsRepository.findByRemitenteId(userId);
    }
    if (!tipo || tipo === 'recibidos') {
      return contactRequestsRepository.findByPropietarioId(userId);
    }
    throw new InputParseError('tipo debe ser "recibidos" o "enviados"');
  };
