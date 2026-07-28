import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from '@/src/shared/config';
import { createRouter } from '@/src/presentation/routes/index';
import { createErrorMiddleware } from '@/src/shared/middleware/error.middleware';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({
    credentials: true,
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const allowedOrigins = config.appOrigins;
      const isNetlifyPreview = /^https:\/\/deploy-preview-\d+--stagging-nearu\.netlify\.app$/.test(origin);
      const isAllowed = allowedOrigins.some(o => origin === o) || isNetlifyPreview;

      callback(null, isAllowed);
    },
  }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  app.use(createRouter());

  app.use(createErrorMiddleware());

  return app;
}
