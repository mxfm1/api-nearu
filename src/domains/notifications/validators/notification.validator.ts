import { z } from 'zod';

export const markNotificationReadSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
});

export const updateNotificationSettingsSchema = z.object({
  body: z.object({
    emailNotificationsEnabled: z.boolean(),
  }),
});
