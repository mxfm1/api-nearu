import { z } from 'zod';

const socialLinkSchema = z.object({
  platform: z.string().min(1),
  url: z.string().url().or(z.string().min(1)),
  orden: z.number().int().min(0).optional(),
});

export const getProfileSchema = z.object({
  params: z.object({ userId: z.string().min(1) }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    bannerUrl: z.string().nullable().optional(),
    logoUrl: z.string().nullable().optional(),
    name: z.string().max(200).nullable().optional(),
    description: z.string().max(2000).nullable().optional(),
    tags: z.array(z.string().max(50)).max(20).optional(),
    regionId: z.string().nullable().optional(),
    founded: z.string().max(20).nullable().optional(),
    employees: z.string().max(50).nullable().optional(),
    website: z.string().max(500).nullable().optional(),
    whatsapp: z.string().max(50).nullable().optional(),
    socialLinks: z.array(socialLinkSchema).max(20).optional(),
  }),
});

export type GetProfileInput = z.infer<typeof getProfileSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
