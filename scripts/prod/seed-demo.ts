/**
 * Seed script: Demo data — 4 companies, 4 services, 6 events
 * Run: npx tsx scripts/prod/seed-demo.ts
 *
 * Dependencies:
 *   1. statuses must already be seeded  → seed-statuses.ts
 *   2. categories must already be seeded → seed-categories.ts
 *   3. regions & locations must be seeded → seed-chile.ts
 *
 * Order:
 *   npx tsx scripts/prod/seed-statuses.ts
 *   npx tsx scripts/prod/seed-categories.ts
 *   npx tsx scripts/prod/seed-chile.ts
 *   npx tsx scripts/prod/seed-demo.ts
 */

import { eq, sql } from 'drizzle-orm';
import { db } from '../../src/shared/database';
import {
  users,
  profiles,
  statuses,
  categories,
  locations,
  services,
  servicePortfolio,
  serviceContacts,
  profileSocialLinks,
  events,
  profilesToTags,
  tags,
} from '../../src/shared/database/schema';

// ──────────────────────────────────────────────
// Helper
// ──────────────────────────────────────────────
async function getStatusId(slug: string): Promise<string> {
  const [s] = await db.select({ id: statuses.id }).from(statuses).where(eq(statuses.slug, slug)).limit(1);
  if (!s) throw new Error(`Status '${slug}' not found — run seed-statuses.ts first`);
  return s.id;
}

// Cache for location ID resolution (LOC-* slug -> UUID)
const locationIdCache = new Map<string, string>();

async function resolveLocationId(locId: string): Promise<string | null> {
  if (locationIdCache.has(locId)) {
    return locationIdCache.get(locId)!;
  }
  // Try to find by slug (LOC-* format maps to slug like 'las-condes' -> 'las-condes')
  const slugFromLocId = locId.replace('LOC-', '').toLowerCase().replace(/-/g, '-');
  const [loc] = await db.select({ id: locations.id }).from(locations).where(eq(locations.slug, slugFromLocId)).limit(1);
  if (loc) {
    locationIdCache.set(locId, loc.id);
    return loc.id;
  }
  // Try direct lookup (might be a UUID already)
  const [locById] = await db.select({ id: locations.id }).from(locations).where(eq(locations.id, locId)).limit(1);
  if (locById) {
    locationIdCache.set(locId, locById.id);
    return locById.id;
  }
  return null;
}

