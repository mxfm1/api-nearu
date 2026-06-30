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
} from '../src/shared/database/schema';

async function seedData() {
  console.log('🌱 Sembrando datos de ejemplo: servicios, eventos e inbox...\n');

  // ──────────────────────────────────────────────
  // 1. Buscar referencias de catálogo existentes
  // ──────────────────────────────────────────────
  console.log('📋 Buscando categorías y ubicaciones...');

  const allCategories = await db.select().from(categories);
  const allLocations = await db.select().from(locations);

  const serviceCats = allCategories.filter((c) => c.type === 'service');
  const eventCats = allCategories.filter((c) => c.type === 'event');

  if (serviceCats.length === 0 || eventCats.length === 0 || allLocations.length === 0) {
    console.error('✗ Necesitas ejecutar primero: npx tsx scripts/seed-catalog.ts');
    process.exit(1);
  }

  console.log(`  ✓ ${serviceCats.length} categorías de servicio, ${eventCats.length} de evento, ${allLocations.length} ubicaciones`);

  // ──────────────────────────────────────────────
  // 2. Limpiar datos de semillas anteriores
  // ──────────────────────────────────────────────
  console.log('\n🧹 Limpiando datos de semillas anteriores...');

  const seedSlugs = [
    'produccion-eventos-corporativos',
    'catering-premium',
    'iluminacion-escenica',
    'festival-gastronomico-2026',
    'networking-startups-2026',
  ];

  // Eliminar contact requests vinculados a servicios seed
  for (const slug of seedSlugs.slice(0, 3)) {
    const [svc] = await db
      .select({ id: services.id })
      .from(services)
      .where(eq(services.slug, slug))
      .limit(1);
    if (svc) {
      await db.delete(contactRequests).where(eq(contactRequests.servicioId, svc.id));
    }
    await db.delete(services).where(eq(services.slug, slug));
  }

  // Eliminar eventos por slug
  for (const slug of seedSlugs.slice(3)) {
    await db.delete(events).where(eq(events.slug, slug));
  }

  // Eliminar usuarios seed anteriores (por email conocido)
  const seedEmails = ['owner@nearu.dev', 'interesado@correo.cl'];
  for (const email of seedEmails) {
    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (user) {
      // El perfil se borra en cascada por FK
      await db.delete(users).where(eq(users.id, user.id));
    }
  }
  console.log('  ✓ Usuarios seed anteriores eliminados');

  // ──────────────────────────────────────────────
  // 3. Crear usuario propietario (logueable via API)
  // ──────────────────────────────────────────────
  console.log('\n👤 Creando usuario propietario (logueable)...');

  const ownerId = crypto.randomUUID();
  const profileId = crypto.randomUUID();
  const now = new Date();

  const ownerEmail = 'owner@nearu.dev';
  const ownerPassword = 'SeedPass123!';

  // Verificar que no exista ya
  const ownerExists = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, ownerEmail))
    .limit(1);

  if (ownerExists[0]) {
    console.log('  ~ Propietario ya existe, saltando...');
  } else {
    // Crear usuario con hash scrypt (formato BetterAuth: salt:key)
    const hashedPassword = await hashPassword(ownerPassword);

    await db.insert(users).values({
      id: ownerId,
      name: 'EventPro Chile',
      email: ownerEmail,
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
    });

    // Entry en accounts para que BetterAuth permita login con email+password
    await db.insert(accounts).values({
      id: crypto.randomUUID(),
      accountId: ownerEmail,
      providerId: 'credential',
      userId: ownerId,
      password: hashedPassword,
      createdAt: now,
      updatedAt: now,
    });

    console.log(`  ✓ Usuario propietario: ${ownerEmail} / ${ownerPassword}`);
  }

  // Profile del propietario
  const profileExists = await db
    .select({ id: profiles.id })
    .from(profiles)
    .where(eq(profiles.userId, ownerId))
    .limit(1);

  const finalProfileId = profileExists[0]?.id ?? profileId;

  if (!profileExists[0]) {
    await db.insert(profiles).values({
      id: profileId,
      userId: ownerExists[0]?.id ?? ownerId,
      name: 'EventPro Chile',
      industry: 'Producción de Eventos',
      description: 'Empresa líder en producción de eventos corporativos y sociales en Santiago.',
      tags: ['eventos', 'producción', 'catering', 'entretención'],
      location: 'Santiago, Chile',
      website: 'https://eventpro.cl',
      whatsapp: '+56912345678',
      createdAt: now,
      updatedAt: now,
    });
    console.log(`  ✓ Perfil: EventPro Chile`);
  } else {
    console.log(`  ~ Perfil ya existe`);
  }

  const finalOwnerId = ownerExists[0]?.id ?? ownerId;

  // ──────────────────────────────────────────────
  // 4. Crear 3 servicios PUBLICADOS
  // ──────────────────────────────────────────────
  console.log('\n📦 Creando 3 servicios...');

  const servicesData = [
    {
      slug: 'produccion-eventos-corporativos',
      title: 'Producción de Eventos Corporativos',
      marca: 'EventPro',
      description: 'Producción integral de eventos corporativos: lanzamientos, cenas de gala, convenciones y team building. Incluye coordinación de proveedores, montaje de escenarios, equipos de sonido e iluminación profesional.',
      yearsExperience: 8,
      priceMin: 1500000,
      priceMax: 15000000,
      availability: 'Lun-Sáb 9:00-22:00',
      contactInfo: [
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
      description: 'Servicio de catering de alto nivel para toda ocasión. Menús personalizados con ingredientes frescos y de temporada. Opciones: cocktail, cena sentada, buffet, food stations temáticos.',
      yearsExperience: 5,
      priceMin: 25000,
      priceMax: 80000,
      availability: 'Previa reserva, 7 días',
      contactInfo: [
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
      description: 'Diseño e instalación de iluminación escénica para eventos, conciertos y espectáculos. Equipamiento LED, cabezas móviles, laser show, mapping arquitectónico y efectos especiales.',
      yearsExperience: 10,
      priceMin: 500000,
      priceMax: 5000000,
      availability: 'Lun-Dom 24 hrs (eventos)',
      contactInfo: [
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
      console.log(`  ~ ${svc.title}: ya existe`);
      createdServiceIds.push(existing[0].id);
      continue;
    }

    const id = crypto.randomUUID();
    await db.insert(services).values({
      id,
      profileId: finalProfileId,
      slug: svc.slug,
      title: svc.title,
      marca: svc.marca,
      description: svc.description,
      yearsExperience: svc.yearsExperience,
      priceMin: svc.priceMin,
      priceMax: svc.priceMax,
      availability: svc.availability,
      contactInfo: svc.contactInfo as any,
      categoryId: svc.categoryId,
      locationId: svc.locationId,
      serviceStatus: 'published',
      createdAt: now,
      updatedAt: now,
    });

    createdServiceIds.push(id);
    console.log(`  ✓ ${svc.title}`);
  }

  // ──────────────────────────────────────────────
  // 5. Crear 2 eventos PUBLICADOS
  // ──────────────────────────────────────────────
  console.log('\n🎪 Creando 2 eventos...');

  const eventsData = [
    {
      slug: 'festival-gastronomico-2026',
      title: 'Festival Gastronómico 2026',
      description: 'El evento culinario más grande del año. Más de 50 expositores, food trucks, catas de vino, clases de cocina en vivo y competencias gastronómicas. Imperdible para los amantes de la buena mesa.',
      startAt: new Date('2026-08-15T10:00:00-04:00'),
      categoryId: eventCats.find((c) => c.name === 'Comida & Bebida')?.id ?? eventCats[0]?.id ?? null,
      locationId: allLocations.find((l) => l.name.includes('Espacio Riesco'))?.id ?? allLocations[0]?.id ?? null,
    },
    {
      slug: 'networking-startups-2026',
      title: 'Networking de Startups & Emprendedores',
      description: 'Encuentro mensual de startups, inversores y mentores del ecosistema tech chileno. Charlas inspiradoras, pitch sessions y mucho networking. ¡No faltes!',
      startAt: new Date('2026-07-20T18:30:00-04:00'),
      categoryId: eventCats.find((c) => c.name === 'Networking & Negocios')?.id ?? eventCats[0]?.id ?? null,
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
      console.log(`  ~ ${evt.title}: ya existe`);
      createdEventIds.push(existing[0].id);
      continue;
    }

    const id = crypto.randomUUID();
    await db.insert(events).values({
      id,
      profileId: finalProfileId,
      slug: evt.slug,
      title: evt.title,
      description: evt.description,
      startAt: evt.startAt,
      categoryId: evt.categoryId,
      locationId: evt.locationId,
      eventStatus: 'published',
      createdAt: now,
      updatedAt: now,
    });

    createdEventIds.push(id);
    console.log(`  ✓ ${evt.title}`);
  }

  // ──────────────────────────────────────────────
  // 6. Crear usuario random (el que consulta)
  // ──────────────────────────────────────────────
  console.log('\n👤 Creando usuario interesado (random)...');

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
    console.log(`  ✓ Usuario interesado: ${randomEmail}`);
  } else {
    console.log(`  ~ Usuario interesado ya existe`);
  }

  // ──────────────────────────────────────────────
  // 7. Crear entries de inbox (contact requests)
  // ──────────────────────────────────────────────
  console.log('\n📬 Creando solicitudes de contacto (inbox)...');

  const messages = [
    `Hola! Me interesa mucho su servicio de "${servicesData[0].title}". ¿Podrían contarme más detalles sobre los paquetes disponibles para eventos corporativos de hasta 200 personas?`,
    `Estimados, quería consultar por el servicio de "${servicesData[1].title}" para un matrimonio de 150 invitados en Noviembre. ¿Tienen fechas disponibles y cuáles son los menús que ofrecen?`,
    `Buenas! Vi que tienen "${servicesData[2].title}". ¿Realizan instalaciones para eventos al aire libre? Necesito iluminación para una fiesta empresarial en una parcela.`,
    `Hola, me interesó el evento "${eventsData[0].title}". ¿Cómo puedo comprar entradas y hay descuentos por grupo?`,
    `Buen día! Quería más info sobre "${eventsData[1].title}". ¿Es necesario inscribirse con anticipación o se puede llegar sin registro?`,
  ];

  let inboxCount = 0;

  // Messages about services (3)
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
      console.log(`  ~ Mensaje ${i + 1}: ya existe`);
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
    console.log(`  ✓ Mensaje ${i + 1}: "${servicesData[i].title}"`);
  }

  // Messages about events (use first service as FK, message references the event)
  for (let i = 0; i < 2; i++) {
    const serviceId = createdServiceIds[0]; // FK to services table
    if (!serviceId) continue;

    const existing = await db
      .select({ id: contactRequests.id })
      .from(contactRequests)
      .where(
        and(
          eq(contactRequests.servicioId, serviceId),
          eq(contactRequests.remitenteId, finalRandomUserId),
          eq(contactRequests.mensaje, messages[i + 3]),
        ),
      )
      .limit(1);

    if (existing[0]) {
      console.log(`  ~ Mensaje ${i + 4}: ya existe`);
      inboxCount++;
      continue;
    }

    await db.insert(contactRequests).values({
      id: crypto.randomUUID(),
      servicioId: serviceId,
      propietarioId: finalOwnerId,
      remitenteId: finalRandomUserId,
      mensaje: messages[i + 3],
      estado: 'pendiente',
      createdAt: new Date(Date.now() - (2 - i) * 86400000),
      updatedAt: new Date(Date.now() - (2 - i) * 86400000),
    });
    inboxCount++;
    console.log(`  ✓ Mensaje ${i + 4}: "${eventsData[i].title}"`);
  }

  // ──────────────────────────────────────────────
  // Summary
  // ──────────────────────────────────────────────
  console.log(`\n🎉 Datos sembrados exitosamente!`);
  console.log(`  ───────────────────────────────────────`);
  console.log(`  👤 Propietario:     ${ownerEmail}`);
  console.log(`  🔑 Contraseña:      ${ownerPassword}`);
  console.log(`  📦 Servicios:       ${createdServiceIds.length}`);
  console.log(`  🎪 Eventos:         ${createdEventIds.length}`);
  console.log(`  👤 Interesado:      ${randomEmail}`);
  console.log(`  📬 Mensajes inbox:  ${inboxCount}`);
  console.log(`\n📌 Probar endpoints públicos:`);
  console.log(`  curl http://localhost:3000/api/servicios`);
  console.log(`  curl http://localhost:3000/api/eventos`);
  console.log(`  curl http://localhost:3000/api/profiles/${finalProfileId}`);
  console.log(`\n📌 Probar inbox (loguearse como propietario):`);
  console.log(`  curl -X POST http://localhost:3000/api/auth/sign-in/email \\`);
  console.log(`    -H "Content-Type: application/json" \\`);
  console.log(`    -d '{"email":"${ownerEmail}","password":"${ownerPassword}"}'`);
  console.log(`\n  → Usar el cookie de la respuesta para:`);
  console.log(`  curl http://localhost:3000/api/contactos/inbox \\`);
  console.log(`    -H "Cookie: <session-cookie>"`);

  process.exit(0);
}

seedData().catch((err) => {
  console.error('✗ Error:', err);
  process.exit(1);
});
