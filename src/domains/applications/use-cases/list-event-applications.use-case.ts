import type { ApplicationWithDetails } from '../entities/application.entity';
import type { IApplicationsRepository } from '../repositories/applications.repository.interface';
import type { IEventsRepository } from '@/src/domains/events/repositories/events.repository.interface';
import type { IProfilesRepository } from '@/src/domains/profiles/repositories/profiles.repository.interface';
import { NotFoundError, ForbiddenError } from '@/src/shared/errors/common';

export type IListEventApplicationsUseCase = ReturnType<typeof listEventApplicationsUseCase>;

export const listEventApplicationsUseCase =
  (
    applicationsRepository: IApplicationsRepository,
    eventsRepository: IEventsRepository,
    profilesRepository: IProfilesRepository,
  ) =>
  async (
    eventId: string,
    userId: string
  ): Promise<ApplicationWithDetails[]> => {
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

    // List applications for event
    const applications = await applicationsRepository.findByEventId(eventId);
    return applications;
  };
