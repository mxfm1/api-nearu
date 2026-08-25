import { ConflictError, NotFoundError, ProfileVerificationRequirementsNotMetError } from '@/src/shared/errors/common';
import type { ICreateNotificationUseCase } from '@/src/domains/notifications/use-cases/create-notification.use-case';
import type { INotificationsRepository } from '@/src/domains/notifications/repositories/notifications.repository.interface';
import type { IProfilesRepository } from '@/src/domains/profiles/repositories/profiles.repository.interface';
import type { IUsersRepository } from '@/src/domains/users/repositories/users.repository.interface';
import type { RequestType, UserRequest } from '../entities/request.entity';
import type { IRequestsRepository } from '../repositories/requests.repository.interface';
import { evaluateProfileVerificationChecklist } from './get-profile-verification-checklist.use-case';

export type ICreateRequestUseCase = ReturnType<typeof createRequestUseCase>;

export const createRequestUseCase = (
  requestsRepository: IRequestsRepository,
  profilesRepository: IProfilesRepository,
  usersRepository: IUsersRepository,
  createNotification: ICreateNotificationUseCase,
) => async (input: {
  userId: string;
  type: RequestType;
  title: string;
  description?: string | null;
  metadata?: Record<string, unknown> | null;
  targetEntityType?: string | null;
  targetEntityId?: string | null;
}): Promise<UserRequest> => {
  const profile = await profilesRepository.findByUserId(input.userId);
  const user = input.type === 'profile_verification'
    ? await usersRepository.findById(input.userId)
    : null;
  const profileVerificationChecklist = input.type === 'profile_verification'
    ? evaluateProfileVerificationChecklist(profile, user)
    : null;

  if (profileVerificationChecklist && !profileVerificationChecklist.eligible) {
    throw new ProfileVerificationRequirementsNotMetError(profileVerificationChecklist);
  }
  if (!profile) throw new NotFoundError('Profile');

  const existing = await requestsRepository.findPendingByProfileAndType(profile.id, input.type);
  if (existing) throw new ConflictError('Ya existe una solicitud pendiente de este tipo.');

  const metadata = profileVerificationChecklist
    ? {
      ...(input.metadata ?? {}),
      profileVerificationChecklist,
    }
    : input.metadata;

  const request = await requestsRepository.create({
    profileId: profile.id,
    type: input.type,
    title: input.title,
    description: input.description,
    metadata,
    targetEntityType: input.targetEntityType,
    targetEntityId: input.targetEntityId,
  });

  await createNotification({
    userId: input.userId,
    type: 'request_submitted',
    title: 'Solicitud generada',
    body: 'Tu solicitud fue generada correctamente y será revisada.',
    entityType: 'request',
    entityId: request.id,
    actionUrl: `/solicitudes/${request.id}`,
  });

  const admins = await usersRepository.findAdmins();
  const adminNotificationType = request.type === 'profile_verification'
    ? 'profile_verification_request_received'
    : request.type === 'profile_report'
      ? 'profile_report_received'
      : request.type === 'publication_report'
        ? 'publication_report_received'
        : 'request_received';
  await Promise.all(admins.map((admin) => createNotification({
    userId: admin.id,
    type: adminNotificationType,
    title: 'Nueva solicitud para revisar',
    body: `${profile.name ?? 'Un usuario'} generó una nueva solicitud.`,
    entityType: 'request',
    entityId: request.id,
    actionUrl: `/admin/solicitudes/${request.id}`,
  })));

  return request;
};
