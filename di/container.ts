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

const container = createContainer();

// --- Services ---
container.bind(DI_SYMBOLS.IAuthenticationService).toClass(AuthenticationService);

// --- Repositories ---
// Always use the real repositories with Drizzle/PostgreSQL.
container.bind(DI_SYMBOLS.IUsersRepository).toClass(UsersRepository);
container.bind(DI_SYMBOLS.IProfilesRepository).toClass(ProfilesRepository);
container.bind(DI_SYMBOLS.IProfileSocialLinksRepository).toClass(ProfileSocialLinksRepository);
container.bind(DI_SYMBOLS.IContactRequestsRepository).toClass(ContactRequestsRepository);
container.bind(DI_SYMBOLS.IServicesRepository).toClass(ServicesRepository);
container.bind(DI_SYMBOLS.IServicePortfolioRepository).toClass(ServicePortfolioRepository);
container.bind(DI_SYMBOLS.IEventsRepository).toClass(EventsRepository);

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
]);
container.bind(DI_SYMBOLS.ICreateContactRequestUseCase).toHigherOrderFunction(createContactRequestUseCase, [
  DI_SYMBOLS.IContactRequestsRepository,
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
]);
container.bind(DI_SYMBOLS.IGetServiceUseCase).toHigherOrderFunction(getServiceUseCase, [
  DI_SYMBOLS.IServicesRepository,
]);
container.bind(DI_SYMBOLS.IUpdateServiceUseCase).toHigherOrderFunction(updateServiceUseCase, [
  DI_SYMBOLS.IServicesRepository,
  DI_SYMBOLS.IServicePortfolioRepository,
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
]);
container.bind(DI_SYMBOLS.IGetEventUseCase).toHigherOrderFunction(getEventUseCase, [
  DI_SYMBOLS.IEventsRepository,
]);
container.bind(DI_SYMBOLS.IUpdateEventUseCase).toHigherOrderFunction(updateEventUseCase, [
  DI_SYMBOLS.IEventsRepository,
]);
container.bind(DI_SYMBOLS.IListEventsUseCase).toHigherOrderFunction(listEventsUseCase, [
  DI_SYMBOLS.IEventsRepository,
]);
container.bind(DI_SYMBOLS.IDeleteEventUseCase).toHigherOrderFunction(deleteEventUseCase, [
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

export function getInjection<K extends keyof DI_RETURN_TYPES>(symbol: K): DI_RETURN_TYPES[K] {
  return container.get(DI_SYMBOLS[symbol]) as DI_RETURN_TYPES[K];
}
