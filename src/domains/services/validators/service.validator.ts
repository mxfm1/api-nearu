import { z } from 'zod';

const contactItemSchema = z.object({
  type: z.string().min(1),
  value: z.string().min(1),
});

const portfolioItemSchema = z.object({
  url: z.string().url('URL inválida'),
  title: z.string().max(200).optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
});

export const createServiceSchema = z.object({
  body: z.object({
    slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug debe ser solo minúsculas, números y guiones'),
    title: z.string().min(1, 'Título es requerido').max(200),
    marca: z.string().max(200).optional().nullable(),
    description: z.string().max(5000).optional().nullable(),
    yearsExperience: z.number().int().min(0).optional().nullable(),
    priceMin: z.number().int().min(0).optional().nullable(),
    priceMax: z.number().int().min(0).optional().nullable(),
    availability: z.string().max(500).optional().nullable(),
    bannerUrl: z.string().url().optional().nullable(),
    logoUrl: z.string().url().optional().nullable(),
    thumbnailUrl: z.string().url().optional().nullable(),
    locationId: z.string().optional().nullable(),
    categoryId: z.string().optional().nullable(),
    status: z.enum(['draft', 'published', 'paused', 'archived']).optional().default('draft'),
    contacts: z.array(contactItemSchema).optional().default([]),
    portfolio: z.array(portfolioItemSchema).optional().default([]),
  }),
});

export const updateServiceSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug debe ser solo minúsculas, números y guiones').optional(),
    title: z.string().min(1).max(200).optional(),
    marca: z.string().max(200).optional().nullable(),
    description: z.string().max(5000).optional().nullable(),
    yearsExperience: z.number().int().min(0).optional().nullable(),
    priceMin: z.number().int().min(0).optional().nullable(),
    priceMax: z.number().int().min(0).optional().nullable(),
    availability: z.string().max(500).optional().nullable(),
    bannerUrl: z.string().url().optional().nullable(),
    logoUrl: z.string().url().optional().nullable(),
    thumbnailUrl: z.string().url().optional().nullable(),
    locationId: z.string().optional().nullable(),
    categoryId: z.string().optional().nullable(),
    status: z.enum(['draft', 'published', 'paused', 'archived']).optional(),
    contacts: z.array(contactItemSchema).optional(),
    portfolio: z.array(portfolioItemSchema).optional(),
  }),
});

export const getServiceSchema = z.object({
  params: z.object({ slugOrId: z.string().min(1) }),
});

export const deleteServiceSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
});

export const listServicesSchema = z.object({
  query: z.object({
    profileId: z.string().optional(),
    categoryId: z.string().optional(),
    locationId: z.string().optional(),
    status: z.string().optional(),
    search: z.string().optional(),
  }),
});

// Portfolio
export const addPortfolioItemSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    url: z.string().url('URL inválida'),
    title: z.string().max(200).optional().nullable(),
    description: z.string().max(2000).optional().nullable(),
    orden: z.number().int().optional(),
  }),
});

export const deletePortfolioItemSchema = z.object({
  params: z.object({
    id: z.string().min(1),
    portfolioId: z.string().min(1),
  }),
});
