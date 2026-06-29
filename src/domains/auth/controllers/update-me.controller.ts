import type { Request, Response, NextFunction } from 'express';
import { auth } from '@/src/shared/auth';
import { presentUser } from '@/src/domains/users/presenters/user.presenter';

function buildHeaders(req: Request): Headers {
  const headers = new Headers();
  if (req.headers.cookie) headers.set('cookie', req.headers.cookie as string);
  if (req.headers.authorization) headers.set('authorization', req.headers.authorization as string);
  return headers;
}

export function updateMeController() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, image } = req.body;

      if (name !== undefined && (typeof name !== 'string' || name.length < 2 || name.length > 100)) {
        res.status(400).json({
          success: false,
          error: { code: 'INPUT_PARSE_ERROR', message: 'Name must be between 2 and 100 characters' },
        });
        return;
      }

      await auth.api.updateUser({
        body: { name, image },
        headers: buildHeaders(req),
      });

      // Get the updated user from the session (re-fetch to get fresh data)
      const session = await auth.api.getSession({ headers: buildHeaders(req) });
      const user = session?.user ?? (req as any).user;

      res.json({ success: true, data: presentUser(user) });
    } catch (error) {
      next(error);
    }
  };
}
