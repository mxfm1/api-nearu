import { eq } from 'drizzle-orm';
import { db } from '@/src/shared/database';
import { users } from '@/src/shared/database/schema';
import type { IUsersRepository } from './users.repository.interface';
import type { User } from '../entities/user.entity';

export class UsersRepository implements IUsersRepository {
  async findById(id: string): Promise<User | null> {
    try {
      const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
      return (result[0] as User) ?? null;
    } catch (error) {
      console.error('[UsersRepository.findById] Error:', error);
      throw error;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
      return (result[0] as User) ?? null;
    } catch (error) {
      console.error('[UsersRepository.findByEmail] Error:', error);
      throw error;
    }
  }

  async create(user: { name: string; email: string }): Promise<User> {
    try {
      const result = await db.insert(users).values({ id: crypto.randomUUID(), name: user.name, email: user.email }).returning();
      return result[0] as User;
    } catch (error) {
      console.error('[UsersRepository.create] Error:', error);
      throw error;
    }
  }

  async update(id: string, data: Partial<{ name: string; email: string }>): Promise<User> {
    try {
      const result = await db.update(users).set({ ...data, updatedAt: new Date() }).where(eq(users.id, id)).returning();
      return result[0] as User;
    } catch (error) {
      console.error('[UsersRepository.update] Error:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await db.delete(users).where(eq(users.id, id));
    } catch (error) {
      console.error('[UsersRepository.delete] Error:', error);
      throw error;
    }
  }
}
