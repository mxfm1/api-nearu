# Exploration: Inbox Messaging System

## Current State

### Database Tables

| Table | Schema Name | Purpose | Key Fields | Existing Features |
|-------|-------------|---------|------------|-------------------|
| `solicitudes_contacto` | `contactRequests` (entity) | Contact request ticket from a user to a service/event owner | id, servicioId, eventoId, propietarioId, remitenteId, mensaje, estado, createdAt, updatedAt | Single message per request, status workflow (pendiente → leido → respondido → archivado), indexes on all FKs + createdAt |
| `service_contacts` | `serviceContacts` | Contact information/methods for a service (NOT messaging) | id, serviceId, type, value, readAt, respondedAt, createdAt | Stores phone/email/website/etc. per service. Not related to messaging at all. |
| `users` | `users` | Basic auth users | id, name, email, emailVerified, image, createdAt, updatedAt | **No notification preferences field** |
| `notifications` | — | **DOES NOT EXIST** | — | — |

### Existing Contact Request API (fully implemented)

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/contactos/inbox` | GET | Yes | Returns contact requests **received by** the authenticated user (queries by `propietarioId`). **Sender cannot see sent requests.** |
| `/api/contactos/:id` | GET | Yes | Detail of a single contact request. Both owner and sender can view. |
| `/api/contactos` | POST | Yes | Create a new contact request. Validates: not self-contact, exactly one of servicioId/eventoId. |
| `/api/contactos/:id/estado` | PATCH | Yes | Update status. Only owner can change. Validates: pendiente/leido/respondido/archivado. |

### Architecture (contact-request domain)

Clean Architecture with DI via `@evyweb/ioctopus`:

```
contact-requests/
  entities/contact-request.entity.ts        — ContactRequest + ContactRequestWithUsers interfaces
  repositories/contact-requests.repository.interface.ts  — IContactRequestsRepository (findById, findByPropietarioId, create, updateEstado)
  repositories/contact-requests.repository.ts  — Drizzle implementation with users join
  use-cases/create-contact-request.use-case.ts  — Validation + repo.create
  use-cases/get-inbox.use-case.ts              — Only propietario inbox (no remitente inbox)
  use-cases/get-contact-request-detail.use-case.ts  — Auth check: owner or sender
  use-cases/update-contact-request-status.use-case.ts  — Only owner
  controllers/contact-request.controller.ts  — 4 controllers
  presenters/contact-request.presenter.ts    — presentContactRequest, presentContactRequests
  validators/contact-request.validator.ts   — Zod schemas
