# Design: Notification Triggers for Applications & Account Events

## Technical Approach

Wire existing notification infrastructure into application and account change flows. Use existing `createNotificationUseCase` (already wired to `INotificationsRepository`) and `emailService` (Resend). Inject into existing use-cases via DI. Fire-and-forget with try/catch (existing pattern from `createContactRequestUseCase`).

## Architecture Decisions

### Decision: Inject notifications via DI into use-cases

**Choice**: Add `INotificationsRepository` as a DI dependency to `createApplicationUseCase` and `updateApplicationStatusUseCase`
**Alternatives considered**: Create separate notification service classes, use events/observer pattern
**Rationale**: Follows existing DI pattern for repositories. Minimal surface area — just inject and call `create()`. Observer pattern would require event emitter infrastructure not currently present.

### Decision: Per-type email preferences with account bypass

**Choice**: Check `notification_preferences` per type before sending email. Account notifications (`PASSWORD_CHANGED`, `EMAIL_CHANGED`) bypass the check.
**Alternatives considered**: Single boolean toggle (too coarse), per-channel preferences JSONB (too complex for v1)
**Rationale**: Provides fine-grained control without schema complexity. Account notifications always sending is a security expectation (users MUST know when their account changes).

### Decision: Fire-and-forget with try/catch

**Choice**: Wrap notification + email calls in try/catch, log warning on failure, never block the main operation.
**Alternatives considered**: Async queue/background jobs, saga pattern
**Rationale**: Matches existing pattern in `createContactRequestUseCase`. Notifications are non-critical — failing to notify should not roll back an application creation or status change.

### Decision: Schema rename vs drop-and-create for notifications table

**Choice**: Migration renames `message` → `body`, `data` → `metadata`, adds new columns.
**Alternatives considered**: Create new table, migrate data, drop old table
**Rationale**: Renames are reversible migrations. Drop-and-create risks data loss if migration fails. Existing data in `data` column migrates to `metadata` as-is.

## Data Flow

### Application Created
```
Frontend → POST /api/applications
  → createApplicationUseCase (DI: applicationsRepository, eventsRepository, profilesRepository, notificationsRepository)
    → applicationsRepository.create()
    → eventsRepository.incrementApplicationCount()
    → notificationsRepository.create({ type: 'NEW_APPLICATION', actor_profile_id, ... })
      → emailService.sendApplicationReceivedEmail() [if preference enabled]
```

### Application Status Changed
```
Frontend → PATCH /api/applications/:id/status
  → updateApplicationStatusUseCase (DI: ...notificationsRepository)
    → applicationsRepository.updateStatus()
    → eventsRepository.incrementSelectedCandidates() / decrementSelectedCandidates()
    → notificationsRepository.create({ type: 'APPLICATION_ACCEPTED', actor_profile_id = event owner, ... })
      → emailService.sendApplicationStatusChangedEmail() [if preference enabled]
```

