import type { MessageWithAttachments } from '../entities/message.entity';
import type { IThreadsRepository } from '../repositories/threads.repository.interface';
import type { IProfilesRepository } from '@/src/domains/profiles/repositories/profiles.repository.interface';
import type { IThreadsMessagesRepository } from '../repositories/messages.repository.interface';
import { NotFoundError } from '@/src/shared/errors/common';
import { UnauthorizedError } from '@/src/shared/errors/auth';

export type IGetThreadMessagesUseCase = ReturnType<typeof getThreadMessagesUseCase>;

export const getThreadMessagesUseCase =
  (
    threadsRepository: IThreadsRepository,
    profilesRepository: IProfilesRepository,
    messagesRepository: IThreadsMessagesRepository,
  ) =>
  async (threadId: string, userId: string): Promise<MessageWithAttachments[]> => {
    // Get thread
    const thread = await threadsRepository.findByIdWithDetails(threadId);
    if (!thread) {
      throw new NotFoundError('Thread no encontrado');
    }

    // Verify user is participant (either applicant or organizer)
    const userProfile = await profilesRepository.findByUserId(userId);
    if (!userProfile) {
      throw new UnauthorizedError('No tienes acceso a este thread');
    }

    const isApplicant = userProfile.id === thread.applicantProfileId;
    const isOrganizer = userProfile.id === thread.organizerProfileId;

    if (!isApplicant && !isOrganizer) {
      throw new UnauthorizedError('No tienes acceso a este thread');
    }

    // Get messages
    return messagesRepository.findByThreadId(threadId);
  };
