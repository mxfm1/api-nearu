import { createContainer } from '@evyweb/ioctopus';
import { DI_SYMBOLS } from './types';
import type { DI_RETURN_TYPES } from './types';
import { AuthenticationService } from '@/src/shared/services/implementations';
import { UsersRepository } from '@/src/domains/users/repositories/users.repository';
import { getUserUseCase } from '@/src/domains/users/use-cases/get-user.use-case';
import { deleteUserUseCase } from '@/src/domains/users/use-cases/delete-user.use-case';
import { getUserController, deleteUserController } from '@/src/domains/users/controllers/users.controller';

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

// --- Use Cases ---
container.bind(DI_SYMBOLS.IGetUserUseCase).toHigherOrderFunction(getUserUseCase, [
  DI_SYMBOLS.IUsersRepository,
]);
container.bind(DI_SYMBOLS.IDeleteUserUseCase).toHigherOrderFunction(deleteUserUseCase, [
  DI_SYMBOLS.IUsersRepository,
]);

// --- Controllers ---
container.bind(DI_SYMBOLS.IGetUserController).toHigherOrderFunction(getUserController, [
  DI_SYMBOLS.IGetUserUseCase,
]);
container.bind(DI_SYMBOLS.IDeleteUserController).toHigherOrderFunction(deleteUserController, [
  DI_SYMBOLS.IDeleteUserUseCase,
]);

export function getInjection<K extends keyof DI_RETURN_TYPES>(symbol: K): DI_RETURN_TYPES[K] {
  return container.get(DI_SYMBOLS[symbol]) as DI_RETURN_TYPES[K];
}
