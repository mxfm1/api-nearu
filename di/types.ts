import type { IAuthenticationService } from '@/src/shared/services/interfaces';
import type { IUsersRepository } from '@/src/domains/users/repositories/users.repository.interface';
import type { IGetUserUseCase } from '@/src/domains/users/use-cases/get-user.use-case';
import type { IDeleteUserUseCase } from '@/src/domains/users/use-cases/delete-user.use-case';
import type { IGetUserController, IDeleteUserController } from '@/src/domains/users/controllers/users.controller';

export const DI_SYMBOLS = {
  IAuthenticationService: Symbol.for('IAuthenticationService'),
  IUsersRepository: Symbol.for('IUsersRepository'),
  IGetUserUseCase: Symbol.for('IGetUserUseCase'),
  IDeleteUserUseCase: Symbol.for('IDeleteUserUseCase'),
  IGetUserController: Symbol.for('IGetUserController'),
  IDeleteUserController: Symbol.for('IDeleteUserController'),
};

export interface DI_RETURN_TYPES {
  IAuthenticationService: IAuthenticationService;
  IUsersRepository: IUsersRepository;
  IGetUserUseCase: IGetUserUseCase;
  IDeleteUserUseCase: IDeleteUserUseCase;
  IGetUserController: IGetUserController;
  IDeleteUserController: IDeleteUserController;
}
