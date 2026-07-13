import type { IThreadsRepository } from '../repositories/threads.repository.interface';
import type { IProfilesRepository } from '@/src/domains/profiles/repositories/profiles.repository.interface';
import { InputParseError, NotFoundError } from '@/src/shared/errors/common';
import { UnauthorizedError } from '@/src/shared/errors/auth';

export type ICloseThreadUseCase = ReturnType<typeof closeThreadUseCase>;

export const closeThreadUseCase =
  (
    threadsRepository: IThreadsRepository,
    profilesRepository: IProfilesRepository,
  ) =>
  async (threadId: string, userId: string): Promise<void> => {
    // Get thread
    const thread = await threadsRepository.findByIdWithDetails(threadId);
    if (!thread) {
      throw new NotFoundError('Thread no encontrado');
    }

    // Only organizer can close the thread
    const userProfile = await profilesRepository.findByUserId(userId);
    if (!userProfile) {
      throw new UnauthorizedError('Usuario no encontrado');
    }

    if (userProfile.id !== thread.organizerProfileId) {
      throw new UnauthorizedError('Solo el organizador puede cerrar el thread');
    }

    // Update thread status
    await threadsRepository.updateStatus(threadId, 'CLOSED');
  };
