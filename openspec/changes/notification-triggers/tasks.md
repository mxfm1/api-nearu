# Tasks: Notification Triggers for Applications & Account Events

## Phase 1: Database Migration

- [ ] 1.1 Create `drizzle/0009_notification_triggers.sql` with: CREATE TYPE notification_type ENUM (...13 types), CREATE TYPE entity_type ENUM (...), ALTER TABLE notifications RENAME COLUMN message TO body, ALTER TABLE notifications RENAME COLUMN data TO metadata, ADD COLUMN is_read boolean NOT NULL DEFAULT false, ADD COLUMN email_sent_at timestamp, ADD COLUMN actor_profile_id text, ADD COLUMN entity_type text, ADD COLUMN entity_id text, ADD COLUMN action_url text, CREATE TABLE notification_preferences (id, user_id, type, email_enabled, in_app_enabled, created_at, updated_at, UNIQUE(user_id, type)), CREATE INDEX np_user_idx ON notification_preferences(user_id)
- [ ] 1.2 Create migration script to populate `notification_preferences` for existing users (copy from `user_notification_settings` value × 13 types), then DROP TABLE user_notification_settings
- [ ] 1.3 Run `npx drizzle-kit push --force` to apply migration

## Phase 2: Entity & Type Updates

- [ ] 2.1 Update `notification.entity.ts`: Add all 13 NotificationType values to union type. Add `actorProfileId`, `entityType`, `entityId`, `actionUrl`, `isRead`, `emailSentAt`, `metadata` to Notification interface. Add `NotificationPreferences` interface with `userId`, `type`, `emailEnabled`, `inAppEnabled`. Export new types.
- [ ] 2.2 Update `notifications.repository.interface.ts`: Add `findPreferencesByUserId(userId): Promise<NotificationPreferences[]>`, `upsertPreference(...)` method signatures.

## Phase 3: Repository Implementation

- [ ] 3.1 Update `notifications.repository.ts`: Update `create()` to accept new fields (actorProfileId, entityType, entityId, actionUrl, metadata). Update `markRead()` to also set `is_read = true`. Add `findPreferencesByUserId()` and `upsertPreference()` implementations.
- [ ] 3.2 Verify `npx tsc --noEmit` passes.

## Phase 4: Email Templates

- [ ] 4.1 Add `sendApplicationReceivedEmail({ to, eventTitle, applicantName, actionUrl })` to `email/index.ts`
- [ ] 4.2 Add `sendApplicationStatusChangedEmail({ to, eventTitle, status, actionUrl })` to `email/index.ts`
- [ ] 4.3 Add `sendAccountChangeEmail({ to, action, timestamp })` to `email/index.ts`
- [ ] 4.4 Verify all templates follow existing HTML style (inline CSS, nearU branding)

## Phase 5: Application Use-Case Wiring

- [ ] 5.1 Update `create-application.use-case.ts`: Add `INotificationsRepository` as DI parameter. After `incrementApplicationCount`, fetch event owner's userId via profilesRepository. Call `notificationsRepository.create({ type: 'NEW_APPLICATION', actorProfileId: applicantProfileId, entityType: 'APPLICATION', entityId: application.id, actionUrl: `/eventos/${event.slug}/aplicaciones`, body: "...", metadata: { eventTitle, applicantName } })`. Call `emailService.sendApplicationReceivedEmail(...)` if preference enabled (check `notification_preferences`).
- [ ] 5.2 Update `di/container.ts`: Add `DI_SYMBOLS.INotificationsRepository` to `ICreateApplicationUseCase` binding dependencies. Update `di/types.ts` if return type changed.
- [ ] 5.3 Update `update-application-status.use-case.ts`: Add `INotificationsRepository` as DI parameter. After status update, fetch applicant's userId. Call `notificationsRepository.create({ type: status map to APPLICATION_REVIEWING/ACCEPTED/REJECTED, actorProfileId: eventOwnerProfileId, entityType: 'APPLICATION', entityId: application.id, actionUrl: `/mis-postulaciones`, body: "...", metadata: { eventTitle, status } })`. Send email if preference enabled.

## Phase 6: Account Controllers Wiring

- [ ] 6.1 Update `change-password.controller.ts`: Add `INotificationsRepository` and `IProfilesRepository` as DI parameters. After `auth.api.changePassword()` succeeds, call `notificationsRepository.create({ type: 'PASSWORD_CHANGED', actorProfileId: null, entityType: 'ACCOUNT', entityId: userId, actionUrl: '/configuracion', body: 'Tu contraseña fue cambiada.' })`. Call `emailService.sendAccountChangeEmail(...)` always (bypass preference).
- [ ] 6.2 Update `change-email.controller.ts`: Add `INotificationsRepository` and `IProfilesRepository` as DI parameters. After `auth.api.changeEmail()` succeeds, call notification + email (always, bypass preference).
- [ ] 6.3 Update `notification.controller.ts` (settings): After `upsertSettings()`, call `notificationsRepository.create({ type: 'ACCOUNT_CHANGE', actorProfileId: null, entityType: 'ACCOUNT', body: 'Configuración de notificaciones actualizada.' })`.

## Phase 7: Testing

- [ ] 7.1 Update `tests/e2e/events.spec.ts` or create `tests/e2e/notifications.spec.ts`: Verify NEW_APPLICATION notification created when applying
- [ ] 7.2 Update `tests/e2e/applications.spec.ts`: Verify APPLICATION_ACCEPTED notification created when accepting applicant
- [ ] 7.3 Update `tests/e2e/auth.spec.ts`: Verify PASSWORD_CHANGED notification created when changing password
- [ ] 7.4 Verify all existing tests still pass (`npx playwright test`)

## Phase 8: Cleanup & Docs

- [ ] 8.1 Update `openspec/specs/notifications/spec.md` with new schema fields documentation
- [ ] 8.2 Run `npx tsc --noEmit` — must pass with 0 errors
- [ ] 8.3 Run `npx drizzle-kit generate` to sync migration meta
