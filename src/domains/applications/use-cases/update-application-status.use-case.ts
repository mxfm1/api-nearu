import type { Application } from '../entities/application.entity';
import type { IApplicationsRepository } from '../repositories/applications.repository.interface';
import type { IEventsRepository } from '@/src/domains/events/repositories/events.repository.interface';
import type { IProfilesRepository } from '@/src/domains/profiles/repositories/profiles.repository.interface';
import type { INotificationsRepository } from '@/src/domains/notifications/repositories/notifications.repository.interface';
import type { ICreateNotificationUseCase } from '@/src/domains/notifications/use-cases/create-notification.use-case';
import type { IUsersRepository } from '@/src/domains/users/repositories/users.repository.interface';
import type { IThreadsRepository } from '@/src/domains/threads/repositories/threads.repository.interface';
import type { ICreateThreadUseCase } from '@/src/domains/threads/use-cases/create-thread.use-case';
import { emailService } from '@/src/shared/email';
import { NotFoundError, ForbiddenError, InputParseError } from '@/src/shared/errors/common';

// Application status IDs - must match statuses table UUIDs
const APPLICATION_STATUS = {
  PENDING: '10000000-0000-0000-0000-000000000001',
  REVIEWING: '10000000-0000-0000-0000-000000000002',
  APPROVED: '10000000-0000-0000-0000-000000000003',
  REJECTED: '10000000-0000-0000-0000-000000000004',
} as const;

// Reverse mapping for display (statusId -> slug)
const STATUS_TO_SLUG: Record<string, string> = {
  [APPLICATION_STATUS.PENDING]: 'pending',
  [APPLICATION_STATUS.REVIEWING]: 'reviewing',
  [APPLICATION_STATUS.APPROVED]: 'accepted',
  [APPLICATION_STATUS.REJECTED]: 'rejected',
};

// Slug to statusId mapping
const SLUG_TO_STATUS_ID: Record<string, string> = {
  pending: APPLICATION_STATUS.PENDING,
  reviewing: APPLICATION_STATUS.REVIEWING,
  accepted: APPLICATION_STATUS.APPROVED,
  rejected: APPLICATION_STATUS.REJECTED,
};

// Valid transitions: statusId -> array of allowed statusId transitions
// Empty object means ALL transitions are allowed
const VALID_STATUS_TRANSITIONS: Record<string, string[]> = {};

export type IUpdateApplicationStatusUseCase = ReturnType<typeof updateApplicationStatusUseCase>;

export const updateApplicationStatusUseCase =
  (
    applicationsRepository: IApplicationsRepository,
    eventsRepository: IEventsRepository,
    profilesRepository: IProfilesRepository,
    notificationsRepository: INotificationsRepository,
    createNotificationUseCase: ICreateNotificationUseCase,
    usersRepository: IUsersRepository,
    threadsRepository: IThreadsRepository,
    createThreadUseCase: ICreateThreadUseCase,
  ) =>
  async (
    applicationId: string,
    userId: string,
    newStatusSlug: string
  ): Promise<Application> => {
    // Get application
    const application = await applicationsRepository.findById(applicationId);
    if (!application) {
      throw new NotFoundError('Aplicación no encontrada');
    }

    // Get event to check ownership
    const event = await eventsRepository.findById(application.eventId);
    if (!event) {
      throw new NotFoundError('Evento no encontrado');
    }

    // Get event owner profile
    const eventOwnerProfile = await profilesRepository.findById(event.profileId);
    if (!eventOwnerProfile) {
      throw new NotFoundError('Perfil del organizador no encontrado');
    }

    // Only event owner can update status
    if (eventOwnerProfile.userId !== userId) {
      throw new ForbiddenError('No tienes permiso para actualizar esta postulación');
    }

    // Convert slug to statusId
    const newStatusId = SLUG_TO_STATUS_ID[newStatusSlug];
    if (!newStatusId) {
      throw new InputParseError(`Estado inválido: ${newStatusSlug}`);
    }

    // Update status
    const updated = await applicationsRepository.updateStatus(applicationId, newStatusId);

    // Handle selectedCandidates count based on status transitions
    if (newStatusSlug === 'accepted') {
      await eventsRepository.incrementSelectedCandidates(application.eventId);

      // Create thread for chat between applicant and organizer (fire-and-forget)
      createThreadUseCase(application.id).catch(() =>
        console.warn('[UpdateApplicationStatus] Failed to create thread')
      );
    } else if (STATUS_TO_SLUG[application.statusId] === 'accepted' && newStatusSlug === 'rejected') {
      await eventsRepository.decrementSelectedCandidates(application.eventId);
    }

    // Notify applicant about status change (fire-and-forget)
    if (newStatusSlug === 'accepted' || newStatusSlug === 'rejected') {
      const applicantProfile = await profilesRepository.findById(application.applicantProfileId);
      if (applicantProfile) {
        const notificationType = newStatusSlug === 'accepted' ? 'application_accepted' : 'application_rejected';
        const notificationTitle = newStatusSlug === 'accepted' ? '¡Postulación aceptada!' : 'Postulación rechazada';

        // Create in-app notification
        createNotificationUseCase({
          userId: applicantProfile.userId,
          type: notificationType,
          title: notificationTitle,
          body: `Tu postulación para "${event.title}" ha sido ${newStatusSlug === 'accepted' ? 'aceptada' : 'rechazada'}.`,
          entityType: 'application',
          entityId: application.id,
          actionUrl: `/mis-postulaciones`,
          metadata: { applicationId: application.id, eventId: event.id, newStatus: newStatusSlug },
        }).catch(() => console.warn('[UpdateApplicationStatus] Failed to create notification'));

        // Send email notification (account notifications bypass email preference)
        usersRepository.findById(applicantProfile.userId)
          .then((user) => {
            if (user?.email) {
              return emailService.sendApplicationStatusChangedEmail({
                to: user.email,
                userName: user.name,
                eventTitle: event.title,
                status: newStatusSlug,
              });
            }
          })
          .catch(() => console.warn('[UpdateApplicationStatus] Failed to send email'));
      }
    }

    return updated;
  };
