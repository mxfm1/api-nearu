import type { Thread, ThreadWithDetails, ThreadStatus } from '../entities/thread.entity';

export interface IThreadsRepository {
  findById(id: string): Promise<Thread | null>;
  findByApplicationId(applicationId: string): Promise<Thread | null>;
  create(data: {
    applicationId: string;
    status?: ThreadStatus;
  }): Promise<Thread>;
  updateStatus(id: string, status: ThreadStatus): Promise<Thread>;
  findByIdWithDetails(id: string): Promise<ThreadWithDetails | null>;
  findByParticipantProfileIds(profileIds: string[]): Promise<ThreadWithDetails[]>;
}
