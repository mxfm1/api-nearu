import { z } from 'zod';

const APPLICATION_STATUSES = ['pending', 'reviewing', 'accepted', 'rejected'] as const;

export const createApplicationSchema = z.object({
  body: z.object({
    eventId: z.string().min(1, 'eventId es requerido'),
    coverLetter: z.string().max(5000).nullable().optional(),
    portfolioUrls: z
      .array(z.string().url('Cada URL debe ser válida'))
      .max(10, 'Máximo 10 URLs de portafolio')
      .optional()
      .default([]),
  }),
});

export const getApplicationSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
});

export const listEventApplicationsSchema = z.object({
  params: z.object({ eventId: z.string().min(1) }),
  query: z.object({
    status: z.enum(['pending', 'reviewing', 'accepted', 'rejected']).optional(),
  }),
});

export const updateApplicationStatusSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    status: z.enum(APPLICATION_STATUSES),
  }),
});

export const createScoringRuleSchema = z.object({
  params: z.object({ eventId: z.string().min(1) }),
  body: z.object({
    ruleType: z.string().min(1),
    weight: z.number().int().min(1).max(100).optional().default(1),
    config: z.record(z.unknown()).nullable().optional(),
  }),
});

export const createScoringRulesSchema = z.object({
  params: z.object({ eventId: z.string().min(1) }),
  body: z.object({
    rules: z.array(z.object({
      ruleType: z.string().min(1),
      weight: z.number().int().min(1).max(100).optional().default(1),
      config: z.record(z.unknown()).nullable().optional(),
    })).min(1, 'Debe proporcionar al menos una regla'),
  }),
});

export const deleteScoringRuleSchema = z.object({
  params: z.object({
    eventId: z.string().min(1),
    ruleId: z.string().min(1),
  }),
});

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type UpdateApplicationStatusInput = z.infer<typeof updateApplicationStatusSchema>;
export type CreateScoringRuleInput = z.infer<typeof createScoringRuleSchema>;
export type CreateScoringRulesInput = z.infer<typeof createScoringRulesSchema>;
