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
}
