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
    industry: text('industry').notNull().default(''),
    description: text('description'),
    locationId: text('location_id').references(() => locations.id),
    founded: text('founded'),
    employees: text('employees'),
    website: text('website'),
    whatsapp: text('whatsapp'),
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
export const notifications = pgTable(
  'notifications',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    title: text('title').notNull(),
    message: text('message').notNull(),
    data: jsonb('data'),
    readAt: timestamp('read_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    index('notif_user_idx').on(table.userId),
    index('notif_createdAt_idx').on(table.createdAt),
    index('notif_readAt_idx').on(table.readAt),
  ],
);

// ──────────────────────────────────────────────
// USER NOTIFICATION SETTINGS (email toggle)
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
    startAt: timestamp('start_at', { withTimezone: true }),
    locationId: text('location_id').references(() => locations.id),
    categoryId: text('category_id').references(() => categories.id),
    thumbnailUrl: text('thumbnail_url'),
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
  'HAS_PORTFOLIO',
  'YEARS_EXPERIENCE',
  'HAS_WEBSITE',
  'HAS_SOCIAL_LINKS',
  'HAS_COMPANY_DESCRIPTION',
  'HAS_LOGO',
  'HAS_BANNER',
  'HAS_PREVIOUS_FEEDBACK',
  'AVERAGE_RATING',
  'NUMBER_OF_COMPLETED_JOBS',
  'NUMBER_OF_COMPLETED_EVENTS',
  'HAS_RESPONSE_HISTORY',
  'FAST_RESPONSE_TIME',
  'IS_PREMIUM_COMPANY',
  'CUSTOM_FIELD_MATCH',
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
    status: text('status').notNull().default('pending'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index('applications_eventId_idx').on(table.eventId),
    index('applications_applicantId_idx').on(table.applicantProfileId),
    index('applications_status_idx').on(table.status),
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
  location: one(locations, {
    fields: [profiles.locationId],
    references: [locations.id],
  }),
  socialLinks: many(profileSocialLinks),
  tags: many(profilesToTags),
  services: many(services),
  events: many(events),
  applications: many(applications),
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
  profiles: many(profiles),
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

