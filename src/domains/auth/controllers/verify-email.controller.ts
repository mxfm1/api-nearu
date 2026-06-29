import type { Request, Response, NextFunction } from 'express';
import { auth } from '@/src/shared/auth';

export function verifyEmailController() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token } = req.body;

      if (!token) {
        res.status(400).json({
          success: false,
          error: { code: 'INPUT_PARSE_ERROR', message: 'Token is required' },
        });
        return;
      }

      // verifyEmail is a GET endpoint internally; we call it server-side with query param
      await auth.api.verifyEmail({ query: { token } });

      res.json({ success: true, data: { message: 'Email verified successfully' } });
    } catch (error: any) {
      // Any error from verifyEmail (invalid/expired token, user not found, etc.)
      // is a client error — return 400, not 500
      const message = error?.message || error?.body?.message || 'Invalid or expired token';
      res.status(400).json({
        success: false,
        error: { code: 'VERIFICATION_FAILED', message },
      });
    }
  };
}
