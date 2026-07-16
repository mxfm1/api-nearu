/**
 * Seed script: Services
 * Run: npx tsx scripts/prod/seed-services.ts
 *
 * Dependencies (run first):
 *   1. npx tsx scripts/prod/seed-statuses.ts
 *   2. npx tsx scripts/prod/seed-categories.ts
 *   3. npx tsx scripts/prod/seed-chile.ts
 *   4. Profiles must exist (run seed-demo.ts or create users/profiles manually)
 */

import { eq } from 'drizzle-orm';
import { db } from '../../src/shared/database';
import { services, profiles, locations, categories, statuses } from '../../src/shared/database/schema';

const servicesData = [
  {
    slug: 'desarrollo-web-techchile',
    title: 'Desarrollo Web a Medida',
    marca: 'TechChile',
    description: 'Creamos aplicaciones web personalizadas con React, Node.js y bases de datos PostgreSQL. Incluye diseño responsive, API REST y despliegue en cloud.',
    yearsExperience: 8,
    priceMin: 1500000,
    priceMax: 15000000,
    availability: 'Lunes a viernes, 9:00 - 18:00 hrs',
    thumbnailUrl: 'https://picsum.photos/seed/webdev/800/600',
    bannerUrl: 'https://picsum.photos/seed/webdev-banner/1200/400',
    logoUrl: 'https://picsum.photos/seed/webdev-logo/200/200',
    categorySlug: 'desarrollo-de-software',
    locationSlug: 'santiago',
  },
  {
    slug: 'soporte-ti-andeslog',
    title: 'Soporte TI Remoto y Presencial',
    marca: 'AndesLogística',
    description: 'Servicio de soporte técnico para empresas. Mesa de ayuda, mantenimiento preventivo, configuración de redes y seguridad básica.',
    yearsExperience: 5,
    priceMin: 500000,
    priceMax: 3000000,
    availability: '24/7 para clientes premium. Horario normal 8:00 - 20:00',
    thumbnailUrl: 'https://picsum.photos/seed/soporte/800/600',
    bannerUrl: 'https://picsum.photos/seed/soporte-banner/1200/400',
    logoUrl: 'https://picsum.photos/seed/soporte-logo/200/200',
    categorySlug: 'soporte-ti',
    locationSlug: 'antofagasta',
  },
  {
    slug: 'marketing-digital-capital',
    title: 'Gestión de Marketing Digital',
    marca: 'Capital Humano',
    description: 'Administramos tus redes sociales, campañas de Google Ads y Meta Ads. Reportes mensuales con métricas de rendimiento.',
    yearsExperience: 6,
    priceMin: 800000,
    priceMax: 5000000,
    availability: 'Lunes a viernes, 9:00 - 19:00 hrs',
    thumbnailUrl: 'https://picsum.photos/seed/marketingdig/800/600',
    bannerUrl: 'https://picsum.photos/seed/marketingdig-banner/1200/400',
    logoUrl: 'https://picsum.photos/seed/marketingdig-logo/200/200',
    categorySlug: 'marketing-digital',
    locationSlug: 'las-condes',
  },
  {
    slug: 'diseno-grafico-creatív',
    title: 'Diseño Gráfico Corporativo',
    marca: 'Creatív Studio',
    description: 'Diseño de branding, logotipos, folletos, presentaciones corporativas y material publicitario. Archivos editables en AI, PSD, INDD.',
    yearsExperience: 10,
    priceMin: 300000,
    priceMax: 2000000,
    availability: 'Lunes a viernes, 10:00 - 19:00 hrs',
    thumbnailUrl: 'https://picsum.photos/seed/diseno/800/600',
    bannerUrl: 'https://picsum.photos/seed/diseno-banner/1200/400',
    logoUrl: 'https://picsum.photos/seed/diseno-logo/200/200',
    categorySlug: 'diseno-grafico',
    locationSlug: 'valparaiso',
  },
  {
    slug: 'logistica-distribucion',
    title: 'Logística y Distribución Nacional',
    marca: 'AndesLogística',
    description: 'Transporte de carga, bodegaje y distribución last-mile. Cobertura desde Arica a Punta Arenas. Flota propia y socios estrategicos.',
    yearsExperience: 14,
    priceMin: 1000000,
    priceMax: 50000000,
    availability: 'Lunes a sábado, 7:00 - 22:00 hrs',
    thumbnailUrl: 'https://picsum.photos/seed/logistica/800/600',
    bannerUrl: 'https://picsum.photos/seed/logistica-banner/1200/400',
    logoUrl: 'https://picsum.photos/seed/logistica-logo/200/200',
    categorySlug: 'logistica',
    locationSlug: 'antofagasta',
  },
  {
    slug: 'produccion-eventos-corporativos',
    title: 'Producción de Eventos Corporativos',
    marca: 'Eventos Plus',
    description: 'Organización integral de eventos empresariales: lanzamientos, convenciones, seminarios y team buildings. Incluye catering y audiovisuales.',
    yearsExperience: 7,
    priceMin: 2000000,
    priceMax: 50000000,
    availability: 'Lunes a domingo, según demanda',
    thumbnailUrl: 'https://picsum.photos/seed/eventos/800/600',
    bannerUrl: 'https://picsum.photos/seed/eventos-banner/1200/400',
    logoUrl: 'https://picsum.photos/seed/eventos-logo/200/200',
    categorySlug: 'produccion-de-eventos',
    locationSlug: 'providencia',
  },
  {
    slug: 'consultoria-financiera',
    title: 'Asesoría Financiera Empresarial',
    marca: 'Capital Humano',
    description: 'Consultoría en estructuración financiera, valoración de empresas, due diligence y levantar capital. Equipo CPA y MBA.',
    yearsExperience: 12,
    priceMin: 1500000,
    priceMax: 20000000,
    availability: 'Lunes a viernes, 9:00 - 18:00 hrs',
    thumbnailUrl: 'https://picsum.photos/seed/finance/800/600',
    bannerUrl: 'https://picsum.photos/seed/finance-banner/1200/400',
    logoUrl: 'https://picsum.photos/seed/finance-logo/200/200',
    categorySlug: 'asesoria-financiera',
    locationSlug: 'las-condes',
  },
  {
    slug: 'alquiler-equipos-oficina',
    title: 'Alquiler de Equipos de Oficina',
    marca: 'TechChile',
    description: 'Arriendo de notebooks, monitores, impresoras y equipos de networking para oficinas y eventos. Entrega y retiro sin costo en Santiago.',
    yearsExperience: 4,
    priceMin: 50000,
    priceMax: 500000,
    availability: 'Lunes a sábado, 8:00 - 20:00 hrs',
    thumbnailUrl: 'https://picsum.photos/seed/equipos/800/600',
    bannerUrl: 'https://picsum.photos/seed/equipos-banner/1200/400',
    logoUrl: 'https://picsum.photos/seed/equipos-logo/200/200',
    categorySlug: 'alquiler-de-equipos',
    locationSlug: 'santiago',
  },
  {
    slug: 'construccion-oficinas',
    title: 'Remodelación y Construcción de Oficinas',
    marca: 'BuildCorp',
    description: 'Diseño de interiores comerciales, ampliación de oficinas, instalación de cielos, pisos técnicos y sistemas eléctricos. Gestión de permisos.',
    yearsExperience: 15,
    priceMin: 5000000,
    priceMax: 200000000,
    availability: 'Lunes a sábado, 8:00 - 18:00 hrs',
    thumbnailUrl: 'https://picsum.photos/seed/construccion/800/600',
    bannerUrl: 'https://picsum.photos/seed/construccion-banner/1200/400',
    logoUrl: 'https://picsum.photos/seed/construccion-logo/200/200',
    categorySlug: 'construccion',
    locationSlug: 'santiago',
  },
  {
    slug: 'limpieza-industrial',
    title: 'Limpieza Industrial y Comercial',
    marca: 'CleanPro',
    description: 'Servicio de limpieza para oficinas, bodegas, plantas industriales y eventos. Personal capacitado y productos certificados.',
    yearsExperience: 9,
    priceMin: 300000,
    priceMax: 10000000,
    availability: '24/7,365 días',
    thumbnailUrl: 'https://picsum.photos/seed/limpieza/800/600',
    bannerUrl: 'https://picsum.photos/seed/limpieza-banner/1200/400',
    logoUrl: 'https://picsum.photos/seed/limpieza-logo/200/200',
    categorySlug: 'limpieza-industrial',
    locationSlug: 'puente-alto',
  },
  {
    slug: 'seguridad-corporativa',
    title: 'Seguridad Corporativa y Eventos',
    marca: 'SecureChile',
    description: 'Servicio de vigilancia para empresas, eventos masivos y construcciones. Guards certificados y sistemas de cámaras con monitoreo remoto.',
    yearsExperience: 11,
    priceMin: 800000,
    priceMax: 15000000,
    availability: '24/7 todo el año',
    thumbnailUrl: 'https://picsum.photos/seed/seguridad/800/600',
    bannerUrl: 'https://picsum.photos/seed/seguridad-banner/1200/400',
    logoUrl: 'https://picsum.photos/seed/seguridad-logo/200/200',
    categorySlug: 'seguridad',
    locationSlug: 'santiago',
  },
  {
    slug: 'capacitacion-corporativa',
    title: 'Capacitación y Talleres Empresariales',
    marca: 'Capital Humano',
    description: 'Talleres de liderazgo, trabajo en equipo, Excel avanzado, gestión del tiempo y habilidades blandas. Modalidad in-house u online.',
    yearsExperience: 8,
    priceMin: 500000,
    priceMax: 5000000,
    availability: 'Lunes a viernes, 9:00 - 19:00 hrs. Sábados con cita.',
    thumbnailUrl: 'https://picsum.photos/seed/capacitacion/800/600',
    bannerUrl: 'https://picsum.photos/seed/capacitacion-banner/1200/400',
    logoUrl: 'https://picsum.photos/seed/capacitacion-logo/200/200',
    categorySlug: 'capacitacion',
    locationSlug: 'providencia',
  },
];

