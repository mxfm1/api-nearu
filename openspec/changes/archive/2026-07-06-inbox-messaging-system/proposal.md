# Proposal: Inbox Messaging System

## Intent

Users need threaded messaging and notifications to communicate through the platform instead of hitting a dead-end form.

## Scope

### In Scope
- Threaded messaging per contact request (`inbox_messages`, JSONB attachments max 6)
- In-app notifications (type discriminator) + email toggle settings
- Dual inbox (`?tipo=recibidos|enviados`)
- Email notifications for new contacts/replies
- Migration of `mensaje` → `inbox_messages` + seed settings for all users

### Out of Scope
- Real-time push, UploadThing logic (frontend handles)
- Per-type email prefs, push notifications, pagination
- Removing deprecated `mensaje` column

## Capabilities

### New Capabilities
- `inbox-messaging`: Thread per contact request, send-message + get-thread, JSONB attachments
- `notifications`: In-app notifications (type enum), list/mark-read/mark-all-read, email toggle

### Modified Capabilities
- `contact-requests`: Dual inbox filter, `ultimoMensaje`/`cantidadMensajes` in response, on-create triggers first message + notification

## Approach

```
solicitudes_contacto ──1:N── inbox_messages
users ──1:1── user_notification_settings
users ──1:N── notifications (type + JSONB data)
```

- 3 new tables: `inbox_messages`, `notifications` (single type discriminator), `user_notification_settings`
- New `messages` + `notifications` domains following Clean Arch patterns
- Enhance `contact-requests` with `findByRemitenteId`, `tipo` param, message preview fields
- Sync email via Resend (existing pattern), check email toggle before send
- Migration: copy `mensaje` → `inbox_messages`, seed settings default `true`

## Affected Areas

| Area | Impact |
|------|--------|
| `src/shared/database/schema.ts` | +3 tables + relations |
| `src/domains/messages/` | New Clean Arch domain |
| `src/domains/notifications/` | New Clean Arch domain |
| `src/domains/contact-requests/` | Repo, UC, controller, presenter, validator |
| `src/shared/email/` | +2 templates |
| `di/container.ts`, `di/types.ts` | Wire new domains |
| `src/presentation/routes/` | +8 endpoints |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Data loss on migration | Low | Copy first, keep col, verify counts |
| Email notification loop | Low | Notify other party only; self-contact blocked |
| >6 attachments stored | Low | Zod max(6) + service guard |
| Email failure blocks save | Med | Try/catch — message saved regardless |

## Rollback Plan

1. DROP TABLE for 3 new tables + indexes
2. Delete `src/domains/messages/` and `src/domains/notifications/`
3. `git checkout` — restore contact-requests, email, DI, routes
4. Verify `GET /api/contactos/inbox` works without `tipo`
5. Deploy previous migration

## Success Criteria

- [ ] Owner notified (in-app + email if enabled) on new contact request
- [ ] Sender notified on reply; reply visible in thread
- [ ] Sender views sent requests via `?tipo=enviados`
- [ ] All existing `mensaje` migrated to `inbox_messages` with zero loss
- [ ] Existing endpoints (detail, estado, create) unchanged
