import { z } from 'zod';

export const INTENCIONES = [
  'Solicitar una cotización',
  'Solicitar una propuesta comercial',
  'Consultar disponibilidad',
  'Realizar una consulta sobre el servicio',
] as const;

export const ESTADOS = ['pendiente', 'en_curso', 'cerrada'] as const;

export const createContactRequestSchema = z.object({
  body: z.object({
    slug: z.string().min(1, 'slug es requerido'),
    intencion: z.enum(INTENCIONES),
    mensaje: z.string().max(2000).nullable().optional(),
    attachments: z
      .array(z.string().url('Cada attachment debe ser una URL válida'))
      .max(6, 'Máximo 6 attachments')
      .optional()
      .default([]),
  }),
});

export const getContactRequestDetailSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
});

export const getInboxSchema = z.object({
  query: z.object({
    tipo: z.enum(['recibidos', 'enviados']).optional(),
  }),
});

export const updateContactRequestStatusSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    estado: z.enum(ESTADOS),
  }),
});

export type CreateContactRequestInput = z.infer<typeof createContactRequestSchema>;
export type UpdateContactRequestStatusInput = z.infer<typeof updateContactRequestStatusSchema>;
