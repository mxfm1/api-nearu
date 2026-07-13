ALTER TABLE "application_score_breakdown" ALTER COLUMN "rule_type" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "application_scoring_fields" ALTER COLUMN "rule_type" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "publication_scoring_rules" ALTER COLUMN "rule_type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."rule_type";--> statement-breakpoint
CREATE TYPE "public"."rule_type" AS ENUM('VERIFIED_PROFILE', 'SAME_REGION', 'HAS_WEBSITE', 'ACCOUNT_AGE');--> statement-breakpoint
ALTER TABLE "application_score_breakdown" ALTER COLUMN "rule_type" SET DATA TYPE "public"."rule_type" USING "rule_type"::"public"."rule_type";--> statement-breakpoint
ALTER TABLE "application_scoring_fields" ALTER COLUMN "rule_type" SET DATA TYPE "public"."rule_type" USING "rule_type"::"public"."rule_type";--> statement-breakpoint
ALTER TABLE "publication_scoring_rules" ALTER COLUMN "rule_type" SET DATA TYPE "public"."rule_type" USING "rule_type"::"public"."rule_type";--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "is_verified" boolean DEFAULT false NOT NULL;