### Password Changed
```
Frontend → POST /api/auth/change-password
  → changePasswordController (DI: profilesRepository, notificationsRepository)
    → auth.api.changePassword()
    → profilesRepository.findByUserId()
    → notificationsRepository.create({ type: 'PASSWORD_CHANGED', actor_profile_id = null, ... })
      → emailService.sendAccountChangeEmail() [ALWAYS, bypasses preference]
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/shared/database/schema.ts` | Modify | Rename `notifications.message`→`body`, `data`→`metadata`. Add `is_read`, `email_sent_at`, `actor_profile_id`, `entity_type`, `entity_id`, `action_url`. Create `notification_preferences` table. Create ENUMs `notification_type`, `entity_type`. |
| `drizzle/0009_notification_triggers.sql` | Create | Migration with all schema changes |
| `src/domains/notifications/entities/notification.entity.ts` | Modify | Add 13 new NotificationType values. Add `actorProfileId`, `entityType`, `entityId`, `actionUrl`, `isRead`, `emailSentAt`, `metadata` to interface. Add `NotificationPreferences` interface. |
| `src/domains/notifications/repositories/notifications.repository.interface.ts` | Modify | Add `notificationPreferences` to interface |
| `src/domains/notifications/repositories/notifications.repository.ts` | Modify | Implement `notification_preferences` CRUD. Update `create()` with new fields. Update `markRead()` to set `is_read`. |
| `src/domains/applications/use-cases/create-application.use-case.ts` | Modify | Add `INotificationsRepository` DI. After creating app, fire `NEW_APPLICATION` notification + email to event owner. |
| `src/domains/applications/use-cases/update-application-status.use-case.ts` | Modify | Add `INotificationsRepository` DI. After status change, fire `APPLICATION_*` notification + email to applicant. |
| `src/domains/auth/controllers/change-password.controller.ts` | Modify | Add `INotificationsRepository` DI. After password change, fire `PASSWORD_CHANGED` notification + email (always). |
| `src/domains/auth/controllers/change-email.controller.ts` | Modify | Add `INotificationsRepository` DI. After email change, fire `EMAIL_CHANGED` notification + email to new address (always). |
| `src/domains/notifications/controllers/notification.controller.ts` | Modify | Fire `ACCOUNT_CHANGE` notification when settings are updated. |
| `src/shared/email/index.ts` | Modify | Add `sendApplicationReceivedEmail()`, `sendApplicationStatusChangedEmail()`, `sendAccountChangeEmail()` templates. |
| `di/container.ts` | Modify | Add `INotificationsRepository` to `createApplicationUseCase` and `updateApplicationStatusUseCase` bindings. |
| `di/types.ts` | Modify | Update `ICreateApplicationUseCase` and `IUpdateApplicationStatusUseCase` return types if needed. |
| `src/domains/applications/repositories/applications.repository.interface.ts` | Modify | Add `findByIdWithApplicant()` if needed to get applicant profile for notifications |

## Email Templates

### `sendApplicationReceivedEmail`
- **To**: Event owner email
- **Subject**: "Nueva postulación — {eventTitle}"
- **Body**: "La empresa {applicantName} ha aplicado a tu evento {eventTitle}. Revisa las postulaciones en tu panel."

### `sendApplicationStatusChangedEmail`
- **To**: Applicant email
- **Subject**: "Actualización de tu postulación — {eventTitle}"
- **Body**: "Tu postulación al evento {eventTitle} ha sido {status}. {accepted: '¡Felicitaciones!' : 'Puedes esperar más información.'}"

### `sendAccountChangeEmail`
- **To**: User's email (new email for EMAIL_CHANGED)
- **Subject**: "Cambio en tu cuenta — nearU"
- **Body**: "Se ha realizado un cambio en tu cuenta: {action}. Si no fuiste vos, contacta soporte inmediatamente."

## Testing Strategy

| Layer | What | Approach |
|-------|------|---------|
| E2E | Application created fires notification | Create event, apply, check /api/notificaciones for NEW_APPLICATION |
| E2E | Status changed fires notification | Change status, check /api/notificaciones for APPLICATION_* |
| E2E | Password change fires notification | Change password, check /api/notificaciones for PASSWORD_CHANGED |
| E2E | Email preference respected | Disable email for NEW_APPLICATION, apply, verify no email sent |

## Migration / Rollout

1. Run migration `0009_notification_triggers.sql` — creates ENUMs, new columns, `notification_preferences` table
2. Migrate `user_notification_settings` data → `notification_preferences` (13 rows per user, copy `email_notifications_enabled` value)
3. Drop `user_notification_settings` table
4. Deploy application code with notification wiring
5. Verify existing tests pass (especially contact-request notifications which still use old schema)

## Open Questions

- [ ] Should `applicationCount` increments also fire an `EVENT_FILLED` notification when `selectedCandidates === requiredCandidates` and `autoCloseWhenFilled` is true?
- [ ] Do we need to store the `actor_profile_id` for application notifications (the applicant's profile) or just the entity reference?
