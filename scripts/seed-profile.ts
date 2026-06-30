import { eq } from 'drizzle-orm';
import { db } from '../src/shared/database';
import { users, profiles, profileSocialLinks } from '../src/shared/database/schema';

async function seedProfile() {
  const email = '1f.andresm@gmail.com';

  console.log(`🔍 Buscando usuario con email: ${email}...`);

  // 1. Find the user
  const user = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (!user[0]) {
    console.error(`✗ Usuario con email "${email}" no encontrado.`);
    console.log('   Posibles emails registrados:');
    const allUsers = await db.select({ email: users.email }).from(users).limit(5);
    allUsers.forEach((u) => console.log(`   - ${u.email}`));
    process.exit(1);
  }

  const userId = user[0].id;
  console.log(`✓ Usuario encontrado: ${user[0].name} (${userId})`);

  // 2. Upsert profile
  const profileId = crypto.randomUUID();
  const existingProfile = await db
    .select({ id: profiles.id })
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .limit(1);

  const profileIdToUse = existingProfile[0]?.id ?? profileId;
  const isNew = !existingProfile[0];

  if (isNew) {
    await db.insert(profiles).values({
      id: profileIdToUse,
      userId,
      name: 'NearU Technologies',
      industry: 'Technology',
      description: 'Plataforma de conexión profesional que utiliza inteligencia artificial para conectar talento con oportunidades.',
      tags: ['technology', 'ai', 'networking', 'innovation'],
      location: 'Buenos Aires, Argentina',
      founded: '2024',
      employees: '10-50',
      website: 'https://nearu.app',
      whatsapp: '+541112345678',
      bannerUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200',
      logoUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=200',
    });
    console.log('✓ Profile creado');
  } else {
    await db
      .update(profiles)
      .set({
        name: 'NearU Technologies',
        industry: 'Technology',
        description: 'Plataforma de conexión profesional que utiliza inteligencia artificial para conectar talento con oportunidades.',
        tags: ['technology', 'ai', 'networking', 'innovation'],
        location: 'Buenos Aires, Argentina',
        founded: '2024',
        employees: '10-50',
        website: 'https://nearu.app',
        whatsapp: '+541112345678',
        bannerUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200',
        logoUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=200',
        updatedAt: new Date(),
      })
      .where(eq(profiles.userId, userId));
    console.log('✓ Profile actualizado');
  }

  // 3. Replace social links
  await db.delete(profileSocialLinks).where(eq(profileSocialLinks.profileId, profileIdToUse));

  const socialLinks = [
    { platform: 'instagram', url: 'https://instagram.com/nearuapp', orden: 0 },
    { platform: 'linkedin', url: 'https://linkedin.com/company/nearu', orden: 1 },
    { platform: 'x', url: 'https://x.com/nearuapp', orden: 2 },
    { platform: 'web', url: 'https://nearu.app', orden: 3 },
  ];

  await db.insert(profileSocialLinks).values(
    socialLinks.map((link) => ({
      id: crypto.randomUUID(),
      profileId: profileIdToUse,
      ...link,
    }))
  );

  console.log(`✓ ${socialLinks.length} social links insertados`);

  // 4. Show result
  const result = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .limit(1);

  const links = await db
    .select()
    .from(profileSocialLinks)
    .where(eq(profileSocialLinks.profileId, profileIdToUse))
    .orderBy(profileSocialLinks.orden);

  console.log('\n=== 📦 PROFILE CREADO ===');
  console.log(JSON.stringify(result[0], null, 2));
  console.log('\n=== 🔗 SOCIAL LINKS ===');
  console.log(JSON.stringify(links, null, 2));
  console.log(`\n🚀 Listo! Probá con Thunder Client:`);
  console.log(`   GET http://localhost:3000/api/profiles/${userId}`);

  process.exit(0);
}

seedProfile().catch((err) => {
  console.error('✗ Error en seed:', err);
  process.exit(1);
});
