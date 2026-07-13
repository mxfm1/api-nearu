import type { Message } from '../entities/message.entity';
import type { MessageType } from '../entities/message.entity';
import type { IThreadsRepository } from '../repositories/threads.repository.interface';
import type { IProfilesRepository } from '@/src/domains/profiles/repositories/profiles.repository.interface';
import type { IThreadsMessagesRepository } from '../repositories/messages.repository.interface';
import type { INotificationsRepository } from '@/src/domains/notifications/repositories/notifications.repository.interface';
import type { ICreateNotificationUseCase } from '@/src/domains/notifications/use-cases/create-notification.use-case';
import { InputParseError, NotFoundError } from '@/src/shared/errors/common';
import { UnauthorizedError } from '@/src/shared/errors/auth';

export type ISendMessageUseCase = ReturnType<typeof sendMessageUseCase>;

export const sendMessageUseCase =
  (
    threadsRepository: IThreadsRepository,
    profilesRepository: IProfilesRepository,
    messagesRepository: IThreadsMessagesRepository,
    notificationsRepository: INotificationsRepository,
    createNotificationUseCase: ICreateNotificationUseCase,
  ) =>
  async (input: {
    threadId: string;
    senderId: string;
    content?: string | null;
    messageType?: MessageType;
  }): Promise<Message> => {
    console.log('[sendMessageUseCase] Input:', {
      threadId: input.threadId,
      senderId: input.senderId,
      content: input.content,
      messageType: input.messageType,
    });

    // Validate content
    const hasContent = input.content && input.content.trim().length > 0;
    const hasAttachments = input.messageType === 'FILE' || input.messageType === 'IMAGE' || input.messageType === 'MIXED';

    if (!hasContent && !hasAttachments) {
      throw new InputParseError('Debes proporcionar contenido o un attachment');
    }

    // Validate content length
    if (input.content && input.content.length > 255) {
      throw new InputParseError('El mensaje no puede exceder 255 caracteres');
    }

    // Get thread
    const thread = await threadsRepository.findByIdWithDetails(input.threadId);
    console.log('[sendMessageUseCase] Thread:', thread);
    if (!thread) {
      throw new NotFoundError('Thread no encontrado');
    }

    // Verify thread is open
    if (thread.status !== 'OPEN') {
      throw new InputParseError('No puedes enviar mensajes a un thread cerrado');
    }

    // Verify sender is participant
    // NOTE: input.senderId is actually a userId, so we use findByUserId
    console.log('[sendMessageUseCase] Looking up senderProfile by userId:', input.senderId);
    const senderProfile = await profilesRepository.findByUserId(input.senderId);
    console.log('[sendMessageUseCase] senderProfile result:', senderProfile);

    if (!senderProfile) {
      console.log('[sendMessageUseCase] ERROR: Profile not found for userId:', input.senderId);
      console.log('[sendMessageUseCase] Thread applicantProfileId:', thread.applicantProfileId);
      console.log('[sendMessageUseCase] Thread organizerProfileId:', thread.organizerProfileId);
      throw new UnauthorizedError('Perfil no encontrado');
    }

    const isApplicant = senderProfile.id === thread.applicantProfileId;
    const isOrganizer = senderProfile.id === thread.organizerProfileId;

    console.log('[sendMessageUseCase] Authorization check:', {
      senderProfileId: senderProfile.id,
      senderUserId: input.senderId,
      isApplicant,
      isOrganizer,
      threadApplicantProfileId: thread.applicantProfileId,
      threadOrganizerProfileId: thread.organizerProfileId,
    });

    if (!isApplicant && !isOrganizer) {
      throw new UnauthorizedError('No puedes enviar mensajes en este thread');
    }

    // Create message
    const message = await messagesRepository.create({
      threadId: input.threadId,
      senderProfileId: senderProfile.id,  // Use resolved profileId
      content: input.content ?? null,
      messageType: input.messageType ?? 'TEXT',
    });

    // Notify recipient (the other participant) - prevent notification bombing
    const recipientUserId = isApplicant ? thread.organizerUserId : thread.applicantUserId;
    console.log('[sendMessageUseCase] Recipient userId:', recipientUserId);
    if (recipientUserId) {
      // Check if notification already exists for this message (idempotency)
      const existingNotifications = await notificationsRepository.findByEntityId(message.id);
      if (existingNotifications.length === 0) {
        // Fire-and-forget: don't await, don't block the response
        createNotificationUseCase({
          userId: recipientUserId,
          type: 'new_message',
          title: isApplicant ? 'Nuevo mensaje del organizador' : 'Nuevo mensaje del applicant',
          body: input.content?.substring(0, 100) ?? 'Tienes un nuevo mensaje',
          actorProfileId: senderProfile.id,
          entityType: 'message',
          entityId: message.id,
          actionUrl: `/threads/${input.threadId}`,
        }).catch((err) => {
          console.error('[sendMessageUseCase] Failed to create notification:', err);
        });
      }
    }

    return message;
  };
