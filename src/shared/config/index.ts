import 'dotenv/config';
import './env';

export const config = {
  get nodeEnv() {
    return process.env.NODE_ENV ?? 'development';
  },
  get port() {
    return Number(process.env.PORT ?? 3000);
  },
  get databaseUrl() {
    return process.env.DATABASE_URL!;
  },
  get betterAuthSecret() {
    return process.env.BETTER_AUTH_SECRET!;
  },
  get betterAuthUrl() {
    return process.env.BETTER_AUTH_URL ?? 'http://localhost:3000/api/auth';
  },
  get corsOrigin() {
    return process.env.CORS_ORIGIN ?? 'http://localhost:3001';
  },
  get isTest() {
    return this.nodeEnv === 'test';
  },
  get isDev() {
    return this.nodeEnv === 'development';
  },
  get googleClientId() {
    return process.env.GOOGLE_CLIENT_ID;
  },
  get googleClientSecret() {
    return process.env.GOOGLE_CLIENT_SECRET;
  },
  get resendApiKey() {
    return process.env.RESEND_API_KEY;
  },
  get resendFromEmail() {
    return process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev';
  },
  get isProd() {
    return this.nodeEnv === 'production';
  },
} as const;
