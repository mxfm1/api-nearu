import { createContainer } from '@evyweb/ioctopus';
import { DI_SYMBOLS } from './types';
import type { DI_RETURN_TYPES } from './types';
import { AuthenticationService } from '@/src/shared/services/implementations';
import { UsersRepository } from '@/src/domains/users/repositories/users.repository';
import { getUserUseCase } from '@/src/domains/users/use-cases/get-user.use-case';
import { deleteUserUseCase } from '@/src/domains/users/use-cases/delete-user.use-case';
import { getUserController, deleteUserController } from '@/src/domains/users/controllers/users.controller';
import { ProfilesRepository } from '@/src/domains/profiles/repositories/profiles.repository';
import { ProfileSocialLinksRepository } from '@/src/domains/profiles/repositories/profile-social-links.repository';
import { TagsRepository } from '@/src/domains/profiles/repositories/tags.repository';
import { StatusesRepository } from '@/src/domains/statuses/repositories/statuses.repository';
import { getProfileUseCase } from '@/src/domains/profiles/use-cases/get-profile.use-case';
import { upsertProfileUseCase } from '@/src/domains/profiles/use-cases/upsert-profile.use-case';
import { getProfileController, upsertProfileController } from '@/src/domains/profiles/controllers/profile.controller';
import { ContactRequestsRepository } from '@/src/domains/contact-requests/repositories/contact-requests.repository';
import { createContactRequestUseCase } from '@/src/domains/contact-requests/use-cases/create-contact-request.use-case';
import { getInboxUseCase } from '@/src/domains/contact-requests/use-cases/get-inbox.use-case';
import { getContactRequestDetailUseCase } from '@/src/domains/contact-requests/use-cases/get-contact-request-detail.use-case';
import { updateContactRequestStatusUseCase } from '@/src/domains/contact-requests/use-cases/update-contact-request-status.use-case';
import {
  createContactRequestController,
  getInboxController,
  getContactRequestDetailController,
  updateContactRequestStatusController,
} from '@/src/domains/contact-requests/controllers/contact-request.controller';
import { ServicesRepository } from '@/src/domains/services/repositories/services.repository';
import { ServicePortfolioRepository } from '@/src/domains/services/repositories/service-portfolio.repository';
import { ServiceContactsRepository } from '@/src/domains/services/repositories/service-contacts.repository';
import { createServiceUseCase } from '@/src/domains/services/use-cases/create-service.use-case';
import { getServiceUseCase } from '@/src/domains/services/use-cases/get-service.use-case';
import { updateServiceUseCase } from '@/src/domains/services/use-cases/update-service.use-case';
import { listServicesUseCase } from '@/src/domains/services/use-cases/list-services.use-case';
import { deleteServiceUseCase } from '@/src/domains/services/use-cases/delete-service.use-case';
import {
  createServiceController,
  getServiceController,
  updateServiceController,
  listServicesController,
  deleteServiceController,
  addPortfolioItemController,
  deletePortfolioItemController,
  myServicesController,
} from '@/src/domains/services/controllers/service.controller';
import { EventsRepository } from '@/src/domains/events/repositories/events.repository';
import { createEventUseCase } from '@/src/domains/events/use-cases/create-event.use-case';
import { getEventUseCase } from '@/src/domains/events/use-cases/get-event.use-case';
import { updateEventUseCase } from '@/src/domains/events/use-cases/update-event.use-case';
import { listEventsUseCase } from '@/src/domains/events/use-cases/list-events.use-case';
import { deleteEventUseCase } from '@/src/domains/events/use-cases/delete-event.use-case';
import {
  createEventController,
  getEventController,
  updateEventController,
  listEventsController,
  deleteEventController,
  myEventsController,
  getMyEventController,
} from '@/src/domains/events/controllers/event.controller';
import { MessagesRepository } from '@/src/domains/messages/repositories/messages.repository';
import { sendMessageUseCase } from '@/src/domains/messages/use-cases/send-message.use-case';
import { getThreadUseCase } from '@/src/domains/messages/use-cases/get-thread.use-case';
import {
  sendMessageController,
  getThreadController,
} from '@/src/domains/messages/controllers/message.controller';
import { NotificationsRepository } from '@/src/domains/notifications/repositories/notifications.repository';
import { listNotificationsUseCase } from '@/src/domains/notifications/use-cases/list-notifications.use-case';
import { createNotificationUseCase } from '@/src/domains/notifications/use-cases/create-notification.use-case';
import { markNotificationReadUseCase, markAllNotificationsReadUseCase } from '@/src/domains/notifications/use-cases/mark-read.use-case';
import { getNotificationSettingsUseCase } from '@/src/domains/notifications/use-cases/get-settings.use-case';
import { updateNotificationSettingsUseCase } from '@/src/domains/notifications/use-cases/update-settings.use-case';
import {
  listNotificationsController,
  markNotificationReadController,
  markAllNotificationsReadController,
  getNotificationSettingsController,
  updateNotificationSettingsController,
} from '@/src/domains/notifications/controllers/notification.controller';
import { ApplicationsRepository } from '@/src/domains/applications/repositories/applications.repository';
import { ScoringRulesRepository } from '@/src/domains/applications/repositories/scoring-rules.repository';
import { createApplicationUseCase } from '@/src/domains/applications/use-cases/create-application.use-case';
import { getApplicationUseCase } from '@/src/domains/applications/use-cases/get-application.use-case';
import { listEventApplicationsUseCase } from '@/src/domains/applications/use-cases/list-event-applications.use-case';
import { listMyApplicationsUseCase } from '@/src/domains/applications/use-cases/list-my-applications.use-case';
import { updateApplicationStatusUseCase } from '@/src/domains/applications/use-cases/update-application-status.use-case';
import { computeScoreUseCase } from '@/src/domains/applications/use-cases/compute-score.use-case';
import { createScoringRulesUseCase } from '@/src/domains/applications/use-cases/create-scoring-rules.use-case';
import {
  createApplicationController,
  getApplicationController,
  listEventApplicationsController,
  listMyApplicationsController,
  updateApplicationStatusController,
  listScoringRulesController,
  createScoringRulesController,
} from '@/src/domains/applications/controllers/application.controller';

