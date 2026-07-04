import { randomBytes } from 'crypto';

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function slugifyUnique(
  text: string,
  existsFn: (slug: string) => Promise<boolean>,
  maxAttempts = 10
): Promise<string> {
  let slug = slugify(text);
  if (!slug) slug = 'untitled';

  for (let i = 0; i < maxAttempts; i++) {
    if (!(await existsFn(slug))) return slug;
    slug = `${slugify(text)}-${randomBytes(2).toString('hex')}`;
  }

  throw new Error(`Could not generate unique slug after ${maxAttempts} attempts`);
}