async function getProfileIds(): Promise<string[]> {
  const result = await db.select({ id: profiles.id }).from(profiles).limit(20);
  if (result.length === 0) throw new Error('No profiles found — run seed-demo.ts first');
  return result.map((r) => r.id);
}

async function getLocationId(slug: string): Promise<string | null> {
  const [loc] = await db.select({ id: locations.id }).from(locations).where(eq(locations.slug, slug)).limit(1);
  return loc?.id ?? null;
}

async function getCategoryId(slug: string): Promise<string | null> {
  const [cat] = await db.select({ id: categories.id }).from(categories).where(eq(categories.slug, slug)).limit(1);
  return cat?.id ?? null;
}

async function getStatusId(slug: string): Promise<string> {
  const [s] = await db.select({ id: statuses.id }).from(statuses).where(eq(statuses.slug, slug)).limit(1);
  if (!s) throw new Error(`Status '${slug}' not found`);
  return s.id;
}

async function main() {
  console.log('🚀 Seeding services...\n');

  const profileIds = await getProfileIds();
  const statusId = await getStatusId('published');

  let inserted = 0;
  for (let i = 0; i < servicesData.length; i++) {
    const s = servicesData[i];
    const locationId = await getLocationId(s.locationSlug);
    const categoryId = await getCategoryId(s.categorySlug);
    const profileId = profileIds[i % profileIds.length];

    await db.insert(services).values({
      id: crypto.randomUUID(),
      profileId,
      slug: s.slug,
      title: s.title,
      marca: s.marca,
      description: s.description,
      yearsExperience: s.yearsExperience,
      priceMin: s.priceMin,
      priceMax: s.priceMax,
      availability: s.availability,
      thumbnailUrl: s.thumbnailUrl,
      bannerUrl: s.bannerUrl,
      logoUrl: s.logoUrl,
      locationId,
      categoryId,
      statusId,
    }).onConflictDoNothing();

    inserted++;
    console.log(`  ✓ ${s.title}`);
  }

  console.log(`\n✅ ${inserted} services seeded`);
}

main().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