const container = createContainer();

// --- Services ---
container.bind(DI_SYMBOLS.IAuthenticationService).toClass(AuthenticationService);

// --- Repositories ---
// Always use the real repositories with Drizzle/PostgreSQL.
container.bind(DI_SYMBOLS.IUsersRepository).toClass(UsersRepository);
container.bind(DI_SYMBOLS.IProfilesRepository).toClass(ProfilesRepository);
container.bind(DI_SYMBOLS.IProfileSocialLinksRepository).toClass(ProfileSocialLinksRepository);
container.bind(DI_SYMBOLS.ITagsRepository).toClass(TagsRepository);
container.bind(DI_SYMBOLS.IServiceContactsRepository).toClass(ServiceContactsRepository);
container.bind(DI_SYMBOLS.IStatusesRepository).toClass(StatusesRepository);
container.bind(DI_SYMBOLS.IContactRequestsRepository).toClass(ContactRequestsRepository);
container.bind(DI_SYMBOLS.IServicesRepository).toClass(ServicesRepository);
container.bind(DI_SYMBOLS.IServicePortfolioRepository).toClass(ServicePortfolioRepository);
container.bind(DI_SYMBOLS.IEventsRepository).toClass(EventsRepository);
container.bind(DI_SYMBOLS.IMessagesRepository).toClass(MessagesRepository);
container.bind(DI_SYMBOLS.INotificationsRepository).toClass(NotificationsRepository);
container.bind(DI_SYMBOLS.IApplicationsRepository).toClass(ApplicationsRepository);
container.bind(DI_SYMBOLS.IScoringRulesRepository).toClass(ScoringRulesRepository);

