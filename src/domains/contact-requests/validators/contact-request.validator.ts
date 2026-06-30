import { z } from 'zod';

export const createContactRequestSchema = z.object({
  body: z.object({
    servicioId: z.string().min(1, 'servicioId es requerido'),
    propietarioId: z.string().min(1, 'propietarioId es requerido'),
    mensaje: z.string().max(2000).nullable().optional(),
  }),
});

export const getContactRequestDetailSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
});

export const updateContactRequestStatusSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    estado: z.enum(['pendiente', 'leido', 'respondido', 'archivado']),
  }),
});

export type CreateContactRequestInput = z.infer<typeof createContactRequestSchema>;
export type UpdateContactRequestStatusInput = z.infer<typeof updateContactRequestStatusSchema>;
