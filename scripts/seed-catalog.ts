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
    'Conferencias & Seminarios',
    'Congresos & Convenciones',
    'Lanzamientos de Producto',
    'Cenas de Gala & Premiaciones',
    'Talleres & Workshops Corporativos',
    'Ferias & Exposiciones',
    'Team Building & Retiros',
    'Juntas & Reuniones Ejecutivas',
    'Networking Empresarial',
    'After Office & Cocktails Corporativos',
  ];

  const toSlug = (name: string) =>
    name
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

  const allCategories = [
    ...serviceCategories.map((name) => ({
      id: crypto.randomUUID(),
      name,
      slug: toSlug(name),
      type: 'service' as const,
    })),
    ...eventCategories.map((name) => ({
      id: crypto.randomUUID(),
      name,
      slug: toSlug(name),
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
      name: 'Arica y Parinacota',
      slug: 'arica-y-parinacota',
      locations: [
        'Arica',
        'Parinacota',
        'Termas de Jurasi',
      ],
    },
    {
      name: 'Tarapacá',
      slug: 'tarapaca',
      locations: [
        'Iquique',
        'Alto Hospicio',
        'Humberstone',
      ],
    },
    {
      name: 'Antofagasta',
      slug: 'antofagasta',
      locations: [
        'Antofagasta',
        'San Pedro de Atacama',
        'Calama',
      ],
    },
    {
      name: 'Atacama',
      slug: 'atacama',
      locations: [
        'Copiapó',
        'Vallenar',
        'Bahía Inglesa',
      ],
    },
    {
      name: 'Coquimbo',
      slug: 'coquimbo',
      locations: [
        'La Serena',
        'Coquimbo',
        'Valle del Elqui',
      ],
    },
    {
      name: 'Valparaíso',
      slug: 'valparaiso',
      locations: [
        'Valparaíso',
        'Viña del Mar',
        'Concón',
        'Casablanca',
        'Centro de Convenciones Enjoy Viña',
        'Hotel Sheraton Miramar',
      ],
    },
    {
      name: 'Metropolitana',
      slug: 'metropolitana',
      locations: [
        'Santiago Centro',
        'Providencia',
        'Las Condes',
        'Vitacura',
        'Espacio Riesco',
        'Centro de Convenciones Metropolitan',
        'Hotel W Santiago',
        'Hotel Renaissance',
        'Parque Bicentenario',
        'Teatro Municipal',
        'Centro Cultural GAM',
        'GAM Digital',
        'Estación Mapocho',
        'Barrio Bellavista',
        'Centro de Convenciones CasaPiedra',
      ],
    },
    {
      name: "Libertador General Bernardo O'Higgins",
      slug: 'ohiggins',
      locations: [
        'Rancagua',
        'San Fernando',
        'Pichilemu',
        'Santa Cruz',
      ],
    },
    {
      name: 'Maule',
      slug: 'maule',
      locations: [
        'Talca',
        'Curicó',
        'Linares',
        'Constitución',
      ],
    },
    {
      name: 'Ñuble',
      slug: 'nuble',
      locations: [
        'Chillán',
        'San Carlos',
        'Termas de Chillán',
      ],
    },
    {
      name: 'Biobío',
      slug: 'biobio',
      locations: [
        'Concepción',
        'Talcahuano',
        'Los Ángeles',
        'Coronel',
        'Centro de Eventos Suractivo',
      ],
    },
    {
      name: 'La Araucanía',
      slug: 'la-araucania',
      locations: [
        'Temuco',
        'Pucón',
        'Villarrica',
        'Congreso Nacional de Eventos Pucón',
      ],
    },
    {
      name: 'Los Ríos',
      slug: 'los-rios',
      locations: [
        'Valdivia',
        'La Unión',
        'Neltume',
      ],
    },
    {
      name: 'Los Lagos',
      slug: 'los-lagos',
      locations: [
        'Puerto Montt',
        'Osorno',
        'Puerto Varas',
        'Chiloé',
        'Hotel Enjoy Puerto Varas',
      ],
    },
    {
      name: 'Aysén del General Carlos Ibáñez del Campo',
      slug: 'aysen',
      locations: [
        'Coyhaique',
        'Puerto Aysén',
        'Cerro Castillo',
      ],
    },
    {
      name: 'Magallanes y de la Antártica Chilena',
      slug: 'magallanes',
      locations: [
        'Punta Arenas',
        'Puerto Natales',
        'Torres del Paine',
      ],
    },
  ];

  for (const regionData of regionsData) {
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
      console.log(`  ✓ ${regionData.name}`);
    }

    if (regionData.locations.length > 0) {
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
          slug: toSlug(name),
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
