import { z } from 'zod';

const dateOrString = z
  .string()
  .optional()
  .nullable()
  .transform((v) => (v ? new Date(v) : null));

export const createEventSchema = z.object({
  body: z.object({
    slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug debe ser solo minúsculas, números y guiones').optional(),
    title: z.string().min(1, 'Título es requerido').max(200),
    description: z.string().max(10000).optional().nullable(),
    startAt: dateOrString,
    locationId: z.string().optional().nullable(),
    categoryId: z.string().optional().nullable(),
    thumbnailUrl: z.string().url().optional().nullable(),
    status: z.enum(['draft', 'published', 'paused', 'archived']).optional().default('draft'),
  }),
});

export const updateEventSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(10000).optional().nullable(),
    startAt: dateOrString,
    locationId: z.string().optional().nullable(),
    categoryId: z.string().optional().nullable(),
    thumbnailUrl: z.string().url().optional().nullable(),
    status: z.enum(['draft', 'published', 'paused', 'archived']).optional(),
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
