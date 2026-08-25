ALTER TABLE "profiles" DROP CONSTRAINT "profiles_location_id_locations_id_fk";
--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "region_id" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN "industry";--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN "location_id";
