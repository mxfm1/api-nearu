CREATE TYPE "public"."attachment_type" AS ENUM('IMAGE', 'DOCUMENT', 'VIDEO', 'OTHER');
CREATE TYPE "public"."entity_type" AS ENUM('application', 'event', 'message', 'conversation', 'profile', 'account', 'system', 'service', 'request', 'feedback', 'deal');
CREATE TYPE "public"."message_type" AS ENUM('TEXT', 'SYSTEM', 'FILE', 'IMAGE', 'MIXED');
CREATE TYPE "public"."notification_type" AS ENUM('new_application', 'application_reviewing', 'application_accepted', 'application_rejected', 'email_changed', 'password_changed', 'profile_updated', 'account_change', 'profile_verified', 'profile_revalidation_required', 'event_closed', 'event_filled', 'new_message', 'system', 'publication_created', 'publication_disabled', 'email_confirmed', 'request_submitted', 'request_status_changed', 'profile_verification_request_received', 'profile_report_received', 'publication_report_received', 'request_received', 'user_report_received', 'request_review_delayed', 'feedback_received', 'deal_created');
CREATE TYPE "public"."request_status" AS ENUM('pending', 'in_review', 'approved', 'rejected', 'resolved', 'cancelled');
CREATE TYPE "public"."request_type" AS ENUM('profile_verification', 'profile_report', 'publication_report', 'withdrawal', 'general_question', 'feedback');
CREATE TYPE "public"."rule_type" AS ENUM('VERIFIED_PROFILE', 'SAME_REGION', 'HAS_WEBSITE', 'ACCOUNT_AGE');
CREATE TYPE "public"."service_availability" AS ENUM('immediate', 'not_immediate');
CREATE TYPE "public"."service_modality" AS ENUM('in_person', 'online', 'hybrid');
CREATE TYPE "public"."thread_status" AS ENUM('OPEN', 'CLOSED', 'ARCHIVED');
CREATE TABLE "accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "application_score_breakdown" (
	"id" text PRIMARY KEY NOT NULL,
	"score_id" text NOT NULL,
	"rule_type" "rule_type" NOT NULL,
	"points_earned" integer DEFAULT 0 NOT NULL,
	"points_possible" integer DEFAULT 0 NOT NULL,
	"reason" text
);

