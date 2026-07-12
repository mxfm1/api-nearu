CREATE TABLE "profile_social_links" (
	"id" text PRIMARY KEY NOT NULL,
	"profile_id" text NOT NULL,
	"platform" text NOT NULL,
	"url" text NOT NULL,
	"orden" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"banner_url" text,
	"logo_url" text,
	"name" text,
	"industry" text DEFAULT '' NOT NULL,
	"description" text,
	"tags" text[] DEFAULT '{}',
	"location" text,
	"founded" text,
	"employees" text,
	"website" text,
	"whatsapp" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "profile_social_links" ADD CONSTRAINT "profile_social_links_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "social_links_profileId_idx" ON "profile_social_links" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "profiles_userId_idx" ON "profiles" USING btree ("user_id");