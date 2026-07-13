import type { Message, MessageWithSender } from '../entities/message.entity';

export interface IMessagesRepository {
  findByContactRequestId(contactRequestId: string): Promise<MessageWithSender[]>;
  create(data: {
    contactRequestId: string;
    senderId: string;
    content?: string | null;
    attachments?: string[];
  }): Promise<Message>;
}
