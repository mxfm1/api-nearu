import type { Application } from '../entities/application.entity';
import type { IApplicationsRepository } from '../repositories/applications.repository.interface';
import type { IEventsRepository } from '@/src/domains/events/repositories/events.repository.interface';
import type { IProfilesRepository } from '@/src/domains/profiles/repositories/profiles.repository.interface';
import type { INotificationsRepository } from '@/src/domains/notifications/repositories/notifications.repository.interface';
import type { ICreateNotificationUseCase } from '@/src/domains/notifications/use-cases/create-notification.use-case';
import type { IUsersRepository } from '@/src/domains/users/repositories/users.repository.interface';
import type { IScoringRulesRepository } from '../repositories/scoring-rules.repository.interface';
import type { IComputeScoreUseCase } from './compute-score.use-case';
import { emailService } from '@/src/shared/email';
import { InputParseError, NotFoundError, ApplicationAlreadyExistsError } from '@/src/shared/errors/common';

export type ICreateApplicationUseCase = ReturnType<typeof createApplicationUseCase>;

export const createApplicationUseCase =
  (
    applicationsRepository: IApplicationsRepository,
    eventsRepository: IEventsRepository,
    profilesRepository: IProfilesRepository,
    notificationsRepository: INotificationsRepository,
    createNotificationUseCase: ICreateNotificationUseCase,
    usersRepository: IUsersRepository,
    scoringRulesRepository: IScoringRulesRepository,
    computeScoreUseCase: IComputeScoreUseCase,
  ) =>
  async (input: {
    eventId: string;
    applicantProfileId: string;
    coverLetter?: string | null;
    portfolioUrls?: string[];
  }): Promise<Application> => {
    // Verify event exists (supports slug or ID)
    let event = await eventsRepository.findById(input.eventId);
    if (!event) {
      event = await eventsRepository.findBySlug(input.eventId);
    }
    if (!event) {
      throw new NotFoundError('Evento no encontrado');
    }

    // Verify applicant profile exists
    const profile = await profilesRepository.findById(input.applicantProfileId);
    if (!profile) {
      throw new NotFoundError('Perfil del postulante no encontrado');
    }

    // Check if user owns the event (cannot apply to own event)
    if (profile.userId === event.profileId) {
      throw new InputParseError('No puedes postular a tu propio evento');
    }

    // Check for duplicate application
    const existing = await applicationsRepository.findByEventAndProfile(
      event.id,
      input.applicantProfileId
    );
    if (existing) {
      throw new ApplicationAlreadyExistsError();
    }

    // Create application
    const application = await applicationsRepository.create({
      eventId: event.id,
      applicantProfileId: input.applicantProfileId,
      coverLetter: input.coverLetter,
      portfolioUrls: input.portfolioUrls,
    });

    // Increment event application count
    await eventsRepository.incrementApplicationCount(event.id, 1);

    // Calculate score if event has scoring rules configured (fire-and-forget)
    const rules = await scoringRulesRepository.findByEventId(event.id);
    if (rules.length > 0) {
      computeScoreUseCase(application.id).catch(() =>
        console.warn('[CreateApplication] Failed to compute score')
      );
    }

    // Notify event organizer (fire-and-forget)
    const organizerProfile = await profilesRepository.findById(event.profileId);
    if (organizerProfile) {
      // Create in-app notification
      createNotificationUseCase({
        userId: organizerProfile.userId,
        type: 'new_application',
        title: 'Nueva postulación',
        body: `${profile.name || 'Un usuario'} se ha postulado a tu evento "${event.title}"`,
        entityType: 'application',
        entityId: application.id,
        actionUrl: `/eventos/${event.slug}/postulaciones`,
        metadata: { applicationId: application.id, eventId: event.id },
      }).catch(() => console.warn('[CreateApplication] Failed to create notification'));

      // Send email notification if enabled (account notifications bypass preference)
      notificationsRepository.isEmailEnabled(organizerProfile.userId, 'new_application')
        .then((emailEnabled) => {
          if (emailEnabled) {
            return usersRepository.findById(organizerProfile.userId);
          }
          return null;
        })
        .then((user) => {
          if (user?.email) {
            return emailService.sendApplicationReceivedEmail({
              to: user.email,
              userName: user.name,
              eventTitle: event.title,
            });
          }
        })
        .catch(() => console.warn('[CreateApplication] Failed to send email'));
    }

    return application;
  };