// --- Use Cases ---
container.bind(DI_SYMBOLS.IGetUserUseCase).toHigherOrderFunction(getUserUseCase, [
  DI_SYMBOLS.IUsersRepository,
]);
container.bind(DI_SYMBOLS.IDeleteUserUseCase).toHigherOrderFunction(deleteUserUseCase, [
  DI_SYMBOLS.IUsersRepository,
]);
container.bind(DI_SYMBOLS.IGetProfileUseCase).toHigherOrderFunction(getProfileUseCase, [
  DI_SYMBOLS.IProfilesRepository,
]);
container.bind(DI_SYMBOLS.IUpsertProfileUseCase).toHigherOrderFunction(upsertProfileUseCase, [
  DI_SYMBOLS.IProfilesRepository,
  DI_SYMBOLS.IProfileSocialLinksRepository,
  DI_SYMBOLS.ITagsRepository,
]);
container.bind(DI_SYMBOLS.ICreateContactRequestUseCase).toHigherOrderFunction(createContactRequestUseCase, [
  DI_SYMBOLS.IContactRequestsRepository,
  DI_SYMBOLS.IMessagesRepository,
  DI_SYMBOLS.ICreateNotificationUseCase,
  DI_SYMBOLS.INotificationsRepository,
  DI_SYMBOLS.IUsersRepository,
  DI_SYMBOLS.IServicesRepository,
  DI_SYMBOLS.IEventsRepository,
  DI_SYMBOLS.IProfilesRepository,
]);
container.bind(DI_SYMBOLS.IGetInboxUseCase).toHigherOrderFunction(getInboxUseCase, [
  DI_SYMBOLS.IContactRequestsRepository,
]);
container.bind(DI_SYMBOLS.IGetContactRequestDetailUseCase).toHigherOrderFunction(getContactRequestDetailUseCase, [
  DI_SYMBOLS.IContactRequestsRepository,
]);
container.bind(DI_SYMBOLS.IUpdateContactRequestStatusUseCase).toHigherOrderFunction(updateContactRequestStatusUseCase, [
  DI_SYMBOLS.IContactRequestsRepository,
]);
// Services use cases
container.bind(DI_SYMBOLS.ICreateServiceUseCase).toHigherOrderFunction(createServiceUseCase, [
  DI_SYMBOLS.IServicesRepository,
  DI_SYMBOLS.IServicePortfolioRepository,
  DI_SYMBOLS.IServiceContactsRepository,
  DI_SYMBOLS.IStatusesRepository,
]);
container.bind(DI_SYMBOLS.IGetServiceUseCase).toHigherOrderFunction(getServiceUseCase, [
  DI_SYMBOLS.IServicesRepository,
]);
container.bind(DI_SYMBOLS.IUpdateServiceUseCase).toHigherOrderFunction(updateServiceUseCase, [
  DI_SYMBOLS.IServicesRepository,
  DI_SYMBOLS.IServicePortfolioRepository,
  DI_SYMBOLS.IServiceContactsRepository,
  DI_SYMBOLS.IStatusesRepository,
]);
container.bind(DI_SYMBOLS.IListServicesUseCase).toHigherOrderFunction(listServicesUseCase, [
  DI_SYMBOLS.IServicesRepository,
]);
container.bind(DI_SYMBOLS.IDeleteServiceUseCase).toHigherOrderFunction(deleteServiceUseCase, [
  DI_SYMBOLS.IServicesRepository,
]);
// Events use cases
container.bind(DI_SYMBOLS.ICreateEventUseCase).toHigherOrderFunction(createEventUseCase, [
  DI_SYMBOLS.IEventsRepository,
  DI_SYMBOLS.IStatusesRepository,
]);
container.bind(DI_SYMBOLS.IGetEventUseCase).toHigherOrderFunction(getEventUseCase, [
  DI_SYMBOLS.IEventsRepository,
]);
container.bind(DI_SYMBOLS.IUpdateEventUseCase).toHigherOrderFunction(updateEventUseCase, [
  DI_SYMBOLS.IEventsRepository,
  DI_SYMBOLS.IStatusesRepository,
]);
container.bind(DI_SYMBOLS.IListEventsUseCase).toHigherOrderFunction(listEventsUseCase, [
  DI_SYMBOLS.IEventsRepository,
]);
container.bind(DI_SYMBOLS.IDeleteEventUseCase).toHigherOrderFunction(deleteEventUseCase, [
  DI_SYMBOLS.IEventsRepository,
]);
// Messages use cases
container.bind(DI_SYMBOLS.ISendMessageUseCase).toHigherOrderFunction(sendMessageUseCase, [
  DI_SYMBOLS.IMessagesRepository,
  DI_SYMBOLS.IContactRequestsRepository,
]);
container.bind(DI_SYMBOLS.IGetThreadUseCase).toHigherOrderFunction(getThreadUseCase, [
  DI_SYMBOLS.IMessagesRepository,
  DI_SYMBOLS.IContactRequestsRepository,
]);
// Notifications use cases
container.bind(DI_SYMBOLS.IListNotificationsUseCase).toHigherOrderFunction(listNotificationsUseCase, [
  DI_SYMBOLS.INotificationsRepository,
]);
container.bind(DI_SYMBOLS.ICreateNotificationUseCase).toHigherOrderFunction(createNotificationUseCase, [
  DI_SYMBOLS.INotificationsRepository,
]);
container.bind(DI_SYMBOLS.IMarkNotificationReadUseCase).toHigherOrderFunction(markNotificationReadUseCase, [
  DI_SYMBOLS.INotificationsRepository,
]);
container.bind(DI_SYMBOLS.IMarkAllNotificationsReadUseCase).toHigherOrderFunction(markAllNotificationsReadUseCase, [
  DI_SYMBOLS.INotificationsRepository,
]);
container.bind(DI_SYMBOLS.IGetNotificationSettingsUseCase).toHigherOrderFunction(getNotificationSettingsUseCase, [
  DI_SYMBOLS.INotificationsRepository,
]);
container.bind(DI_SYMBOLS.IUpdateNotificationSettingsUseCase).toHigherOrderFunction(updateNotificationSettingsUseCase, [
  DI_SYMBOLS.INotificationsRepository,
]);
// Applications use cases
container.bind(DI_SYMBOLS.ICreateApplicationUseCase).toHigherOrderFunction(createApplicationUseCase, [
  DI_SYMBOLS.IApplicationsRepository,
  DI_SYMBOLS.IEventsRepository,
  DI_SYMBOLS.IProfilesRepository,
  DI_SYMBOLS.INotificationsRepository,
  DI_SYMBOLS.ICreateNotificationUseCase,
  DI_SYMBOLS.IUsersRepository,
]);
container.bind(DI_SYMBOLS.IGetApplicationUseCase).toHigherOrderFunction(getApplicationUseCase, [
  DI_SYMBOLS.IApplicationsRepository,
  DI_SYMBOLS.IEventsRepository,
  DI_SYMBOLS.IProfilesRepository,
]);
container.bind(DI_SYMBOLS.IListEventApplicationsUseCase).toHigherOrderFunction(listEventApplicationsUseCase, [
  DI_SYMBOLS.IApplicationsRepository,
  DI_SYMBOLS.IEventsRepository,
  DI_SYMBOLS.IProfilesRepository,
]);
container.bind(DI_SYMBOLS.IListMyApplicationsUseCase).toHigherOrderFunction(listMyApplicationsUseCase, [
  DI_SYMBOLS.IApplicationsRepository,
  DI_SYMBOLS.IProfilesRepository,
]);
container.bind(DI_SYMBOLS.IUpdateApplicationStatusUseCase).toHigherOrderFunction(updateApplicationStatusUseCase, [
  DI_SYMBOLS.IApplicationsRepository,
  DI_SYMBOLS.IEventsRepository,
  DI_SYMBOLS.IProfilesRepository,
  DI_SYMBOLS.INotificationsRepository,
  DI_SYMBOLS.ICreateNotificationUseCase,
  DI_SYMBOLS.IUsersRepository,
]);
container.bind(DI_SYMBOLS.IComputeScoreUseCase).toHigherOrderFunction(computeScoreUseCase, [
  DI_SYMBOLS.IApplicationsRepository,
  DI_SYMBOLS.IScoringRulesRepository,
  DI_SYMBOLS.IProfilesRepository,
  DI_SYMBOLS.IUsersRepository,
  DI_SYMBOLS.IEventsRepository,
]);
container.bind(DI_SYMBOLS.ICreateScoringRulesUseCase).toHigherOrderFunction(createScoringRulesUseCase, [
  DI_SYMBOLS.IScoringRulesRepository,
  DI_SYMBOLS.IEventsRepository,
]);

