/**
 * Seed script for Chile Regions and Locations
 * Run: npx tsx scripts/prod/seed-chile.ts
 *
 * Data source: user-provided Chilean regions
 */

import { eq } from 'drizzle-orm';
import { db } from '../../src/shared/database';
import { regions, locations } from '../../src/shared/database/schema';

const toSlug = (name: string) =>
  name
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

// Chilean regions data (user-provided)
const chileRegions = [
  {
    id: 'CL-AP',
    name: 'Arica y Parinacota',
    slug: 'arica-y-parinacota',
    locations: ['Arica', 'Parinacota', 'Camarones', 'Putre', 'General Lagos'],
  },
  {
    id: 'CL-TA',
    name: 'Tarapacá',
    slug: 'tarapaca',
    locations: ['Iquique', 'Alto Hospicio', 'Huara', 'Pica', 'Pozo Almonte', 'La Tirana'],
  },
  {
    id: 'CL-AN',
    name: 'Antofagasta',
    slug: 'antofagasta',
    locations: ['Antofagasta', 'Calama', 'San Pedro de Atacama', 'Tocopilla', 'Mejillones', 'María Elena'],
  },
  {
    id: 'CL-AT',
    name: 'Atacama',
    slug: 'atacama',
    locations: ['Copiapó', 'Caldera', 'Tierra Amarilla', 'Chañaral', 'Vallenar', 'Freirina'],
  },
  {
    id: 'CL-CO',
    name: 'Coquimbo',
    slug: 'coquimbo',
    locations: ['La Serena', 'Coquimbo', 'Ovalle', 'Illapel', 'Vicuña', 'Los Vilos', 'Salamanca'],
  },
  {
    id: 'CL-VS',
    name: 'Valparaíso',
    slug: 'valparaiso',
    locations: [
      'Valparaíso',
      'Viña del Mar',
      'Concón',
      'Quilpué',
      'Villa Alemana',
      'San Antonio',
      'Quillota',
      'Los Andes',
      'Petorca',
    ],
  },
  {
    id: 'CL-RM',
    name: 'Región Metropolitana de Santiago',
    slug: 'region-metropolitana-de-santiago',
    locations: [
      'Santiago Centro',
      'Providencia',
      'Las Condes',
      'Vitacura',
      'La Reina',
      'Ñuñoa',
      'Macul',
      'Peñalolén',
      'Maipú',
      'Pudahuel',
      'Cerro Navia',
      'Quinta Normal',
      'Estación Central',
      'San Bernardo',
      'Puente Alto',
      'La Florida',
      'San José de Maipo',
    ],
  },
  {
    id: 'CL-LI',
    name: 'Libertador General Bernardo O Higgins',
    slug: 'libertador-general-bernardo-ohiggins',
    locations: ['Rancagua', 'San Fernando', 'Pichilemu', 'Santa Cruz', 'Graneros', 'Machalí', 'San Vicente'],
  },
  {
    id: 'CL-ML',
    name: 'Maule',
    slug: 'maule',
    locations: ['Talca', 'Curicó', 'Linares', 'Cauquenes', 'Constitución', 'Parral', 'San Javier'],
  },
  {
    id: 'CL-NB',
    name: 'Ñuble',
    slug: 'nuble',
    locations: ['Chillán', 'San Carlos', 'Bulnes', 'Quirihue', 'Cobquecura', 'Termas de Chillán'],
  },
  {
    id: 'CL-BI',
    name: 'Biobío',
    slug: 'biobio',
    locations: [
      'Concepción',
      'Talcahuano',
      'Los Ángeles',
      'Chiguayante',
      'San Pedro de la Paz',
      'Coronel',
      'Lota',
      'Tomé',
      'Penco',
    ],
  },
  {
    id: 'CL-AR',
    name: 'La Araucanía',
    slug: 'la-araucania',
    locations: ['Temuco', 'Pucón', 'Villarrica', 'Angol', 'Vicuña', 'Padre Las Casas', ' Lautaro'],
  },
  {
    id: 'CL-LR',
    name: 'Los Ríos',
    slug: 'los-rios',
    locations: ['Valdivia', 'La Unión', 'Río Bueno', 'Panguipulli', 'Llanquihue', 'Futrono', ' Lago Ranco'],
  },
  {
    id: 'CL-LL',
    name: 'Los Lagos',
    slug: 'los-lagos',
    locations: [
      'Puerto Montt',
      'Osorno',
      'Puerto Varas',
      'Castro',
      'Ancud',
      'Quellón',
      'Frutillar',
      'Llanquihue',
    ],
  },
  {
    id: 'CL-AI',
    name: 'Aysén del General Carlos Ibáñez del Campo',
    slug: 'aysen-del-general-carlos-ibanez-del-campo',
    locations: ['Coyhaique', 'Puerto Aysén', 'Chile Chico', 'Río Ibáñez', 'Cisnes', 'Guaitecas'],
  },
  {
    id: 'CL-MA',
    name: 'Magallanes y de la Antártica Chilena',
    slug: 'magallanes-y-antartica-chilena',
    locations: ['Punta Arenas', 'Puerto Natales', 'Porvenir', 'Puerto Williams', 'Torres del Paine', ' Primavera'],
  },
];

async function seedChile() {
  console.log('🇨🇱 Seed script: Chile Regions & Locations\n');

  let totalRegions = 0;
  let totalLocations = 0;

  for (const regionData of chileRegions) {
    // Check if region exists
    const existingRegion = await db
      .select({ id: regions.id })
      .from(regions)
      .where(eq(regions.id, regionData.id))
      .limit(1);

    let regionId: string;

    if (existingRegion[0]) {
      regionId = existingRegion[0].id;
      console.log(`  ~ ${regionData.name} (ya existe)`);
    } else {
      await db.insert(regions).values({
        id: regionData.id,
        name: regionData.name,
        slug: regionData.slug,
      });
      regionId = regionData.id;
      totalRegions++;
      console.log(`  ✓ ${regionData.name}`);
    }

    // Insert locations - check against ALL existing slugs in DB
    const allExistingLocations = await db.select({ name: locations.name, slug: locations.slug }).from(locations);
    const existingNames = new Set(allExistingLocations.map((l) => l.name));
    const existingSlugs = new Set(allExistingLocations.map((l) => l.slug));

    const newLocations = regionData.locations
      .filter((name) => !existingNames.has(name.trim()))
      .map((name) => {
        let slug = toSlug(name);
        // Handle duplicate slugs by adding region suffix
        if (existingSlugs.has(slug)) {
          slug = `${slug}-${regionData.slug}`;
        }
        return {
          id: crypto.randomUUID(),
          name: name.trim(),
          slug,
          regionId,
        };
      })
      .filter((loc) => !existingSlugs.has(loc.slug));

    if (newLocations.length > 0) {
      await db.insert(locations).values(newLocations);
      totalLocations += newLocations.length;
    }

    const newCount = newLocations.length;
    if (newCount > 0) {
      console.log(`    + ${newCount} ubicaciones agregadas`);
    }
  }

  console.log(`\n✅ Seed completado!`);
  console.log(`   Regiones: ${totalRegions} nuevas`);
  console.log(`   Ubicaciones: ${totalLocations} nuevas`);
  console.log(`   Total regiones en BD: ${chileRegions.length}`);

  process.exit(0);
}

seedChile().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
