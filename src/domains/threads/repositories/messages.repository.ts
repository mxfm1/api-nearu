import { eq, asc } from 'drizzle-orm';
import { db } from '@/src/shared/database';
import { messages, messageAttachments, profiles } from '@/src/shared/database/schema';
import type { IThreadsMessagesRepository } from './messages.repository.interface';
import type { Message, MessageWithAttachments, MessageType } from '../entities/message.entity';

export class ThreadsMessagesRepository implements IThreadsMessagesRepository {
  async findByThreadId(threadId: string): Promise<MessageWithAttachments[]> {
    try {
      // Get all messages for thread with sender info
      const messagesResult = await db
        .select({
          message: messages,
          senderName: profiles.name,
          senderLogoUrl: profiles.logoUrl,
        })
        .from(messages)
        .where(eq(messages.threadId, threadId))
        .leftJoin(profiles, eq(messages.senderProfileId, profiles.id))
        .orderBy(asc(messages.createdAt));

      // Get attachments per message
      const messagesWithAttachments = await Promise.all(
        messagesResult.map(async (row) => {
          const attachments = await db
            .select()
            .from(messageAttachments)
            .where(eq(messageAttachments.messageId, row.message.id));

          return {
            id: row.message.id,
            threadId: row.message.threadId,
            senderProfileId: row.message.senderProfileId,
            content: row.message.content,
            messageType: row.message.messageType as MessageType,
            readAt: row.message.readAt,
            createdAt: row.message.createdAt,
            updatedAt: row.message.updatedAt,
            senderName: row.senderName ?? '',
            senderLogoUrl: row.senderLogoUrl ?? null,
            attachments: attachments.map((a) => ({
              id: a.id,
              messageId: a.messageId,
              url: a.url,
              type: a.type,
              mimeType: a.mimeType,
              size: a.size,
              name: a.name,
              createdAt: a.createdAt,
            })),
          };
        })
      );

      return messagesWithAttachments;
    } catch (error) {
      console.error('[MessagesRepository.findByThreadId] Error:', error);
      throw error;
    }
  }

  async create(data: {
    threadId: string;
    senderProfileId: string;
    content: string | null;
    messageType?: MessageType;
  }): Promise<Message> {
    try {
      const result = await db
        .insert(messages)
        .values({
          id: crypto.randomUUID(),
          threadId: data.threadId,
          senderProfileId: data.senderProfileId,
          content: data.content,
          messageType: data.messageType ?? 'TEXT',
        })
        .returning();

      return result[0] as Message;
    } catch (error) {
      console.error('[MessagesRepository.create] Error:', error);
      throw error;
    }
  }
}
