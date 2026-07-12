import { eq, asc } from 'drizzle-orm';
import { db } from '@/src/shared/database';
import { inboxMessages, users } from '@/src/shared/database/schema';
import type { IMessagesRepository } from './messages.repository.interface';
import type { Message, MessageWithSender } from '../entities/message.entity';

export class MessagesRepository implements IMessagesRepository {
  async findByContactRequestId(contactRequestId: string): Promise<MessageWithSender[]> {
    try {
      const result = await db
        .select({
          message: inboxMessages,
          senderNombre: users.name,
          senderEmail: users.email,
          senderImagen: users.image,
        })
        .from(inboxMessages)
        .where(eq(inboxMessages.contactRequestId, contactRequestId))
        .leftJoin(users, eq(inboxMessages.senderId, users.id))
        .orderBy(asc(inboxMessages.createdAt));

      return result.map(({ message, ...userData }) => ({
        ...(message as unknown as Message),
        senderNombre: userData.senderNombre ?? undefined,
        senderEmail: userData.senderEmail ?? undefined,
        senderImagen: userData.senderImagen ?? null,
      }));
    } catch (error) {
      console.error('[MessagesRepository.findByContactRequestId] Error:', error);
      throw error;
    }
  }

  async create(data: {
    contactRequestId: string;
    senderId: string;
    content?: string | null;
    attachments?: string[];
  }): Promise<Message> {
    try {
      const result = await db
        .insert(inboxMessages)
        .values({
          id: crypto.randomUUID(),
          contactRequestId: data.contactRequestId,
          senderId: data.senderId,
          content: data.content ?? null,
          attachments: data.attachments ?? [],
        })
        .returning();
      return result[0] as unknown as Message;
    } catch (error) {
      console.error('[MessagesRepository.create] Error:', error);
      throw error;
    }
  }
}
