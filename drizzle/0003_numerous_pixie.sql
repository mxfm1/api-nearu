CREATE TABLE "categories" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "solicitudes_contacto" (
	"id" text PRIMARY KEY NOT NULL,
	"servicio_id" text NOT NULL,
	"propietario_id" text NOT NULL,
	"remitente_id" text NOT NULL,
	"mensaje" text,
	"estado" text DEFAULT 'pendiente' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" text PRIMARY KEY NOT NULL,
	"profile_id" text NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"start_at" timestamp with time zone,
	"location_id" text,
	"category_id" text,
	"thumbnail_url" text,
	"event_status" text DEFAULT 'draft' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "events_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "locations" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"region_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "regions" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "regions_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "service_portfolio" (
	"id" text PRIMARY KEY NOT NULL,
	"service_id" text NOT NULL,
	"url" text NOT NULL,
	"title" text,
	"description" text,
	"orden" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" text PRIMARY KEY NOT NULL,
	"profile_id" text NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"marca" text,
	"description" text,
	"years_experience" integer,
	"price_min" integer,
	"price_max" integer,
	"availability" text,
	"contact_info" jsonb DEFAULT '[]'::jsonb,
	"banner_url" text,
	"logo_url" text,
	"thumbnail_url" text,
	"location_id" text,
	"category_id" text,
	"service_status" text DEFAULT 'draft' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "services_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "solicitudes_contacto" ADD CONSTRAINT "solicitudes_contacto_servicio_id_services_id_fk" FOREIGN KEY ("servicio_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "solicitudes_contacto" ADD CONSTRAINT "solicitudes_contacto_propietario_id_users_id_fk" FOREIGN KEY ("propietario_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "solicitudes_contacto" ADD CONSTRAINT "solicitudes_contacto_remitente_id_users_id_fk" FOREIGN KEY ("remitente_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "locations" ADD CONSTRAINT "locations_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_portfolio" ADD CONSTRAINT "service_portfolio_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "contact_req_propietario_idx" ON "solicitudes_contacto" USING btree ("propietario_id");--> statement-breakpoint
CREATE INDEX "contact_req_remitente_idx" ON "solicitudes_contacto" USING btree ("remitente_id");--> statement-breakpoint
CREATE INDEX "events_profileId_idx" ON "events" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "events_locationId_idx" ON "events" USING btree ("location_id");--> statement-breakpoint
CREATE INDEX "events_categoryId_idx" ON "events" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "events_status_idx" ON "events" USING btree ("event_status");--> statement-breakpoint
CREATE INDEX "events_startAt_idx" ON "events" USING btree ("start_at");--> statement-breakpoint
CREATE INDEX "locations_regionId_idx" ON "locations" USING btree ("region_id");--> statement-breakpoint
CREATE INDEX "portfolio_serviceId_idx" ON "service_portfolio" USING btree ("service_id");--> statement-breakpoint
CREATE INDEX "services_profileId_idx" ON "services" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "services_locationId_idx" ON "services" USING btree ("location_id");--> statement-breakpoint
CREATE INDEX "services_categoryId_idx" ON "services" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "services_status_idx" ON "services" USING btree ("service_status");