import type { Message, MessageWithAttachments, MessageType } from '../entities/message.entity';

export interface IThreadsMessagesRepository {
  findByThreadId(threadId: string): Promise<MessageWithAttachments[]>;
  create(data: {
    threadId: string;
    senderProfileId: string;
    content: string | null;
    messageType?: MessageType;
  }): Promise<Message>;
}
