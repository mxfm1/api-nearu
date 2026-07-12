/**
 * Backfill data for v2 schema migration.
 *
 * RUN THIS BEFORE `npm run db:migrate` — it reads old columns
 * and writes to new tables/columns before the migration drops the old ones.
 *
 * After running this, run:
 *   1. npm run db:migrate
 *   2. npx tsx scripts/seed-statuses.ts
 *   3. npx tsx scripts/seed-data.ts   (updated seed)
 *
 * ⚠️ THIS ASSUMES the schema.ts ALREADY reflects the NEW schema.
 *    Drizzle queries will use the NEW column names.
 *    We use raw SQL via db.execute to read OLD columns.
 */

import { eq } from 'drizzle-orm';
import { db } from '../src/shared/database';
import {
  tags,
  profilesToTags,
  serviceContacts,
  statuses,
} from '../src/shared/database/schema';

async function backfill() {
  console.log('Backfilling data for v2 schema migration...\n');

  // ──────────────────────────────────────────────
  // 1. Backfill profiles.tags text[] → tags + profiles_to_tags
  // ──────────────────────────────────────────────
  console.log('1. Backfilling tags from profiles.tags...');

  const rawProfiles: { id: string; tags: string | null }[] = await db.execute(
    `SELECT id, tags FROM profiles WHERE tags IS NOT NULL`,
  ).then((r) => r.rows ?? []);

  let tagCount = 0;
  for (const profile of rawProfiles) {
    let profileTags: string[];
    try {
      profileTags = JSON.parse(profile.tags ?? '[]');
    } catch {
      profileTags = [];
    }

    if (profileTags.length === 0) continue;

    for (const tagName of profileTags) {
      const name = tagName.trim().toLowerCase();
      if (!name) continue;

      const slug = name
        .replace(/[^a-z0-9áéíóúñü\s-]/g, '')
        .replace(/[á]/g, 'a')
        .replace(/[é]/g, 'e')
        .replace(/[í]/g, 'i')
        .replace(/[ó]/g, 'o')
        .replace(/[ú]/g, 'u')
        .replace(/[ñ]/g, 'n')
        .replace(/[ü]/g, 'u')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');

      // Find or create tag
      let [tag] = await db
        .select()
        .from(tags)
        .where(eq(tags.name, name))
        .limit(1);

      if (!tag) {
        const tagId = crypto.randomUUID();
        await db.insert(tags).values({ id: tagId, name, slug });
        tag = { id: tagId, name, slug, createdAt: new Date() };
      }

      // Check if relation already exists
      const [existing] = await db
        .select()
        .from(profilesToTags)
        .where(eq(profilesToTags.profileId, profile.id))
        .limit(1);

      if (!existing) {
        await db
          .insert(profilesToTags)
          .values({ profileId: profile.id, tagId: tag.id });
        tagCount++;
      }
    }
  }
  console.log(`  Created ${tagCount} tag-profile relations`);

  // ──────────────────────────────────────────────
  // 2. Backfill services.contact_info jsonb → service_contacts
  // ──────────────────────────────────────────────
  console.log('\n2. Backfilling service_contacts from services.contact_info...');

  const rawServices: { id: string; contact_info: string | null }[] = await db.execute(
    `SELECT id, contact_info FROM services WHERE contact_info IS NOT NULL`,
  ).then((r) => r.rows ?? []);

  let contactCount = 0;
  for (const svc of rawServices) {
    let contactInfo: Array<{ type: string; value: string }>;
    try {
      contactInfo = JSON.parse(svc.contact_info ?? '[]');
    } catch {
      contactInfo = [];
    }

    for (const contact of contactInfo) {
      if (!contact.type || !contact.value) continue;

      await db.insert(serviceContacts).values({
        id: crypto.randomUUID(),
        serviceId: svc.id,
        type: contact.type,
        value: contact.value,
      });
      contactCount++;
    }
  }
  console.log(`  Created ${contactCount} service contacts`);

  // ──────────────────────────────────────────────
  // 3. Seed statuses (needed before we can set status_id)
  // ──────────────────────────────────────────────
  console.log('\n3. Seeding statuses...');

  const statusEntries = [
    { name: 'Borrador', slug: 'draft' },
    { name: 'Publicado', slug: 'published' },
    { name: 'Pausado', slug: 'paused' },
    { name: 'Archivado', slug: 'archived' },
  ];

  const statusMap: Record<string, string> = {};
  for (const s of statusEntries) {
    const [existing] = await db
      .select({ id: statuses.id })
      .from(statuses)
      .where(eq(statuses.slug, s.slug))
      .limit(1);

    if (existing) {
      statusMap[s.slug] = existing.id;
    } else {
      const id = crypto.randomUUID();
      await db.insert(statuses).values({ id, ...s });
      statusMap[s.slug] = id;
    }
  }
  console.log('  Statuses ready:', Object.keys(statusMap).join(', '));

  // ──────────────────────────────────────────────
  // 4. Migrate services.service_status → services.status_id
  // ──────────────────────────────────────────────
  console.log('\n4. Migrating services.service_status → status_id...');

  const STATUS_MAP: Record<string, string> = {
    draft: statusMap['draft'],
    published: statusMap['published'],
    paused: statusMap['paused'],
    archived: statusMap['archived'],
  };

  await db.execute(
    `UPDATE services SET status_id = CASE service_status
      WHEN 'draft' THEN '${STATUS_MAP.draft}'
      WHEN 'published' THEN '${STATUS_MAP.published}'
      WHEN 'paused' THEN '${STATUS_MAP.paused}'
      WHEN 'archived' THEN '${STATUS_MAP.archived}'
      ELSE '${STATUS_MAP.draft}'
    END
    WHERE status_id IS NULL OR status_id = ''`,
  );
  console.log('  Services updated');

  // ──────────────────────────────────────────────
  // 5. Migrate events.event_status → events.status_id
  // ──────────────────────────────────────────────
  console.log('\n5. Migrating events.event_status → status_id...');

  await db.execute(
    `UPDATE events SET status_id = CASE event_status
      WHEN 'draft' THEN '${STATUS_MAP.draft}'
      WHEN 'published' THEN '${STATUS_MAP.published}'
      WHEN 'paused' THEN '${STATUS_MAP.paused}'
      WHEN 'archived' THEN '${STATUS_MAP.archived}'
      ELSE '${STATUS_MAP.draft}'
    END
    WHERE status_id IS NULL OR status_id = ''`,
  );
  console.log('  Events updated');

  // ──────────────────────────────────────────────
  // 6. Generate slugs for profiles that have name but no slug
  // ──────────────────────────────────────────────
  console.log('\n6. Generating slugs for profiles...');

  const sluglessProfiles: { id: string; name: string | null }[] = await db.execute(
    `SELECT id, name FROM profiles WHERE slug IS NULL AND name IS NOT NULL`,
  ).then((r) => r.rows ?? []);

  for (const p of sluglessProfiles) {
    if (!p.name) continue;
    const baseSlug = p.name
      .toLowerCase()
      .replace(/[^a-z0-9áéíóúñü\s-]/g, '')
      .replace(/[áéíóúñü]/g, (c: string) => ({ 'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u', 'ñ': 'n', 'ü': 'u' } as Record<string, string>)[c] ?? c)
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');

    let slug = baseSlug;
    let suffix = 1;
    while (true) {
      const [existing] = await db
        .select({ id: slug })
        .from('profiles' as any)
        .where(eq('slug' as any, slug))
        .limit(1);
      if (!existing) break;
      slug = `${baseSlug}-${suffix++}`;
    }

    await db.execute(`UPDATE profiles SET slug = '${slug}' WHERE id = '${p.id}'`);
  }
  console.log(`  Generated slugs for ${sluglessProfiles.length} profiles`);

  // ──────────────────────────────────────────────
  // Summary
  // ──────────────────────────────────────────────
  console.log('\nBackfill complete!');
  console.log('Next steps:');
  console.log('  1. npm run db:migrate');
  console.log('  2. npx tsx scripts/seed-statuses.ts  (if not run already)');
  console.log('  3. npx tsx scripts/seed-data.ts  (updated seed)');

  process.exit(0);
}

backfill().catch((err) => {
  console.error('Error during backfill:', err);
  process.exit(1);
});
