/**
 * Seed script: Events
 * Run: npx tsx scripts/prod/seed-events.ts
 *
 * Dependencies (run first):
 *   1. npx tsx scripts/prod/seed-statuses.ts
 *   2. npx tsx scripts/prod/seed-categories.ts
 *   3. npx tsx scripts/prod/seed-chile.ts
 *   4. Profiles must exist (run seed-demo.ts or create users/profiles manually)
 */

import { eq } from 'drizzle-orm';
import { db } from '../../src/shared/database';
import { events, profiles, locations, categories, statuses } from '../../src/shared/database/schema';

const eventsData = [
  {
    slug: 'hackathon-tech-2026',
    title: 'Hackathon Tech Chile 2026',
    description: '48 horas de innovación y desarrollo. Únete a equipos de todo Chile para crear soluciones tecnológicas que impacten a la comunidad.',
    requirements: 'Equipo de 2-4 personas. Conocimientos en desarrollo web, móvil o backend. Laptop propia.',
    startAt: new Date('2026-08-15T09:00:00-04:00'),
    applicationDeadline: new Date('2026-08-10T23:59:00-04:00'),
    thumbnailUrl: 'https://picsum.photos/seed/hackathon/800/600',
    bannerUrl: 'https://picsum.photos/seed/hackathon-banner/1200/400',
    requiredCandidates: 120,
    requiresVerifiedProfile: false,
    autoCloseWhenFilled: true,
    categorySlug: 'desarrollo-de-software',
    locationSlug: 'santiago',
  },
  {
    slug: 'networking-tech-santiago',
    title: 'Networking Tech Santiago',
    description: 'Evento de networking para profesionales del sector tecnológico. Oportunidades de negocio, empleo y colaboración.',
    requirements: 'Profesional o estudiante del área tech. Registro previo obligatorio.',
    startAt: new Date('2026-07-25T18:00:00-04:00'),
    applicationDeadline: new Date('2026-07-24T12:00:00-04:00'),
    thumbnailUrl: 'https://picsum.photos/seed/networking/800/600',
    bannerUrl: 'https://picsum.photos/seed/networking-banner/1200/400',
    requiredCandidates: 80,
    requiresVerifiedProfile: false,
    autoCloseWhenFilled: true,
    categorySlug: 'networking-empresarial',
    locationSlug: 'providencia',
  },
  {
    slug: 'feria-empleo-valparaiso',
    title: 'Feria de Empleo Valparaíso 2026',
    description: 'Encuentra tu próximo trabajo en la zona de Valparaíso. Más de 50 empresas reclutando activamente.',
    requirements: 'CV actualizado. Disponibilidad para entrevistas presenciales.',
    startAt: new Date('2026-08-01T10:00:00-04:00'),
    applicationDeadline: new Date('2026-07-28T23:59:00-04:00'),
    thumbnailUrl: 'https://picsum.photos/seed/feria/800/600',
    bannerUrl: 'https://picsum.photos/seed/feria-banner/1200/400',
    requiredCandidates: 200,
    requiresVerifiedProfile: true,
    autoCloseWhenFilled: true,
    categorySlug: 'ferias-exposiciones',
    locationSlug: 'valparaiso',
  },
  {
    slug: 'workshop-marketing-digital',
    title: 'Workshop: Marketing Digital para Pymes',
    description: 'Aprende a usar Google Ads, Meta Ads y SEO para hacer crecer tu negocio. Teórico-práctico con casos reales.',
    requirements: 'Ser dueño de pyme o encargado de marketing. Traer laptop.',
    startAt: new Date('2026-08-05T14:00:00-04:00'),
    applicationDeadline: new Date('2026-08-03T18:00:00-04:00'),
    thumbnailUrl: 'https://picsum.photos/seed/marketing/800/600',
    bannerUrl: 'https://picsum.photos/seed/marketing-banner/1200/400',
    requiredCandidates: 30,
    requiresVerifiedProfile: false,
    autoCloseWhenFilled: true,
    categorySlug: 'marketing-digital',
    locationSlug: 'las-condes',
  },
  {
    slug: 'junta-ejecutiva-gestion',
    title: 'Junta Ejecutiva: Gestión Ágil de Proyectos',
    description: 'Sesión ejecutiva para discutir metodologías ágiles, Scrum, Kanban y su implementación en empresas chilenas.',
    requirements: 'Cargo gerencial o de liderazgo de equipos. Confirmación de asistencia obligatoria.',
    startAt: new Date('2026-07-30T08:30:00-04:00'),
    applicationDeadline: new Date('2026-07-29T20:00:00-04:00'),
    thumbnailUrl: 'https://picsum.photos/seed/junta/800/600',
    bannerUrl: 'https://picsum.photos/seed/junta-banner/1200/400',
    requiredCandidates: 25,
    requiresVerifiedProfile: true,
    autoCloseWhenFilled: false,
    categorySlug: 'juntas-reuniones-ejecutivas',
    locationSlug: 'las-condes',
  },
  {
    slug: 'lanzamiento-producto-tech',
    title: 'Lanzamiento: Nueva Suite de ciberseguridad',
    description: 'Presentación oficial de nuestra nueva suite de ciberseguridad para empresas. Demo en vivo y descuentos de lanzamiento.',
    requirements: 'Profesional IT o Security. Empresa con infraestructura tecnológica.',
    startAt: new Date('2026-09-10T17:00:00-04:00'),
    applicationDeadline: new Date('2026-09-08T23:59:00-04:00'),
    thumbnailUrl: 'https://picsum.photos/seed/ciberseg/800/600',
    bannerUrl: 'https://picsum.photos/seed/ciberseg-banner/1200/400',
    requiredCandidates: 50,
    requiresVerifiedProfile: false,
    autoCloseWhenFilled: true,
    categorySlug: 'ciberseguridad',
    locationSlug: 'santiago',
  },
  {
    slug: 'after-office-tech',
    title: 'After Office Tech Chile',
    description: 'Encuentro casual para la comunidad tech de Santiago. Cerveza, networking y conversaciones interesantes.',
    requirements: 'Ser parte de la comunidad tech. Mayor de 18 años.',
    startAt: new Date('2026-08-20T19:00:00-04:00'),
    applicationDeadline: new Date('2026-08-20T14:00:00-04:00'),
    thumbnailUrl: 'https://picsum.photos/seed/afteroffice/800/600',
    bannerUrl: 'https://picsum.photos/seed/afteroffice-banner/1200/400',
    requiredCandidates: 100,
    requiresVerifiedProfile: false,
    autoCloseWhenFilled: true,
    categorySlug: 'after-office-cocktails-corporativos',
    locationSlug: 'providencia',
  },
  {
    slug: 'catering-corporativo-santiago',
    title: 'Servicio de Catering Corporativo',
    description: 'Catering para eventos empresariales, lanzamientos, capacitaciones y reuniones ejecutivas. Menú ejecutivo y coffee break.',
    requirements: 'Empresa o institución. Mínimo 20 personas.',
    startAt: new Date('2026-07-15T12:00:00-04:00'),
    applicationDeadline: new Date('2026-07-14T18:00:00-04:00'),
    thumbnailUrl: 'https://picsum.photos/seed/catering/800/600',
    bannerUrl: 'https://picsum.photos/seed/catering-banner/1200/400',
    requiredCandidates: 1,
    requiresVerifiedProfile: false,
    autoCloseWhenFilled: true,
    categorySlug: 'catering',
    locationSlug: 'santiago',
  },
];

