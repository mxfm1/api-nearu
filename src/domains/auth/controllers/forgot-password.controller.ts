import type { Request, Response, NextFunction } from 'express';
import { auth } from '@/src/shared/auth';

export function forgotPasswordController() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({ success: false, errorCode: 'INPUT_PARSE_ERROR' });
        return;
      }

      // The sendResetPassword callback will handle building the frontend URL
      // with the token extracted from Better Auth's generated reset link.
      // redirectTo is handled there, no need to pass it to Better Auth.
      await auth.api.requestPasswordReset({
        body: { email },
      });

      res.json({
        success: true,
        data: { message: 'If the email exists, a password reset link has been sent' },
      });
    } catch (error) {
      next(error);
    }
  };
}
