export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface SocialLink {
  id: string;
  profileId: string;
  platform: string;
  url: string;
  orden: number;
  createdAt: Date;
}

export interface Profile {
  id: string;
  userId: string;
  bannerUrl: string | null;
  logoUrl: string | null;
  name: string | null;
  industry: string;
  description: string | null;
  slug: string | null;
  locationId: string | null;
  founded: string | null;
  employees: string | null;
  website: string | null;
  whatsapp: string | null;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  socialLinks?: SocialLink[];
  tags?: Tag[];
  locationName?: string | null;
}
