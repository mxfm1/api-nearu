import { pgTable, text, boolean, timestamp, integer, jsonb, index } from 'drizzle-orm/pg-core';
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
    bannerUrl: text('banner_url'),
    logoUrl: text('logo_url'),
    name: text('name'),
    industry: text('industry').notNull().default(''),
    description: text('description'),
    tags: text('tags').array().default([]),
    location: text('location'),
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
  (table) => [index('profiles_userId_idx').on(table.userId)],
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
      .notNull()
      .references(() => services.id, { onDelete: 'cascade' }),
    propietarioId: text('propietario_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    remitenteId: text('remitente_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    mensaje: text('mensaje'),
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
  ],
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
    regionId: text('region_id')
      .notNull()
      .references(() => regions.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [index('locations_regionId_idx').on(table.regionId)],
);

// ──────────────────────────────────────────────
// CATEGORIES (discriminated by type)
// ──────────────────────────────────────────────
export const categories = pgTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
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
    contactInfo: jsonb('contact_info').default([]),
    bannerUrl: text('banner_url'),
    logoUrl: text('logo_url'),
    thumbnailUrl: text('thumbnail_url'),
    locationId: text('location_id').references(() => locations.id),
    categoryId: text('category_id').references(() => categories.id),
    serviceStatus: text('service_status').notNull().default('draft'), // draft | published | paused | archived
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
    index('services_status_idx').on(table.serviceStatus),
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
    eventStatus: text('event_status').notNull().default('draft'), // draft | published | paused | archived
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
    index('events_status_idx').on(table.eventStatus),
    index('events_startAt_idx').on(table.startAt),
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
  socialLinks: many(profileSocialLinks),
  services: many(services),
  events: many(events),
}));

export const contactRequestsRelations = relations(contactRequests, ({ one }) => ({
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

export const locationsRelations = relations(locations, ({ one, many }) => ({
  region: one(regions, {
    fields: [locations.regionId],
    references: [regions.id],
  }),
  services: many(services),
  events: many(events),
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
  portfolio: many(servicePortfolio),
  contactRequests: many(contactRequests),
}));

export const servicePortfolioRelations = relations(servicePortfolio, ({ one }) => ({
  service: one(services, {
    fields: [servicePortfolio.serviceId],
    references: [services.id],
  }),
}));

export const eventsRelations = relations(events, ({ one }) => ({
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
}));

