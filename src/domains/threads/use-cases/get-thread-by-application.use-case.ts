import type { ThreadWithDetails } from '../entities/thread.entity';
import type { IThreadsRepository } from '../repositories/threads.repository.interface';
import type { IApplicationsRepository } from '@/src/domains/applications/repositories/applications.repository.interface';
import type { IProfilesRepository } from '@/src/domains/profiles/repositories/profiles.repository.interface';
import type { IEventsRepository } from '@/src/domains/events/repositories/events.repository.interface';
import { NotFoundError } from '@/src/shared/errors/common';
import { UnauthorizedError } from '@/src/shared/errors/auth';

export type IGetThreadByApplicationUseCase = ReturnType<typeof getThreadByApplicationUseCase>;

export const getThreadByApplicationUseCase =
  (
    threadsRepository: IThreadsRepository,
    applicationsRepository: IApplicationsRepository,
    profilesRepository: IProfilesRepository,
    eventsRepository: IEventsRepository,
  ) =>
  async (applicationId: string, userId: string): Promise<ThreadWithDetails | null> => {
    // Get application
    const application = await applicationsRepository.findById(applicationId);
    if (!application) {
      throw new NotFoundError('Aplicación no encontrada');
    }

    // Get user's profile
    const userProfile = await profilesRepository.findByUserId(userId);
    if (!userProfile) {
      throw new UnauthorizedError('Perfil no encontrado');
    }

    // Get event to find organizer's profileId
    const event = await eventsRepository.findById(application.eventId);
    if (!event) {
      throw new NotFoundError('Evento no encontrado');
    }

    // Verify user is either the applicant or the organizer
    const isApplicant = userProfile.id === application.applicantProfileId;
    const isOrganizer = userProfile.id === event.profileId;

    if (!isApplicant && !isOrganizer) {
      throw new UnauthorizedError('No tienes acceso a esta aplicación');
    }

    // Find thread by application ID
    const thread = await threadsRepository.findByApplicationId(applicationId);
    if (!thread) {
      return null;
    }

    // Return thread with full details
    return threadsRepository.findByIdWithDetails(thread.id);
  };
