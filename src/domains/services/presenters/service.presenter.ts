import type { Service, ServiceWithDetails } from '../entities/service.entity';

export function presentService(service: ServiceWithDetails) {
  return {
    id: service.id,
    profileId: service.profileId,
    slug: service.slug,
    title: service.title,
    marca: service.marca,
    description: service.description,
    yearsExperience: service.yearsExperience,
    priceMin: service.priceMin,
    priceMax: service.priceMax,
    availability: service.availability,
    contactInfo: service.contactInfo,
    bannerUrl: service.bannerUrl,
    logoUrl: service.logoUrl,
    thumbnailUrl: service.thumbnailUrl,
    location: service.locationId
      ? {
          id: service.locationId,
          name: service.locationName,
        }
      : null,
    category: service.categoryId
      ? {
          id: service.categoryId,
          name: service.categoryName,
        }
      : null,
    profile: {
      id: service.profileId,
      name: service.profileName,
      slug: service.profileSlug,
    },
    portfolio: service.portfolio.map((item) => ({
      id: item.id,
      url: item.url,
      title: item.title,
      description: item.description,
      orden: item.orden,
    })),
    serviceStatus: service.serviceStatus,
    createdAt: service.createdAt?.toISOString?.() ?? service.createdAt,
    updatedAt: service.updatedAt?.toISOString?.() ?? service.updatedAt,
  };
}

export function presentServices(services: ServiceWithDetails[]) {
  return services.map(presentService);
}