// ──────────────────────────────────────────────
// 1. USERS
// ──────────────────────────────────────────────
const companies = [
  {
    userId: 'USER-TECHCHILE',
    name: 'TechChile SpA',
    email: 'contacto@techchile.cl',
    profile: {
      id: 'PROF-TECHCHILE',
      userId: 'USER-TECHCHILE',
      slug: 'techchile',
      bannerUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80',
      logoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
      name: 'TechChile SpA',
      description:
        'Empresa líder en desarrollo de software a medida y soluciones tecnológicas para empresas. Especialistas en apps web, APIs REST y sistemas empresariales con más de 8 años de experiencia en el mercado chileno.',
      regionId: 'CL-RM',
      founded: '2016',
      employees: '51-200',
      website: 'https://techchile.cl',
      whatsapp: '+56912345678',
      isVerified: true,
      socialLinks: [
        { platform: 'linkedin', url: 'https://linkedin.com/company/techchile', orden: 0 },
        { platform: 'instagram', url: 'https://instagram.com/techchile', orden: 1 },
      ],
      tags: ['Desarrollo Web', 'APIs', 'Cloud', 'DevOps'],
    },
  },
  {
    userId: 'USER-ANDESLOG',
    name: 'AndesLogística Ltda',
    email: 'ventas@andeslogistica.cl',
    profile: {
      id: 'PROF-ANDESLOG',
      userId: 'USER-ANDESLOG',
      slug: 'andes-logistica',
      bannerUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&q=80',
      logoUrl: 'https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=200&q=80',
      name: 'AndesLogística Ltda',
      description:
        'Empresa de logística y distribución con cobertura en toda la zona norte de Chile. Flota propia de camiones, almacenamiento en bodega y distribución last mile para empresas de retail y manufacturing.',
      regionId: 'CL-AN',
      founded: '2010',
      employees: '201-500',
      website: 'https://andeslogistica.cl',
      whatsapp: '+56923456789',
      isVerified: true,
      socialLinks: [
        { platform: 'linkedin', url: 'https://linkedin.com/company/andeslogistica', orden: 0 },
      ],
      tags: ['Logística', 'Distribución', 'Bodegaje', 'Transporte'],
    },
  },
  {
    userId: 'USER-CAPITAL',
    name: 'Capital Humano Chile',
    email: 'rrhh@capitalhumano.cl',
    profile: {
      id: 'PROF-CAPITAL',
      userId: 'USER-CAPITAL',
      slug: 'capital-humano-chile',
      bannerUrl: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1200&q=80',
      logoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&q=80',
      name: 'Capital Humano Chile',
      description:
        'Consultora de recursos humanos especializada en headhunting executive,招聘 de personal técnico y desarrollo organizacional. Más de 12 años conectando talento con oportunidades en Chile y Latinoamérica.',
      regionId: 'CL-RM',
      founded: '2012',
      employees: '11-50',
      website: 'https://capitalhumano.cl',
      whatsapp: '+56934567890',
      isVerified: true,
      socialLinks: [
        { platform: 'linkedin', url: 'https://linkedin.com/company/capitalhumano', orden: 0 },
        { platform: 'instagram', url: 'https://instagram.com/capitalhumanochile', orden: 1 },
        { platform: 'twitter', url: 'https://twitter.com/capitalhumano', orden: 2 },
      ],
      tags: ['Headhunting', 'Reclutamiento', 'RRHH', 'Organizacional'],
    },
  },
  {
    userId: 'USER-COCINANDO',
    name: 'Cocinando Eventos SpA',
    email: 'hola@cocinandoeventos.cl',
    profile: {
      id: 'PROF-COCINANDO',
      userId: 'USER-COCINANDO',
      slug: 'cocinando-eventos',
      bannerUrl: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200&q=80',
      logoUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&q=80',
      name: 'Cocinando Eventos SpA',
      description:
        'Productora de eventos corporativos y sociales en la zona central de Chile. Cocktails, catering ejecutivo, lanzamientos de producto y eventos híbridos. Equipamiento profesional de última generación.',
      regionId: 'CL-VS',
      founded: '2018',
      employees: '11-50',
      website: 'https://cocinandoeventos.cl',
      whatsapp: '+56945678901',
      isVerified: false,
      socialLinks: [
        { platform: 'instagram', url: 'https://instagram.com/cocinandoeventos', orden: 0 },
        { platform: 'facebook', url: 'https://facebook.com/cocinandoeventos', orden: 1 },
      ],
      tags: ['Catering', 'Eventos', 'Corporativo', 'Cocktails'],
    },
  },
];