```

### Email Infrastructure (Resend)

- File: `src/shared/email/index.ts`
- Only **two templates**: `sendVerificationEmail`, `sendResetPasswordEmail`
- Mock mode when `RESEND_API_KEY` is not set (logs to console)
- No contact notification templates exist
- Config: `config.resendApiKey`, `config.resendFromEmail` from env vars

### DI Wiring (container.ts + types.ts)

All contact-request components already wired:
- `IContactRequestsRepository` → `ContactRequestsRepository`
- 4 use cases → `createContactRequestUseCase`, `getInboxUseCase`, `getContactRequestDetailUseCase`, `updateContactRequestStatusUseCase`
- 4 controllers → `createContactRequestController`, `getInboxController`, `getContactRequestDetailController`, `updateContactRequestStatusController`

---

## Affected Areas

### New Files Needed

| File | Purpose |
|------|---------|
| `src/shared/database/schema.ts` (additions) | Add 3 new tables: `inbox_messages`, `user_notification_settings`, `notifications` |
| `src/domains/messages/entities/message.entity.ts` | Message entity + DTOs |
| `src/domains/messages/repositories/messages.repository.interface.ts` | IInboxMessagesRepository |
| `src/domains/messages/repositories/messages.repository.ts` | Drizzle implementation |
| `src/domains/messages/use-cases/send-message.use-case.ts` | Reply to a contact request thread |
| `src/domains/messages/use-cases/get-thread.use-case.ts` | Get full message thread |
| `src/domains/messages/controllers/message.controller.ts` | Express controllers |
| `src/domains/messages/validators/message.validator.ts` | Zod schemas |
| `src/domains/messages/presenters/message.presenter.ts` | Response formatting |
| `src/domains/notifications/entities/notification.entity.ts` | Notification entity |
| `src/domains/notifications/repositories/notifications.repository.interface.ts` | INotificationsRepository |
| `src/domains/notifications/repositories/notifications.repository.ts` | Drizzle implementation |
| `src/domains/notifications/use-cases/create-notification.use-case.ts` | Create notification |
| `src/domains/notifications/use-cases/get-notifications.use-case.ts` | List user notifications |
| `src/domains/notifications/use-cases/mark-read.use-case.ts` | Mark as read |
| `src/domains/notifications/use-cases/update-settings.use-case.ts` | Toggle email notifications |
| `src/domains/notifications/controllers/notification.controller.ts` | Express controllers |
| `src/domains/notifications/validators/notification.validator.ts` | Zod schemas |
| `src/domains/notifications/presenters/notification.presenter.ts` | Response formatting |
| `src/shared/email/templates/contact-notification.ts` | New email template for contact messages |
| `drizzle/0005_*.sql` | Migration for new tables |

### Existing Files to Modify

| File | Change |
|------|--------|
| `src/shared/database/schema.ts` | Add `inbox_messages`, `user_notification_settings`, `notifications` tables + Drizzle relations |
| `src/domains/contact-requests/entities/contact-request.entity.ts` | Add `ultimoMensaje`, `cantidadMensajes` to DTO (computed, not DB) |
| `src/domains/contact-requests/repositories/contact-requests.repository.interface.ts` | Add `findByRemitenteId` for sender's sent requests |
| `src/domains/contact-requests/repositories/contact-requests.repository.ts` | Add `findByRemitenteId` implementation |
| `src/domains/contact-requests/use-cases/get-inbox.use-case.ts` | Add `tipo` param: 'recibidos' \| 'enviados' — dual inbox |
| `src/domains/contact-requests/use-cases/create-contact-request.use-case.ts` | After create → also create first message in `inbox_messages` + trigger notification |
| `src/domains/contact-requests/controllers/contact-request.controller.ts` | Add `tipo` query param support for inbox endpoint |
| `src/domains/contact-requests/presenters/contact-request.presenter.ts` | Add `ultimoMensaje`, `cantidadMensajes` to response |
| `src/domains/contact-requests/validators/contact-request.validator.ts` | Add `tipo` optional query param |
| `src/shared/email/index.ts` | Add `sendNewContactNotification`, `sendNewMessageNotification` |
| `di/container.ts` | Wire new use cases and controllers |
| `di/types.ts` | Add new DI symbols + return types |
| `src/presentation/routes/index.ts` | Add new message + notification endpoints |

---

## Approaches

### 1. Thread Model: Single `inbox_messages` table vs Separate `solicitud_mensajes` + `solicitud_adjuntos`

#### Option A: Single `inbox_messages` table with JSONB attachments

```
inbox_messages
├── id: text (PK)
├── solicitud_id: text (FK → solicitudes_contacto.id, NOT NULL)
├── remitente_id: text (FK → users.id, NOT NULL)
├── contenido: text (NOT NULL)
├── adjuntos: jsonb (array of URLs, max 6, DEFAULT '[]')
└── created_at: timestamp
```

- **Pros**: Simple schema, single query to get thread, attachments stored inline, no extra JOIN
- **Cons**: Can't query individual attachments (not needed for this use case), JSONB validation at app level
- **Effort**: Low

#### Option B: Separate `solicitud_mensajes` + `solicitud_adjuntos` tables

```
solicitud_mensajes
├── id: text (PK)
├── solicitud_id: text (FK)
├── remitente_id: text (FK)
├── contenido: text
└── created_at: timestamp