async function getProfileIds(): Promise<string[]> {
  const result = await db.select({ id: profiles.id }).from(profiles).limit(10);
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
  console.log('🚀 Seeding events...\n');

  const profileIds = await getProfileIds();
  const statusId = await getStatusId('published');

  let inserted = 0;
  for (let i = 0; i < eventsData.length; i++) {
    const e = eventsData[i];
    const locationId = await getLocationId(e.locationSlug);
    const categoryId = await getCategoryId(e.categorySlug);
    const profileId = profileIds[i % profileIds.length];

    await db.insert(events).values({
      id: crypto.randomUUID(),
      profileId,
      slug: e.slug,
      title: e.title,
      description: e.description,
      requirements: e.requirements,
      startAt: e.startAt,
      applicationDeadline: e.applicationDeadline,
      thumbnailUrl: e.thumbnailUrl,
      bannerUrl: e.bannerUrl,
      requiredCandidates: e.requiredCandidates,
      selectedCandidates: 0,
      applicationCount: 0,
      requiresVerifiedProfile: e.requiresVerifiedProfile,
      autoCloseWhenFilled: e.autoCloseWhenFilled,
      locationId,
      categoryId,
      statusId,
    }).onConflictDoNothing();

    inserted++;
    console.log(`  ✓ ${e.title}`);
  }

  console.log(`\n✅ ${inserted} events seeded`);
}

main().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
