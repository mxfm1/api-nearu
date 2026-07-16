/**
 * Seed script for Statuses (Services/Events + Applications)
 * Run: npx tsx scripts/prod/seed-statuses.ts
 *
 * 8 statuses total:
 *   - 4 for services/events (auto-generated IDs)
 *   - 4 for applications (fixed UUIDs matching hardcoded constants)
 */

import { db } from '../../src/shared/database';
import { statuses } from '../../src/shared/database/schema';

const allStatuses = [
  // ──────────────────────────────────────────────
  // SERVICES / EVENTS STATUSES (fixed UUIDs)
  // ──────────────────────────────────────────────
  { id: '20000000-0000-0000-0000-000000000001', name: 'Borrador', slug: 'draft' },
  { id: '20000000-0000-0000-0000-000000000002', name: 'Publicado', slug: 'published' },
  { id: '20000000-0000-0000-0000-000000000003', name: 'Pausado', slug: 'paused' },
  { id: '20000000-0000-0000-0000-000000000004', name: 'Archivado', slug: 'archived' },

  // ──────────────────────────────────────────────
  // APPLICATION STATUSES (fixed UUIDs — hardcoded in code)
  // ──────────────────────────────────────────────
  { id: '10000000-0000-0000-0000-000000000001', name: 'Pendiente', slug: 'pending' },
  { id: '10000000-0000-0000-0000-000000000002', name: 'En revisión', slug: 'reviewing' },
  { id: '10000000-0000-0000-0000-000000000003', name: 'Aceptada', slug: 'accepted' },
  { id: '10000000-0000-0000-0000-000000000004', name: 'Rechazada', slug: 'rejected' },
];

async function main() {
  console.log('🚀 Seeding statuses...');

  await db
    .insert(statuses)
    .values(allStatuses)
    .onConflictDoNothing();

  const servicesCount = 4;
  const applicationsCount = 4;
  console.log(`✅ ${allStatuses.length} statuses upserted (${servicesCount} servicios/eventos, ${applicationsCount} aplicaciones)`);
}

main().catch((err) => {
  console.error('❌ Error seeding statuses:', err);
  process.exit(1);
});