// ──────────────────────────────────────────────
// 2. SERVICES (4)
// ──────────────────────────────────────────────
const servicesData = [
  {
    id: 'SERV-TECH-001',
    profileId: 'PROF-TECHCHILE',
    slug: 'desarrollo-software-a-medida',
    title: 'Desarrollo de Software a Medida',
    marca: 'TechChile',
    description:
      'Diseñamos y desarrollamos aplicaciones web y móviles personalizadas para tu empresa. Nuestro equipo de 25 desarrolladores trabaja con tecnologías modernas (React, Node.js, Python) para entregar productos de alta calidad en tiempos reducidos.',
    yearsExperience: 8,
    priceMin: 5000000,
    priceMax: 50000000,
    availability: 'Lunes a Viernes, 9:00 - 18:00 hrs',
    bannerUrl: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&q=80',
    logoUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&q=80',
    locationId: 'LOC-LAS-CONDES',
    categoryId: 'CAT-SOFTWARE',
    statusId: '', // filled dynamically
    portfolio: [
      {
        url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
        title: 'Dashboard Fintech',
        description: 'Panel de control para plataforma financiera con métricas en tiempo real',
        orden: 0,
      },
      {
        url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
        title: 'E-commerce Empresarial',
        description: 'Tienda online B2B con integración a SAP',
        orden: 1,
      },
    ],
    contacts: [
      { type: 'email', value: 'proyectos@techchile.cl' },
      { type: 'whatsapp', value: '+56912345678' },
    ],
  },
  {
    id: 'SERV-LOG-001',
    profileId: 'PROF-ANDESLOG',
    slug: 'logistica-y-distribucion-norte-chile',
    title: 'Logística y Distribución Zona Norte',
    marca: 'AndesLogística',
    description:
      'Servicio integral de logística conCoverage en las regiones de Arica y Parinacota, Tarapacá y Antofagasta. Flota de 40 camiones propios, bodegas certificadas y sistema de tracking GPS en tiempo real.',
    yearsExperience: 14,
    priceMin: 1000000,
    priceMax: 50000000,
    availability: 'Lunes a Sábado, 7:00 - 21:00 hrs',
    bannerUrl: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=1200&q=80',
    logoUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=600&q=80',
    locationId: 'LOC-ANTOFAGASTA',
    categoryId: 'CAT-LOGISTICS',
    statusId: '',
    portfolio: [
      {
        url: 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&q=80',
        title: 'Centro de Distribución Antofagasta',
        description: 'Bodega de 5.000 m² con racks Selectivos y sistema WMS',
        orden: 0,
      },
    ],
    contacts: [
      { type: 'email', value: 'operaciones@andeslogistica.cl' },
      { type: 'phone', value: '+5655223456' },
    ],
  },
  {
    id: 'SERV-HR-001',
    profileId: 'PROF-CAPITAL',
    slug: 'headhunting-y-reclutamiento-executive',
    title: 'Headhunting y Reclutamiento Executive',
    marca: 'Capital Humano Chile',
    description:
      'Servicio especializado de headhunting para posiciones de alta dirección y gerenciales. Base de datos de +50.000 candidatos verificados, proceso de selección en 30 días promedio y garantía de permanencia.',
    yearsExperience: 12,
    priceMin: 3000000,
    priceMax: 25000000,
    availability: 'Lunes a Viernes, 8:30 - 19:00 hrs',
    bannerUrl: 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=1200&q=80',
    logoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=600&q=80',
    locationId: 'LOC-PROVIDENCIA',
    categoryId: 'CAT-FINANCIAL',
    statusId: '',
    portfolio: [
      {
        url: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80',
        title: 'Proyecto Mining Sector',
        description: 'Selección de 8 posiciones de alta dirección para empresa minera',
        orden: 0,
      },
      {
        url: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&q=80',
        title: 'Tech Industry - TechChile',
        description: 'Reclutamiento de CTO y equipo de ingeniería (12 personas)',
        orden: 1,
      },
    ],
    contacts: [
      { type: 'email', value: 'busquedas@capitalhumano.cl' },
      { type: 'whatsapp', value: '+56934567890' },
    ],
  },
  {
    id: 'SERV-EVT-001',
    profileId: 'PROF-COCINANDO',
    slug: 'catering-y-eventos-corporativos',
    title: 'Catering y Producción de Eventos Corporativos',
    marca: 'Cocinando Eventos',
    description:
      'Organización completa de eventos corporativos: cocktails, coffee breaks, almuerzos de trabajo y lanzamientos de producto. Capacidad para grupos de 20 a 500 personas con servicio de meseros y equipamiento audiovisual incluido.',
    yearsExperience: 6,
    priceMin: 500000,
    priceMax: 30000000,
    availability: 'Lunes a Domingo, 7:00 - 00:00 hrs',
    bannerUrl: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1200&q=80',
    logoUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80',
    locationId: 'LOC-VINA-DEL-MAR',
    categoryId: 'CAT-EQUIPMENT-RENTAL',
    statusId: '',
    portfolio: [
      {
        url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
        title: 'Lanzamiento Producto Pharma',
        description: 'Evento para 350 personas con DJ y barra libre',
        orden: 0,
      },
    ],
    contacts: [
      { type: 'email', value: 'eventos@cocinandoeventos.cl' },
      { type: 'whatsapp', value: '+56945678901' },
    ],
  },
];

