-- ═══════════════════════════════════════════════════════════════
-- DOWN MIGRATION: v2 → v1 (revierte 0004_left_loki.sql)
-- ═══════════════════════════════════════════════════════════════
-- EJECUTAR SOLO EN EMERGENCIA si ya corriste 0004 en prod y
-- necesitás volver atrás.
--
-- ⚠️  DATA LOSS: Los datos migrados a tablas nuevas (service_contacts,
--     tags, profiles_to_tags) NO se vuelcan automáticamente a las
--     columnas viejas. Perdés esa data a menos que la backfillées
--     manualmente DESPUÉS del down.
--
-- ⚠️  Las columnas event_status/service_status vuelven con valores
--     NULL — tenés que reconstruirlos desde statuses si los necesitás.
--
-- 1. Corré este script contra tu DB (psql, pgAdmin, lo que sea)
-- 2. Borrá la entry de 0004 en drizzle/meta/_journal.json
-- 3. Borrá drizzle/meta/0004_snapshot.json
-- 4. Hacé git revert del commit que agregó 0004
-- ═══════════════════════════════════════════════════════════════

-- ==============================================================
-- 1. DROP UNIQUE CONSTRAINTS (added last, undo first)
-- ==============================================================
ALTER TABLE "profiles" DROP CONSTRAINT IF EXISTS "profiles_slug_unique";
ALTER TABLE "locations" DROP CONSTRAINT IF EXISTS "locations_slug_unique";
ALTER TABLE "categories" DROP CONSTRAINT IF EXISTS "categories_slug_unique";

-- ==============================================================
-- 2. RE-ADD OLD COLUMNS (dropped at lines 65-69)
-- ==============================================================

-- Re-add service_status to services
ALTER TABLE "services" ADD COLUMN "service_status" text DEFAULT 'draft' NOT NULL;

-- Re-add contact_info to services (jsonb)
ALTER TABLE "services" ADD COLUMN "contact_info" jsonb;

-- Re-add location to profiles (text)
ALTER TABLE "profiles" ADD COLUMN "location" text;

-- Re-add tags to profiles (text[])
ALTER TABLE "profiles" ADD COLUMN "tags" text[];

-- Re-add event_status to events
ALTER TABLE "events" ADD COLUMN "event_status" text DEFAULT 'draft' NOT NULL;

-- ==============================================================
-- 3. DROP NEW COLUMNS (added at lines 37-43, reverse order)
-- ==============================================================
ALTER TABLE "services" DROP COLUMN IF EXISTS "status_id";
ALTER TABLE "events" DROP COLUMN IF EXISTS "status_id";
ALTER TABLE "profiles" DROP COLUMN IF EXISTS "slug";
ALTER TABLE "profiles" DROP COLUMN IF EXISTS "location_id";
ALTER TABLE "locations" DROP COLUMN IF EXISTS "slug";
ALTER TABLE "categories" DROP COLUMN IF EXISTS "slug";
ALTER TABLE "solicitudes_contacto" DROP COLUMN IF EXISTS "evento_id";

-- ==============================================================
-- 4. REVERT solicitudes_contacto.servicio_id → NOT NULL
-- ==============================================================
ALTER TABLE "solicitudes_contacto" ALTER COLUMN "servicio_id" SET NOT NULL;

-- ==============================================================
-- 5. DROP NEW INDEXES (lines 47-49, 54-64)
-- ==============================================================
DROP INDEX IF EXISTS "services_slug_idx";
DROP INDEX IF EXISTS "services_createdAt_idx";
DROP INDEX IF EXISTS "services_statusId_idx";
DROP INDEX IF EXISTS "profiles_slug_idx";
DROP INDEX IF EXISTS "locations_slug_idx";
DROP INDEX IF EXISTS "events_slug_idx";
DROP INDEX IF EXISTS "events_createdAt_idx";
DROP INDEX IF EXISTS "events_statusId_idx";
DROP INDEX IF EXISTS "contact_req_createdAt_idx";
DROP INDEX IF EXISTS "contact_req_evento_idx";
DROP INDEX IF EXISTS "contact_req_servicio_idx";
DROP INDEX IF EXISTS "sc_serviceId_idx";
DROP INDEX IF EXISTS "pt_tags_idx";
DROP INDEX IF EXISTS "pt_profiles_idx";

-- ==============================================================
-- 6. RE-ADD OLD INDEXES (dropped at lines 34-35)
-- ==============================================================
CREATE INDEX IF NOT EXISTS "services_status_idx" ON "services" USING btree ("service_status");
CREATE INDEX IF NOT EXISTS "events_status_idx" ON "events" USING btree ("event_status");

-- ==============================================================
-- 7. DROP NEW FK CONSTRAINTS (lines 44-46, 50-53)
-- ==============================================================
ALTER TABLE "services" DROP CONSTRAINT IF EXISTS "services_status_id_statuses_id_fk";
ALTER TABLE "profiles" DROP CONSTRAINT IF EXISTS "profiles_location_id_locations_id_fk";
ALTER TABLE "events" DROP CONSTRAINT IF EXISTS "events_status_id_statuses_id_fk";
ALTER TABLE "solicitudes_contacto" DROP CONSTRAINT IF EXISTS "solicitudes_contacto_evento_id_events_id_fk";
ALTER TABLE "service_contacts" DROP CONSTRAINT IF EXISTS "service_contacts_service_id_services_id_fk";
ALTER TABLE "profiles_to_tags" DROP CONSTRAINT IF EXISTS "profiles_to_tags_tag_id_tags_id_fk";
ALTER TABLE "profiles_to_tags" DROP CONSTRAINT IF EXISTS "profiles_to_tags_profile_id_profiles_id_fk";

-- ==============================================================
-- 8. DROP NEW TABLES (lines 1-33)
-- ==============================================================
DROP TABLE IF EXISTS "service_contacts";
DROP TABLE IF EXISTS "profiles_to_tags";
DROP TABLE IF EXISTS "tags";
DROP TABLE IF EXISTS "statuses";
