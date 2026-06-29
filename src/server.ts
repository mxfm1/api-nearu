import { config } from '@/src/shared/config';
import { createApp } from './presentation/app';

const app = createApp();

app.listen(config.port, () => {
  console.log(`🚀 Server running on http://localhost:${config.port}`);
  console.log(`📊 Environment: ${config.nodeEnv}`);
});
