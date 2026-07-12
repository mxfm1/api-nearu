import type { Message } from '../entities/message.entity';
import type { IMessagesRepository } from '../repositories/messages.repository.interface';
import type { IContactRequestsRepository } from '@/src/domains/contact-requests/repositories/contact-requests.repository.interface';
import { NotFoundError } from '@/src/shared/errors/common';
import { UnauthorizedError } from '@/src/shared/errors/auth';
import { InputParseError } from '@/src/shared/errors/common';

export type ISendMessageUseCase = ReturnType<typeof sendMessageUseCase>;

export const sendMessageUseCase =
  (
    messagesRepository: IMessagesRepository,
    contactRequestsRepository: IContactRequestsRepository,
  ) =>
  async (input: {
    contactRequestId: string;
    senderId: string;
    content?: string | null;
    attachments?: string[];
  }): Promise<Message> => {
    const hasContent = input.content && input.content.trim().length > 0;
    const hasAttachments = input.attachments && input.attachments.length > 0;

    if (!hasContent && !hasAttachments) {
      throw new InputParseError('Debes proporcionar contenido o al menos un attachment');
    }

    const request = await contactRequestsRepository.findById(input.contactRequestId);
    if (!request) {
      throw new NotFoundError('Contact request');
    }

    const isParticipant =
      request.propietarioId === input.senderId || request.remitenteId === input.senderId;
    if (!isParticipant) {
      throw new UnauthorizedError('No eres participante de esta conversación');
    }

    return messagesRepository.create({
      contactRequestId: input.contactRequestId,
      senderId: input.senderId,
      content: input.content ?? null,
      attachments: input.attachments ?? [],
    });
  };
