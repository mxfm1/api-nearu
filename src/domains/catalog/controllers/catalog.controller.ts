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
  { ruleType: 'SAME_REGION', description: 'La empresa pertenece a la misma región del evento', group: 'ubicacion' },
  { ruleType: 'HAS_WEBSITE', description: 'Posee sitio web corporativo configurado', group: 'perfil' },
  { ruleType: 'VERIFIED_PROFILE', description: 'Perfil de empresa verificado por el sistema', group: 'perfil' },
  { ruleType: 'ACCOUNT_AGE', description: 'Cuenta con más de 6 meses de antigüedad', group: 'perfil' },
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
