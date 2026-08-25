CREATE EXTENSION IF NOT EXISTS unaccent;--> statement-breakpoint
CREATE EXTENSION IF NOT EXISTS pg_trgm;--> statement-breakpoint

ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "category_id" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "search_vector" tsvector;--> statement-breakpoint

ALTER TABLE "profiles" ALTER COLUMN "employees" TYPE integer USING (
  CASE
    WHEN "employees" ~ '^[0-9]+$' THEN "employees"::integer
    WHEN "employees" ~ '^[0-9]+-[0-9]+$' THEN (
      split_part("employees", '-', 1)::integer + split_part("employees", '-', 2)::integer
    ) / 2
    ELSE NULL
  END
);--> statement-breakpoint

CREATE TYPE "public"."service_modality" AS ENUM('in_person', 'online', 'hybrid');--> statement-breakpoint
CREATE TYPE "public"."service_availability" AS ENUM('immediate', 'not_immediate');--> statement-breakpoint
ALTER TABLE "services" RENAME COLUMN "availability" TO "availability_details";--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN "availability" "service_availability";--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN "modality" "service_modality";--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "search_vector" tsvector;--> statement-breakpoint
UPDATE "services"
SET "availability" = CASE
  WHEN lower(coalesce("availability_details", '')) LIKE '%24/7%'
    OR lower(coalesce("availability_details", '')) LIKE '%inmediata%'
    OR lower(coalesce("availability_details", '')) LIKE '%inmediato%'
    THEN 'immediate'::"service_availability"
  ELSE 'not_immediate'::"service_availability"
END;--> statement-breakpoint

ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "search_vector" tsvector;--> statement-breakpoint

CREATE OR REPLACE FUNCTION refresh_profiles_search_vector() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('spanish', unaccent(coalesce(NEW.name, ''))), 'A') ||
    setweight(to_tsvector('spanish', unaccent(coalesce(NEW.description, ''))), 'B');
  RETURN NEW;
END;
$$;--> statement-breakpoint

CREATE OR REPLACE FUNCTION refresh_services_search_vector() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('spanish', unaccent(coalesce(NEW.title, ''))), 'A') ||
    setweight(to_tsvector('spanish', unaccent(coalesce(NEW.marca, ''))), 'B') ||
    setweight(to_tsvector('spanish', unaccent(coalesce(NEW.description, ''))), 'C');
  RETURN NEW;
END;
$$;--> statement-breakpoint

CREATE OR REPLACE FUNCTION refresh_events_search_vector() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('spanish', unaccent(coalesce(NEW.title, ''))), 'A') ||
    setweight(to_tsvector('spanish', unaccent(coalesce(NEW.description, ''))), 'B') ||
    setweight(to_tsvector('spanish', unaccent(coalesce(NEW.requirements, ''))), 'C');
  RETURN NEW;
END;
$$;--> statement-breakpoint

DROP TRIGGER IF EXISTS profiles_search_vector_trigger ON "profiles";--> statement-breakpoint
CREATE TRIGGER profiles_search_vector_trigger BEFORE INSERT OR UPDATE OF name, description ON "profiles"
FOR EACH ROW EXECUTE FUNCTION refresh_profiles_search_vector();--> statement-breakpoint
DROP TRIGGER IF EXISTS services_search_vector_trigger ON "services";--> statement-breakpoint
CREATE TRIGGER services_search_vector_trigger BEFORE INSERT OR UPDATE OF title, marca, description ON "services"
FOR EACH ROW EXECUTE FUNCTION refresh_services_search_vector();--> statement-breakpoint
DROP TRIGGER IF EXISTS events_search_vector_trigger ON "events";--> statement-breakpoint
CREATE TRIGGER events_search_vector_trigger BEFORE INSERT OR UPDATE OF title, description, requirements ON "events"
FOR EACH ROW EXECUTE FUNCTION refresh_events_search_vector();--> statement-breakpoint

UPDATE "profiles" SET "name" = "name";--> statement-breakpoint
UPDATE "services" SET "title" = "title";--> statement-breakpoint
UPDATE "events" SET "title" = "title";--> statement-breakpoint

CREATE INDEX "profiles_region_category_idx" ON "profiles" USING btree ("region_id", "category_id");--> statement-breakpoint
CREATE INDEX "profiles_region_verified_created_idx" ON "profiles" USING btree ("region_id", "is_verified", "created_at");--> statement-breakpoint
CREATE INDEX "profiles_employees_idx" ON "profiles" USING btree ("employees");--> statement-breakpoint
CREATE INDEX "profiles_search_vector_idx" ON "profiles" USING gin ("search_vector");--> statement-breakpoint
CREATE INDEX "services_status_category_created_idx" ON "services" USING btree ("status_id", "category_id", "created_at");--> statement-breakpoint
CREATE INDEX "services_status_location_created_idx" ON "services" USING btree ("status_id", "location_id", "created_at");--> statement-breakpoint
CREATE INDEX "services_modality_idx" ON "services" USING btree ("modality");--> statement-breakpoint
CREATE INDEX "services_availability_idx" ON "services" USING btree ("availability");--> statement-breakpoint
CREATE INDEX "services_search_vector_idx" ON "services" USING gin ("search_vector");--> statement-breakpoint
CREATE INDEX "events_status_category_start_idx" ON "events" USING btree ("status_id", "category_id", "start_at");--> statement-breakpoint
CREATE INDEX "events_status_location_start_idx" ON "events" USING btree ("status_id", "location_id", "start_at");--> statement-breakpoint
CREATE INDEX "events_search_vector_idx" ON "events" USING gin ("search_vector");
