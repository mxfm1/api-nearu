import type { IAuthenticationService } from './interfaces';
import { auth } from '@/src/shared/auth';
import type { User } from '@/src/domains/users/entities/user.entity';

export class AuthenticationService implements IAuthenticationService {
  async getSession(headers: { authorization?: string; cookie?: string }): Promise<{ user: User; session: { id: string; expiresAt: Date } } | null> {
    try {
      const entries: [string, string][] = [];
      if (headers.authorization) entries.push(['authorization', headers.authorization]);
      if (headers.cookie) entries.push(['cookie', headers.cookie]);

      const session = await auth.api.getSession({ headers: new Headers(entries) });
      if (!session) return null;

      return {
        user: {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          emailVerified: session.user.emailVerified,
          image: session.user.image ?? null,
          createdAt: session.user.createdAt,
          updatedAt: session.user.updatedAt,
        },
        session: { id: session.session.id, expiresAt: session.session.expiresAt },
      };
    } catch {
      return null;
    }
  }
}
