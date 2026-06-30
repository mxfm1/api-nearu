import { eq } from 'drizzle-orm';
import { db } from '../src/shared/database';
import { regions, locations, categories } from '../src/shared/database/schema';

async function seedCatalog() {
  console.log('🌱 Sembrando catálogo de categorías, regiones y ubicaciones...\n');

  // ──────────────────────────────────────────────
  // CATEGORIES
  // ──────────────────────────────────────────────
  console.log('📁 Categorías...');

  const serviceCategories = [
    'Producción de Eventos',
    'Catering & Banquetes',
    'Iluminación',
    'Sonido & Audio',
    'Decoración',
    'Fotografía',
    'Streaming & Transmisión',
  ];

  const eventCategories = [
    'Música',
    'Comida & Bebida',
    'Tecnología',
    'Moda & Belleza',
    'Deportes',
    'Arte & Cultura',
    'Networking & Negocios',
    'Educación & Talleres',
  ];

  const allCategories = [
    ...serviceCategories.map((name) => ({
      id: crypto.randomUUID(),
      name,
      type: 'service' as const,
    })),
    ...eventCategories.map((name) => ({
      id: crypto.randomUUID(),
      name,
      type: 'event' as const,
    })),
  ];

  for (const cat of allCategories) {
    const existing = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.name, cat.name))
      .limit(1);

    if (!existing[0]) {
      await db.insert(categories).values(cat);
    }
  }
  console.log(`  ✓ ${allCategories.length} categorías registradas (${serviceCategories.length} servicio, ${eventCategories.length} evento)`);

  // ──────────────────────────────────────────────
  // REGIONS & LOCATIONS
  // ──────────────────────────────────────────────
  console.log('\n📍 Regiones y ubicaciones...');

  const regionsData = [
    {
      name: 'Metropolitana',
      slug: 'metropolitana',
      locations: [
        'Santiago, RM',
        'Providencia',
        'Las Condes',
        'Espacio Riesco, Santiago',
        'Centro de Convenciones, Santiago',
        'Hotel W, Santiago',
        'Parque Bicentenario, Santiago',
        'Teatro Municipal, Santiago',
        'Centro Cultural GAM',
        'Barrio Bellavista, Santiago',
        'CoWork Providencia',
      ],
    },
    {
      name: 'Valparaíso',
      slug: 'valparaiso',
      locations: ['Viña del Mar'],
    },
    {
      name: 'Biobío',
      slug: 'biobio',
      locations: ['Concepción'],
    },
    {
      name: 'Aysén',
      slug: 'aysen',
      locations: [],
    },
    {
      name: 'Magallanes',
      slug: 'magallanes',
      locations: ['Punta Arenas'],
    },
  ];

  for (const regionData of regionsData) {
    // Check if region already exists
    const existingRegion = await db
      .select({ id: regions.id })
      .from(regions)
      .where(eq(regions.slug, regionData.slug))
      .limit(1);

    let regionId: string;
    if (existingRegion[0]) {
      regionId = existingRegion[0].id;
      console.log(`  ~ ${regionData.name}: ya existe (${regionData.locations.length} ubicaciones)`);
    } else {
      regionId = crypto.randomUUID();
      await db.insert(regions).values({
        id: regionId,
        name: regionData.name,
        slug: regionData.slug,
      });
      console.log(`  ✓ ${regionData.name}: ${regionData.locations.length} ubicaciones`);
    }

    if (regionData.locations.length > 0) {
      // Check existing locations for this region to avoid duplicates
      const existingLocations = await db
        .select({ name: locations.name })
        .from(locations)
        .where(eq(locations.regionId, regionId));
      const existingNames = new Set(existingLocations.map((l) => l.name));

      const newLocations = regionData.locations
        .filter((name) => !existingNames.has(name))
        .map((name) => ({
          id: crypto.randomUUID(),
          name,
          regionId,
        }));

      if (newLocations.length > 0) {
        await db.insert(locations).values(newLocations);
      }
    }
  }

  console.log(`\n🎉 Catálogo listo! Total: ${allCategories.length} categorías, ${regionsData.length} regiones`);
  process.exit(0);
}

seedCatalog().catch((err) => {
  console.error('✗ Error:', err);
  process.exit(1);
});
