import { eq } from 'drizzle-orm';
import { db } from '../src/shared/database';
import { statuses } from '../src/shared/database/schema';

async function seedStatuses() {
  console.log('Seeding statuses...');

  const defaultStatuses = [
    { name: 'Borrador', slug: 'draft' },
    { name: 'Publicado', slug: 'published' },
    { name: 'Pausado', slug: 'paused' },
    { name: 'Archivado', slug: 'archived' },
  ];

  for (const status of defaultStatuses) {
    const existing = await db
      .select({ id: statuses.id })
      .from(statuses)
      .where(eq(statuses.slug, status.slug))
      .limit(1);

    if (!existing[0]) {
      await db.insert(statuses).values({
        id: crypto.randomUUID(),
        ...status,
      });
      console.log(`  Created: ${status.name} (${status.slug})`);
    } else {
      console.log(`  Exists: ${status.name} (${status.slug})`);
    }
  }

  console.log('Statuses seeded successfully!');
  process.exit(0);
}

seedStatuses().catch((err) => {
  console.error('Error seeding statuses:', err);
  process.exit(1);
});