solicitud_adjuntos
├── id: text (PK)
├── mensaje_id: text (FK → solicitud_mensajes.id)
├── url: text
└── orden: integer (0-5)
```

- **Pros**: Relational normalization, each attachment individually addressable
- **Cons**: Multiple queries or JOINs to get thread with attachments, more complex writes, over-engineering for max 6 files
- **Effort**: Medium

#### Recommendation: **Option A** — Single `inbox_messages` table with JSONB `adjuntos`

The requirements clearly state max 6 URLs from UploadThing. There's no need to normalize attachments — we're storing URLs, not files. JSONB gives us atomicity (all or nothing per message) and keeps queries simple. The frontend already generates UploadThing URLs; we just store them.

### 2. Notifications: Single `notifications` table with `type` discriminator vs Polymorphic tables

#### Option A: Single table with type discriminator

```
notifications
├── id: text (PK)
├── user_id: text (FK → users.id, NOT NULL)
├── type: text (NOT NULL) — 'new_contact_request' | 'new_message' | 'profile_update' | etc.
├── title: text (NOT NULL)
├── message: text (NOT NULL)
├── data: jsonb (flexible payload — servicioId, eventoId, etc.)
├── read_at: timestamp (nullable)
└── created_at: timestamp
```

- **Pros**: Simple, extensible (just add new type strings), single query for all notifications, JSONB data for type-specific payload, easy pagination
- **Cons**: Loose schema for `data` field, no FK constraints inside JSONB
- **Effort**: Low

#### Option B: Separate table per notification type

```
contact_notifications
├── id, user_id, solicitud_id, read_at, created_at

message_notifications
├── id, user_id, mensaje_id, read_at, created_at

system_notifications
├── id, user_id, title, body, read_at, created_at
```

- **Pros**: Strongly typed, FK constraints per type
- **Cons**: Proliferation of tables, UNION queries for global notification list, harder to extend, complex pagination
- **Effort**: High

#### Recommendation: **Option A** — Single `notifications` table with `type` discriminator

The requirements explicitly say "debe ser extensible". A single table with type discriminator + JSONB data wins here. Adding a new notification type is just adding a string. The `data` JSONB field can hold whatever context each type needs. Querying "all unread for user" is a single indexed query.

### 3. Email Sending: Sync vs Async (queue) on new message creation

#### Option A: Sync — Send email in the same request

- **Pros**: Simplest to implement, no infrastructure needed, immediate feedback
- **Pros (this project)**: Already the pattern used for verify/reset emails — `src/shared/email/index.ts` sends sync
- **Cons**: Slows down API response (Resend API latency), potential failure point
- **Effort**: Low

#### Option B: Async — Queue emails to a background job

- **Pros**: Fast API response, retry on failure, doesn't block the user
- **Cons**: Need Bull/BullMQ + Redis, OR in-process queue with in-memory storage (loses on restart), overkill for current traffic
- **Effort**: High

#### Recommendation: **Option A** — Sync email sending (maintain current pattern)

Mantengamos el patrón existente. El proyecto actualmente usa envío síncrono para verify/reset emails. Para un MVP, sync está bien. La latencia de Resend es típicamente <500ms. Podemos refactorizar a async cuando el sistema tenga tráfico real que lo justifique. Además, el `sendEmail` ya swallows errores en dev, así que no rompe el flujo si Resend falla.

---

## Recommendation

### Architecture Design

```
solicitudes_contacto (parent ticket — 1 per contact request)
        │
        │ 1:N
        ▼
inbox_messages (thread — N per contact request)
        │
        │ 1:1 per user
        ▼
user_notification_settings (toggle — 1 per user)
        │
        │
