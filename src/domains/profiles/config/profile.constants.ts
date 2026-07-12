import type { SocialLink } from '../entities/profile.entity';

export const SIMPLE_REQUIRED_FIELDS = [
  'name',
  'description',
  'bannerUrl',
  'industry',
  'locationId',
] as const;

export const CONTACT_QUERY_FIELDS = ['website', 'whatsapp'] as const;

export const COMPLETENESS_QUERY_FIELDS = [
  ...SIMPLE_REQUIRED_FIELDS,
  ...CONTACT_QUERY_FIELDS,
] as const;

export function getMissingFields(profile: {
  name: string | null;
  description: string | null;
  bannerUrl: string | null;
  industry: string;
  locationId: string | null;
  website: string | null;
  whatsapp: string | null;
  socialLinks?: SocialLink[];
}): string[] {
  const missing: string[] = SIMPLE_REQUIRED_FIELDS.filter((f) => !profile[f]);
  const hasContact =
    profile.website || profile.whatsapp || (profile.socialLinks && profile.socialLinks.length > 0);
  if (!hasContact) missing.push('contactFields');
  return missing;
}