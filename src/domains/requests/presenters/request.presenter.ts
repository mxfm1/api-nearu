import type { UserRequest } from '../entities/request.entity';

export function presentRequest(request: UserRequest) {
  return {
    id: request.id,
    profileId: request.profileId,
    type: request.type,
    status: request.status,
    title: request.title,
    description: request.description,
    metadata: request.metadata,
    targetEntityType: request.targetEntityType,
    targetEntityId: request.targetEntityId,
    reviewerUserId: request.reviewerUserId,
    reviewerComment: request.reviewerComment,
    createdAt: request.createdAt.toISOString(),
    updatedAt: request.updatedAt.toISOString(),
    reviewedAt: request.reviewedAt?.toISOString() ?? null,
  };
}

export function presentRequests(requests: UserRequest[]) {
  return requests.map(presentRequest);
}
