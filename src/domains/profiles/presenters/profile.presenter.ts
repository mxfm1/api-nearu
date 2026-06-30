import type { Profile } from '../entities/profile.entity';

export function presentProfile(profile: Profile) {
  return {
    id: profile.id,
    userId: profile.userId,
    bannerUrl: profile.bannerUrl,
    logoUrl: profile.logoUrl,
    name: profile.name,
    industry: profile.industry,
    description: profile.description,
    tags: profile.tags,
    location: profile.location,
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
  };
}