// ──────────────────────────────────────────────
// 3. EVENTS (6)
// ──────────────────────────────────────────────
const eventsData = [
  {
    id: 'EVT-001',
    profileId: 'PROF-TECHCHILE',
    slug: 'hackathon-techchile-2026',
    title: 'Hackathon TechChile 2026',
    description:
      'Hackathon de 48 horas para desarrollar soluciones tecnológicas innovadoras. Buscamos equipos de 3-5 personas con ideas en fintech, edtech o proptech. Premiación de USD 5.000 para el equipo ganador.',
    requirements:
      'Equipo de 3 a 5 integrantes. Al menos un desarrollador con experiencia en React, Vue o Angular. Presentar prototipo funcional al final del evento.',
    startAt: new Date('2026-09-15T09:00:00-04:00'),
    applicationDeadline: new Date('2026-09-10T23:59:59-04:00'),
    locationId: 'LOC-LAS-CONDES',
    categoryId: 'CAT-SOFTWARE',
    thumbnailUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1200&q=80',
    requiredCandidates: 20,
    selectedCandidates: 0,
    applicationCount: 0,
    requiresVerifiedProfile: true,
    autoCloseWhenFilled: true,
    statusId: '',
  },
  {
    id: 'EVT-002',
    profileId: 'PROF-ANDESLOG',
    slug: 'conferencia-logistica-sustentable-2026',
    title: 'Conferencia: Logística Sustentable 2026',
    description:
      'Conferencia de un día sobre logística sostenible y economía circular. Expositores internacionales de Alemania y Brasil. Tendencias en distribución last mile con vehículos eléctricos y optimización de rutas con IA.',
    requirements:
      'Profesionales del área de logística, supply chain o operaciones. Presentar cargo empresarial al momento de inscripción.',
    startAt: new Date('2026-10-22T08:30:00-04:00'),
    applicationDeadline: new Date('2026-10-15T18:00:00-04:00'),
    locationId: 'LOC-ANTOFAGASTA',
    categoryId: 'CAT-LOGISTICS',
    thumbnailUrl: 'https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=600&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&q=80',
    requiredCandidates: 80,
    selectedCandidates: 0,
    applicationCount: 0,
    requiresVerifiedProfile: false,
    autoCloseWhenFilled: true,
    statusId: '',
  },
  {
    id: 'EVT-003',
    profileId: 'PROF-CAPITAL',
    slug: 'feria-laboral-virtual-chile-2026',
    title: 'Feria Laboral Virtual Chile 2026',
    description:
      'Feria laboral gratuita con más de 50 empresas participantes. Oportunidades para todos los sectores: tecnología, mining, retail, salud y construcción. Entrevistas por videollamada programadas.',
    requirements:
      'CV actualizado en PDF. Disponibilidad para entrevistas durante los días de la feria. Registro obligatorio en plataforma.',
    startAt: new Date('2026-08-20T10:00:00-04:00'),
    applicationDeadline: new Date('2026-08-18T23:59:59-04:00'),
    locationId: 'LOC-SANTIAGO',
    categoryId: 'CAT-HR',
    thumbnailUrl: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=600&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&q=80',
    requiredCandidates: 200,
    selectedCandidates: 0,
    applicationCount: 0,
    requiresVerifiedProfile: false,
    autoCloseWhenFilled: false,
    statusId: '',
  },
  {
    id: 'EVT-004',
    profileId: 'PROF-COCINANDO',
    slug: 'cocktail-networking-tech-2026',
    title: 'Cocktail de Networking Tech & Business',
    description:
      'Evento de networking para profesionales del sector tecnológico y empresarial. Cocktail con más de 200 asistentes entre emprendedores, inversores y executives. Ambientación premium en terraza con vista al mar.',
    requirements:
      'Profesional del sector tecnológico, empresarial o de inversiones. Dress code: smart casual. Confirmar asistencia con 48h de anticipación.',
    startAt: new Date('2026-08-28T19:30:00-04:00'),
    applicationDeadline: new Date('2026-08-26T12:00:00-04:00'),
    locationId: 'LOC-VINA-DEL-MAR',
    categoryId: 'CAT-AFTER-OFFICE',
    thumbnailUrl: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200&q=80',
    requiredCandidates: 50,
    selectedCandidates: 0,
    applicationCount: 0,
    requiresVerifiedProfile: false,
    autoCloseWhenFilled: true,
    statusId: '',
  },
  {
    id: 'EVT-005',
    profileId: 'PROF-TECHCHILE',
    slug: 'bootcamp-python-data-science-2026',
    title: 'Bootcamp Python & Data Science',
    description:
      'Bootcamp intensivo de 2 semanas sobre Python para análisis de datos y Machine Learning. Dirigido a profesionales con nociones de programación. Cupos limitados a 30 estudiantes con seguimiento personalizado.',
    requirements:
      'Nociones básicas de programación en cualquier lenguaje. Laptop con mínimo 8GB RAM. Disponibilidad full-time durante las 2 semanas del bootcamp.',
    startAt: new Date('2026-11-03T09:00:00-04:00'),
    applicationDeadline: new Date('2026-10-25T23:59:59-04:00'),
    locationId: 'LOC-LAS-CONDES',
    categoryId: 'CAT-TRAINING',
    thumbnailUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=1200&q=80',
    requiredCandidates: 30,
    selectedCandidates: 0,
    applicationCount: 0,
    requiresVerifiedProfile: true,
    autoCloseWhenFilled: true,
    statusId: '',
  },
  {
    id: 'EVT-006',
    profileId: 'PROF-CAPITAL',
    slug: 'junta-directiva-chile-argentina-2026',
    title: 'Junta Ejecutiva: Integración Comercial Chile-Argentina',
    description:
      'Reunión de alto nivel para executives de ambos países. Discusión sobre oportunidades de negocio binacional, tratados de libre comercio y casos de éxito de empresas que operan en los dos mercados.',
    requirements:
      'Cargos de Gerencia General, Directorio o Jefatura de área.cupo limitado a 40 participantes. Presentación de名片 o credentials empresariales.',
    startAt: new Date('2026-09-08T08:00:00-04:00'),
    applicationDeadline: new Date('2026-09-01T18:00:00-04:00'),
    locationId: 'LOC-SANTIAGO',
    categoryId: 'CAT-EXECUTIVE-MEETINGS',
    thumbnailUrl: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=600&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&q=80',
    requiredCandidates: 40,
    selectedCandidates: 0,
    applicationCount: 0,
    requiresVerifiedProfile: true,
    autoCloseWhenFilled: false,
    statusId: '',
  },
];

