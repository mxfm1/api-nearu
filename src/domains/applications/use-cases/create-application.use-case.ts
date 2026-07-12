import type { Application } from '../entities/application.entity';
import type { IApplicationsRepository } from '../repositories/applications.repository.interface';
import type { IEventsRepository } from '@/src/domains/events/repositories/events.repository.interface';
import type { IProfilesRepository } from '@/src/domains/profiles/repositories/profiles.repository.interface';
import { InputParseError, NotFoundError, ApplicationAlreadyExistsError } from '@/src/shared/errors/common';

export type ICreateApplicationUseCase = ReturnType<typeof createApplicationUseCase>;

export const createApplicationUseCase =
  (
    applicationsRepository: IApplicationsRepository,
    eventsRepository: IEventsRepository,
    profilesRepository: IProfilesRepository,
  ) =>
  async (input: {
    eventId: string;
    applicantProfileId: string;
    coverLetter?: string | null;
    portfolioUrls?: string[];
  }): Promise<Application> => {
    // Verify event exists
    const event = await eventsRepository.findById(input.eventId);
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
      input.eventId,
      input.applicantProfileId
    );
    if (existing) {
      throw new ApplicationAlreadyExistsError();
    }

    // Create application
    const application = await applicationsRepository.create({
      eventId: input.eventId,
      applicantProfileId: input.applicantProfileId,
      coverLetter: input.coverLetter,
      portfolioUrls: input.portfolioUrls,
    });

    return application;
  };
