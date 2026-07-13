import type { IAuthenticationService } from '@/src/shared/services/interfaces';
import type { IUsersRepository } from '@/src/domains/users/repositories/users.repository.interface';
import type { IGetUserUseCase } from '@/src/domains/users/use-cases/get-user.use-case';
import type { IDeleteUserUseCase } from '@/src/domains/users/use-cases/delete-user.use-case';
import type { IGetUserController, IDeleteUserController } from '@/src/domains/users/controllers/users.controller';
import type { IProfilesRepository } from '@/src/domains/profiles/repositories/profiles.repository.interface';
import type { IProfileSocialLinksRepository } from '@/src/domains/profiles/repositories/profile-social-links.repository.interface';
import type { ITagsRepository } from '@/src/domains/profiles/repositories/tags.repository.interface';
import type { IServiceContactsRepository } from '@/src/domains/services/repositories/service-contacts.repository.interface';
import type { IGetProfileUseCase } from '@/src/domains/profiles/use-cases/get-profile.use-case';
import type { IUpsertProfileUseCase } from '@/src/domains/profiles/use-cases/upsert-profile.use-case';
import type { IGetProfileController, IUpsertProfileController } from '@/src/domains/profiles/controllers/profile.controller';
import type { IStatusesRepository } from '@/src/domains/statuses/repositories/statuses.repository.interface';
import type { IContactRequestsRepository } from '@/src/domains/contact-requests/repositories/contact-requests.repository.interface';
import type { ICreateContactRequestUseCase } from '@/src/domains/contact-requests/use-cases/create-contact-request.use-case';
import type { IGetInboxUseCase } from '@/src/domains/contact-requests/use-cases/get-inbox.use-case';
import type { IGetContactRequestDetailUseCase } from '@/src/domains/contact-requests/use-cases/get-contact-request-detail.use-case';
import type { IUpdateContactRequestStatusUseCase } from '@/src/domains/contact-requests/use-cases/update-contact-request-status.use-case';
import type { ICreateContactRequestController, IGetInboxController, IGetContactRequestDetailController, IUpdateContactRequestStatusController } from '@/src/domains/contact-requests/controllers/contact-request.controller';
import type { IServicesRepository } from '@/src/domains/services/repositories/services.repository.interface';
import type { IServicePortfolioRepository } from '@/src/domains/services/repositories/service-portfolio.repository.interface';
import type { ICreateServiceUseCase } from '@/src/domains/services/use-cases/create-service.use-case';
import type { IGetServiceUseCase } from '@/src/domains/services/use-cases/get-service.use-case';
import type { IUpdateServiceUseCase } from '@/src/domains/services/use-cases/update-service.use-case';
import type { IListServicesUseCase } from '@/src/domains/services/use-cases/list-services.use-case';
import type { IDeleteServiceUseCase } from '@/src/domains/services/use-cases/delete-service.use-case';
import type { ICreateServiceController, IGetServiceController, IUpdateServiceController, IListServicesController, IDeleteServiceController, IAddPortfolioItemController, IDeletePortfolioItemController, IMyServicesController } from '@/src/domains/services/controllers/service.controller';
import type { IEventsRepository } from '@/src/domains/events/repositories/events.repository.interface';
import type { ICreateEventUseCase } from '@/src/domains/events/use-cases/create-event.use-case';
import type { IGetEventUseCase } from '@/src/domains/events/use-cases/get-event.use-case';
import type { IUpdateEventUseCase } from '@/src/domains/events/use-cases/update-event.use-case';
import type { IListEventsUseCase } from '@/src/domains/events/use-cases/list-events.use-case';
import type { IDeleteEventUseCase } from '@/src/domains/events/use-cases/delete-event.use-case';
import type { ICreateEventController, IGetEventController, IUpdateEventController, IListEventsController, IDeleteEventController, IMyEventsController, IGetMyEventController } from '@/src/domains/events/controllers/event.controller';
import type { IMessagesRepository } from '@/src/domains/messages/repositories/messages.repository.interface';
import type { ISendMessageUseCase } from '@/src/domains/messages/use-cases/send-message.use-case';
import type { IGetThreadUseCase } from '@/src/domains/messages/use-cases/get-thread.use-case';
import type { ISendMessageController, IGetThreadController } from '@/src/domains/messages/controllers/message.controller';
import type { INotificationsRepository } from '@/src/domains/notifications/repositories/notifications.repository.interface';
import type { IListNotificationsUseCase } from '@/src/domains/notifications/use-cases/list-notifications.use-case';
import type { ICreateNotificationUseCase } from '@/src/domains/notifications/use-cases/create-notification.use-case';
import type { IMarkNotificationReadUseCase, IMarkAllNotificationsReadUseCase } from '@/src/domains/notifications/use-cases/mark-read.use-case';
import type { IGetNotificationSettingsUseCase } from '@/src/domains/notifications/use-cases/get-settings.use-case';
import type { IUpdateNotificationSettingsUseCase } from '@/src/domains/notifications/use-cases/update-settings.use-case';
import type { IListNotificationsController, IMarkNotificationReadController, IMarkAllNotificationsReadController, IGetNotificationSettingsController, IUpdateNotificationSettingsController } from '@/src/domains/notifications/controllers/notification.controller';
import type { IApplicationsRepository } from '@/src/domains/applications/repositories/applications.repository.interface';
import type { IScoringRulesRepository } from '@/src/domains/applications/repositories/scoring-rules.repository.interface';
import type { ICreateApplicationUseCase } from '@/src/domains/applications/use-cases/create-application.use-case';
import type { IGetApplicationUseCase } from '@/src/domains/applications/use-cases/get-application.use-case';
import type { IThreadsRepository } from '@/src/domains/threads/repositories/threads.repository.interface';
import type { ICreateThreadUseCase } from '@/src/domains/threads/use-cases/create-thread.use-case';
import type { IListEventApplicationsUseCase } from '@/src/domains/applications/use-cases/list-event-applications.use-case';
import type { IListEventApplicationsWithScoreUseCase } from '@/src/domains/applications/use-cases/list-event-applications-with-score.use-case';
import type { IListMyApplicationsUseCase } from '@/src/domains/applications/use-cases/list-my-applications.use-case';
import type { IGetMyApplicationByEventUseCase } from '@/src/domains/applications/use-cases/get-my-application-by-event.use-case';
import type { IUpdateApplicationStatusUseCase } from '@/src/domains/applications/use-cases/update-application-status.use-case';
import type { IComputeScoreUseCase } from '@/src/domains/applications/use-cases/compute-score.use-case';
import type { ICreateScoringRulesUseCase } from '@/src/domains/applications/use-cases/create-scoring-rules.use-case';
import type { ICreateThreadUseCase } from '@/src/domains/threads/use-cases/create-thread.use-case';
import type { IGetThreadUseCase } from '@/src/domains/threads/use-cases/get-thread.use-case';
import type { IGetThreadMessagesUseCase } from '@/src/domains/threads/use-cases/get-thread-messages.use-case';
import type { ISendMessageUseCase } from '@/src/domains/threads/use-cases/send-message.use-case';
import type { ICloseThreadUseCase } from '@/src/domains/threads/use-cases/close-thread.use-case';
import type { IListThreadsUseCase } from '@/src/domains/threads/use-cases/list-threads.use-case';
import type { IGetThreadByApplicationUseCase } from '@/src/domains/threads/use-cases/get-thread-by-application.use-case';
import type { ICreateApplicationController, IGetApplicationController, IListEventApplicationsController, IListEventApplicationsWithScoreController, IListMyApplicationsController, IGetMyApplicationByEventController, IUpdateApplicationStatusController, IListScoringRulesController, ICreateScoringRulesController } from '@/src/domains/applications/controllers/application.controller';
import type { IThreadsGetThreadController, IThreadsGetMessagesController, IThreadsSendMessageController, IThreadsCloseThreadController, IThreadsListController, IThreadsGetByApplicationController } from '@/src/domains/threads/controllers/thread.controller.interface';

