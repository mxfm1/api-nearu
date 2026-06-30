import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@/src/shared/database';
import { config } from '../config';
import * as schema from '../database/schema';
import { emailService } from '../email';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),
  trustedOrigins: config.appOrigins,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    resetPasswordRedirect: `${config.corsOrigin}/reset-password`,
    sendResetPassword: async ({ user, url, token }) => {
      try {
        const parsed = new URL(url);
        const tokenFromPath = parsed.pathname.split('/').pop();
        const resetToken = token || tokenFromPath;

        if (!resetToken) {
          console.error('[Auth] ✗ No reset token found in URL');
          return;
        }

        const frontendUrl = new URL(config.corsOrigin);
        frontendUrl.pathname = '/reset-password';
        frontendUrl.searchParams.set('token', resetToken);
        await emailService.sendResetPasswordEmail({ user, url: frontendUrl.toString() });
        console.log('[Auth] ✓ Reset password email sent successfully to', user.email);
      } catch (error) {
        console.error('[Auth] ✗ Failed to send reset password email to', user.email, ':', error);
      }
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }) => {
      try {
        console.log('[Auth] 📧 Verification URL generated:', url);
        const parsed = new URL(url);
        const modifiedUrl = parsed.toString();
        await emailService.sendVerificationEmail({ user, url: modifiedUrl });
        console.log('[Auth] ✓ Verification email sent successfully to', user.email);
      } catch (error) {
        console.error('[Auth] ✗ Failed to send verification email to', user.email, ':', error);
      }
    },
    autoSignInAfterVerification: true,
  },
  user: {
    deleteUser: {
      enabled: true
    },
    changeEmail: {
      enabled: true,
    },
  },
  socialProviders: {
    ...(config.googleClientId && config.googleClientSecret
      ? {
        google: {
          clientId: config.googleClientId,
          clientSecret: config.googleClientSecret,
        },
      }
      : {}),
  },
  secret: config.betterAuthSecret,
  baseURL: config.betterAuthUrl,
  advanced: {
    disableOriginCheck: !config.isProd,
    disableCSRFCheck: !config.isProd,
  },
});

export type Session = typeof auth.$Infer.Session;
