import type { ApplicationWithDetails, ApplicationScoreWithBreakdown } from '../entities/application.entity';
import type { IApplicationsRepository } from '../repositories/applications.repository.interface';
import type { IEventsRepository } from '@/src/domains/events/repositories/events.repository.interface';
import type { IProfilesRepository } from '@/src/domains/profiles/repositories/profiles.repository.interface';
import { NotFoundError, ForbiddenError } from '@/src/shared/errors/common';

export type IListEventApplicationsWithScoreUseCase = ReturnType<typeof listEventApplicationsWithScoreUseCase>;

export const listEventApplicationsWithScoreUseCase =
  (
    applicationsRepository: IApplicationsRepository,
    eventsRepository: IEventsRepository,
    profilesRepository: IProfilesRepository,
  ) =>
  async (
    eventId: string,
    userId: string,
    options?: { status?: string }
  ): Promise<(ApplicationWithDetails & { score?: ApplicationScoreWithBreakdown })[]> => {
    // Verify event exists
    const event = await eventsRepository.findById(eventId);
    if (!event) {
      throw new NotFoundError('Evento no encontrado');
    }

    // Get event owner profile
    const eventOwnerProfile = await profilesRepository.findById(event.profileId);
    if (!eventOwnerProfile) {
      throw new NotFoundError('Perfil del organizador no encontrado');
    }

    // Only event owner can list applications
    if (eventOwnerProfile.userId !== userId) {
      throw new ForbiddenError('No tienes permiso para ver estas postulaciones');
    }

    // List applications with full score details
    const applications = await applicationsRepository.findByEventIdWithScoreDetails(eventId, options);

    return applications;
  };
