import type { Request, Response, NextFunction } from 'express';
import { db } from '@/src/shared/database';
import { categories, regions, locations } from '@/src/shared/database/schema';
import { eq } from 'drizzle-orm';

// ──────────────────────────────────────────────
// GET /api/categorias?type=service|event
// ──────────────────────────────────────────────
export async function listCategoriesController(req: Request, res: Response, next: NextFunction) {
  try {
    const type = req.query.type as string | undefined;

    let result;
    const selectCategories = { id: categories.id, name: categories.name, slug: categories.slug, type: categories.type };
    if (type && (type === 'service' || type === 'event')) {
      result = await db
        .select(selectCategories)
        .from(categories)
        .where(eq(categories.type, type))
        .orderBy(categories.name);
    } else {
      result = await db
        .select(selectCategories)
        .from(categories)
        .orderBy(categories.name);
    }

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

// ──────────────────────────────────────────────
// GET /api/regiones (con sus ubicaciones)
// ──────────────────────────────────────────────
export async function listRegionsController(req: Request, res: Response, next: NextFunction) {
  try {
    const allRegions = await db
      .select({ id: regions.id, name: regions.name, slug: regions.slug })
      .from(regions)
      .orderBy(regions.name);

    const allLocations = await db
      .select({ id: locations.id, name: locations.name, slug: locations.slug, regionId: locations.regionId })
      .from(locations)
      .orderBy(locations.name);

    // Agrupar ubicaciones por región
    const regionsWithLocations = allRegions.map((region) => ({
      ...region,
      locations: allLocations
        .filter((loc) => loc.regionId === region.id)
        .map(({ regionId, ...loc }) => loc), // omitir regionId en la respuesta
    }));

    res.json({ success: true, data: regionsWithLocations });
  } catch (error) {
    next(error);
  }
}

// ──────────────────────────────────────────────
// GET /api/scoring-rules/catalog
// Catálogo de reglas de scoring disponibles
// ──────────────────────────────────────────────
const SCORING_RULES_CATALOG = [
  { ruleType: 'VERIFIED_PROFILE', description: 'La empresa completó el proceso de verificación empresarial', group: 'perfil' },
  { ruleType: 'SAME_REGION', description: 'La empresa pertenece a la misma región del evento', group: 'ubicacion' },
  { ruleType: 'HAS_PORTFOLIO', description: 'Posee elementos publicados en su portafolio', group: 'perfil' },
  { ruleType: 'YEARS_EXPERIENCE', description: 'Cantidad de años de experiencia declarados', group: 'perfil' },
  { ruleType: 'HAS_WEBSITE', description: 'Posee sitio web corporativo', group: 'perfil' },
  { ruleType: 'HAS_SOCIAL_LINKS', description: 'Posee redes sociales corporativas configuradas', group: 'perfil' },
  { ruleType: 'HAS_COMPANY_DESCRIPTION', description: 'Posee descripción empresarial suficientemente completa', group: 'perfil' },
  { ruleType: 'HAS_LOGO', description: 'Posee logo configurado', group: 'perfil' },
  { ruleType: 'HAS_BANNER', description: 'Posee banner corporativo configurado', group: 'perfil' },
  { ruleType: 'HAS_PREVIOUS_FEEDBACK', description: 'Posee historial de feedback de trabajos anteriores', group: 'historial' },
  { ruleType: 'AVERAGE_RATING', description: 'Promedio de calificaciones recibidas', group: 'historial' },
  { ruleType: 'NUMBER_OF_COMPLETED_JOBS', description: 'Cantidad de trabajos finalizados exitosamente', group: 'historial' },
  { ruleType: 'NUMBER_OF_COMPLETED_EVENTS', description: 'Cantidad de eventos donde ha participado', group: 'historial' },
  { ruleType: 'HAS_RESPONSE_HISTORY', description: 'Historial de respuestas a solicitudes', group: 'historial' },
  { ruleType: 'FAST_RESPONSE_TIME', description: 'Tiempo promedio de respuesta inferior al promedio', group: 'historial' },
  { ruleType: 'IS_PREMIUM_COMPANY', description: 'Empresa con suscripción premium activa', group: 'premium' },
  { ruleType: 'CUSTOM_FIELD_MATCH', description: 'Coincidencia con campos personalizados definidos por el organizador', group: 'custom' },
];

export async function listScoringRulesCatalogController(req: Request, res: Response, next: NextFunction) {
  try {
    const group = req.query.group as string | undefined;

    let result = SCORING_RULES_CATALOG;
    if (group) {
      result = result.filter((rule) => rule.group === group);
    }

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}
export async function listLocationsController(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await db
      .select({
        id: locations.id,
        name: locations.name,
        slug: locations.slug,
        region: {
          id: regions.id,
          name: regions.name,
          slug: regions.slug,
        },
      })
      .from(locations)
      .innerJoin(regions, eq(locations.regionId, regions.id))
      .orderBy(regions.name, locations.name);

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}
