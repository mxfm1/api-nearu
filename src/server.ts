import { config } from '@/src/shared/config';
import { createApp } from './presentation/app';

const app = createApp();

const hasAuthSecret = !!process.env.BETTER_AUTH_SECRET;
console.log(`🔑 BETTER_AUTH_SECRET ${hasAuthSecret ? '✓ set' : '✗ MISSING'}`);
console.log(`🌐 BETTER_AUTH_URL: ${process.env.BETTER_AUTH_URL ?? '(usando default)'}`);

app.listen(config.port, () => {
  console.log(`🚀 Server running on http://localhost:${config.port}`);
  console.log(`📊 Environment: ${config.nodeEnv}`);
});
