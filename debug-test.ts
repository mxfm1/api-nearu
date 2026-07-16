import { eq, sql } from 'drizzle-orm';
import { db } from './src/shared/database';
import { users, profiles } from './src/shared/database/schema';

const companies = [
  {
    userId: 'USER-TEST7',
    profile: {
      id: 'PROF-TEST7',
      userId: 'USER-TEST7',
      slug: 'test7',
      name: 'Test Profile 7',
      description: 'desc',
      regionId: 'CL-RM',
      bannerUrl: 'https://example.com/banner.jpg',
      logoUrl: 'https://example.com/logo.jpg',
      founded: '2020',
      employees: '11-50',
      website: 'https://test.cl',
      whatsapp: '+56912345678',
      isVerified: false,
      socialLinks: [],
      tags: [],
    },
  },
];

async function main() {
  try {
    // Insert user first
    await db
      .insert(users)
      .values({ id: 'USER-TEST7', name: 'Test7', email: 'test7@test.cl' })
      .onConflictDoNothing();
    console.log('User created');

    for (const c of companies) {
      const p = c.profile;
      console.log('p.userId:', JSON.stringify(p.userId), 'type:', typeof p.userId);

      const result = await db.execute(sql`
        INSERT INTO profiles (id, user_id, slug, banner_url, logo_url, name, description, region_id, founded, employees, website, whatsapp, is_verified)
        VALUES (
          ${p.id},
          ${p.userId},
          ${p.slug},
          ${p.bannerUrl},
          ${p.logoUrl},
          ${p.name},
          ${p.description},
          ${p.regionId},
          ${p.founded},
          ${p.employees},
          ${p.website},
          ${p.whatsapp},
          ${p.isVerified}
        )
        ON CONFLICT (id) DO NOTHING
      `);
      console.log('Insert result:', JSON.stringify(result));
    }
  } catch (e: any) {
    console.error('ERROR:', e.message);
  } finally {
    // cleanup
    try {
      await db.delete(profiles).where(eq(profiles.id, 'PROF-TEST7'));
      await db.delete(users).where(eq(users.id, 'USER-TEST7'));
    } catch (_) {}
    process.exit(0);
  }
}

main();
