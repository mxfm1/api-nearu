import type { IAuthenticationService } from '@/src/shared/services/interfaces';
import type { IUsersRepository } from '@/src/domains/users/repositories/users.repository.interface';
import type { IGetUserUseCase } from '@/src/domains/users/use-cases/get-user.use-case';
import type { IDeleteUserUseCase } from '@/src/domains/users/use-cases/delete-user.use-case';
import type { IGetUserController, IDeleteUserController } from '@/src/domains/users/controllers/users.controller';
import type { IProfilesRepository } from '@/src/domains/profiles/repositories/profiles.repository.interface';
import type { IProfileSocialLinksRepository } from '@/src/domains/profiles/repositories/profile-social-links.repository.interface';
import type { IGetProfileUseCase } from '@/src/domains/profiles/use-cases/get-profile.use-case';
import type { IUpsertProfileUseCase } from '@/src/domains/profiles/use-cases/upsert-profile.use-case';
import type { IGetProfileController, IUpsertProfileController } from '@/src/domains/profiles/controllers/profile.controller';
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
import type { ICreateServiceController, IGetServiceController, IUpdateServiceController, IListServicesController, IDeleteServiceController, IAddPortfolioItemController, IDeletePortfolioItemController } from '@/src/domains/services/controllers/service.controller';
import type { IEventsRepository } from '@/src/domains/events/repositories/events.repository.interface';
import type { ICreateEventUseCase } from '@/src/domains/events/use-cases/create-event.use-case';
import type { IGetEventUseCase } from '@/src/domains/events/use-cases/get-event.use-case';
import type { IUpdateEventUseCase } from '@/src/domains/events/use-cases/update-event.use-case';
import type { IListEventsUseCase } from '@/src/domains/events/use-cases/list-events.use-case';
import type { IDeleteEventUseCase } from '@/src/domains/events/use-cases/delete-event.use-case';
import type { ICreateEventController, IGetEventController, IUpdateEventController, IListEventsController, IDeleteEventController } from '@/src/domains/events/controllers/event.controller';

export const DI_SYMBOLS = {
  IAuthenticationService: Symbol.for('IAuthenticationService'),
  IUsersRepository: Symbol.for('IUsersRepository'),
  IGetUserUseCase: Symbol.for('IGetUserUseCase'),
  IDeleteUserUseCase: Symbol.for('IDeleteUserUseCase'),
  IGetUserController: Symbol.for('IGetUserController'),
  IDeleteUserController: Symbol.for('IDeleteUserController'),
  IProfilesRepository: Symbol.for('IProfilesRepository'),
  IProfileSocialLinksRepository: Symbol.for('IProfileSocialLinksRepository'),
  IGetProfileUseCase: Symbol.for('IGetProfileUseCase'),
  IUpsertProfileUseCase: Symbol.for('IUpsertProfileUseCase'),
  IGetProfileController: Symbol.for('IGetProfileController'),
  IUpsertProfileController: Symbol.for('IUpsertProfileController'),
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
  IGetProfileUseCase: IGetProfileUseCase;
  IUpsertProfileUseCase: IUpsertProfileUseCase;
  IGetProfileController: IGetProfileController;
  IUpsertProfileController: IUpsertProfileController;
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
}
