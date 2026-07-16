/**
 * Seed script for Chile Locations
 * Run: npx tsx scripts/prod/seed-locations.ts
 *
 * Data: user-provided with fixed IDs for consistency
 */

import { eq } from 'drizzle-orm';
import { db } from '../../src/shared/database';
import { locations, regions } from '../../src/shared/database/schema';

export const locationsSeed = [
  // Arica y Parinacota
  { id: 'LOC-ARICA', name: 'Arica', slug: 'arica', regionId: 'CL-AP' },
  { id: 'LOC-PUTRE', name: 'Putre', slug: 'putre', regionId: 'CL-AP' },

  // Tarapacá
  { id: 'LOC-IQUIQUE', name: 'Iquique', slug: 'iquique', regionId: 'CL-TA' },
  { id: 'LOC-ALTO-HOSPICIO', name: 'Alto Hospicio', slug: 'alto-hospicio', regionId: 'CL-TA' },
  { id: 'LOC-POZO-ALMONTE', name: 'Pozo Almonte', slug: 'pozo-almonte', regionId: 'CL-TA' },

  // Antofagasta
  { id: 'LOC-ANTOFAGASTA', name: 'Antofagasta', slug: 'antofagasta', regionId: 'CL-AN' },
  { id: 'LOC-CALAMA', name: 'Calama', slug: 'calama', regionId: 'CL-AN' },
  { id: 'LOC-MEJILLONES', name: 'Mejillones', slug: 'mejillones', regionId: 'CL-AN' },
  { id: 'LOC-SAN-PEDRO-ATACAMA', name: 'San Pedro de Atacama', slug: 'san-pedro-de-atacama', regionId: 'CL-AN' },

  // Atacama
  { id: 'LOC-COPIAPO', name: 'Copiapó', slug: 'copiapo', regionId: 'CL-AT' },
  { id: 'LOC-VALLENAR', name: 'Vallenar', slug: 'vallenar', regionId: 'CL-AT' },
  { id: 'LOC-CALDERA', name: 'Caldera', slug: 'caldera', regionId: 'CL-AT' },
  { id: 'LOC-CHANARAL', name: 'Chañaral', slug: 'chanaral', regionId: 'CL-AT' },

  // Coquimbo
  { id: 'LOC-LA-SERENA', name: 'La Serena', slug: 'la-serena', regionId: 'CL-CO' },
  { id: 'LOC-COQUIMBO', name: 'Coquimbo', slug: 'coquimbo', regionId: 'CL-CO' },
  { id: 'LOC-OVALLE', name: 'Ovalle', slug: 'ovalle', regionId: 'CL-CO' },
  { id: 'LOC-ILLAPEL', name: 'Illapel', slug: 'illapel', regionId: 'CL-CO' },

  // Valparaíso
  { id: 'LOC-VALPARAISO', name: 'Valparaíso', slug: 'valparaiso', regionId: 'CL-VS' },
  { id: 'LOC-VINA-DEL-MAR', name: 'Viña del Mar', slug: 'vina-del-mar', regionId: 'CL-VS' },
  { id: 'LOC-QUILPUE', name: 'Quilpué', slug: 'quilpue', regionId: 'CL-VS' },
  { id: 'LOC-SAN-ANTONIO', name: 'San Antonio', slug: 'san-antonio', regionId: 'CL-VS' },
  { id: 'LOC-SAN-FELIPE', name: 'San Felipe', slug: 'san-felipe', regionId: 'CL-VS' },

  // Metropolitana
  { id: 'LOC-SANTIAGO', name: 'Santiago', slug: 'santiago', regionId: 'CL-RM' },
  { id: 'LOC-PROVIDENCIA', name: 'Providencia', slug: 'providencia', regionId: 'CL-RM' },
  { id: 'LOC-LAS-CONDES', name: 'Las Condes', slug: 'las-condes', regionId: 'CL-RM' },
  { id: 'LOC-MAIPU', name: 'Maipú', slug: 'maipu', regionId: 'CL-RM' },
  { id: 'LOC-PUENTE-ALTO', name: 'Puente Alto', slug: 'puente-alto', regionId: 'CL-RM' },

  // O'Higgins
  { id: 'LOC-RANCAGUA', name: 'Rancagua', slug: 'rancagua', regionId: 'CL-LI' },
  { id: 'LOC-SAN-FERNANDO', name: 'San Fernando', slug: 'san-fernando', regionId: 'CL-LI' },
  { id: 'LOC-PICHILEMU', name: 'Pichilemu', slug: 'pichilemu', regionId: 'CL-LI' },
  { id: 'LOC-SANTA-CRUZ', name: 'Santa Cruz', slug: 'santa-cruz', regionId: 'CL-LI' },

  // Maule
  { id: 'LOC-TALCA', name: 'Talca', slug: 'talca', regionId: 'CL-ML' },
  { id: 'LOC-CURICO', name: 'Curicó', slug: 'curico', regionId: 'CL-ML' },
  { id: 'LOC-LINARES', name: 'Linares', slug: 'linares', regionId: 'CL-ML' },
  { id: 'LOC-CONSTITUCION', name: 'Constitución', slug: 'constitucion', regionId: 'CL-ML' },

  // Ñuble
  { id: 'LOC-CHILLAN', name: 'Chillán', slug: 'chillan', regionId: 'CL-NB' },
  { id: 'LOC-BULNES', name: 'Bulnes', slug: 'bulnes', regionId: 'CL-NB' },
  { id: 'LOC-SAN-CARLOS', name: 'San Carlos', slug: 'san-carlos', regionId: 'CL-NB' },

  // Biobío
  { id: 'LOC-CONCEPCION', name: 'Concepción', slug: 'concepcion', regionId: 'CL-BI' },
  { id: 'LOC-TALCAHUANO', name: 'Talcahuano', slug: 'talcahuano', regionId: 'CL-BI' },
  { id: 'LOC-LOS-ANGELES', name: 'Los Ángeles', slug: 'los-angeles', regionId: 'CL-BI' },
  { id: 'LOC-CORONEL', name: 'Coronel', slug: 'coronel', regionId: 'CL-BI' },

  // La Araucanía
  { id: 'LOC-TEMUCO', name: 'Temuco', slug: 'temuco', regionId: 'CL-AR' },
  { id: 'LOC-PUCON', name: 'Pucón', slug: 'pucon', regionId: 'CL-AR' },
  { id: 'LOC-VILLARRICA', name: 'Villarrica', slug: 'villarrica', regionId: 'CL-AR' },
  { id: 'LOC-ANGOL', name: 'Angol', slug: 'angol', regionId: 'CL-AR' },

  // Los Ríos
  { id: 'LOC-VALDIVIA', name: 'Valdivia', slug: 'valdivia', regionId: 'CL-LR' },
  { id: 'LOC-LA-UNION', name: 'La Unión', slug: 'la-union', regionId: 'CL-LR' },
  { id: 'LOC-RIO-BUENO', name: 'Río Bueno', slug: 'rio-bueno', regionId: 'CL-LR' },

  // Los Lagos
  { id: 'LOC-PUERTO-MONTT', name: 'Puerto Montt', slug: 'puerto-montt', regionId: 'CL-LL' },
  { id: 'LOC-CASTRO', name: 'Castro', slug: 'castro', regionId: 'CL-LL' },
  { id: 'LOC-OSORNO', name: 'Osorno', slug: 'osorno', regionId: 'CL-LL' },
  { id: 'LOC-PUERTO-VARAS', name: 'Puerto Varas', slug: 'puerto-varas', regionId: 'CL-LL' },

  // Aysén
  { id: 'LOC-COYHAIQUE', name: 'Coyhaique', slug: 'coyhaique', regionId: 'CL-AI' },
  { id: 'LOC-PUERTO-AYSEN', name: 'Puerto Aysén', slug: 'puerto-aysen', regionId: 'CL-AI' },
  { id: 'LOC-CHILE-CHICO', name: 'Chile Chico', slug: 'chile-chico', regionId: 'CL-AI' },

  // Magallanes
  { id: 'LOC-PUNTA-ARENAS', name: 'Punta Arenas', slug: 'punta-arenas', regionId: 'CL-MA' },
  { id: 'LOC-PUERTO-NATALES', name: 'Puerto Natales', slug: 'puerto-natales', regionId: 'CL-MA' },
  { id: 'LOC-PORVENIR', name: 'Porvenir', slug: 'porvenir', regionId: 'CL-MA' },
];

