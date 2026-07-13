import { z } from 'zod';

export const sendMessageSchema = z.object({
  body: z.object({
    contactRequestId: z.string().min(1),
    content: z.string().max(5000).optional().nullable(),
    attachments: z
      .array(z.string().url('Cada attachment debe ser una URL válida'))
      .max(6, 'Máximo 6 attachments')
      .optional()
      .default([]),
  }),
});

export const getThreadSchema = z.object({
  params: z.object({ contactRequestId: z.string().min(1) }),
});
