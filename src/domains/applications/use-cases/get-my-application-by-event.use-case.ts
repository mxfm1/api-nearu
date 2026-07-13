import type { ApplicationWithDetails } from '../entities/application.entity';
import type { IApplicationsRepository } from '../repositories/applications.repository.interface';
import type { IProfilesRepository } from '@/src/domains/profiles/repositories/profiles.repository.interface';
import type { IEventsRepository } from '@/src/domains/events/repositories/events.repository.interface';
import { NotFoundError } from '@/src/shared/errors/common';

export type IGetMyApplicationByEventUseCase = ReturnType<typeof getMyApplicationByEventUseCase>;

export const getMyApplicationByEventUseCase =
  (
    applicationsRepository: IApplicationsRepository,
    profilesRepository: IProfilesRepository,
    eventsRepository: IEventsRepository,
  ) =>
  async (userId: string, eventIdOrSlug: string): Promise<ApplicationWithDetails | null> => {
    // Get user's profile
    const profile = await profilesRepository.findByUserId(userId);
    if (!profile) {
      throw new NotFoundError('Perfil no encontrado');
    }

    // Resolve eventIdOrSlug to actual event ID (supports both ID and slug)
    let event = await eventsRepository.findById(eventIdOrSlug);
    if (!event) {
      event = await eventsRepository.findBySlug(eventIdOrSlug);
    }
    if (!event) {
      throw new NotFoundError('Evento no encontrado');
    }

    // Find application by event and profile
    const application = await applicationsRepository.findByEventAndProfile(event.id, profile.id);
    if (!application) {
      return null;
    }

    // Get full details using findById
    const applicationWithDetails = await applicationsRepository.findById(application.id);
    return applicationWithDetails;
  };