// --- Controllers ---
container.bind(DI_SYMBOLS.IGetUserController).toHigherOrderFunction(getUserController, [
  DI_SYMBOLS.IGetUserUseCase,
]);
container.bind(DI_SYMBOLS.IDeleteUserController).toHigherOrderFunction(deleteUserController, [
  DI_SYMBOLS.IDeleteUserUseCase,
]);
container.bind(DI_SYMBOLS.IGetProfileController).toHigherOrderFunction(getProfileController, [
  DI_SYMBOLS.IGetProfileUseCase,
]);
container.bind(DI_SYMBOLS.IUpsertProfileController).toHigherOrderFunction(upsertProfileController, [
  DI_SYMBOLS.IUpsertProfileUseCase,
]);
container.bind(DI_SYMBOLS.ICreateContactRequestController).toHigherOrderFunction(createContactRequestController, [
  DI_SYMBOLS.ICreateContactRequestUseCase,
]);
container.bind(DI_SYMBOLS.IGetInboxController).toHigherOrderFunction(getInboxController, [
  DI_SYMBOLS.IGetInboxUseCase,
]);
container.bind(DI_SYMBOLS.IGetContactRequestDetailController).toHigherOrderFunction(getContactRequestDetailController, [
  DI_SYMBOLS.IGetContactRequestDetailUseCase,
]);
container.bind(DI_SYMBOLS.IUpdateContactRequestStatusController).toHigherOrderFunction(updateContactRequestStatusController, [
  DI_SYMBOLS.IUpdateContactRequestStatusUseCase,
]);
// Services controllers
container.bind(DI_SYMBOLS.ICreateServiceController).toHigherOrderFunction(createServiceController, [
  DI_SYMBOLS.ICreateServiceUseCase,
]);
container.bind(DI_SYMBOLS.IGetServiceController).toHigherOrderFunction(getServiceController, [
  DI_SYMBOLS.IGetServiceUseCase,
]);
container.bind(DI_SYMBOLS.IUpdateServiceController).toHigherOrderFunction(updateServiceController, [
  DI_SYMBOLS.IUpdateServiceUseCase,
]);
container.bind(DI_SYMBOLS.IListServicesController).toHigherOrderFunction(listServicesController, [
  DI_SYMBOLS.IListServicesUseCase,
]);
container.bind(DI_SYMBOLS.IDeleteServiceController).toHigherOrderFunction(deleteServiceController, [
  DI_SYMBOLS.IDeleteServiceUseCase,
]);
container.bind(DI_SYMBOLS.IAddPortfolioItemController).toHigherOrderFunction(addPortfolioItemController, [
  DI_SYMBOLS.IServicePortfolioRepository,
]);
container.bind(DI_SYMBOLS.IDeletePortfolioItemController).toHigherOrderFunction(deletePortfolioItemController, [
  DI_SYMBOLS.IServicePortfolioRepository,
]);
container.bind(DI_SYMBOLS.IMyServicesController).toHigherOrderFunction(myServicesController, [
  DI_SYMBOLS.IListServicesUseCase,
]);
// Events controllers
container.bind(DI_SYMBOLS.ICreateEventController).toHigherOrderFunction(createEventController, [
  DI_SYMBOLS.ICreateEventUseCase,
]);
container.bind(DI_SYMBOLS.IGetEventController).toHigherOrderFunction(getEventController, [
  DI_SYMBOLS.IGetEventUseCase,
]);
container.bind(DI_SYMBOLS.IUpdateEventController).toHigherOrderFunction(updateEventController, [
  DI_SYMBOLS.IUpdateEventUseCase,
]);
container.bind(DI_SYMBOLS.IListEventsController).toHigherOrderFunction(listEventsController, [
  DI_SYMBOLS.IListEventsUseCase,
]);
container.bind(DI_SYMBOLS.IDeleteEventController).toHigherOrderFunction(deleteEventController, [
  DI_SYMBOLS.IDeleteEventUseCase,
]);
container.bind(DI_SYMBOLS.IMyEventsController).toHigherOrderFunction(myEventsController, [
  DI_SYMBOLS.IListEventsUseCase,
]);
container.bind(DI_SYMBOLS.IGetMyEventController).toHigherOrderFunction(getMyEventController, [
  DI_SYMBOLS.IGetEventUseCase,
]);
// Messages controllers
container.bind(DI_SYMBOLS.ISendMessageController).toHigherOrderFunction(sendMessageController, [
  DI_SYMBOLS.ISendMessageUseCase,
]);
container.bind(DI_SYMBOLS.IGetThreadController).toHigherOrderFunction(getThreadController, [
  DI_SYMBOLS.IGetThreadUseCase,
]);
// Notifications controllers
container.bind(DI_SYMBOLS.IListNotificationsController).toHigherOrderFunction(listNotificationsController, [
  DI_SYMBOLS.IListNotificationsUseCase,
]);
container.bind(DI_SYMBOLS.IMarkNotificationReadController).toHigherOrderFunction(markNotificationReadController, [
  DI_SYMBOLS.IMarkNotificationReadUseCase,
]);
container.bind(DI_SYMBOLS.IMarkAllNotificationsReadController).toHigherOrderFunction(markAllNotificationsReadController, [
  DI_SYMBOLS.IMarkAllNotificationsReadUseCase,
]);
container.bind(DI_SYMBOLS.IGetNotificationSettingsController).toHigherOrderFunction(getNotificationSettingsController, [
  DI_SYMBOLS.IGetNotificationSettingsUseCase,
]);
container.bind(DI_SYMBOLS.IUpdateNotificationSettingsController).toHigherOrderFunction(updateNotificationSettingsController, [
  DI_SYMBOLS.IUpdateNotificationSettingsUseCase,
]);
// Applications controllers
container.bind(DI_SYMBOLS.ICreateApplicationController).toHigherOrderFunction(createApplicationController, [
  DI_SYMBOLS.ICreateApplicationUseCase,
  DI_SYMBOLS.IProfilesRepository,
]);
container.bind(DI_SYMBOLS.IGetApplicationController).toHigherOrderFunction(getApplicationController, [
  DI_SYMBOLS.IGetApplicationUseCase,
]);
container.bind(DI_SYMBOLS.IListEventApplicationsController).toHigherOrderFunction(listEventApplicationsController, [
  DI_SYMBOLS.IListEventApplicationsUseCase,
]);
container.bind(DI_SYMBOLS.IListMyApplicationsController).toHigherOrderFunction(listMyApplicationsController, [
  DI_SYMBOLS.IListMyApplicationsUseCase,
]);
container.bind(DI_SYMBOLS.IUpdateApplicationStatusController).toHigherOrderFunction(updateApplicationStatusController, [
  DI_SYMBOLS.IUpdateApplicationStatusUseCase,
]);
container.bind(DI_SYMBOLS.IListScoringRulesController).toHigherOrderFunction(listScoringRulesController, [
  DI_SYMBOLS.IScoringRulesRepository,
  DI_SYMBOLS.IEventsRepository,
]);
container.bind(DI_SYMBOLS.ICreateScoringRulesController).toHigherOrderFunction(createScoringRulesController, [
  DI_SYMBOLS.ICreateScoringRulesUseCase,
  DI_SYMBOLS.IProfilesRepository,
  DI_SYMBOLS.IEventsRepository,
]);

export function getInjection<K extends keyof DI_RETURN_TYPES>(symbol: K): DI_RETURN_TYPES[K] {
  return container.get(DI_SYMBOLS[symbol]) as DI_RETURN_TYPES[K];
}