CREATE TABLE "application_scores" (
	"id" text PRIMARY KEY NOT NULL,
	"application_id" text NOT NULL,
	"total_score" integer DEFAULT 0 NOT NULL,
	"max_possible" integer DEFAULT 0 NOT NULL,
	"computed_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "application_scoring_fields" (
	"id" text PRIMARY KEY NOT NULL,
	"application_id" text NOT NULL,
	"rule_type" "rule_type" NOT NULL,
	"value" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "applications" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"applicant_profile_id" text NOT NULL,
	"cover_letter" text,
	"portfolio_urls" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status_id" text DEFAULT '10000000-0000-0000-0000-000000000001' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "categories" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"type" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);

CREATE TABLE "solicitudes_contacto" (
	"id" text PRIMARY KEY NOT NULL,
	"servicio_id" text,
	"evento_id" text,
	"propietario_id" text NOT NULL,
	"remitente_id" text NOT NULL,
	"intencion" text NOT NULL,
	"estado" text DEFAULT 'pendiente' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "events" (
	"id" text PRIMARY KEY NOT NULL,
	"profile_id" text NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"requirements" text,
	"start_at" timestamp with time zone,
	"application_deadline" timestamp,
	"location_id" text,
	"category_id" text,
	"thumbnail_url" text,
	"banner_url" text,
	"required_candidates" integer DEFAULT 1 NOT NULL,
	"selected_candidates" integer DEFAULT 0 NOT NULL,
	"application_count" integer DEFAULT 0 NOT NULL,
	"requires_verified_profile" boolean DEFAULT true NOT NULL,
	"auto_close_when_filled" boolean DEFAULT true NOT NULL,
	"search_vector" "tsvector",
	"status_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "events_slug_unique" UNIQUE("slug")
);

CREATE TABLE "inbox_messages" (
	"id" text PRIMARY KEY NOT NULL,
	"contact_request_id" text NOT NULL,
	"sender_id" text NOT NULL,
	"content" text,
	"attachments" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "locations" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"region_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "locations_slug_unique" UNIQUE("slug")
);

CREATE TABLE "message_attachments" (
	"id" text PRIMARY KEY NOT NULL,
	"message_id" text NOT NULL,
	"file_url" text NOT NULL,
	"file_name" text NOT NULL,
	"mime_type" text NOT NULL,
	"attachment_type" "attachment_type" NOT NULL,
	"size_bytes" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "messages" (
	"id" text PRIMARY KEY NOT NULL,
	"thread_id" text NOT NULL,
	"sender_profile_id" text NOT NULL,
	"content" text,
	"message_type" "message_type" DEFAULT 'TEXT' NOT NULL,
	"read_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "notification_preferences" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" "notification_type" NOT NULL,
	"email_enabled" boolean DEFAULT true NOT NULL,
	"in_app_enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"actor_profile_id" text,
	"type" "notification_type" NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"entity_type" "entity_type",
	"entity_id" text,
	"action_url" text,
	"is_read" boolean DEFAULT false NOT NULL,
	"read_at" timestamp,
	"email_sent_at" timestamp,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "profile_social_links" (
	"id" text PRIMARY KEY NOT NULL,
	"profile_id" text NOT NULL,
	"platform" text NOT NULL,
	"url" text NOT NULL,
	"orden" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"slug" text,
	"banner_url" text,
	"logo_url" text,
	"name" text,
	"description" text,
	"region_id" text,
	"category_id" text,
	"founded" text,
	"employees" integer,
	"website" text,
	"whatsapp" text,
	"is_verified" boolean DEFAULT false NOT NULL,
	"search_vector" "tsvector",
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "profiles_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "profiles_slug_unique" UNIQUE("slug")
);

CREATE TABLE "profiles_to_tags" (
	"profile_id" text NOT NULL,
	"tag_id" text NOT NULL
);

CREATE TABLE "publication_scoring_rules" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"rule_type" "rule_type" NOT NULL,
	"weight" integer DEFAULT 1 NOT NULL,
	"config" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "regions" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "regions_slug_unique" UNIQUE("slug")
);

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

CREATE TABLE "service_contacts" (
	"id" text PRIMARY KEY NOT NULL,
	"service_id" text NOT NULL,
	"type" text NOT NULL,
	"value" text NOT NULL,
	"read_at" timestamp,
	"responded_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "service_portfolio" (
	"id" text PRIMARY KEY NOT NULL,
	"service_id" text NOT NULL,
	"url" text NOT NULL,
	"title" text,
	"description" text,
	"orden" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

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
	"availability" "service_availability",
	"availability_details" text,
	"modality" "service_modality",
	"search_vector" "tsvector",
	"banner_url" text,
	"logo_url" text,
	"thumbnail_url" text,
	"location_id" text,
	"category_id" text,
	"status_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "services_slug_unique" UNIQUE("slug")
);

CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);

CREATE TABLE "statuses" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "statuses_name_unique" UNIQUE("name"),
	CONSTRAINT "statuses_slug_unique" UNIQUE("slug")
);

CREATE TABLE "tags" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tags_name_unique" UNIQUE("name"),
	CONSTRAINT "tags_slug_unique" UNIQUE("slug")
);

CREATE TABLE "test" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "threads" (
	"id" text PRIMARY KEY NOT NULL,
	"application_id" text NOT NULL,
	"status" "thread_status" DEFAULT 'OPEN' NOT NULL,
	"closed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "user_notification_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"email_notifications_enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_notification_settings_user_id_unique" UNIQUE("user_id")
);

CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"role" text DEFAULT 'user' NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);

