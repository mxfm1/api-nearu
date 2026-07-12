import type { Request, Response, NextFunction } from 'express';
import { auth } from '@/src/shared/auth';

function buildHeaders(req: Request): Headers {
  const headers = new Headers();
  if (req.headers.cookie) headers.set('cookie', req.headers.cookie as string);
  if (req.headers.authorization) headers.set('authorization', req.headers.authorization as string);
  return headers;
}

export function changePasswordController() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        res.status(400).json({ success: false, errorCode: 'INPUT_PARSE_ERROR' });
        return;
      }

      if (typeof newPassword !== 'string' || newPassword.length < 8) {
        res.status(400).json({ success: false, errorCode: 'INPUT_PARSE_ERROR' });
        return;
      }

      await auth.api.changePassword({
        body: { currentPassword, newPassword },
        headers: buildHeaders(req),
      });

      res.json({ success: true, data: { message: 'Password changed successfully' } });
    } catch (error) {
      next(error);
    }
  };
}
