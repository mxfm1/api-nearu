import type { Profile } from '../entities/profile.entity';
import { getMissingFields } from '../config/profile.constants';

export function presentProfile(profile: Profile) {
  const missingFields = getMissingFields(profile);

  return {
    id: profile.id,
    userId: profile.userId,
    bannerUrl: profile.bannerUrl,
    logoUrl: profile.logoUrl,
    name: profile.name,
    slug: profile.slug,
    industry: profile.industry,
    description: profile.description,
    tags: (profile.tags ?? []).map((t) => ({ id: t.id, name: t.name, slug: t.slug })),
    location: profile.locationId
      ? { id: profile.locationId, name: profile.locationName ?? null }
      : null,
    founded: profile.founded,
    employees: profile.employees,
    website: profile.website,
    whatsapp: profile.whatsapp,
    socialLinks: (profile.socialLinks ?? []).map((link) => ({
      id: link.id,
      platform: link.platform,
      url: link.url,
      orden: link.orden,
    })),
    createdAt: profile.createdAt?.toISOString?.() ?? profile.createdAt,
    updatedAt: profile.updatedAt?.toISOString?.() ?? profile.updatedAt,
    missingFields,
    isComplete: missingFields.length === 0,
  };
}