CREATE TABLE "verifications" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "application_score_breakdown" ADD CONSTRAINT "application_score_breakdown_score_id_application_scores_id_fk" FOREIGN KEY ("score_id") REFERENCES "public"."application_scores"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "application_scores" ADD CONSTRAINT "application_scores_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "application_scoring_fields" ADD CONSTRAINT "application_scoring_fields_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "applications" ADD CONSTRAINT "applications_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "applications" ADD CONSTRAINT "applications_applicant_profile_id_profiles_id_fk" FOREIGN KEY ("applicant_profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "applications" ADD CONSTRAINT "applications_status_id_statuses_id_fk" FOREIGN KEY ("status_id") REFERENCES "public"."statuses"("id") ON DELETE restrict ON UPDATE no action;
ALTER TABLE "solicitudes_contacto" ADD CONSTRAINT "solicitudes_contacto_servicio_id_services_id_fk" FOREIGN KEY ("servicio_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "solicitudes_contacto" ADD CONSTRAINT "solicitudes_contacto_evento_id_events_id_fk" FOREIGN KEY ("evento_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "solicitudes_contacto" ADD CONSTRAINT "solicitudes_contacto_propietario_id_users_id_fk" FOREIGN KEY ("propietario_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "solicitudes_contacto" ADD CONSTRAINT "solicitudes_contacto_remitente_id_users_id_fk" FOREIGN KEY ("remitente_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "events" ADD CONSTRAINT "events_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "events" ADD CONSTRAINT "events_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "events" ADD CONSTRAINT "events_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "events" ADD CONSTRAINT "events_status_id_statuses_id_fk" FOREIGN KEY ("status_id") REFERENCES "public"."statuses"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "inbox_messages" ADD CONSTRAINT "inbox_messages_contact_request_id_solicitudes_contacto_id_fk" FOREIGN KEY ("contact_request_id") REFERENCES "public"."solicitudes_contacto"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "inbox_messages" ADD CONSTRAINT "inbox_messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "locations" ADD CONSTRAINT "locations_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "message_attachments" ADD CONSTRAINT "message_attachments_message_id_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "messages" ADD CONSTRAINT "messages_thread_id_threads_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."threads"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_profile_id_profiles_id_fk" FOREIGN KEY ("sender_profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_actor_profile_id_profiles_id_fk" FOREIGN KEY ("actor_profile_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "profile_social_links" ADD CONSTRAINT "profile_social_links_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "profiles_to_tags" ADD CONSTRAINT "profiles_to_tags_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "profiles_to_tags" ADD CONSTRAINT "profiles_to_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "publication_scoring_rules" ADD CONSTRAINT "publication_scoring_rules_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "requests" ADD CONSTRAINT "requests_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "requests" ADD CONSTRAINT "requests_reviewer_user_id_users_id_fk" FOREIGN KEY ("reviewer_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "service_contacts" ADD CONSTRAINT "service_contacts_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "service_portfolio" ADD CONSTRAINT "service_portfolio_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "services" ADD CONSTRAINT "services_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "services" ADD CONSTRAINT "services_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "services" ADD CONSTRAINT "services_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "services" ADD CONSTRAINT "services_status_id_statuses_id_fk" FOREIGN KEY ("status_id") REFERENCES "public"."statuses"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "threads" ADD CONSTRAINT "threads_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "user_notification_settings" ADD CONSTRAINT "user_notification_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
CREATE INDEX "accounts_userId_idx" ON "accounts" USING btree ("user_id");
CREATE INDEX "breakdown_scoreId_idx" ON "application_score_breakdown" USING btree ("score_id");
CREATE INDEX "scores_applicationId_idx" ON "application_scores" USING btree ("application_id");
CREATE INDEX "asf_applicationId_idx" ON "application_scoring_fields" USING btree ("application_id");
CREATE INDEX "asf_ruleType_idx" ON "application_scoring_fields" USING btree ("rule_type");
CREATE INDEX "applications_eventId_idx" ON "applications" USING btree ("event_id");
CREATE INDEX "applications_applicantId_idx" ON "applications" USING btree ("applicant_profile_id");
CREATE INDEX "applications_statusId_idx" ON "applications" USING btree ("status_id");
CREATE INDEX "applications_createdAt_idx" ON "applications" USING btree ("created_at");
CREATE INDEX "contact_req_propietario_idx" ON "solicitudes_contacto" USING btree ("propietario_id");
CREATE INDEX "contact_req_remitente_idx" ON "solicitudes_contacto" USING btree ("remitente_id");
CREATE INDEX "contact_req_servicio_idx" ON "solicitudes_contacto" USING btree ("servicio_id");
CREATE INDEX "contact_req_evento_idx" ON "solicitudes_contacto" USING btree ("evento_id");
CREATE INDEX "contact_req_createdAt_idx" ON "solicitudes_contacto" USING btree ("created_at");
CREATE INDEX "events_profileId_idx" ON "events" USING btree ("profile_id");
CREATE INDEX "events_locationId_idx" ON "events" USING btree ("location_id");
CREATE INDEX "events_categoryId_idx" ON "events" USING btree ("category_id");
CREATE INDEX "events_statusId_idx" ON "events" USING btree ("status_id");
CREATE INDEX "events_startAt_idx" ON "events" USING btree ("start_at");
CREATE INDEX "events_applicationDeadline_idx" ON "events" USING btree ("application_deadline");
CREATE INDEX "events_createdAt_idx" ON "events" USING btree ("created_at");
CREATE INDEX "events_slug_idx" ON "events" USING btree ("slug");
CREATE INDEX "events_status_category_start_idx" ON "events" USING btree ("status_id","category_id","start_at");
CREATE INDEX "events_status_location_start_idx" ON "events" USING btree ("status_id","location_id","start_at");
CREATE INDEX "events_search_vector_idx" ON "events" USING gin ("search_vector");
CREATE INDEX "im_contact_request_idx" ON "inbox_messages" USING btree ("contact_request_id");
CREATE INDEX "im_sender_idx" ON "inbox_messages" USING btree ("sender_id");
CREATE INDEX "im_createdAt_idx" ON "inbox_messages" USING btree ("created_at");
CREATE INDEX "locations_regionId_idx" ON "locations" USING btree ("region_id");
CREATE INDEX "locations_slug_idx" ON "locations" USING btree ("slug");
CREATE INDEX "ma_messageId_idx" ON "message_attachments" USING btree ("message_id");
CREATE INDEX "messages_threadId_idx" ON "messages" USING btree ("thread_id");
CREATE INDEX "messages_senderProfileId_idx" ON "messages" USING btree ("sender_profile_id");
CREATE INDEX "messages_createdAt_idx" ON "messages" USING btree ("created_at");
CREATE INDEX "np_user_idx" ON "notification_preferences" USING btree ("user_id");
CREATE INDEX "np_user_type_idx" ON "notification_preferences" USING btree ("user_id","type");
CREATE UNIQUE INDEX "np_user_type_unique" ON "notification_preferences" USING btree ("user_id","type");
CREATE INDEX "notif_user_idx" ON "notifications" USING btree ("user_id");
CREATE INDEX "notif_createdAt_idx" ON "notifications" USING btree ("created_at");
CREATE INDEX "notif_readAt_idx" ON "notifications" USING btree ("read_at");
CREATE INDEX "notif_isRead_idx" ON "notifications" USING btree ("is_read");
CREATE INDEX "notif_type_idx" ON "notifications" USING btree ("type");
CREATE INDEX "notif_entity_idx" ON "notifications" USING btree ("entity_type","entity_id");
CREATE INDEX "social_links_profileId_idx" ON "profile_social_links" USING btree ("profile_id");
CREATE INDEX "profiles_userId_idx" ON "profiles" USING btree ("user_id");
CREATE INDEX "profiles_slug_idx" ON "profiles" USING btree ("slug");
CREATE INDEX "profiles_region_category_idx" ON "profiles" USING btree ("region_id","category_id");
CREATE INDEX "profiles_region_verified_created_idx" ON "profiles" USING btree ("region_id","is_verified","created_at");
CREATE INDEX "profiles_employees_idx" ON "profiles" USING btree ("employees");
CREATE INDEX "profiles_search_vector_idx" ON "profiles" USING gin ("search_vector");
CREATE INDEX "pt_profiles_idx" ON "profiles_to_tags" USING btree ("profile_id");
CREATE INDEX "pt_tags_idx" ON "profiles_to_tags" USING btree ("tag_id");
CREATE UNIQUE INDEX "pt_profile_tag_unique" ON "profiles_to_tags" USING btree ("profile_id","tag_id");
CREATE INDEX "scoring_rules_eventId_idx" ON "publication_scoring_rules" USING btree ("event_id");
CREATE INDEX "requests_profile_idx" ON "requests" USING btree ("profile_id");
CREATE INDEX "requests_type_status_idx" ON "requests" USING btree ("type","status");
CREATE INDEX "requests_created_at_idx" ON "requests" USING btree ("created_at");
CREATE INDEX "requests_reviewer_idx" ON "requests" USING btree ("reviewer_user_id");
CREATE INDEX "sc_serviceId_idx" ON "service_contacts" USING btree ("service_id");
CREATE INDEX "portfolio_serviceId_idx" ON "service_portfolio" USING btree ("service_id");
CREATE INDEX "services_profileId_idx" ON "services" USING btree ("profile_id");
CREATE INDEX "services_locationId_idx" ON "services" USING btree ("location_id");
CREATE INDEX "services_categoryId_idx" ON "services" USING btree ("category_id");
CREATE INDEX "services_statusId_idx" ON "services" USING btree ("status_id");
CREATE INDEX "services_createdAt_idx" ON "services" USING btree ("created_at");
CREATE INDEX "services_slug_idx" ON "services" USING btree ("slug");
CREATE INDEX "services_status_category_created_idx" ON "services" USING btree ("status_id","category_id","created_at");
CREATE INDEX "services_status_location_created_idx" ON "services" USING btree ("status_id","location_id","created_at");
CREATE INDEX "services_modality_idx" ON "services" USING btree ("modality");
CREATE INDEX "services_availability_idx" ON "services" USING btree ("availability");
CREATE INDEX "services_search_vector_idx" ON "services" USING gin ("search_vector");
CREATE INDEX "sessions_userId_idx" ON "sessions" USING btree ("user_id");
CREATE INDEX "threads_applicationId_idx" ON "threads" USING btree ("application_id");
CREATE INDEX "threads_status_idx" ON "threads" USING btree ("status");
CREATE INDEX "uns_user_idx" ON "user_notification_settings" USING btree ("user_id");
CREATE INDEX "verifications_identifier_idx" ON "verifications" USING btree ("identifier");

CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE OR REPLACE FUNCTION refresh_profiles_search_vector() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('spanish', unaccent(coalesce(NEW.name, ''))), 'A') ||
    setweight(to_tsvector('spanish', unaccent(coalesce(NEW.description, ''))), 'B');
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION refresh_services_search_vector() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('spanish', unaccent(coalesce(NEW.title, ''))), 'A') ||
    setweight(to_tsvector('spanish', unaccent(coalesce(NEW.marca, ''))), 'B') ||
    setweight(to_tsvector('spanish', unaccent(coalesce(NEW.description, ''))), 'C');
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION refresh_events_search_vector() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('spanish', unaccent(coalesce(NEW.title, ''))), 'A') ||
    setweight(to_tsvector('spanish', unaccent(coalesce(NEW.description, ''))), 'B') ||
    setweight(to_tsvector('spanish', unaccent(coalesce(NEW.requirements, ''))), 'C');
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_search_vector_trigger BEFORE INSERT OR UPDATE OF name, description ON "profiles"
FOR EACH ROW EXECUTE FUNCTION refresh_profiles_search_vector();
CREATE TRIGGER services_search_vector_trigger BEFORE INSERT OR UPDATE OF title, marca, description ON "services"
FOR EACH ROW EXECUTE FUNCTION refresh_services_search_vector();
CREATE TRIGGER events_search_vector_trigger BEFORE INSERT OR UPDATE OF title, description, requirements ON "events"
FOR EACH ROW EXECUTE FUNCTION refresh_events_search_vector();

UPDATE "profiles" SET "name" = "name";
UPDATE "services" SET "title" = "title";
UPDATE "events" SET "title" = "title";
