import type { ContactRequestWithUsers } from '../entities/contact-request.entity';
import type { IContactRequestsRepository } from '../repositories/contact-requests.repository.interface';

export type IGetInboxUseCase = ReturnType<typeof getInboxUseCase>;

export const getInboxUseCase =
  (contactRequestsRepository: IContactRequestsRepository) =>
  async (propietarioId: string): Promise<ContactRequestWithUsers[]> => {
    return contactRequestsRepository.findByPropietarioId(propietarioId);
  };
