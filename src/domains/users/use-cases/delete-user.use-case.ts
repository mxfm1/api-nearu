import type { IUsersRepository } from '../repositories/users.repository.interface';
import { NotFoundError } from '@/src/shared/errors/common';

export type IDeleteUserUseCase = ReturnType<typeof deleteUserUseCase>;

export const deleteUserUseCase =
  (usersRepository: IUsersRepository) =>
  async (userId: string): Promise<void> => {
    const user = await usersRepository.findById(userId);
    if (!user) throw new NotFoundError('User');
    await usersRepository.delete(userId);
  };
