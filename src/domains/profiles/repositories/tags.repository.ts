import { eq } from 'drizzle-orm';
import { db } from '@/src/shared/database';
import { tags, profilesToTags } from '@/src/shared/database/schema';
import type { ITagsRepository } from './tags.repository.interface';
import type { Tag } from '../entities/tag.entity';

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9áéíóúñü\s-]/g, '')
    .replace(/[á]/g, 'a')
    .replace(/[é]/g, 'e')
    .replace(/[í]/g, 'i')
    .replace(/[ó]/g, 'o')
    .replace(/[ú]/g, 'u')
    .replace(/[ñ]/g, 'n')
    .replace(/[ü]/g, 'u')
    .replace(/[\s]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export class TagsRepository implements ITagsRepository {
  async findOrCreateByName(name: string): Promise<Tag> {
    try {
      const existing = await db
        .select()
        .from(tags)
        .where(eq(tags.name, name))
        .limit(1);
      if (existing[0]) return existing[0] as Tag;

      const slug = slugify(name);
      const result = await db
        .insert(tags)
        .values({ id: crypto.randomUUID(), name, slug })
        .returning();
      return result[0] as Tag;
    } catch (error) {
      console.error('[TagsRepository.findOrCreateByName] Error:', error);
      throw error;
    }
  }

  async setProfileTags(profileId: string, tagIds: string[]): Promise<void> {
    try {
      await db
        .delete(profilesToTags)
        .where(eq(profilesToTags.profileId, profileId));

      if (tagIds.length > 0) {
        await db.insert(profilesToTags).values(
          tagIds.map((tagId) => ({ profileId, tagId })),
        );
      }
    } catch (error) {
      console.error('[TagsRepository.setProfileTags] Error:', error);
      throw error;
    }
  }
}
