import { eq } from 'drizzle-orm';
import { db } from '../src/shared/database';
import { statuses } from '../src/shared/database/schema';

async function seedStatuses() {
  console.log('Seeding statuses...');

  const defaultStatuses = [
    // Services / Events
    { name: 'Borrador', slug: 'draft' },
    { name: 'Publicado', slug: 'published' },
    { name: 'Pausado', slug: 'paused' },
    { name: 'Archivado', slug: 'archived' },
    // Applications (fixed UUIDs — hardcoded in code)
    { id: '10000000-0000-0000-0000-000000000001', name: 'Pendiente', slug: 'pending' },
    { id: '10000000-0000-0000-0000-000000000002', name: 'En revisión', slug: 'reviewing' },
    { id: '10000000-0000-0000-0000-000000000003', name: 'Aceptada', slug: 'accepted' },
    { id: '10000000-0000-0000-0000-000000000004', name: 'Rechazada', slug: 'rejected' },
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
