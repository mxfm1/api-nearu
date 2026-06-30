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

const container = createContainer();

// --- Services ---
container.bind(DI_SYMBOLS.IAuthenticationService).toClass(AuthenticationService);

// --- Repositories ---
// Always use the real UsersRepository with Drizzle/PostgreSQL.
// The mock was used for E2E tests to avoid DB dependency, but now that
// Better Auth handles user creation (auth.api.signUpEmail), the mock is
// never populated — Better Auth writes directly to the database via its
// own Drizzle adapter. E2E tests need the real DB to find users.
container.bind(DI_SYMBOLS.IUsersRepository).toClass(UsersRepository);
container.bind(DI_SYMBOLS.IProfilesRepository).toClass(ProfilesRepository);
container.bind(DI_SYMBOLS.IProfileSocialLinksRepository).toClass(ProfileSocialLinksRepository);

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

export function getInjection<K extends keyof DI_RETURN_TYPES>(symbol: K): DI_RETURN_TYPES[K] {
  return container.get(DI_SYMBOLS[symbol]) as DI_RETURN_TYPES[K];
}
