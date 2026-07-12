CREATE TABLE "profiles_to_tags" (
	"profile_id" text NOT NULL,
	"tag_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_contacts" (
	"id" text PRIMARY KEY NOT NULL,
	"service_id" text NOT NULL,
	"type" text NOT NULL,
	"value" text NOT NULL,
	"read_at" timestamp,
	"responded_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "statuses" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "statuses_name_unique" UNIQUE("name"),
	CONSTRAINT "statuses_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tags_name_unique" UNIQUE("name"),
	CONSTRAINT "tags_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
DROP INDEX "events_status_idx";--> statement-breakpoint
DROP INDEX "services_status_idx";--> statement-breakpoint
ALTER TABLE "solicitudes_contacto" ALTER COLUMN "servicio_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "slug" text NOT NULL;--> statement-breakpoint
ALTER TABLE "solicitudes_contacto" ADD COLUMN "evento_id" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "status_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "locations" ADD COLUMN "slug" text NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "slug" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "location_id" text;--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN "status_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles_to_tags" ADD CONSTRAINT "profiles_to_tags_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles_to_tags" ADD CONSTRAINT "profiles_to_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_contacts" ADD CONSTRAINT "service_contacts_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "pt_profiles_idx" ON "profiles_to_tags" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "pt_tags_idx" ON "profiles_to_tags" USING btree ("tag_id");--> statement-breakpoint
CREATE INDEX "sc_serviceId_idx" ON "service_contacts" USING btree ("service_id");--> statement-breakpoint
ALTER TABLE "solicitudes_contacto" ADD CONSTRAINT "solicitudes_contacto_evento_id_events_id_fk" FOREIGN KEY ("evento_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_status_id_statuses_id_fk" FOREIGN KEY ("status_id") REFERENCES "public"."statuses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_status_id_statuses_id_fk" FOREIGN KEY ("status_id") REFERENCES "public"."statuses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "contact_req_servicio_idx" ON "solicitudes_contacto" USING btree ("servicio_id");--> statement-breakpoint
CREATE INDEX "contact_req_evento_idx" ON "solicitudes_contacto" USING btree ("evento_id");--> statement-breakpoint
CREATE INDEX "contact_req_createdAt_idx" ON "solicitudes_contacto" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "events_statusId_idx" ON "events" USING btree ("status_id");--> statement-breakpoint
CREATE INDEX "events_createdAt_idx" ON "events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "events_slug_idx" ON "events" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "locations_slug_idx" ON "locations" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "profiles_slug_idx" ON "profiles" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "services_statusId_idx" ON "services" USING btree ("status_id");--> statement-breakpoint
CREATE INDEX "services_createdAt_idx" ON "services" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "services_slug_idx" ON "services" USING btree ("slug");--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "event_status";--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN "tags";--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN "location";--> statement-breakpoint
ALTER TABLE "services" DROP COLUMN "contact_info";--> statement-breakpoint
ALTER TABLE "services" DROP COLUMN "service_status";--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_slug_unique" UNIQUE("slug");--> statement-breakpoint
ALTER TABLE "locations" ADD CONSTRAINT "locations_slug_unique" UNIQUE("slug");--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_slug_unique" UNIQUE("slug");