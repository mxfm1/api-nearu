import type { ContactRequest } from '../entities/contact-request.entity';
import type { IContactRequestsRepository } from '../repositories/contact-requests.repository.interface';
import type { IMessagesRepository } from '@/src/domains/messages/repositories/messages.repository.interface';
import type { ICreateNotificationUseCase } from '@/src/domains/notifications/use-cases/create-notification.use-case';
import type { INotificationsRepository } from '@/src/domains/notifications/repositories/notifications.repository.interface';
import type { IUsersRepository } from '@/src/domains/users/repositories/users.repository.interface';
import type { IServicesRepository } from '@/src/domains/services/repositories/services.repository.interface';
import type { IEventsRepository } from '@/src/domains/events/repositories/events.repository.interface';
import type { IProfilesRepository } from '@/src/domains/profiles/repositories/profiles.repository.interface';
import { InputParseError, NotFoundError } from '@/src/shared/errors/common';
import { emailService } from '@/src/shared/email';

export type ICreateContactRequestUseCase = ReturnType<typeof createContactRequestUseCase>;

export const createContactRequestUseCase =
  (
    contactRequestsRepository: IContactRequestsRepository,
    messagesRepository: IMessagesRepository,
    createNotificationUseCase: ICreateNotificationUseCase,
    notificationsRepository: INotificationsRepository,
    usersRepository: IUsersRepository,
    servicesRepository: IServicesRepository,
    eventsRepository: IEventsRepository,
    profilesRepository: IProfilesRepository,
  ) =>
  async (input: {
    slug: string;
    intencion: string;
    remitenteId: string;
    mensaje?: string | null;
    attachments?: string[];
  }): Promise<ContactRequest> => {
    // Resolve slug → service or event
    const service = await servicesRepository.findBySlug(input.slug);
    const event = service ? null : await eventsRepository.findBySlug(input.slug);

    if (!service && !event) {
      throw new NotFoundError('Servicio o evento no encontrado');
    }

    // Resolve profile → propietarioId
    const profileId = service?.profileId ?? event!.profileId;
    const profile = await profilesRepository.findById(profileId);
    if (!profile) {
      throw new NotFoundError('Perfil del propietario no encontrado');
    }

    const propietarioId = profile.userId;
    if (input.remitenteId === propietarioId) {
      throw new InputParseError('No puedes contactarte a ti mismo');
    }

    const request = await contactRequestsRepository.create({
      servicioId: service?.id ?? null,
      eventoId: event?.id ?? null,
      propietarioId,
      remitenteId: input.remitenteId,
      intencion: input.intencion,
    });

    // Create initial inbox message from mensaje
    const hasContent = input.mensaje && input.mensaje.trim().length > 0;
    const hasAttachments = input.attachments && input.attachments.length > 0;
    if (hasContent || hasAttachments) {
      await messagesRepository.create({
        contactRequestId: request.id,
        senderId: input.remitenteId,
        content: input.mensaje ?? null,
        attachments: input.attachments ?? [],
      });
    }

    // Create in-app notification for propietario
    try {
      await createNotificationUseCase({
        userId: propietarioId,
        type: 'new_contact_request',
        title: 'Nueva solicitud de contacto',
        message: 'Has recibido una nueva solicitud de contacto',
        data: { contactRequestId: request.id },
      });
    } catch {
      console.warn('[CreateContactRequest] Failed to create notification');
    }

    // Send email if enabled
    try {
      const settings = await notificationsRepository.findSettingsByUserId(propietarioId);
      if (!settings || settings.emailNotificationsEnabled) {
        const user = await usersRepository.findById(propietarioId);
        if (user?.email) {
          await emailService.sendContactNotificationEmail({
            to: user.email,
            propietarioName: user.name,
          });
        }
      }
    } catch {
      console.warn('[CreateContactRequest] Email notification failed (swallowed)');
    }

    return request;
  };
