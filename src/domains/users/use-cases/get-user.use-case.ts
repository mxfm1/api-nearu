import type { User } from '../entities/user.entity';
import type { IUsersRepository } from '../repositories/users.repository.interface';
import { NotFoundError } from '@/src/shared/errors/common';

export type IGetUserUseCase = ReturnType<typeof getUserUseCase>;

export const getUserUseCase =
  (usersRepository: IUsersRepository) =>
  async (userId: string): Promise<User> => {
    const user = await usersRepository.findById(userId);
    if (!user) throw new NotFoundError('User');
    return user;
  };
