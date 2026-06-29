import type { Request, Response, NextFunction } from 'express';
import type { IAuthenticationService } from '../services/interfaces';
import { UnauthenticatedError } from '../errors/auth';

export function createAuthMiddleware(authenticationService: IAuthenticationService) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const session = await authenticationService.getSession({
        authorization: req.headers.authorization,
        cookie: req.headers.cookie,
      });
      if (!session) throw new UnauthenticatedError();
      (req as any).user = session.user;
      (req as any).session = session.session;
      next();
    } catch (error) {
      next(error);
    }
  };
}
