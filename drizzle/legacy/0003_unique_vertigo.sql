ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "region_id" text;--> statement-breakpoint
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'profiles_location_id_locations_id_fk'
  ) THEN
    ALTER TABLE "profiles" DROP CONSTRAINT "profiles_location_id_locations_id_fk";
  END IF;
END $$;--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN IF EXISTS "industry";--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN IF EXISTS "location_id";--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'profiles_region_id_regions_id_fk'
  ) THEN
    ALTER TABLE "profiles"
      ADD CONSTRAINT "profiles_region_id_regions_id_fk"
      FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id")
      ON DELETE no action ON UPDATE no action;
  END IF;
END $$;--> statement-breakpoint

CREATE TYPE "public"."request_status" AS ENUM('pending', 'in_review', 'approved', 'rejected', 'resolved', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."request_type" AS ENUM('profile_verification', 'profile_report', 'publication_report', 'withdrawal', 'general_question', 'feedback');--> statement-breakpoint
ALTER TYPE "public"."entity_type" ADD VALUE 'request';--> statement-breakpoint
ALTER TYPE "public"."entity_type" ADD VALUE 'feedback';--> statement-breakpoint
ALTER TYPE "public"."entity_type" ADD VALUE 'deal';--> statement-breakpoint
ALTER TYPE "public"."notification_type" ADD VALUE 'publication_created';--> statement-breakpoint
ALTER TYPE "public"."notification_type" ADD VALUE 'publication_disabled';--> statement-breakpoint
ALTER TYPE "public"."notification_type" ADD VALUE 'email_confirmed';--> statement-breakpoint
ALTER TYPE "public"."notification_type" ADD VALUE 'request_submitted';--> statement-breakpoint
ALTER TYPE "public"."notification_type" ADD VALUE 'request_status_changed';--> statement-breakpoint
ALTER TYPE "public"."notification_type" ADD VALUE 'profile_verification_request_received';--> statement-breakpoint
ALTER TYPE "public"."notification_type" ADD VALUE 'profile_report_received';--> statement-breakpoint
ALTER TYPE "public"."notification_type" ADD VALUE 'publication_report_received';--> statement-breakpoint
ALTER TYPE "public"."notification_type" ADD VALUE 'request_received';--> statement-breakpoint
ALTER TYPE "public"."notification_type" ADD VALUE 'user_report_received';--> statement-breakpoint
ALTER TYPE "public"."notification_type" ADD VALUE 'request_review_delayed';--> statement-breakpoint
ALTER TYPE "public"."notification_type" ADD VALUE 'feedback_received';--> statement-breakpoint
ALTER TYPE "public"."notification_type" ADD VALUE 'deal_created';--> statement-breakpoint
CREATE TABLE "requests" (
	"id" text PRIMARY KEY NOT NULL,
	"profile_id" text NOT NULL,
	"type" "request_type" NOT NULL,
	"status" "request_status" DEFAULT 'pending' NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"metadata" jsonb,
	"target_entity_type" "entity_type",
	"target_entity_id" text,
	"reviewer_user_id" text,
	"reviewer_comment" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"reviewed_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role" text DEFAULT 'user' NOT NULL;--> statement-breakpoint
ALTER TABLE "requests" ADD CONSTRAINT "requests_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "requests" ADD CONSTRAINT "requests_reviewer_user_id_users_id_fk" FOREIGN KEY ("reviewer_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "requests_profile_idx" ON "requests" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "requests_type_status_idx" ON "requests" USING btree ("type","status");--> statement-breakpoint
CREATE INDEX "requests_created_at_idx" ON "requests" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "requests_reviewer_idx" ON "requests" USING btree ("reviewer_user_id");--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_actor_profile_id_profiles_id_fk" FOREIGN KEY ("actor_profile_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "np_user_type_unique" ON "notification_preferences" USING btree ("user_id","type");--> statement-breakpoint
CREATE UNIQUE INDEX "pt_profile_tag_unique" ON "profiles_to_tags" USING btree ("profile_id","tag_id");