export const DI_SYMBOLS = {
  IAuthenticationService: Symbol.for('IAuthenticationService'),
  IUsersRepository: Symbol.for('IUsersRepository'),
  IGetUserUseCase: Symbol.for('IGetUserUseCase'),
  IDeleteUserUseCase: Symbol.for('IDeleteUserUseCase'),
  IGetUserController: Symbol.for('IGetUserController'),
  IDeleteUserController: Symbol.for('IDeleteUserController'),
  IProfilesRepository: Symbol.for('IProfilesRepository'),
  IProfileSocialLinksRepository: Symbol.for('IProfileSocialLinksRepository'),
  ITagsRepository: Symbol.for('ITagsRepository'),
  IServiceContactsRepository: Symbol.for('IServiceContactsRepository'),
  IGetProfileUseCase: Symbol.for('IGetProfileUseCase'),
  IUpsertProfileUseCase: Symbol.for('IUpsertProfileUseCase'),
  IGetProfileController: Symbol.for('IGetProfileController'),
  IUpsertProfileController: Symbol.for('IUpsertProfileController'),
  IStatusesRepository: Symbol.for('IStatusesRepository'),
  IContactRequestsRepository: Symbol.for('IContactRequestsRepository'),
  ICreateContactRequestUseCase: Symbol.for('ICreateContactRequestUseCase'),
  IGetInboxUseCase: Symbol.for('IGetInboxUseCase'),
  IGetContactRequestDetailUseCase: Symbol.for('IGetContactRequestDetailUseCase'),
  IUpdateContactRequestStatusUseCase: Symbol.for('IUpdateContactRequestStatusUseCase'),
  ICreateContactRequestController: Symbol.for('ICreateContactRequestController'),
  IGetInboxController: Symbol.for('IGetInboxController'),
  IGetContactRequestDetailController: Symbol.for('IGetContactRequestDetailController'),
  IUpdateContactRequestStatusController: Symbol.for('IUpdateContactRequestStatusController'),
  // Services
  IServicesRepository: Symbol.for('IServicesRepository'),
  IServicePortfolioRepository: Symbol.for('IServicePortfolioRepository'),
  ICreateServiceUseCase: Symbol.for('ICreateServiceUseCase'),
  IGetServiceUseCase: Symbol.for('IGetServiceUseCase'),
  IUpdateServiceUseCase: Symbol.for('IUpdateServiceUseCase'),
  IListServicesUseCase: Symbol.for('IListServicesUseCase'),
  IDeleteServiceUseCase: Symbol.for('IDeleteServiceUseCase'),
  ICreateServiceController: Symbol.for('ICreateServiceController'),
  IGetServiceController: Symbol.for('IGetServiceController'),
  IUpdateServiceController: Symbol.for('IUpdateServiceController'),
  IListServicesController: Symbol.for('IListServicesController'),
  IDeleteServiceController: Symbol.for('IDeleteServiceController'),
  IAddPortfolioItemController: Symbol.for('IAddPortfolioItemController'),
  IDeletePortfolioItemController: Symbol.for('IDeletePortfolioItemController'),
  IMyServicesController: Symbol.for('IMyServicesController'),
  // Events
  IEventsRepository: Symbol.for('IEventsRepository'),
  ICreateEventUseCase: Symbol.for('ICreateEventUseCase'),
  IGetEventUseCase: Symbol.for('IGetEventUseCase'),
  IUpdateEventUseCase: Symbol.for('IUpdateEventUseCase'),
  IListEventsUseCase: Symbol.for('IListEventsUseCase'),
  IDeleteEventUseCase: Symbol.for('IDeleteEventUseCase'),
  ICreateEventController: Symbol.for('ICreateEventController'),
  IGetEventController: Symbol.for('IGetEventController'),
  IUpdateEventController: Symbol.for('IUpdateEventController'),
  IListEventsController: Symbol.for('IListEventsController'),
  IDeleteEventController: Symbol.for('IDeleteEventController'),
  IMyEventsController: Symbol.for('IMyEventsController'),
  IGetMyEventController: Symbol.for('IGetMyEventController'),
  // Messages
  IMessagesRepository: Symbol.for('IMessagesRepository'),
  ISendMessageUseCase: Symbol.for('ISendMessageUseCase'),
  IGetThreadUseCase: Symbol.for('IGetThreadUseCase'),
  ISendMessageController: Symbol.for('ISendMessageController'),
  IGetThreadController: Symbol.for('IGetThreadController'),
  // Notifications
  INotificationsRepository: Symbol.for('INotificationsRepository'),
  IListNotificationsUseCase: Symbol.for('IListNotificationsUseCase'),
  ICreateNotificationUseCase: Symbol.for('ICreateNotificationUseCase'),
  IMarkNotificationReadUseCase: Symbol.for('IMarkNotificationReadUseCase'),
  IMarkAllNotificationsReadUseCase: Symbol.for('IMarkAllNotificationsReadUseCase'),
  IGetNotificationSettingsUseCase: Symbol.for('IGetNotificationSettingsUseCase'),
  IUpdateNotificationSettingsUseCase: Symbol.for('IUpdateNotificationSettingsUseCase'),
  IListNotificationsController: Symbol.for('IListNotificationsController'),
  IMarkNotificationReadController: Symbol.for('IMarkNotificationReadController'),
  IMarkAllNotificationsReadController: Symbol.for('IMarkAllNotificationsReadController'),
  IGetNotificationSettingsController: Symbol.for('IGetNotificationSettingsController'),
  IUpdateNotificationSettingsController: Symbol.for('IUpdateNotificationSettingsController'),
  // Applications
  IApplicationsRepository: Symbol.for('IApplicationsRepository'),
  IScoringRulesRepository: Symbol.for('IScoringRulesRepository'),
  ICreateApplicationUseCase: Symbol.for('ICreateApplicationUseCase'),
  IGetApplicationUseCase: Symbol.for('IGetApplicationUseCase'),
  IListEventApplicationsUseCase: Symbol.for('IListEventApplicationsUseCase'),
  IListEventApplicationsWithScoreUseCase: Symbol.for('IListEventApplicationsWithScoreUseCase'),
  IListMyApplicationsUseCase: Symbol.for('IListMyApplicationsUseCase'),
  IGetMyApplicationByEventUseCase: Symbol.for('IGetMyApplicationByEventUseCase'),
  IUpdateApplicationStatusUseCase: Symbol.for('IUpdateApplicationStatusUseCase'),
  // Threads
  IThreadsRepository: Symbol.for('IThreadsRepository'),
  ICreateThreadUseCase: Symbol.for('ICreateThreadUseCase'),
  IThreadsGetThreadUseCase: Symbol.for('IThreadsGetThreadUseCase'),
  IThreadsGetMessagesUseCase: Symbol.for('IThreadsGetMessagesUseCase'),
  IThreadsSendMessageUseCase: Symbol.for('IThreadsSendMessageUseCase'),
  IThreadsCloseThreadUseCase: Symbol.for('ICloseThreadUseCase'),
  IThreadsGetThreadController: Symbol.for('IThreadsGetThreadController'),
  IThreadsGetMessagesController: Symbol.for('IThreadsGetMessagesController'),
  IThreadsSendMessageController: Symbol.for('IThreadsSendMessageController'),
  IThreadsCloseThreadController: Symbol.for('IThreadsCloseThreadController'),
  IListThreadsUseCase: Symbol.for('IListThreadsUseCase'),
  IThreadsListController: Symbol.for('IThreadsListController'),
  IGetThreadByApplicationUseCase: Symbol.for('IGetThreadByApplicationUseCase'),
  IThreadsGetByApplicationController: Symbol.for('IThreadsGetByApplicationController'),
  IComputeScoreUseCase: Symbol.for('IComputeScoreUseCase'),
  ICreateScoringRulesUseCase: Symbol.for('ICreateScoringRulesUseCase'),
  ICreateApplicationController: Symbol.for('ICreateApplicationController'),
  IGetApplicationController: Symbol.for('IGetApplicationController'),
  IListEventApplicationsController: Symbol.for('IListEventApplicationsController'),
  IListEventApplicationsWithScoreController: Symbol.for('IListEventApplicationsWithScoreController'),
  IListMyApplicationsController: Symbol.for('IListMyApplicationsController'),
  IGetMyApplicationByEventController: Symbol.for('IGetMyApplicationByEventController'),
  IUpdateApplicationStatusController: Symbol.for('IUpdateApplicationStatusController'),
  IListScoringRulesController: Symbol.for('IListScoringRulesController'),
  ICreateScoringRulesController: Symbol.for('ICreateScoringRulesController'),
};

