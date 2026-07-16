import { eq, and } from 'drizzle-orm';
import { db } from '../src/shared/database';
import { users, profiles, profileSocialLinks, tags, profilesToTags, locations } from '../src/shared/database/schema';

async function seedProfile() {
  const email = '1f.andresm@gmail.com';

  console.log(`Looking up user: ${email}...`);

  const user = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (!user[0]) {
    console.error(`User "${email}" not found.`);
    const allUsers = await db.select({ email: users.email }).from(users).limit(5);
    allUsers.forEach((u) => console.log(`  - ${u.email}`));
    process.exit(1);
  }

  const userId = user[0].id;
  console.log(`User found: ${user[0].name} (${userId})`);

  // Find a location for "Buenos Aires"
  let locationId: string | null = null;
  const allLocations = await db.select().from(locations).limit(50);
  const baLocation = allLocations.find((l) =>
    l.name.toLowerCase().includes('buenos') || l.name.toLowerCase().includes('santiago'),
  );
  if (baLocation) locationId = baLocation.id;

  // Upsert profile
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
      slug: 'nearu-technologies',
      description: 'Plataforma de conexión profesional que utiliza inteligencia artificial.',
      locationId,
      founded: '2024',
      employees: '10-50',
      website: 'https://nearu.app',
      whatsapp: '+541112345678',
      bannerUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200',
      logoUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=200',
    });
    console.log('Profile created');
  } else {
    await db
      .update(profiles)
      .set({
        name: 'NearU Technologies',
        slug: 'nearu-technologies',
        description: 'Plataforma de conexión profesional que utiliza inteligencia artificial.',
        locationId,
        founded: '2024',
        employees: '10-50',
        website: 'https://nearu.app',
        whatsapp: '+541112345678',
        bannerUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200',
        logoUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=200',
        updatedAt: new Date(),
      })
      .where(eq(profiles.userId, userId));
    console.log('Profile updated');
  }

  // Upsert tags
  const tagNames = ['technology', 'ai', 'networking', 'innovation'];
  for (const name of tagNames) {
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    let [tag] = await db.select().from(tags).where(eq(tags.name, name)).limit(1);
    if (!tag) {
      const tagId = crypto.randomUUID();
      await db.insert(tags).values({ id: tagId, name, slug });
      tag = { id: tagId, name, slug, createdAt: new Date() };
    }

    const [existingRel] = await db
      .select()
      .from(profilesToTags)
      .where(and(
        eq(profilesToTags.profileId, profileIdToUse),
        eq(profilesToTags.tagId, tag.id),
      ))
      .limit(1);

    if (!existingRel) {
      await db.insert(profilesToTags).values({ profileId: profileIdToUse, tagId: tag.id });
    }
  }
  console.log(`Tags synced: ${tagNames.join(', ')}`);

  // Replace social links
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

  console.log(`${socialLinks.length} social links inserted`);

  // Show result
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

  console.log('\n=== PROFILE ===');
  console.log(JSON.stringify(result[0], null, 2));
  console.log('\n=== SOCIAL LINKS ===');
  console.log(JSON.stringify(links, null, 2));
  console.log('\nDone!');

  process.exit(0);
}

seedProfile().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
