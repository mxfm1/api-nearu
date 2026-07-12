import type { Application } from '../entities/application.entity';
import type { IApplicationsRepository } from '../repositories/applications.repository.interface';
import type { IEventsRepository } from '@/src/domains/events/repositories/events.repository.interface';
import type { IProfilesRepository } from '@/src/domains/profiles/repositories/profiles.repository.interface';
import type { INotificationsRepository } from '@/src/domains/notifications/repositories/notifications.repository.interface';
import type { ICreateNotificationUseCase } from '@/src/domains/notifications/use-cases/create-notification.use-case';
import type { IUsersRepository } from '@/src/domains/users/repositories/users.repository.interface';
import { emailService } from '@/src/shared/email';
import { NotFoundError, ForbiddenError, InputParseError } from '@/src/shared/errors/common';

const VALID_STATUS_TRANSITIONS: Record<string, string[]> = {
  pending: ['reviewing', 'rejected'],
  reviewing: ['accepted', 'rejected'],
  accepted: [],
  rejected: [],
};

export type IUpdateApplicationStatusUseCase = ReturnType<typeof updateApplicationStatusUseCase>;

export const updateApplicationStatusUseCase =
  (
    applicationsRepository: IApplicationsRepository,
    eventsRepository: IEventsRepository,
    profilesRepository: IProfilesRepository,
    notificationsRepository: INotificationsRepository,
    createNotificationUseCase: ICreateNotificationUseCase,
    usersRepository: IUsersRepository,
  ) =>
  async (
    applicationId: string,
    userId: string,
    newStatus: string
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

    // Validate status transition
    const allowedTransitions = VALID_STATUS_TRANSITIONS[application.status] ?? [];
    if (!allowedTransitions.includes(newStatus)) {
      throw new InputParseError(
        `Transición de estado no válida: ${application.status} → ${newStatus}`
      );
    }

    // Update status
    const updated = await applicationsRepository.updateStatus(applicationId, newStatus);

    // Handle selectedCandidates count based on status transitions
    if (newStatus === 'accepted') {
      await eventsRepository.incrementSelectedCandidates(application.eventId);
    } else if (application.status === 'accepted' && newStatus === 'rejected') {
      await eventsRepository.decrementSelectedCandidates(application.eventId);
    }

    // Notify applicant about status change (fire-and-forget)
    if (newStatus === 'accepted' || newStatus === 'rejected') {
      const applicantProfile = await profilesRepository.findById(application.applicantProfileId);
      if (applicantProfile) {
        const notificationType = newStatus === 'accepted' ? 'application_accepted' : 'application_rejected';
        const notificationTitle = newStatus === 'accepted' ? '¡Postulación aceptada!' : 'Postulación rechazada';

        // Create in-app notification
        createNotificationUseCase({
          userId: applicantProfile.userId,
          type: notificationType,
          title: notificationTitle,
          body: `Tu postulación para "${event.title}" ha sido ${newStatus === 'accepted' ? 'aceptada' : 'rechazada'}.`,
          entityType: 'application',
          entityId: application.id,
          actionUrl: `/mis-postulaciones`,
          metadata: { applicationId: application.id, eventId: event.id, newStatus },
        }).catch(() => console.warn('[UpdateApplicationStatus] Failed to create notification'));

        // Send email notification (account notifications bypass email preference)
        usersRepository.findById(applicantProfile.userId)
          .then((user) => {
            if (user?.email) {
              return emailService.sendApplicationStatusChangedEmail({
                to: user.email,
                userName: user.name,
                eventTitle: event.title,
                status: newStatus,
              });
            }
          })
          .catch(() => console.warn('[UpdateApplicationStatus] Failed to send email'));
      }
    }

    return updated;
  };