export interface DI_RETURN_TYPES {
  IAuthenticationService: IAuthenticationService;
  IUsersRepository: IUsersRepository;
  IGetUserUseCase: IGetUserUseCase;
  IDeleteUserUseCase: IDeleteUserUseCase;
  IGetUserController: IGetUserController;
  IDeleteUserController: IDeleteUserController;
  IProfilesRepository: IProfilesRepository;
  IProfileSocialLinksRepository: IProfileSocialLinksRepository;
  ITagsRepository: ITagsRepository;
  IServiceContactsRepository: IServiceContactsRepository;
  IGetProfileUseCase: IGetProfileUseCase;
  IUpsertProfileUseCase: IUpsertProfileUseCase;
  IGetProfileController: IGetProfileController;
  IUpsertProfileController: IUpsertProfileController;
  IStatusesRepository: IStatusesRepository;
  IContactRequestsRepository: IContactRequestsRepository;
  ICreateContactRequestUseCase: ICreateContactRequestUseCase;
  IGetInboxUseCase: IGetInboxUseCase;
  IGetContactRequestDetailUseCase: IGetContactRequestDetailUseCase;
  IUpdateContactRequestStatusUseCase: IUpdateContactRequestStatusUseCase;
  ICreateContactRequestController: ICreateContactRequestController;
  IGetInboxController: IGetInboxController;
  IGetContactRequestDetailController: IGetContactRequestDetailController;
  IUpdateContactRequestStatusController: IUpdateContactRequestStatusController;
  // Services
  IServicesRepository: IServicesRepository;
  IServicePortfolioRepository: IServicePortfolioRepository;
  ICreateServiceUseCase: ICreateServiceUseCase;
  IGetServiceUseCase: IGetServiceUseCase;
  IUpdateServiceUseCase: IUpdateServiceUseCase;
  IListServicesUseCase: IListServicesUseCase;
  IDeleteServiceUseCase: IDeleteServiceUseCase;
  ICreateServiceController: ICreateServiceController;
  IGetServiceController: IGetServiceController;
  IUpdateServiceController: IUpdateServiceController;
  IListServicesController: IListServicesController;
  IDeleteServiceController: IDeleteServiceController;
  IAddPortfolioItemController: IAddPortfolioItemController;
  IDeletePortfolioItemController: IDeletePortfolioItemController;
  IMyServicesController: IMyServicesController;
  // Events
  IEventsRepository: IEventsRepository;
  ICreateEventUseCase: ICreateEventUseCase;
  IGetEventUseCase: IGetEventUseCase;
  IUpdateEventUseCase: IUpdateEventUseCase;
  IListEventsUseCase: IListEventsUseCase;
  IDeleteEventUseCase: IDeleteEventUseCase;
  ICreateEventController: ICreateEventController;
  IGetEventController: IGetEventController;
  IUpdateEventController: IUpdateEventController;
  IListEventsController: IListEventsController;
  IDeleteEventController: IDeleteEventController;
  IMyEventsController: IMyEventsController;
  IGetMyEventController: IGetMyEventController;
  // Messages
  IMessagesRepository: IMessagesRepository;
  ISendMessageUseCase: ISendMessageUseCase;
  IGetThreadUseCase: IGetThreadUseCase;
  ISendMessageController: ISendMessageController;
  IGetThreadController: IGetThreadController;
  // Notifications
  INotificationsRepository: INotificationsRepository;
  IListNotificationsUseCase: IListNotificationsUseCase;
  ICreateNotificationUseCase: ICreateNotificationUseCase;
  IMarkNotificationReadUseCase: IMarkNotificationReadUseCase;
  IMarkAllNotificationsReadUseCase: IMarkAllNotificationsReadUseCase;
  IGetNotificationSettingsUseCase: IGetNotificationSettingsUseCase;
  IUpdateNotificationSettingsUseCase: IUpdateNotificationSettingsUseCase;
  IListNotificationsController: IListNotificationsController;
  IMarkNotificationReadController: IMarkNotificationReadController;
  IMarkAllNotificationsReadController: IMarkAllNotificationsReadController;
  IGetNotificationSettingsController: IGetNotificationSettingsController;
  IUpdateNotificationSettingsController: IUpdateNotificationSettingsController;
  // Applications
  IApplicationsRepository: IApplicationsRepository;
  IScoringRulesRepository: IScoringRulesRepository;
  ICreateApplicationUseCase: ICreateApplicationUseCase;
  IGetApplicationUseCase: IGetApplicationUseCase;
  IListEventApplicationsUseCase: IListEventApplicationsUseCase;
  IListEventApplicationsWithScoreUseCase: IListEventApplicationsWithScoreUseCase;
  IListMyApplicationsUseCase: IListMyApplicationsUseCase;
  IGetMyApplicationByEventUseCase: IGetMyApplicationByEventUseCase;
  IUpdateApplicationStatusUseCase: IUpdateApplicationStatusUseCase;
  // Threads
  IThreadsRepository: IThreadsRepository;
  ICreateThreadUseCase: ICreateThreadUseCase;
  IThreadsGetThreadUseCase: IThreadsGetThreadUseCase;
  IThreadsGetMessagesUseCase: IThreadsGetMessagesUseCase;
  IThreadsSendMessageUseCase: ISendMessageUseCase;
  IThreadsCloseThreadUseCase: ICloseThreadUseCase;
  IThreadsGetThreadController: IThreadsGetThreadController;
  IThreadsGetMessagesController: IThreadsGetMessagesController;
  IThreadsSendMessageController: IThreadsSendMessageController;
  IThreadsCloseThreadController: IThreadsCloseThreadController;
  IListThreadsUseCase: IListThreadsUseCase;
  IThreadsListController: IThreadsListController;
  IGetThreadByApplicationUseCase: IGetThreadByApplicationUseCase;
  IThreadsGetByApplicationController: IThreadsGetByApplicationController;
  IComputeScoreUseCase: IComputeScoreUseCase;
  ICreateScoringRulesUseCase: ICreateScoringRulesUseCase;
  ICreateApplicationController: ICreateApplicationController;
  IGetApplicationController: IGetApplicationController;
  IListEventApplicationsController: IListEventApplicationsController;
  IListEventApplicationsWithScoreController: IListEventApplicationsWithScoreController;
  IListMyApplicationsController: IListMyApplicationsController;
  IGetMyApplicationByEventController: IGetMyApplicationByEventController;
  IUpdateApplicationStatusController: IUpdateApplicationStatusController;
  IListScoringRulesController: IListScoringRulesController;
  ICreateScoringRulesController: ICreateScoringRulesController;
}
