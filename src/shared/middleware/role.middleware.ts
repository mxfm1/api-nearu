import type { NextFunction, Request, Response } from 'express';
import { ForbiddenError } from '../errors/common';

export function requireRole(...roles: Array<'user' | 'admin'>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user || !roles.includes(user.role)) {
      return next(new ForbiddenError('No tienes permisos para realizar esta acción.'));
    }
    next();
  };
}