notifications (in-app campanita — N per user, extends to cover all notification types)
```

### Table Designs

#### `inbox_messages` (NEW)

```typescript
export const inboxMessages = pgTable(
  'inbox_messages',
  {
    id: text('id').primaryKey(),
    solicitudId: text('solicitud_id')
      .notNull()
      .references(() => contactRequests.id, { onDelete: 'cascade' }),
    remitenteId: text('remitente_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    contenido: text('contenido').notNull(),
    adjuntos: jsonb('adjuntos').$type<string[]>().notNull().default([]),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    index('inbox_messages_solicitud_idx').on(table.solicitudId),
    index('inbox_messages_remitente_idx').on(table.remitenteId),
    index('inbox_messages_createdAt_idx').on(table.createdAt),
  ],
);
```

#### `user_notification_settings` (NEW)

```typescript
export const userNotificationSettings = pgTable('user_notification_settings', {
  userId: text('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  emailNotificationsEnabled: boolean('email_notifications_enabled')
    .notNull()
    .default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
```

#### `notifications` (NEW)

```typescript
export const notifications = pgTable(
  'notifications',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type', {
      enum: ['new_contact_request', 'new_message', 'profile_update', 'account_change'],
    }).notNull(),
    title: text('title').notNull(),
    message: text('message').notNull(),
    data: jsonb('data').$type<Record<string, unknown>>().notNull().default({}),
    readAt: timestamp('read_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    index('notifications_userId_idx').on(table.userId),
    index('notifications_userId_unread_idx').on(table.userId, table.readAt),
    index('notifications_createdAt_idx').on(table.createdAt),
  ],
);
```

### Migration Strategy for Existing Data

Existing `solicitudes_contacto` records have a single `mensaje` field. These hold the initial message. Migration steps:

1. For each existing `solicitudes_contacto` where `mensaje IS NOT NULL`, create a row in `inbox_messages` with:
   - `solicitudId` = solicitud id
   - `remitenteId` = solicitud.remitenteId
   - `contenido` = solicitud.mensaje
   - `adjuntos` = `[]`
   - `createdAt` = solicitud.createdAt

2. The `mensaje` column on `solicitudes_contacto` becomes **deprecated** but kept for backward compatibility. New code writes messages to `inbox_messages` only. The column can be dropped in a future migration after confirming all clients migrated.

3. Add `user_notification_settings` rows with default `true` for all existing users.

### New Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| **GET** | `/api/contactos/inbox?tipo=recibidos` | Yes | Dual inbox — received requests (existing, enhanced) |
| **GET** | `/api/contactos/inbox?tipo=enviados` | Yes | Dual inbox — sent requests (NEW) |
| **GET** | `/api/contactos/:id/mensajes` | Yes | Full message thread for a contact request (NEW) |
| **POST** | `/api/contactos/:id/mensajes` | Yes | Send a reply message in a thread (NEW) |
| **GET** | `/api/notificaciones` | Yes | List user notifications (campanita) |
| **PATCH** | `/api/notificaciones/:id/leer` | Yes | Mark single notification as read |
| **PATCH** | `/api/notificaciones/leer-todas` | Yes | Mark all notifications as read |
| **GET** | `/api/notificaciones/config` | Yes | Get notification preferences |
| **PATCH** | `/api/notificaciones/config` | Yes | Update notification preferences |

### Notification Flow (Sequence)

```
1. User A sends contact request to User B (owner of service X)
   → Create solicitudes_contacto
   → Create inbox_messages (initial message)
   → Create notification for User B (type: new_contact_request)
   → If User B has email_notifications_enabled: send email notification

2. User B replies to the contact request thread
   → Create inbox_messages (reply)
   → Create notification for User A (type: new_message)
   → If User A has email_notifications_enabled: send email notification

3. User A replies again
   → Create inbox_messages
   → Create notification for User B (type: new_message)
   → If User B has email_notifications_enabled: send email notification
```

---

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Existing `mensaje` column migration** | Data loss if not handled | Migration script copies to `inbox_messages`, keep column as deprecated fallback |
| **Notification email loop** | User gets spammed | Only notify on: (1) new contact request to owner, (2) new reply to the other party. Never notify on own action. `InputParseError` already prevents self-contact. |
| **JSONB `adjuntos` validation** | >6 files stored | Validate at Zod layer (max 6 items in array) AND at service layer. Never trust frontend. |
| **Email sending failure blocks response** | User sees error | Already handled by current pattern — errors are swallowed in dev. In prod, email failure should not block the message being saved; log and continue. |
| **Missing `findByRemitenteId`** | Sender cannot view sent requests | Must add to repository interface + implementation before dual inbox works |
| **No pagination on existing inbox** | Performance issues with many requests | Current implementation returns all. Future improvement: add cursor/offset pagination. Acceptable for MVP. |

---

## Ready for Proposal

**Yes** — the exploration is complete. There is enough information to write a proposal.

Key findings for the orchestrator to communicate to the user:

1. **The existing contact-request system is a solid foundation** but currently only supports a single message per request. The `solicitudes_contacto` table becomes the parent "ticket" in the conversation model.

2. **The inbox is half-done** — only received requests are queryable (`findByPropietarioId`). The `findByRemitenteId` method is missing from the repository, making it impossible for senders to see their sent requests.

3. **No notification infrastructure exists** — both in-app and email notifications for contact need to be built from scratch.

4. **`service_contacts` is NOT messaging** — it's contact info (phone/email/website) for a service profile. It should NOT be confused with inbox messaging.

5. **The single `inbox_messages` table with JSONB attachments** approach is the right call for this project's scope — simple, extensible, and follows existing patterns.
