/**
 * Seed script for Categories (Service + Event)
 * Run: npx tsx scripts/prod/seed-categories.ts
 *
 * 36 event categories + 3 service categories
 */

import { db } from '../../src/shared/database';
import { categories } from '../../src/shared/database/schema';

const allCategories = [
  // ──────────────────────────────────────────────
  // EVENT CATEGORIES (36)
  // ──────────────────────────────────────────────

  // Servicios profesionales
  { id: 'CAT-CONSULTING', name: 'Consultoría', slug: 'consultoria', type: 'event' },
  { id: 'CAT-ACCOUNTING', name: 'Contabilidad', slug: 'contabilidad', type: 'event' },
  { id: 'CAT-LEGAL', name: 'Servicios Legales', slug: 'servicios-legales', type: 'event' },
  { id: 'CAT-HR', name: 'Recursos Humanos', slug: 'recursos-humanos', type: 'event' },

  // Tecnología
  { id: 'CAT-SOFTWARE', name: 'Desarrollo de Software', slug: 'desarrollo-de-software', type: 'event' },
  { id: 'CAT-IT', name: 'Soporte TI', slug: 'soporte-ti', type: 'event' },
  { id: 'CAT-CYBERSECURITY', name: 'Ciberseguridad', slug: 'ciberseguridad', type: 'event' },
  { id: 'CAT-INFRASTRUCTURE', name: 'Infraestructura Tecnológica', slug: 'infraestructura-tecnologica', type: 'event' },

  // Marketing y diseño
  { id: 'CAT-MARKETING', name: 'Marketing Digital', slug: 'marketing-digital', type: 'event' },
  { id: 'CAT-DESIGN', name: 'Diseño Gráfico', slug: 'diseno-grafico', type: 'event' },
  { id: 'CAT-BRANDING', name: 'Branding', slug: 'branding', type: 'event' },
  { id: 'CAT-AUDIOVISUAL', name: 'Producción Audiovisual', slug: 'produccion-audiovisual', type: 'event' },

  // Construcción e industria
  { id: 'CAT-CONSTRUCTION', name: 'Construcción', slug: 'construccion', type: 'event' },
  { id: 'CAT-ELECTRICAL', name: 'Electricidad', slug: 'electricidad', type: 'event' },
  { id: 'CAT-HVAC', name: 'Climatización', slug: 'climatizacion', type: 'event' },
  { id: 'CAT-MACHINERY', name: 'Maquinaria', slug: 'maquinaria', type: 'event' },

  // Comercio y logística
  { id: 'CAT-DISTRIBUTION', name: 'Distribución', slug: 'distribucion', type: 'event' },
  { id: 'CAT-TRANSPORT', name: 'Transporte', slug: 'transporte', type: 'event' },
  { id: 'CAT-IMPORTS', name: 'Importaciones', slug: 'importaciones', type: 'event' },
  { id: 'CAT-WAREHOUSING', name: 'Bodegaje', slug: 'bodegaje', type: 'event' },

  // Manufactura
  { id: 'CAT-PRINTING', name: 'Imprentas', slug: 'imprentas', type: 'event' },
  { id: 'CAT-MANUFACTURING', name: 'Fabricación', slug: 'fabricacion', type: 'event' },
  { id: 'CAT-PACKAGING', name: 'Packaging', slug: 'packaging', type: 'event' },
  { id: 'CAT-SIGNAGE', name: 'Señalética', slug: 'senaletica', type: 'event' },

  // Alimentación y eventos
  { id: 'CAT-CATERING', name: 'Catering', slug: 'catering', type: 'event' },
  { id: 'CAT-EVENTS', name: 'Producción de Eventos', slug: 'produccion-de-eventos', type: 'event' },
  { id: 'CAT-GASTRONOMY', name: 'Servicios Gastronómicos', slug: 'servicios-gastronomicos', type: 'event' },

  // Otros servicios empresariales
  { id: 'CAT-CLEANING', name: 'Limpieza Industrial', slug: 'limpieza-industrial', type: 'event' },
  { id: 'CAT-SECURITY', name: 'Seguridad', slug: 'seguridad', type: 'event' },
  { id: 'CAT-TRAINING', name: 'Capacitación', slug: 'capacitacion', type: 'event' },
  { id: 'CAT-TRANSLATION', name: 'Traducción', slug: 'traduccion', type: 'event' },

  // 4 Nuevas categorías de eventos
  { id: 'CAT-PRODUCT-LAUNCH', name: 'Lanzamientos de Producto', slug: 'lanzamientos-de-producto', type: 'event' },
  { id: 'CAT-FARIES', name: 'Ferias & Exposiciones', slug: 'ferias-exposiciones', type: 'event' },
  { id: 'CAT-EXECUTIVE-MEETINGS', name: 'Juntas & Reuniones Ejecutivas', slug: 'juntas-reuniones-ejecutivas', type: 'event' },
  { id: 'CAT-NETWORKING', name: 'Networking Empresarial', slug: 'networking-empresarial', type: 'event' },
  { id: 'CAT-AFTER-OFFICE', name: 'After Office & Cocktails Corporativos', slug: 'after-office-cocktails-corporativos', type: 'event' },

  // ──────────────────────────────────────────────
  // SERVICE CATEGORIES (3)
  // ──────────────────────────────────────────────

  { id: 'CAT-FINANCIAL', name: 'Asesoría Financiera', slug: 'asesoria-financiera', type: 'service' },
  { id: 'CAT-LOGISTICS', name: 'Logística', slug: 'logistica', type: 'service' },
  { id: 'CAT-EQUIPMENT-RENTAL', name: 'Alquiler de Equipos', slug: 'alquiler-de-equipos', type: 'service' },
];

async function main() {
  console.log('🚀 Seeding categories...');

  await db
    .insert(categories)
    .values(allCategories)
    .onConflictDoUpdate({
      target: categories.id,
      set: { name: categories.name, slug: categories.slug, type: categories.type },
    });

  const eventCount = allCategories.filter((c) => c.type === 'event').length;
  const serviceCount = allCategories.filter((c) => c.type === 'service').length;
  console.log(`✅ ${allCategories.length} categorías upserted (${eventCount} evento, ${serviceCount} servicio)`);
}

main().catch((err) => {
  console.error('❌ Error seeding categories:', err);
  process.exit(1);
});
