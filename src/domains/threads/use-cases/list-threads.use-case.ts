import type { ThreadWithDetails } from '../entities/thread.entity';
import type { IThreadsRepository } from '../repositories/threads.repository.interface';
import type { IProfilesRepository } from '@/src/domains/profiles/repositories/profiles.repository.interface';
import { UnauthorizedError } from '@/src/shared/errors/auth';

export type IListThreadsUseCase = ReturnType<typeof listThreadsUseCase>;

export const listThreadsUseCase =
  (
    threadsRepository: IThreadsRepository,
    profilesRepository: IProfilesRepository,
  ) =>
  async (userId: string): Promise<ThreadWithDetails[]> => {
    // Get all profiles owned by the user
    const userProfile = await profilesRepository.findByUserId(userId);
    if (!userProfile) {
      throw new UnauthorizedError('Perfil no encontrado');
    }

    // Get all threads where user is participant (either as applicant or organizer)
    const threads = await threadsRepository.findByParticipantProfileIds([userProfile.id]);

    return threads;
  };
