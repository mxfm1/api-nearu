import { ForbiddenError, NotFoundError } from '@/src/shared/errors/common';
import type { ICreateNotificationUseCase } from '@/src/domains/notifications/use-cases/create-notification.use-case';
import type { IProfilesRepository } from '@/src/domains/profiles/repositories/profiles.repository.interface';
import type { IUsersRepository } from '@/src/domains/users/repositories/users.repository.interface';
import type { RequestStatus, UserRequest } from '../entities/request.entity';
import type { IRequestsRepository } from '../repositories/requests.repository.interface';

export type IUpdateRequestStatusUseCase = ReturnType<typeof updateRequestStatusUseCase>;

const transitions: Record<RequestStatus, RequestStatus[]> = {
  pending: ['in_review', 'approved', 'rejected', 'cancelled'],
  in_review: ['approved', 'rejected', 'resolved', 'cancelled'],
  approved: [],
  rejected: [],
  resolved: [],
  cancelled: [],
};

export const updateRequestStatusUseCase = (
  requestsRepository: IRequestsRepository,
  profilesRepository: IProfilesRepository,
  usersRepository: IUsersRepository,
  createNotification: ICreateNotificationUseCase,
) => async (input: {
  requestId: string;
  reviewerUserId: string;
  status: RequestStatus;
  comment?: string | null;
}): Promise<UserRequest> => {
  const reviewer = await usersRepository.findById(input.reviewerUserId);
  if (!reviewer || reviewer.role !== 'admin') throw new ForbiddenError('Se requiere rol de administrador.');

  const request = await requestsRepository.findById(input.requestId);
  if (!request) throw new NotFoundError('Request');
  if (!transitions[request.status].includes(input.status)) {
    throw new ForbiddenError(`No se puede cambiar una solicitud de ${request.status} a ${input.status}.`);
  }

  const profile = await profilesRepository.findById(request.profileId);
  if (!profile) throw new NotFoundError('Profile');

  const updated = await requestsRepository.updateStatus(input.requestId, {
    status: input.status,
    reviewerUserId: input.reviewerUserId,
    reviewerComment: input.comment,
    verifyProfile: request.type === 'profile_verification' && input.status === 'approved',
  });
  if (!updated) throw new NotFoundError('Request');

  await createNotification({
    userId: profile.userId,
    type: request.type === 'profile_verification' && input.status === 'approved'
      ? 'profile_verified'
      : request.type === 'profile_verification' && input.status === 'rejected'
        ? 'profile_verification_rejected'
        : 'request_status_changed',
    title: input.status === 'approved' ? 'Solicitud aprobada' : input.status === 'rejected' ? 'Solicitud rechazada' : 'Estado de solicitud actualizado',
    body: input.comment ?? `Tu solicitud ahora está ${input.status}.`,
    entityType: 'request',
    entityId: updated.id,
    actionUrl: `/solicitudes/${updated.id}`,
  });

  return updated;
};
