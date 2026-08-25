import { z } from 'zod';
import { REQUEST_STATUSES, REQUEST_TYPES } from '../entities/request.entity';

export const createRequestSchema = z.object({
  body: z.object({
    type: z.enum(REQUEST_TYPES),
    title: z.string().trim().min(1).max(160),
    description: z.string().trim().max(5000).nullable().optional(),
    metadata: z.record(z.unknown()).nullable().optional(),
    targetEntityType: z.string().trim().max(50).nullable().optional(),
    targetEntityId: z.string().trim().max(255).nullable().optional(),
  }),
});

export const listRequestsSchema = z.object({
  query: z.object({
    status: z.enum(REQUEST_STATUSES).optional(),
  }),
});

export const updateRequestStatusSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    status: z.enum(REQUEST_STATUSES),
    comment: z.string().trim().max(5000).nullable().optional(),
  }),
});
