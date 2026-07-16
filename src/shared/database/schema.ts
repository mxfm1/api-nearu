import { pgTable, text, boolean, timestamp, integer, index, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const sessions = pgTable(
  'sessions',
  {
    id: text('id').primaryKey(),
    expiresAt: timestamp('expires_at').notNull(),
    token: text('token').notNull().unique(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
  },
  (table) => [index('sessions_userId_idx').on(table.userId)],
);

export const accounts = pgTable(
  'accounts',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at'),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [index('accounts_userId_idx').on(table.userId)],
);

export const verifications = pgTable(
  'verifications',
  {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [index('verifications_identifier_idx').on(table.identifier)],
);


export const profiles = pgTable(
  'profiles',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: 'cascade' }),
    slug: text('slug').unique(),
    bannerUrl: text('banner_url'),
    logoUrl: text('logo_url'),
    name: text('name'),
    description: text('description'),
    regionId: text('region_id').references(() => regions.id),
    founded: text('founded'),
    employees: text('employees'),
    website: text('website'),
    whatsapp: text('whatsapp'),
    isVerified: boolean('is_verified').notNull().default(false),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index('profiles_userId_idx').on(table.userId),
    index('profiles_slug_idx').on(table.slug),
  ],
);

export const tags = pgTable('tags', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const profilesToTags = pgTable(
  'profiles_to_tags',
  {
    profileId: text('profile_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    tagId: text('tag_id')
      .notNull()
      .references(() => tags.id, { onDelete: 'cascade' }),
  },
  (table) => [
    index('pt_profiles_idx').on(table.profileId),
    index('pt_tags_idx').on(table.tagId),
  ],
);

export const serviceContacts = pgTable(
  'service_contacts',
  {
    id: text('id').primaryKey(),
    serviceId: text('service_id')
      .notNull()
      .references(() => services.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    value: text('value').notNull(),
    readAt: timestamp('read_at'),
    respondedAt: timestamp('responded_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [index('sc_serviceId_idx').on(table.serviceId)],
);

export const profileSocialLinks = pgTable(
  'profile_social_links',
  {
    id: text('id').primaryKey(),
    profileId: text('profile_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    platform: text('platform').notNull(),
    url: text('url').notNull(),
    orden: integer('orden').notNull().default(0),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [index('social_links_profileId_idx').on(table.profileId)],
);

export const contactRequests = pgTable(
  'solicitudes_contacto',
  {
    id: text('id').primaryKey(),
    servicioId: text('servicio_id')
      .references(() => services.id, { onDelete: 'cascade' }),
    eventoId: text('evento_id')
      .references(() => events.id, { onDelete: 'cascade' }),
    propietarioId: text('propietario_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    remitenteId: text('remitente_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    intencion: text('intencion').notNull(),
    estado: text('estado').notNull().default('pendiente'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index('contact_req_propietario_idx').on(table.propietarioId),
    index('contact_req_remitente_idx').on(table.remitenteId),
    index('contact_req_servicio_idx').on(table.servicioId),
    index('contact_req_evento_idx').on(table.eventoId),
    index('contact_req_createdAt_idx').on(table.createdAt),
  ],
);

// ──────────────────────────────────────────────
// INBOX MESSAGES (threaded per contact request)
// ──────────────────────────────────────────────
export const inboxMessages = pgTable(
  'inbox_messages',
  {
    id: text('id').primaryKey(),
    contactRequestId: text('contact_request_id')
      .notNull()
      .references(() => contactRequests.id, { onDelete: 'cascade' }),
    senderId: text('sender_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    content: text('content'),
    attachments: jsonb('attachments').notNull().default([]),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index('im_contact_request_idx').on(table.contactRequestId),
    index('im_sender_idx').on(table.senderId),
    index('im_createdAt_idx').on(table.createdAt),
  ],
);

// ──────────────────────────────────────────────
// NOTIFICATIONS (in-app, type-discriminated)
// ──────────────────────────────────────────────
export const notificationTypeEnum = pgEnum('notification_type', [
  'new_application',
  'application_reviewing',
  'application_accepted',
  'application_rejected',
  'email_changed',
  'password_changed',
  'profile_updated',
  'account_change',
  'profile_verified',
  'profile_revalidation_required',
  'event_closed',
  'event_filled',
  'new_message',
  'system',
]);

export const entityTypeEnum = pgEnum('entity_type', [
  'application',
  'event',
  'message',
  'conversation',
  'profile',
  'account',
  'system',
  'service',
]);

export const notifications = pgTable(
  'notifications',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    actorProfileId: text('actor_profile_id'),
    type: notificationTypeEnum('type').notNull(),
    title: text('title').notNull(),
    body: text('body').notNull(),
    entityType: entityTypeEnum('entity_type'),
    entityId: text('entity_id'),
    actionUrl: text('action_url'),
    isRead: boolean('is_read').notNull().default(false),
    readAt: timestamp('read_at'),
    emailSentAt: timestamp('email_sent_at'),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    index('notif_user_idx').on(table.userId),
    index('notif_createdAt_idx').on(table.createdAt),
    index('notif_readAt_idx').on(table.readAt),
    index('notif_isRead_idx').on(table.isRead),
    index('notif_type_idx').on(table.type),
    index('notif_entity_idx').on(table.entityType, table.entityId),
  ],
);

// ──────────────────────────────────────────────
// NOTIFICATION PREFERENCES (per-type)
// ──────────────────────────────────────────────
export const notificationPreferences = pgTable(
  'notification_preferences',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: notificationTypeEnum('type').notNull(),
    emailEnabled: boolean('email_enabled').notNull().default(true),
    inAppEnabled: boolean('in_app_enabled').notNull().default(true),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index('np_user_idx').on(table.userId),
    index('np_user_type_idx').on(table.userId, table.type),
  ],
);

// ──────────────────────────────────────────────
// USER NOTIFICATION SETTINGS (deprecated — use notification_preferences)
// ──────────────────────────────────────────────
export const userNotificationSettings = pgTable(
  'user_notification_settings',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: 'cascade' }),
    emailNotificationsEnabled: boolean('email_notifications_enabled').notNull().default(true),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [index('uns_user_idx').on(table.userId)],
);

// ──────────────────────────────────────────────
// REGIONS & LOCATIONS
// ──────────────────────────────────────────────
export const regions = pgTable('regions', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const locations = pgTable(
  'locations',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    regionId: text('region_id')
      .notNull()
      .references(() => regions.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    index('locations_regionId_idx').on(table.regionId),
    index('locations_slug_idx').on(table.slug),
  ],
);

// ──────────────────────────────────────────────
// STATUSES (shared by services & events)
// ──────────────────────────────────────────────
export const statuses = pgTable('statuses', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ──────────────────────────────────────────────
// CATEGORIES (discriminated by type)
// ──────────────────────────────────────────────
export const categories = pgTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  type: text('type').notNull(), // 'service' | 'event'
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ──────────────────────────────────────────────
// SERVICES
// ──────────────────────────────────────────────
export const services = pgTable(
  'services',
  {
    id: text('id').primaryKey(),
    profileId: text('profile_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    slug: text('slug').notNull().unique(),
    title: text('title').notNull(),
    marca: text('marca'),
    description: text('description'),
    yearsExperience: integer('years_experience'),
    priceMin: integer('price_min'),
    priceMax: integer('price_max'),
    availability: text('availability'),
    bannerUrl: text('banner_url'),
    logoUrl: text('logo_url'),
    thumbnailUrl: text('thumbnail_url'),
    locationId: text('location_id').references(() => locations.id),
    categoryId: text('category_id').references(() => categories.id),
    statusId: text('status_id')
      .notNull()
      .references(() => statuses.id),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index('services_profileId_idx').on(table.profileId),
    index('services_locationId_idx').on(table.locationId),
    index('services_categoryId_idx').on(table.categoryId),
    index('services_statusId_idx').on(table.statusId),
    index('services_createdAt_idx').on(table.createdAt),
    index('services_slug_idx').on(table.slug),
  ],
);

// ──────────────────────────────────────────────
// SERVICE PORTFOLIO
// ──────────────────────────────────────────────
export const servicePortfolio = pgTable(
  'service_portfolio',
  {
    id: text('id').primaryKey(),
    serviceId: text('service_id')
      .notNull()
      .references(() => services.id, { onDelete: 'cascade' }),
    url: text('url').notNull(),
    title: text('title'),
    description: text('description'),
    orden: integer('orden').notNull().default(0),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [index('portfolio_serviceId_idx').on(table.serviceId)],
);

// ──────────────────────────────────────────────
// EVENTS
// ──────────────────────────────────────────────
export const events = pgTable(
  'events',
  {
    id: text('id').primaryKey(),
    profileId: text('profile_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    slug: text('slug').notNull().unique(),
    title: text('title').notNull(),
    description: text('description'),
    requirements: text('requirements'),
    startAt: timestamp('start_at', { withTimezone: true }),
    applicationDeadline: timestamp('application_deadline'),
    locationId: text('location_id').references(() => locations.id),
    categoryId: text('category_id').references(() => categories.id),
    thumbnailUrl: text('thumbnail_url'),
    bannerUrl: text('banner_url'),
    requiredCandidates: integer('required_candidates').notNull().default(1),
    selectedCandidates: integer('selected_candidates').notNull().default(0),
    applicationCount: integer('application_count').notNull().default(0),
    requiresVerifiedProfile: boolean('requires_verified_profile').notNull().default(true),
    autoCloseWhenFilled: boolean('auto_close_when_filled').notNull().default(true),
    statusId: text('status_id')
      .notNull()
      .references(() => statuses.id),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index('events_profileId_idx').on(table.profileId),
    index('events_locationId_idx').on(table.locationId),
    index('events_categoryId_idx').on(table.categoryId),
    index('events_statusId_idx').on(table.statusId),
    index('events_startAt_idx').on(table.startAt),
    index('events_applicationDeadline_idx').on(table.applicationDeadline),
    index('events_createdAt_idx').on(table.createdAt),
    index('events_slug_idx').on(table.slug),
  ],
);

// ──────────────────────────────────────────────
// APPLICATIONS (event postulations)
// ──────────────────────────────────────────────
export const ruleTypeEnum = pgEnum('rule_type', [
  'VERIFIED_PROFILE',
  'SAME_REGION',
  'HAS_WEBSITE',
  'ACCOUNT_AGE',
]);

export const threadStatusEnum = pgEnum('thread_status', [
  'OPEN',
  'CLOSED',
  'ARCHIVED',
]);

export const messageTypeEnum = pgEnum('message_type', [
  'TEXT',
  'SYSTEM',
  'FILE',
  'IMAGE',
  'MIXED',
]);

export const attachmentTypeEnum = pgEnum('attachment_type', [
  'IMAGE',
  'DOCUMENT',
  'VIDEO',
  'OTHER',
]);

export const applications = pgTable(
  'applications',
  {
    id: text('id').primaryKey(),
    eventId: text('event_id')
      .notNull()
      .references(() => events.id, { onDelete: 'cascade' }),
    applicantProfileId: text('applicant_profile_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    coverLetter: text('cover_letter'),
    portfolioUrls: jsonb('portfolio_urls').notNull().default([]),
    statusId: text('status_id')
      .notNull()
      .default('10000000-0000-0000-0000-000000000001') // application_pending UUID
      .references(() => statuses.id, { onDelete: 'restrict' }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index('applications_eventId_idx').on(table.eventId),
    index('applications_applicantId_idx').on(table.applicantProfileId),
    index('applications_statusId_idx').on(table.statusId),
    index('applications_createdAt_idx').on(table.createdAt),
  ],
);

export const publicationScoringRules = pgTable(
  'publication_scoring_rules',
  {
    id: text('id').primaryKey(),
    eventId: text('event_id')
      .notNull()
      .references(() => events.id, { onDelete: 'cascade' }),
    ruleType: ruleTypeEnum('rule_type').notNull(),
    weight: integer('weight').notNull().default(1),
    config: jsonb('config'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    index('scoring_rules_eventId_idx').on(table.eventId),
  ],
);

export const applicationScores = pgTable(
  'application_scores',
  {
    id: text('id').primaryKey(),
    applicationId: text('application_id')
      .notNull()
      .references(() => applications.id, { onDelete: 'cascade' }),
    totalScore: integer('total_score').notNull().default(0),
    maxPossible: integer('max_possible').notNull().default(0),
    computedAt: timestamp('computed_at').notNull().defaultNow(),
  },
  (table) => [
    index('scores_applicationId_idx').on(table.applicationId),
  ],
);

export const applicationScoreBreakdown = pgTable(
  'application_score_breakdown',
  {
    id: text('id').primaryKey(),
    scoreId: text('score_id')
      .notNull()
      .references(() => applicationScores.id, { onDelete: 'cascade' }),
    ruleType: ruleTypeEnum('rule_type').notNull(),
    pointsEarned: integer('points_earned').notNull().default(0),
    pointsPossible: integer('points_possible').notNull().default(0),
    reason: text('reason'),
  },
  (table) => [
    index('breakdown_scoreId_idx').on(table.scoreId),
  ],
);

// ──────────────────────────────────────────────
// APPLICATION SCORING FIELDS (respuestas del postulante por regla)
// ──────────────────────────────────────────────
export const applicationScoringFields = pgTable(
  'application_scoring_fields',
  {
    id: text('id').primaryKey(),
    applicationId: text('application_id')
      .notNull()
      .references(() => applications.id, { onDelete: 'cascade' }),
    ruleType: ruleTypeEnum('rule_type').notNull(),
    value: jsonb('value'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index('asf_applicationId_idx').on(table.applicationId),
    index('asf_ruleType_idx').on(table.ruleType),
  ],
);

// ──────────────────────────────────────────────
// THREADS (conversaciones post-aceptación)
// ──────────────────────────────────────────────
export const threads = pgTable(
  'threads',
  {
    id: text('id').primaryKey(),
    applicationId: text('application_id')
      .notNull()
      .references(() => applications.id, { onDelete: 'cascade' }),
    status: threadStatusEnum('status').notNull().default('OPEN'),
    closedAt: timestamp('closed_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index('threads_applicationId_idx').on(table.applicationId),
    index('threads_status_idx').on(table.status),
  ],
);

// ──────────────────────────────────────────────
// MESSAGES (mensajes del chat por thread)
// ──────────────────────────────────────────────
export const messages = pgTable(
  'messages',
  {
    id: text('id').primaryKey(),
    threadId: text('thread_id')
      .notNull()
      .references(() => threads.id, { onDelete: 'cascade' }),
    senderProfileId: text('sender_profile_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    content: text('content'),
    messageType: messageTypeEnum('message_type').notNull().default('TEXT'),
    readAt: timestamp('read_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index('messages_threadId_idx').on(table.threadId),
    index('messages_senderProfileId_idx').on(table.senderProfileId),
    index('messages_createdAt_idx').on(table.createdAt),
  ],
);

// ──────────────────────────────────────────────
// MESSAGE ATTACHMENTS (archivos adjuntos por mensaje)
// ──────────────────────────────────────────────
export const messageAttachments = pgTable(
  'message_attachments',
  {
    id: text('id').primaryKey(),
    messageId: text('message_id')
      .notNull()
      .references(() => messages.id, { onDelete: 'cascade' }),
    fileUrl: text('file_url').notNull(),
    fileName: text('file_name').notNull(),
    mimeType: text('mime_type').notNull(),
    attachmentType: attachmentTypeEnum('attachment_type').notNull(),
    sizeBytes: integer('size_bytes').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index('ma_messageId_idx').on(table.messageId),
  ],
);

export const testTable = pgTable('test', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});



export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
  profiles: many(profiles),
  contactRequestsAsOwner: many(contactRequests, { relationName: 'contact_requests_owner' }),
  contactRequestsAsSender: many(contactRequests, { relationName: 'contact_requests_sender' }),
  notifications: many(notifications),
  notificationSettings: many(userNotificationSettings),
  inboxMessages: many(inboxMessages),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const profilesRelations = relations(profiles, ({ one, many }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
  region: one(regions, {
    fields: [profiles.regionId],
    references: [regions.id],
  }),
  socialLinks: many(profileSocialLinks),
  tags: many(profilesToTags),
  services: many(services),
  events: many(events),
  applications: many(applications),
  sentMessages: many(messages),
}));

export const contactRequestsRelations = relations(contactRequests, ({ one, many }) => ({
  propietario: one(users, {
    fields: [contactRequests.propietarioId],
    references: [users.id],
    relationName: 'contact_requests_owner',
  }),
  remitente: one(users, {
    fields: [contactRequests.remitenteId],
    references: [users.id],
    relationName: 'contact_requests_sender',
  }),
  servicio: one(services, {
    fields: [contactRequests.servicioId],
    references: [services.id],
  }),
  evento: one(events, {
    fields: [contactRequests.eventoId],
    references: [events.id],
  }),
  messages: many(inboxMessages),
}));

export const profileSocialLinksRelations = relations(profileSocialLinks, ({ one }) => ({
  profile: one(profiles, {
    fields: [profileSocialLinks.profileId],
    references: [profiles.id],
  }),
}));

export const regionsRelations = relations(regions, ({ many }) => ({
  locations: many(locations),
  profiles: many(profiles),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  services: many(services),
  events: many(events),
}));

export const servicesRelations = relations(services, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [services.profileId],
    references: [profiles.id],
  }),
  location: one(locations, {
    fields: [services.locationId],
    references: [locations.id],
  }),
  category: one(categories, {
    fields: [services.categoryId],
    references: [categories.id],
  }),
  status: one(statuses, {
    fields: [services.statusId],
    references: [statuses.id],
  }),
  portfolio: many(servicePortfolio),
  contacts: many(serviceContacts),
  contactRequests: many(contactRequests),
}));

export const servicePortfolioRelations = relations(servicePortfolio, ({ one }) => ({
  service: one(services, {
    fields: [servicePortfolio.serviceId],
    references: [services.id],
  }),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [events.profileId],
    references: [profiles.id],
  }),
  location: one(locations, {
    fields: [events.locationId],
    references: [locations.id],
  }),
  category: one(categories, {
    fields: [events.categoryId],
    references: [categories.id],
  }),
  status: one(statuses, {
    fields: [events.statusId],
    references: [statuses.id],
  }),
  contactRequests: many(contactRequests),
  applications: many(applications),
  scoringRules: many(publicationScoringRules),
}));

export const statusesRelations = relations(statuses, ({ many }) => ({
  services: many(services),
  events: many(events),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  profiles: many(profilesToTags),
}));

export const profilesToTagsRelations = relations(profilesToTags, ({ one }) => ({
  profile: one(profiles, {
    fields: [profilesToTags.profileId],
    references: [profiles.id],
  }),
  tag: one(tags, {
    fields: [profilesToTags.tagId],
    references: [tags.id],
  }),
}));

export const inboxMessagesRelations = relations(inboxMessages, ({ one }) => ({
  contactRequest: one(contactRequests, {
    fields: [inboxMessages.contactRequestId],
    references: [contactRequests.id],
  }),
  sender: one(users, {
    fields: [inboxMessages.senderId],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  actorProfile: one(profiles, {
    fields: [notifications.actorProfileId],
    references: [profiles.id],
  }),
}));

export const notificationPreferencesRelations = relations(notificationPreferences, ({ one }) => ({
  user: one(users, {
    fields: [notificationPreferences.userId],
    references: [users.id],
  }),
}));

export const userNotificationSettingsRelations = relations(userNotificationSettings, ({ one }) => ({
  user: one(users, {
    fields: [userNotificationSettings.userId],
    references: [users.id],
  }),
}));

export const serviceContactsRelations = relations(serviceContacts, ({ one }) => ({
  service: one(services, {
    fields: [serviceContacts.serviceId],
    references: [services.id],
  }),
}));

export const locationsRelations = relations(locations, ({ one, many }) => ({
  region: one(regions, {
    fields: [locations.regionId],
    references: [regions.id],
  }),
  services: many(services),
  events: many(events),
}));

export const applicationsRelations = relations(applications, ({ one, many }) => ({
  event: one(events, {
    fields: [applications.eventId],
    references: [events.id],
  }),
  applicantProfile: one(profiles, {
    fields: [applications.applicantProfileId],
    references: [profiles.id],
  }),
  scores: many(applicationScores),
  scoringFields: many(applicationScoringFields),
  thread: one(threads),
}));

export const publicationScoringRulesRelations = relations(publicationScoringRules, ({ one }) => ({
  event: one(events, {
    fields: [publicationScoringRules.eventId],
    references: [events.id],
  }),
}));

export const applicationScoresRelations = relations(applicationScores, ({ one, many }) => ({
  application: one(applications, {
    fields: [applicationScores.applicationId],
    references: [applications.id],
  }),
  breakdown: many(applicationScoreBreakdown),
}));

export const applicationScoreBreakdownRelations = relations(applicationScoreBreakdown, ({ one }) => ({
  score: one(applicationScores, {
    fields: [applicationScoreBreakdown.scoreId],
    references: [applicationScores.id],
  }),
}));

export const applicationScoringFieldsRelations = relations(applicationScoringFields, ({ one }) => ({
  application: one(applications, {
    fields: [applicationScoringFields.applicationId],
    references: [applications.id],
  }),
}));

export const threadsRelations = relations(threads, ({ one, many }) => ({
  application: one(applications, {
    fields: [threads.applicationId],
    references: [applications.id],
  }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one, many }) => ({
  thread: one(threads, {
    fields: [messages.threadId],
    references: [threads.id],
  }),
  senderProfile: one(profiles, {
    fields: [messages.senderProfileId],
    references: [profiles.id],
  }),
  attachments: many(messageAttachments),
}));

export const messageAttachmentsRelations = relations(messageAttachments, ({ one }) => ({
  message: one(messages, {
    fields: [messageAttachments.messageId],
    references: [messages.id],
  }),
}));

