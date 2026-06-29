import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from '@/src/shared/config';
import { createRouter } from '@/src/presentation/routes/index';
import { createErrorMiddleware } from '@/src/shared/middleware/error.middleware';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: config.corsOrigin, credentials: true }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  app.use(createRouter());

  app.use(createErrorMiddleware());

  return app;
}
