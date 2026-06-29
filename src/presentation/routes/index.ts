import { Router } from 'express';
import { toNodeHandler } from 'better-auth/node';
import { auth } from '@/src/shared/auth';
import { getInjection } from '@di/container';
import { validate } from '@/src/shared/middleware/validate.middleware';
import { createUserSchema, deleteUserSchema } from '@/src/domains/users/validators/user.validator';
import { createAuthMiddleware } from '@/src/shared/middleware/auth.middleware';
import { getMeController } from '@/src/domains/auth/controllers/me.controller';
import { updateMeController } from '@/src/domains/auth/controllers/update-me.controller';
import { changePasswordController } from '@/src/domains/auth/controllers/change-password.controller';
import { changeEmailController } from '@/src/domains/auth/controllers/change-email.controller';
import { forgotPasswordController } from '@/src/domains/auth/controllers/forgot-password.controller';
import { verifyEmailController } from '@/src/domains/auth/controllers/verify-email.controller';
import { createUserController } from '@/src/domains/users/controllers/users.controller';

export function createRouter() {
  const router = Router();

  // Health
  router.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Users: public
  router.get('/api/users/:id', getInjection('IGetUserController'));
  router.post('/api/users', validate(createUserSchema), createUserController());

  // Auth middleware (used by custom protected routes)
  const authMiddleware = createAuthMiddleware(getInjection('IAuthenticationService'));

  // ──────────────────────────────────────────────
  // CUSTOM AUTH ROUTES (before Better Auth catch-all)
  // ──────────────────────────────────────────────
  // Protected
  router.get('/api/auth/me', authMiddleware, getMeController());
  router.patch('/api/users/me', authMiddleware, updateMeController());
  router.post('/api/auth/change-password', authMiddleware, changePasswordController());
  router.post('/api/auth/change-email', authMiddleware, changeEmailController());
  router.delete('/api/users/:id', authMiddleware, validate(deleteUserSchema), getInjection('IDeleteUserController'));

  // Public (supplement Better Auth's internal routes)
  router.post('/api/auth/forgot-password', forgotPasswordController());
  router.post('/api/auth/verify-email', verifyEmailController());

  // ──────────────────────────────────────────────
  // BETTER AUTH — catches everything else under /api/auth/*
  //   POST /api/auth/sign-up/email          → register
  //   POST /api/auth/sign-in/email          → login
  //   POST /api/auth/sign-out               → logout
  //   POST /api/auth/reset-password         → reset password with token
  //   POST /api/auth/send-verification-email → resend verification email
  //   GET  /api/auth/sign-in/google         → Google OAuth
  //   GET  /api/auth/callback/google        → Google OAuth callback
  // ──────────────────────────────────────────────
  router.all('/api/auth/*', toNodeHandler(auth));

  return router;
}
