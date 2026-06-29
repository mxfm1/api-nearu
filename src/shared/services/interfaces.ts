import type { User } from '@/src/domains/users/entities/user.entity';

export interface IAuthenticationService {
  getSession(headers: { authorization?: string; cookie?: string }): Promise<{ user: User; session: { id: string; expiresAt: Date } } | null>;
}
