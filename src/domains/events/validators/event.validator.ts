import { z } from 'zod';

const dateOrString = z
  .string()
  .optional()
  .nullable()
  .transform((v) => (v ? new Date(v) : null));

const futureDateOrString = z
  .string()
  .optional()
  .nullable()
  .transform((v) => {
    if (!v) return null;
    const date = new Date(v);
    return date;
  })
  .refine((v) => v === null || v instanceof Date, {
    message: 'Fecha inválida',
  });

export const createEventSchema = z.object({
  body: z.object({
    slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug debe ser solo minúsculas, números y guiones').optional(),
    title: z.string().min(1, 'Título es requerido').max(200, 'Título no puede exceder 200 caracteres'),
    description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres').max(10000, 'La descripción no puede exceder 10000 caracteres').optional().nullable(),
    requirements: z.string().min(10, 'Los requisitos deben tener al menos 10 caracteres').max(10000, 'Los requisitos no pueden exceder 10000 caracteres').optional().nullable(),
    startAt: dateOrString,
    applicationDeadline: futureDateOrString,
    locationId: z.string().min(1, 'La región es requerida si se especifica').optional().nullable(),
    categoryId: z.string().min(1, 'La categoría es requerida si se especifica').optional().nullable(),
    thumbnailUrl: z.string().url('La portada debe ser una URL válida').optional().nullable(),
    bannerUrl: z.string().url('El banner debe ser una URL válida').optional().nullable(),
    requiredCandidates: z.number().int('Debe ser un número entero').min(1, 'Debe requerir al menos 1 candidato').max(1000, 'No puede exceder 1000 candidatos requeridos').optional().default(1),
    requiresVerifiedProfile: z.boolean().optional().default(true),
    autoCloseWhenFilled: z.boolean().optional().default(true),
    eventStatus: z.enum(['draft', 'published', 'paused', 'archived']).optional(),
    status: z.enum(['draft', 'published', 'paused', 'archived']).optional(),
  }).transform((data) => {
    // priority: status > eventStatus > default('draft')
    const finalStatus = data.status ?? data.eventStatus ?? 'draft';
    const { eventStatus, ...rest } = data;
    return { ...rest, status: finalStatus };
  }),
});

export const updateEventSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug debe ser solo minúsculas, números y guiones').optional(),
    title: z.string().min(1, 'Título es requerido').max(200, 'Título no puede exceder 200 caracteres').optional(),
    description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres').max(10000, 'La descripción no puede exceder 10000 caracteres').optional().nullable(),
    requirements: z.string().min(10, 'Los requisitos deben tener al menos 10 caracteres').max(10000, 'Los requisitos no pueden exceder 10000 caracteres').optional().nullable(),
    startAt: dateOrString,
    applicationDeadline: futureDateOrString,
    locationId: z.string().min(1, 'La región es requerida si se especifica').optional().nullable(),
    categoryId: z.string().min(1, 'La categoría es requerida si se especifica').optional().nullable(),
    thumbnailUrl: z.string().url('La portada debe ser una URL válida').optional().nullable(),
    bannerUrl: z.string().url('El banner debe ser una URL válida').optional(),
    requiredCandidates: z.number().int('Debe ser un número entero').min(1, 'Debe requerir al menos 1 candidato').max(1000, 'No puede exceder 1000 candidatos requeridos').optional(),
    requiresVerifiedProfile: z.boolean().optional(),
    autoCloseWhenFilled: z.boolean().optional(),
    eventStatus: z.enum(['draft', 'published', 'paused', 'archived']).optional(),
    status: z.enum(['draft', 'published', 'paused', 'archived']).optional(),
  }).transform((data) => {
    // priority: status > eventStatus > undefined (don't change status)
    if (data.status === undefined && data.eventStatus !== undefined) {
      data.status = data.eventStatus;
    }
    const { eventStatus, ...rest } = data;
    return rest;
  }),
});

export const getEventSchema = z.object({
  params: z.object({ slugOrId: z.string().min(1) }),
});

export const deleteEventSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
});

export const listEventsSchema = z.object({
  query: z.object({
    profileId: z.string().optional(),
    categoryId: z.string().optional(),
    locationId: z.string().optional(),
    status: z.string().optional(),
    search: z.string().optional(),
    upcoming: z
      .string()
      .optional()
      .transform((v) => v === 'true'),
  }),
});
