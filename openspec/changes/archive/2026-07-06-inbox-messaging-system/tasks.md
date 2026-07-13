# Tasks: Inbox Messaging System

## Phase 1: Foundation

- [x] 1.1 Add 3 tables to `src/shared/database/schema.ts`: `inbox_messages` (FK→solicitudes_contacto), `notifications` (FK→users, type, data JSONB, read_at), `user_notification_settings` (FK→users UNIQUE, email_notifications_enabled) + relations + indexes
- [x] 1.2 Add DI symbols for `messages` + `notifications` domains (repositories, use-cases, controllers) + return types in `di/types.ts`

## Phase 2: Messages Domain

- [x] 2.1 Create `src/domains/messages/entities/message.entity.ts` — `Message` + `MessageWithSender` types
- [x] 2.2 Create `src/domains/messages/repositories/messages.repository.interface.ts` — `findByContactRequestId`, `create`
- [x] 2.3 Create `src/domains/messages/repositories/messages.repository.ts` — Drizzle impl, LEFT JOIN users for sender info
- [x] 2.4 Create `src/domains/messages/validators/message.validator.ts` — `sendMessageSchema` (content XOR attachments required, attachments max 6 URLs)
- [x] 2.5 Create `src/domains/messages/use-cases/send-message.use-case.ts` — validate participant (remitenteId or propietarioId), 404 if CR doesn't exist
- [x] 2.6 Create `src/domains/messages/use-cases/get-thread.use-case.ts` — validate participant, fetch ordered ASC
- [x] 2.7 Create `src/domains/messages/controllers/message.controller.ts` — `sendMessageController`, `getThreadController`

## Phase 3: Notifications Domain

- [x] 3.1 Create `src/domains/notifications/entities/notification.entity.ts` — `Notification` type + `NotificationType` union
- [x] 3.2 Create `src/domains/notifications/repositories/notifications.repository.interface.ts` — `findByUserId`, `create`, `markRead`, `markAllRead`, `findSettingsByUserId`, `upsertSettings`
- [x] 3.3 Create `src/domains/notifications/repositories/notifications.repository.ts` — Drizzle impl
- [x] 3.4 Create `src/domains/notifications/validators/notification.validator.ts` — `markReadSchema` (params: id), `updateSettingsSchema` (body: email_notifications_enabled boolean)
- [x] 3.5 Create `src/domains/notifications/use-cases/list-notifications.use-case.ts` — by userId, ordered DESC
- [x] 3.6 Create `src/domains/notifications/use-cases/create-notification.use-case.ts` — create with type + data
- [x] 3.7 Create `src/domains/notifications/use-cases/mark-read.use-case.ts` — single (verify ownership) + mark-all
- [x] 3.8 Create `src/domains/notifications/use-cases/get-settings.use-case.ts` — get by userId, default true
- [x] 3.9 Create `src/domains/notifications/use-cases/update-settings.use-case.ts` — upsert email toggle
- [x] 3.10 Create `src/domains/notifications/controllers/notification.controller.ts` — list, markRead, markAll, getSettings, updateSettings

## Phase 4: Enhanced Contact Requests

- [x] 4.1 Add `findByRemitenteId` to `contact-requests.repository.interface.ts`
- [x] 4.2 Add `findByRemitenteId` + message preview (subquery for `ultimoMensaje` + COUNT) to `contact-requests.repository.ts`
- [x] 4.3 Modify `get-inbox.use-case.ts` — accept `tipo` param, delegate to `findByRemitenteId` or `findByPropietarioId`
- [x] 4.4 Modify `contact-request.controller.ts` — pass `tipo` from `req.query` to getInbox use case
- [x] 4.5 Modify `contact-request.validator.ts` — add `tipo` enum query param (`recibidos` | `enviados`)
- [x] 4.6 Modify `create-contact-request.use-case.ts` — after create: insert initial `inbox_messages` from `mensaje`, call `createNotification` for propietario, send email if enabled (try/catch)
- [x] 4.7 Modify `contact-request.presenter.ts` — add `ultimoMensaje`, `cantidadMensajes` fields
- [x] 4.8 Modify `contact-request.entity.ts` — add `ultimoMensaje: string | null`, `cantidadMensajes: number`
- [x] ~~4.9 Modify `create-contact-request.controller.ts` — return 201 with request data (no change needed, already returns data)~~

## Phase 5: Email Integration

- [x] 5.1 Add `sendContactNotificationEmail` + `sendNewMessageEmail` to `src/shared/email/index.ts` with HTML templates

## Phase 6: Wire DI + Routes

- [x] 6.1 Wire messages + notifications domains in `di/container.ts` (repositories → use-cases → controllers)
- [x] 6.2 Add 8 new routes in `src/presentation/routes/index.ts`: POST/GET `/api/mensajes`, GET/PATCH `/api/notificaciones`, PATCH `/api/notificaciones/read-all`, GET/PATCH `/api/notificaciones/config`

## Phase 7: Migration

- [x] 7.1 Run `npx drizzle-kit generate` → `drizzle/0005_low_wolfsbane.sql`
- [x] 7.2 Run `drizzle-kit push` → 3 tables created
- [x] 7.3 Run `npx tsx scripts/migrate-inbox.ts` → 0 backfilled, 1 user seeded
- [x] 7.4 Rollback doc created at `docs/migrations/0005-inbox-messaging.md`
