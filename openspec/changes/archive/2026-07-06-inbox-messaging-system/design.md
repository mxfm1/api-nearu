# Design: Inbox Messaging System

## Technical Approach

3 new tables (`inbox_messages`, `notifications`, `user_notification_settings`), 2 new Clean Architecture domains (`messages`, `notifications`), enhanced `contact-requests` domain, and email notifications via existing Resend service. Migration copies `mensaje` → `inbox_messages` and seeds default settings for all users.

## Architecture Decisions

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Single table vs polymorphic notifications | Single: simpler queries, no union. Polymorphic: per-type extensibility | Single table with `type` discriminator |
| Email sync vs queue | Sync: simpler, no infra. Risk: blocks request if slow | Sync with try/catch — email failure never blocks |
| Message preview via subquery vs join | Subquery: exact latest msg. Join: simpler but needs ORDER + DISTINCT | LEFT JOIN LATERAL via Drizzle subquery for `ultimoMensaje` |
| Separate validator files per domain | Follows existing pattern (service.validator.ts, event.validator.ts) | One validator per new domain |

## Data Flow

```
POST /api/contactos
  │
  ├─→ contact-requests: create request
  ├─→ messages: insert initial inbox_messages row (from mensaje)
  ├─→ notifications: create notification for propietario
  └─→ email: send to propietario if settings allow (try/catch)

POST /api/mensajes
  │
  ├─→ messages: validate participant
  ├─→ messages: insert inbox_messages row
  └─→ notifications: create notification for other participant

GET /api/contactos/inbox?tipo=recibidos|enviados
  │
  └─→ contact-requests: filter by propietarioId or remitenteId
      └─→ join inbox_messages for ultimoMensaje + COUNT
```

## New Tables

```typescript
// inbox_messages
inbox_messages {
  id: text PK
  contact_request_id: text FK → solicitudes_contacto (CASCADE)
  sender_id: text FK → users (CASCADE)
  content: text
  attachments: jsonb DEFAULT []
  created_at: timestamp
  updated_at: timestamp
}

// notifications
notifications {
  id: text PK
  user_id: text FK → users (CASCADE)
  type: text   // 'new_contact_request'|'new_message'|'profile_update'|'account_change'
  title: text
  message: text
  data: jsonb
  read_at: timestamp nullable
  created_at: timestamp
}

// user_notification_settings
user_notification_settings {
  id: text PK
  user_id: text FK → users (CASCADE) UNIQUE
  email_notifications_enabled: boolean DEFAULT true
  created_at: timestamp
  updated_at: timestamp
}
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/shared/database/schema.ts` | Modify | +3 tables + relations + indexes |
| `src/domains/messages/entities/message.entity.ts` | Create | Message type + MessageWithSender |
| `src/domains/messages/repositories/messages.repository.interface.ts` | Create | IMessageRepository interface |
| `src/domains/messages/repositories/messages.repository.ts` | Create | Drizzle implementation |
| `src/domains/messages/use-cases/send-message.use-case.ts` | Create | Validate participant + insert |
| `src/domains/messages/use-cases/get-thread.use-case.ts` | Create | Fetch messages for CR |
| `src/domains/messages/controllers/message.controller.ts` | Create | sendMessage + getThread |
| `src/domains/messages/validators/message.validator.ts` | Create | Zod schemas |
| `src/domains/notifications/entities/notification.entity.ts` | Create | Notification type |
| `src/domains/notifications/repositories/notifications.repository.interface.ts` | Create | INotificationsRepository |
| `src/domains/notifications/repositories/notifications.repository.ts` | Create | Drizzle implementation |
| `src/domains/notifications/use-cases/list-notifications.use-case.ts` | Create | By userId, ordered DESC |
| `src/domains/notifications/use-cases/mark-read.use-case.ts` | Create | Single + mark-all |
| `src/domains/notifications/use-cases/create-notification.use-case.ts` | Create | Create with type + data |
| `src/domains/notifications/controllers/notification.controller.ts` | Create | List, markRead, markAll |
| `src/domains/notifications/validators/notification.validator.ts` | Create | Zod schemas |
| `src/domains/notifications/use-cases/get-settings.use-case.ts` | Create | Get user settings |
| `src/domains/notifications/use-cases/update-settings.use-case.ts` | Create | Toggle email |
| `src/domains/contact-requests/entities/contact-request.entity.ts` | Modify | +ultimoMensaje, +cantidadMensajes |
| `src/domains/contact-requests/repositories/contact-requests.repository.interface.ts` | Modify | +findByRemitenteId |
| `src/domains/contact-requests/repositories/contact-requests.repository.ts` | Modify | +findByRemitenteId, +message preview |
| `src/domains/contact-requests/use-cases/get-inbox.use-case.ts` | Modify | Accept tipo param |
| `src/domains/contact-requests/use-cases/create-contact-request.use-case.ts` | Modify | +on-create triggers |
| `src/domains/contact-requests/presenters/contact-request.presenter.ts` | Modify | +ultimoMensaje, +cantidadMensajes |
| `src/domains/contact-requests/controllers/contact-request.controller.ts` | Modify | Pass tipo to getInbox |
| `src/domains/contact-requests/validators/contact-request.validator.ts` | Modify | +tipo query schema |
| `src/shared/email/index.ts` | Modify | +sendContactNotification, +sendMessageNotification |
| `di/types.ts` | Modify | +new domain symbols + return types |
| `di/container.ts` | Modify | +wire new domains |
| `src/presentation/routes/index.ts` | Modify | +8 new endpoints |

## Interfaces / Contracts

```typescript
// Message
interface SendMessageInput {
  contactRequestId: string;
  content: string;
  attachments?: string[];  // max 6, URLs
}

interface Message {
  id: string;
  contactRequestId: string;
  senderId: string;
  content: string | null;
  attachments: string[];
  createdAt: Date;
}

// Notification
type NotificationType = 'new_contact_request' | 'new_message' | 'profile_update' | 'account_change';

interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data: Record<string, unknown> | null;
  readAt: Date | null;
  createdAt: Date;
}
```

## Endpoint Map

| Method | Path | Auth | Domain | Description |
|--------|------|------|--------|-------------|
| POST | `/api/mensajes` | Yes | messages | Send message |
| GET | `/api/mensajes/:contactRequestId` | Yes | messages | Get thread |
| GET | `/api/notificaciones` | Yes | notifications | List user notifications |
| PATCH | `/api/notificaciones/:id/read` | Yes | notifications | Mark single read |
| PATCH | `/api/notificaciones/read-all` | Yes | notifications | Mark all read |
| GET | `/api/notificaciones/config` | Yes | notifications | Get email settings |
| PATCH | `/api/notificaciones/config` | Yes | notifications | Update email settings |
| GET | `/api/contactos/inbox?tipo=` | Yes | contact-requests | Dual inbox filter |

## Testing Strategy

No unit/integration tests detected (Playwright E2E only). Verify manually:
- E2E: create contact request → verify message + notification created
- E2E: send reply → verify thread + notification for other party
- E2E: toggle email off → verify no email sent on new contact

## Migration / Rollout

1. `drizzle-kit generate` + `db:push` for 3 new tables
2. Run migration: `INSERT INTO inbox_messages ... SELECT` from existing `mensaje`
3. Seed: `INSERT INTO user_notification_settings (user_id) SELECT id FROM users ON CONFLICT DO NOTHING`
4. Deploy code. `mensaje` column kept for rollback.

## Open Questions

None.
