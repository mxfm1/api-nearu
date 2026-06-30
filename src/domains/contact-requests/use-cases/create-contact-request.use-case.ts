import type { ContactRequest } from '../entities/contact-request.entity';
import type { IContactRequestsRepository } from '../repositories/contact-requests.repository.interface';
import { InputParseError } from '@/src/shared/errors/common';

export type ICreateContactRequestUseCase = ReturnType<typeof createContactRequestUseCase>;

export const createContactRequestUseCase =
  (contactRequestsRepository: IContactRequestsRepository) =>
  async (input: {
    servicioId: string;
    propietarioId: string;
    remitenteId: string;
    mensaje?: string | null;
  }): Promise<ContactRequest> => {
    if (input.remitenteId === input.propietarioId) {
      throw new InputParseError('No puedes contactarte a ti mismo');
    }
    return contactRequestsRepository.create(input);
  };
