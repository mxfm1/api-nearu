import type { Request, Response, NextFunction } from 'express';
import { auth } from '@/src/shared/auth';

export function verifyEmailController() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token } = req.body;

      if (!token) {
        res.status(400).json({ success: false, errorCode: 'INPUT_PARSE_ERROR' });
        return;
      }

      // verifyEmail is a GET endpoint internally; we call it server-side with query param
      await auth.api.verifyEmail({ query: { token } });

      res.json({ success: true, data: { message: 'Email verified successfully' } });
    } catch (error: any) {
      // Any error from verifyEmail (invalid/expired token, user not found, etc.)
      // is a client error — return 400, not 500
      res.status(400).json({ success: false, errorCode: 'VERIFICATION_FAILED' });
    }
  };
}
