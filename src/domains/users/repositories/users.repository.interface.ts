import type { User } from '../entities/user.entity';

export interface IUsersRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(user: { name: string; email: string }): Promise<User>;
  update(id: string, data: Partial<{ name: string; email: string }>): Promise<User>;
  delete(id: string): Promise<void>;
}
