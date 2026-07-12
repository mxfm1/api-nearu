import type { Application } from '../entities/application.entity';
import type { IApplicationsRepository } from '../repositories/applications.repository.interface';
import type { IEventsRepository } from '@/src/domains/events/repositories/events.repository.interface';
import type { IProfilesRepository } from '@/src/domains/profiles/repositories/profiles.repository.interface';
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
    return updated;
  };
