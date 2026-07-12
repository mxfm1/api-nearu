import type { ApplicationWithDetails, ApplicationScoreWithBreakdown } from '../entities/application.entity';
import type { IApplicationsRepository } from '../repositories/applications.repository.interface';
import type { IEventsRepository } from '@/src/domains/events/repositories/events.repository.interface';
import type { IProfilesRepository } from '@/src/domains/profiles/repositories/profiles.repository.interface';
import { NotFoundError, ForbiddenError } from '@/src/shared/errors/common';

export type IGetApplicationUseCase = ReturnType<typeof getApplicationUseCase>;

export const getApplicationUseCase =
  (
    applicationsRepository: IApplicationsRepository,
    eventsRepository: IEventsRepository,
    profilesRepository: IProfilesRepository,
  ) =>
  async (
    applicationId: string,
    userId: string
  ): Promise<ApplicationWithDetails & { score?: ApplicationScoreWithBreakdown }> => {
    // Get application
    const application = await applicationsRepository.findById(applicationId);
    if (!application) {
      throw new NotFoundError('Aplicación no encontrada');
    }

    // Get the applicant profile to check userId
    const applicantProfile = await profilesRepository.findById(application.applicantProfileId);
    if (!applicantProfile) {
      throw new NotFoundError('Perfil del postulante no encontrado');
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

    // Authorization: only applicant or event owner can view
    const isApplicant = applicantProfile.userId === userId;
    const isEventOwner = eventOwnerProfile.userId === userId;

    if (!isApplicant && !isEventOwner) {
      throw new ForbiddenError('No tienes permiso para ver esta postulación');
    }

    // Get score if exists
    const score = await applicationsRepository.findScoreByApplicationId(applicationId);

    return {
      ...application,
      score: score ?? undefined,
    };
  };
