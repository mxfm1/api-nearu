import type { MessageWithSender } from '../entities/message.entity';
import type { IMessagesRepository } from '../repositories/messages.repository.interface';
import type { IContactRequestsRepository } from '@/src/domains/contact-requests/repositories/contact-requests.repository.interface';
import { NotFoundError } from '@/src/shared/errors/common';
import { UnauthorizedError } from '@/src/shared/errors/auth';

export type IGetThreadUseCase = ReturnType<typeof getThreadUseCase>;

export const getThreadUseCase =
  (
    messagesRepository: IMessagesRepository,
    contactRequestsRepository: IContactRequestsRepository,
  ) =>
  async (contactRequestId: string, userId: string): Promise<MessageWithSender[]> => {
    const request = await contactRequestsRepository.findById(contactRequestId);
    if (!request) {
      throw new NotFoundError('Contact request');
    }

    const isParticipant =
      request.propietarioId === userId || request.remitenteId === userId;
    if (!isParticipant) {
      throw new UnauthorizedError('No eres participante de esta conversación');
    }

    return messagesRepository.findByContactRequestId(contactRequestId);
  };