async function seedLocations() {
  console.log('📍 Seed script: Chile Locations\n');

  // Verify regions exist first
  const existingRegions = await db.select({ id: regions.id }).from(regions);
  const regionIds = new Set(existingRegions.map((r) => r.id));

  const missingRegions = locationsSeed.filter((loc) => !regionIds.has(loc.regionId));
  if (missingRegions.length > 0) {
    console.error('❌ Error: Las siguientes regiones no existen en la BD:');
    const uniqueMissing = [...new Set(missingRegions.map((loc) => loc.regionId))];
    uniqueMissing.forEach((id) => console.error(`   - ${id}`));
    console.error('\nEjecuta primero el script de regiones: npx tsx scripts/prod/seed-chile.ts');
    process.exit(1);
  }

  // Batch upsert all locations (idempotent)
  // If location with slug exists, keep its id but update name/regionId
  // If not, insert with the fixed id
  console.log('📦 Upserting locations...\n');
  let upserted = 0;
  for (const loc of locationsSeed) {
    const existing = await db
      .select({ id: locations.id })
      .from(locations)
      .where(eq(locations.slug, loc.slug))
      .limit(1);

    if (existing[0]) {
      await db
        .update(locations)
        .set({ name: loc.name, regionId: loc.regionId })
        .where(eq(locations.slug, loc.slug));
    } else {
      await db.insert(locations).values({
        id: loc.id,
        name: loc.name,
        slug: loc.slug,
        regionId: loc.regionId,
      });
    }
    upserted++;
  }

  console.log(`✅ Seed completado!`);
  console.log(`   Ubicaciones procesadas: ${upserted}`);

  process.exit(0);
}

seedLocations().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
