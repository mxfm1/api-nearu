import { eq, and } from 'drizzle-orm';
import { hashPassword } from '@better-auth/utils/password';
import { db } from '../src/shared/database';
import {
  users,
  accounts,
  profiles,
  services,
  events,
  contactRequests,
  categories,
  locations,
  statuses,
  tags,
  profilesToTags,
  serviceContacts,
} from '../src/shared/database/schema';

async function seedData() {
  console.log('Seeding sample data: services, events & inbox...\n');

  // ──────────────────────────────────────────────
  // 0. Resolve statuses
  // ──────────────────────────────────────────────
  console.log('Resolving status references...');
  const allStatuses = await db.select().from(statuses);
  const statusBySlug = Object.fromEntries(allStatuses.map((s) => [s.slug, s.id]));
  if (!statusBySlug.published) {
    console.error('Status "published" not found. Run npx tsx scripts/seed-statuses.ts first.');
    process.exit(1);
  }
  console.log(`  Published status ID: ${statusBySlug.published}`);

  // ──────────────────────────────────────────────
  // 1. Find catalog references
  // ──────────────────────────────────────────────
  console.log('\nLooking up categories and locations...');

  const allCategories = await db.select().from(categories);
  const allLocations = await db.select().from(locations);

  const serviceCats = allCategories.filter((c) => c.type === 'service');
  const eventCats = allCategories.filter((c) => c.type === 'event');

  if (serviceCats.length === 0 || eventCats.length === 0 || allLocations.length === 0) {
    console.error('Run npx tsx scripts/seed-catalog.ts first.');
    process.exit(1);
  }

  console.log(`  ${serviceCats.length} service cats, ${eventCats.length} event cats, ${allLocations.length} locations`);

  // ──────────────────────────────────────────────
  // 2. Clean previous seed data
  // ──────────────────────────────────────────────
  console.log('\nCleaning previous seed data...');

  const seedSlugs = [
    'produccion-eventos-corporativos',
    'catering-premium',
    'iluminacion-escenica',
    'festival-gastronomico-2026',
    'networking-startups-2026',
  ];

  for (const slug of seedSlugs.slice(0, 3)) {
    const [svc] = await db
      .select({ id: services.id })
      .from(services)
      .where(eq(services.slug, slug))
      .limit(1);
    if (svc) {
      await db.delete(contactRequests).where(eq(contactRequests.servicioId, svc.id));
      await db.delete(serviceContacts).where(eq(serviceContacts.serviceId, svc.id));
    }
    await db.delete(services).where(eq(services.slug, slug));
  }

  for (const slug of seedSlugs.slice(3)) {
    await db.delete(events).where(eq(events.slug, slug));
  }

  const seedEmails = ['owner@nearu.dev', 'interesado@correo.cl'];
  for (const email of seedEmails) {
    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (user) {
      await db.delete(users).where(eq(users.id, user.id));
    }
  }
  console.log('  Previous seed users removed');

  // ──────────────────────────────────────────────
  // 3. Create owner user
  // ──────────────────────────────────────────────
  console.log('\nCreating owner user (loggeable)...');

  const ownerId = crypto.randomUUID();
  const profileId = crypto.randomUUID();
  const now = new Date();

  const ownerEmail = 'owner@nearu.dev';
  const ownerPassword = 'SeedPass123!';

  const ownerExists = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, ownerEmail))
    .limit(1);

  if (ownerExists[0]) {
    console.log('  ~ Owner already exists, skipping...');
  } else {
    const hashedPassword = await hashPassword(ownerPassword);

    await db.insert(users).values({
      id: ownerId,
      name: 'EventPro Chile',
      email: ownerEmail,
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
    });

    await db.insert(accounts).values({
      id: crypto.randomUUID(),
      accountId: ownerEmail,
      providerId: 'credential',
      userId: ownerId,
      password: hashedPassword,
      createdAt: now,
      updatedAt: now,
    });

    console.log(`  Owner: ${ownerEmail} / ${ownerPassword}`);
  }

  // Profile
  const profileExists = await db
    .select({ id: profiles.id })
    .from(profiles)
    .where(eq(profiles.userId, ownerId))
    .limit(1);

  const finalProfileId = profileExists[0]?.id ?? profileId;

  if (!profileExists[0]) {
    const santiagoLoc = allLocations.find((l) => l.name.includes('Santiago Centro'));
    await db.insert(profiles).values({
      id: profileId,
      userId: ownerExists[0]?.id ?? ownerId,
      name: 'EventPro Chile',
      slug: 'eventpro-chile',
      description: 'Empresa líder en producción de eventos corporativos y sociales en Santiago.',
      locationId: santiagoLoc?.id ?? null,
      founded: '2018',
      employees: '10-50',
      website: 'https://eventpro.cl',
      whatsapp: '+56912345678',
      createdAt: now,
      updatedAt: now,
    });

    // Seed tags
    const tagNames = ['eventos', 'producción', 'catering', 'entretención'];
    for (const name of tagNames) {
      const slug = name
        .toLowerCase()
        .replace(/[á]/g, 'a').replace(/[é]/g, 'e').replace(/[ó]/g, 'o')
        .replace(/\s+/g, '-');

      let [tag] = await db.select().from(tags).where(eq(tags.name, name)).limit(1);
      if (!tag) {
        const tagId = crypto.randomUUID();
        await db.insert(tags).values({ id: tagId, name, slug });
        tag = { id: tagId, name, slug, createdAt: new Date() };
      }
      await db.insert(profilesToTags).values({ profileId, tagId: tag.id });
    }

    console.log('  Profile: EventPro Chile created with tags');
  } else {
    console.log('  ~ Profile already exists');
  }

  const finalOwnerId = ownerExists[0]?.id ?? ownerId;

  // ──────────────────────────────────────────────
  // 4. Create 3 PUBLISHED services
  // ──────────────────────────────────────────────
  console.log('\nCreating 3 services...');

  const servicesData = [
    {
      slug: 'produccion-eventos-corporativos',
      title: 'Producción de Eventos Corporativos',
      marca: 'EventPro',
      description: 'Producción integral de eventos corporativos...',
      yearsExperience: 8,
      priceMin: 1500000,
      priceMax: 15000000,
      availability: 'Lun-Sáb 9:00-22:00',
      contacts: [
        { type: 'email', value: 'contacto@eventpro.cl' },
        { type: 'whatsapp', value: '+56912345678' },
        { type: 'instagram', value: '@eventprochile' },
      ],
      categoryId: serviceCats[0]?.id ?? null,
      locationId: allLocations[0]?.id ?? null,
    },
    {
      slug: 'catering-premium',
      title: 'Catering Premium para Eventos',
      marca: 'EventPro Gastronomía',
      description: 'Servicio de catering de alto nivel...',
      yearsExperience: 5,
      priceMin: 25000,
      priceMax: 80000,
      availability: 'Previa reserva, 7 días',
      contacts: [
        { type: 'email', value: 'catering@eventpro.cl' },
        { type: 'whatsapp', value: '+56987654321' },
      ],
      categoryId: serviceCats.find((c) => c.name === 'Catering & Banquetes')?.id ?? serviceCats[1]?.id ?? null,
      locationId: allLocations[1]?.id ?? null,
    },
    {
      slug: 'iluminacion-escenica',
      title: 'Iluminación Escénica Profesional',
      marca: 'EventPro Light',
      description: 'Diseño e instalación de iluminación escénica...',
      yearsExperience: 10,
      priceMin: 500000,
      priceMax: 5000000,
      availability: 'Lun-Dom 24 hrs (eventos)',
      contacts: [
        { type: 'email', value: 'lighting@eventpro.cl' },
        { type: 'instagram', value: '@eventprolight' },
      ],
      categoryId: serviceCats.find((c) => c.name === 'Iluminación')?.id ?? serviceCats[2]?.id ?? null,
      locationId: allLocations[2]?.id ?? null,
    },
  ];

  const createdServiceIds: string[] = [];

  for (const svc of servicesData) {
    const existing = await db
      .select({ id: services.id })
      .from(services)
      .where(eq(services.slug, svc.slug))
      .limit(1);

    if (existing[0]) {
      console.log(`  ~ ${svc.title}: already exists`);
      createdServiceIds.push(existing[0].id);
      continue;
    }

    const id = crypto.randomUUID();
    const { contacts: svcContacts, ...serviceFields } = svc;
    await db.insert(services).values({
      id,
      profileId: finalProfileId,
      ...serviceFields,
      statusId: statusBySlug.published,
      createdAt: now,
      updatedAt: now,
    });

    // Insert contacts
    if (svcContacts.length > 0) {
      await db.insert(serviceContacts).values(
        svcContacts.map((c) => ({
          id: crypto.randomUUID(),
          serviceId: id,
          type: c.type,
          value: c.value,
        })),
      );
    }

    createdServiceIds.push(id);
    console.log(`  ${svc.title}`);
  }

  // ──────────────────────────────────────────────
  // 5. Create 2 PUBLISHED events
  // ──────────────────────────────────────────────
  console.log('\nCreating 2 events...');

  const eventsData = [
    {
      slug: 'festival-gastronomico-2026',
      title: 'Festival Gastronómico 2026',
      description: 'El evento culinario más grande del año...',
      startAt: new Date('2026-08-15T10:00:00-04:00'),
      categoryId: eventCats.find((c) => c.name === 'Ferias & Exposiciones')?.id ?? eventCats[0]?.id ?? null,
      locationId: allLocations.find((l) => l.name.includes('Espacio Riesco'))?.id ?? allLocations[0]?.id ?? null,
    },
    {
      slug: 'networking-startups-2026',
      title: 'Networking de Startups & Emprendedores',
      description: 'Encuentro mensual de startups, inversores y mentores...',
      startAt: new Date('2026-07-20T18:30:00-04:00'),
      categoryId: eventCats.find((c) => c.name === 'Networking Empresarial')?.id ?? eventCats[0]?.id ?? null,
      locationId: allLocations.find((l) => l.name.includes('CoWork'))?.id ?? allLocations[1]?.id ?? null,
    },
  ];

  const createdEventIds: string[] = [];

  for (const evt of eventsData) {
    const existing = await db
      .select({ id: events.id })
      .from(events)
      .where(eq(events.slug, evt.slug))
      .limit(1);

    if (existing[0]) {
      console.log(`  ~ ${evt.title}: already exists`);
      createdEventIds.push(existing[0].id);
      continue;
    }

    const id = crypto.randomUUID();
    await db.insert(events).values({
      id,
      profileId: finalProfileId,
      ...evt,
      statusId: statusBySlug.published,
      createdAt: now,
      updatedAt: now,
    });

    createdEventIds.push(id);
    console.log(`  ${evt.title}`);
  }

  // ──────────────────────────────────────────────
  // 6. Create random user (inquirer)
  // ──────────────────────────────────────────────
  console.log('\nCreating inquirer user...');

  const randomUserId = crypto.randomUUID();
  const randomEmail = 'interesado@correo.cl';

  const randomUserExists = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, randomEmail))
    .limit(1);

  const finalRandomUserId = randomUserExists[0]?.id ?? randomUserId;

  if (!randomUserExists[0]) {
    await db.insert(users).values({
      id: randomUserId,
      name: 'Carlos Méndez',
      email: randomEmail,
      emailVerified: false,
      createdAt: now,
      updatedAt: now,
    });
    console.log(`  Inquirer: ${randomEmail}`);
  } else {
    console.log(`  ~ Inquirer already exists`);
  }

  // ──────────────────────────────────────────────
  // 7. Create inbox entries (contact requests)
  // ──────────────────────────────────────────────
  console.log('\nCreating contact requests...');

  const messages = [
    `Hola! Me interesa mucho su servicio de "${servicesData[0].title}"...`,
    `Estimados, quería consultar por el servicio de "${servicesData[1].title}"...`,
    `Buenas! Vi que tienen "${servicesData[2].title}"...`,
    `Hola, me interesó el evento "${eventsData[0].title}"...`,
    `Buen día! Quería más info sobre "${eventsData[1].title}"...`,
  ];

  let inboxCount = 0;

  // Messages for services (serviceId FK)
  for (let i = 0; i < 3; i++) {
    const serviceId = createdServiceIds[i];
    if (!serviceId) continue;

    const existing = await db
      .select({ id: contactRequests.id })
      .from(contactRequests)
      .where(
        and(
          eq(contactRequests.servicioId, serviceId),
          eq(contactRequests.remitenteId, finalRandomUserId),
        ),
      )
      .limit(1);

    if (existing[0]) {
      console.log(`  ~ Message ${i + 1}: already exists`);
      inboxCount++;
      continue;
    }

    await db.insert(contactRequests).values({
      id: crypto.randomUUID(),
      servicioId: serviceId,
      propietarioId: finalOwnerId,
      remitenteId: finalRandomUserId,
      mensaje: messages[i],
      estado: 'pendiente',
      createdAt: new Date(Date.now() - (5 - i) * 86400000),
      updatedAt: new Date(Date.now() - (5 - i) * 86400000),
    });
    inboxCount++;
    console.log(`  Message ${i + 1}: "${servicesData[i].title}"`);
  }

  // Messages for events (eventoId FK)
  for (let i = 0; i < 2; i++) {
    const eventId = createdEventIds[i];
    if (!eventId) continue;

    const existing = await db
      .select({ id: contactRequests.id })
      .from(contactRequests)
      .where(
        and(
          eq(contactRequests.eventoId, eventId),
          eq(contactRequests.remitenteId, finalRandomUserId),
          eq(contactRequests.mensaje, messages[i + 3]),
        ),
      )
      .limit(1);

    if (existing[0]) {
      console.log(`  ~ Message ${i + 4}: already exists`);
      inboxCount++;
      continue;
    }

    await db.insert(contactRequests).values({
      id: crypto.randomUUID(),
      eventoId: eventId,
      propietarioId: finalOwnerId,
      remitenteId: finalRandomUserId,
      mensaje: messages[i + 3],
      estado: 'pendiente',
      createdAt: new Date(Date.now() - (2 - i) * 86400000),
      updatedAt: new Date(Date.now() - (2 - i) * 86400000),
    });
    inboxCount++;
    console.log(`  Message ${i + 4}: "${eventsData[i].title}"`);
  }

  // ──────────────────────────────────────────────
  // Summary
  // ──────────────────────────────────────────────
  console.log(`\nDone!`);
  console.log(`  Owner: ${ownerEmail} / ${ownerPassword}`);
  console.log(`  Inquirer: ${randomEmail}`);
  console.log(`  Services: ${createdServiceIds.length}`);
  console.log(`  Events: ${createdEventIds.length}`);
  console.log(`  Inbox messages: ${inboxCount}`);

  process.exit(0);
}

seedData().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
