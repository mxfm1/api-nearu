import type { Request, Response, NextFunction } from 'express';
import { auth } from '@/src/shared/auth';

function buildHeaders(req: Request): Headers {
  const headers = new Headers();
  if (req.headers.cookie) headers.set('cookie', req.headers.cookie as string);
  if (req.headers.authorization) headers.set('authorization', req.headers.authorization as string);
  return headers;
}

export function changeEmailController() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { newEmail } = req.body;

      if (!newEmail) {
        res.status(400).json({ success: false, errorCode: 'INPUT_PARSE_ERROR' });
        return;
      }

      const result = await auth.api.changeEmail({
        body: { newEmail },
        headers: buildHeaders(req),
      });

      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };
}