// ──────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────
async function main() {
  console.log('🚀 Seeding demo data...\n');

  // ── Resolve status IDs ──
  const publishedStatusId = await getStatusId('published');

  // ──────────────────────────────────────────────
  // STEP 1: Users
  // ──────────────────────────────────────────────
  console.log('👤 Creating users...');
  for (const c of companies) {
    await db
      .insert(users)
      .values({ id: c.userId, name: c.name, email: c.email })
      .onConflictDoNothing();
    console.log(`  ✓ ${c.name}`);
  }

  // ──────────────────────────────────────────────
  // STEP 2: Tags (upsert)
  // ──────────────────────────────────────────────
  const allTags = [...new Set(companies.flatMap((c) => c.profile.tags))];
  console.log('\n 🏷️  Creating tags...');
  for (const tagName of allTags) {
    const tagSlug = tagName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    await db
      .insert(tags)
      .values({ id: `TAG-${tagSlug.toUpperCase()}`, name: tagName, slug: tagSlug })
      .onConflictDoNothing();
  }
  console.log(`  ✓ ${allTags.length} tags`);

  // ──────────────────────────────────────────────
  // STEP 3: Profiles (explicit fields, no spread)
  // ──────────────────────────────────────────────
  console.log('\n 🏢 Creating profiles...');
  for (const c of companies) {
    const p = c.profile;

    // Use raw SQL to bypass prepared-statement issue with userId FK column
    await db.execute(sql`
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

    // Social links
    await db.delete(profileSocialLinks).where(eq(profileSocialLinks.profileId, p.id));
    if (p.socialLinks.length > 0) {
      await db.insert(profileSocialLinks).values(
        p.socialLinks.map((s) => ({ id: crypto.randomUUID(), profileId: p.id, platform: s.platform, url: s.url, orden: s.orden }))
      );
    }

    // Profile tags
    await db.delete(profilesToTags).where(eq(profilesToTags.profileId, p.id));
    const tagIds = p.tags.map((t) => {
      const tagSlug = t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      return `TAG-${tagSlug.toUpperCase()}`;
    });
    if (tagIds.length > 0) {
      await db.insert(profilesToTags).values(tagIds.map((tagId) => ({ profileId: p.id, tagId })));
    }

    console.log(`  ✓ ${p.name}`);
  }

  // ──────────────────────────────────────────────
  // STEP 4: Services
  // ──────────────────────────────────────────────
  console.log('\n 🛠️  Creating services...');
  for (const s of servicesData) {
    const resolvedLocationId = s.locationId ? await resolveLocationId(s.locationId) : null;
    await db.insert(services).values({
      id: s.id,
      profileId: s.profileId,
      slug: s.slug,
      title: s.title,
      marca: s.marca ?? null,
      description: s.description ?? null,
      yearsExperience: s.yearsExperience ?? null,
      priceMin: s.priceMin ?? null,
      priceMax: s.priceMax ?? null,
      availability: s.availability ?? null,
      bannerUrl: s.bannerUrl ?? null,
      logoUrl: s.logoUrl ?? null,
      thumbnailUrl: s.thumbnailUrl ?? null,
      locationId: resolvedLocationId,
      categoryId: s.categoryId ?? null,
      statusId: publishedStatusId,
    }).onConflictDoNothing();

    // Portfolio
    await db.delete(servicePortfolio).where(eq(servicePortfolio.serviceId, s.id));
    if (s.portfolio.length > 0) {
      await db.insert(servicePortfolio).values(
        s.portfolio.map((p) => ({ id: crypto.randomUUID(), serviceId: s.id, url: p.url, title: p.title, description: p.description ?? null, orden: p.orden }))
      );
    }

    // Contacts
    await db.delete(serviceContacts).where(eq(serviceContacts.serviceId, s.id));
    if (s.contacts.length > 0) {
      await db.insert(serviceContacts).values(
        s.contacts.map((c) => ({ id: crypto.randomUUID(), serviceId: s.id, type: c.type, value: c.value }))
      );
    }

    console.log(`  ✓ ${s.title} (${s.slug})`);
  }

  // ──────────────────────────────────────────────
  // STEP 5: Events
  // ──────────────────────────────────────────────
  console.log('\n 📅 Creating events...');
  for (const e of eventsData) {
    const resolvedLocationId = e.locationId ? await resolveLocationId(e.locationId) : null;
    await db.insert(events).values({
      id: e.id,
      profileId: e.profileId,
      slug: e.slug,
      title: e.title,
      description: e.description ?? null,
      requirements: e.requirements ?? null,
      startAt: e.startAt,
      applicationDeadline: e.applicationDeadline ?? null,
      locationId: resolvedLocationId,
      categoryId: e.categoryId ?? null,
      thumbnailUrl: e.thumbnailUrl ?? null,
      bannerUrl: e.bannerUrl ?? null,
      requiredCandidates: e.requiredCandidates,
      selectedCandidates: e.selectedCandidates,
      applicationCount: e.applicationCount,
      requiresVerifiedProfile: e.requiresVerifiedProfile,
      autoCloseWhenFilled: e.autoCloseWhenFilled,
      statusId: publishedStatusId,
    }).onConflictDoNothing();
    console.log(`  ✓ ${e.title} (${e.slug})`);
  }

  // ──────────────────────────────────────────────
  // Summary
  // ──────────────────────────────────────────────
  console.log('\n✅ Demo seed completado!');
  console.log(`   Empresas: ${companies.length}`);
  console.log(`   Servicios: ${servicesData.length}`);
  console.log(`   Eventos: ${eventsData.length}`);
}

main().catch((err) => {
  console.error('\n❌ Error:', err);
  process.exit(1);
});
