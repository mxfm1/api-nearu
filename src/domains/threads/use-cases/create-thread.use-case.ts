import type { Thread } from '../entities/thread.entity';
import type { IThreadsRepository } from '../repositories/threads.repository.interface';
import { ConflictError } from '@/src/shared/errors/common';

export type ICreateThreadUseCase = ReturnType<typeof createThreadUseCase>;

export const createThreadUseCase =
  (threadsRepository: IThreadsRepository) =>
  async (applicationId: string): Promise<Thread> => {
    // Check if thread already exists for this application
    const existing = await threadsRepository.findByApplicationId(applicationId);
    if (existing) {
      throw new ConflictError('Ya existe un thread para esta postulación');
    }

    return threadsRepository.create({
      applicationId,
      status: 'OPEN',
    });
  };
