import type { RequestStatus, RequestType, UserRequest } from '../entities/request.entity';

export interface IRequestsRepository {
  create(data: {
    profileId: string;
    type: RequestType;
    title: string;
    description?: string | null;
    metadata?: Record<string, unknown> | null;
    targetEntityType?: string | null;
    targetEntityId?: string | null;
  }): Promise<UserRequest>;
  findById(id: string): Promise<UserRequest | null>;
  findPendingByProfileAndType(profileId: string, type: RequestType): Promise<UserRequest | null>;
  listByProfile(profileId: string, status?: RequestStatus): Promise<UserRequest[]>;
  list(status?: RequestStatus): Promise<UserRequest[]>;
  updateStatus(id: string, data: {
    status: RequestStatus;
    reviewerUserId: string;
    reviewerComment?: string | null;
    reviewedAt?: Date | null;
    verifyProfile?: boolean;
  }): Promise<UserRequest | null>;
}
