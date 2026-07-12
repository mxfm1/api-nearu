# Contact Requests Specification

## Purpose

Contact requests enable users to initiate connections. The system handles creation, inbox listing with dual filtering, message previews, and trigger-based notifications.

## Requirements

### Requirement: Dual Inbox Filter

The `GET /api/contactos/inbox` endpoint MUST accept a `tipo` query parameter to filter by user role.

- `?tipo=recibidos` MUST return requests where the user is `propietarioId`
- `?tipo=enviados` MUST return requests where the user is `remitenteId`
- The endpoint MUST return 422 for invalid `tipo` values

#### Scenario: Received requests
- GIVEN a user who is `propietarioId` on 2 requests and `remitenteId` on 3
- WHEN they request `GET /api/contactos/inbox?tipo=recibidos`
- THEN exactly 2 requests are returned

#### Scenario: Sent requests
- GIVEN the same user
- WHEN they request `GET /api/contactos/inbox?tipo=enviados`
- THEN exactly 3 requests are returned

#### Scenario: Invalid tipo value
- GIVEN a user
- WHEN they request `GET /api/contactos/inbox?tipo=invalid`
- THEN the system MUST reject with 422 Validation Error

### Requirement: Message Preview Fields

Each contact request in the inbox response MUST include `ultimoMensaje` (content of the most recent `inbox_messages` row) and `cantidadMensajes` (total count of messages).

#### Scenario: Request with messages
- GIVEN a contact request with 5 messages, the latest containing text "Hola"
- WHEN it appears in the inbox response
- THEN `ultimoMensaje` is "Hola" and `cantidadMensajes` is 5

#### Scenario: Request without messages
- GIVEN a newly created request with no messages
- WHEN it appears in the inbox response
- THEN `ultimoMensaje` is `null` and `cantidadMensajes` is 0

### Requirement: Slug-based Creation

The `POST /api/contactos` endpoint MUST accept a `slug` (of a service or event) instead of
requiring the client to resolve `propietarioId`, `servicioId`, or `eventoId`. The backend
resolves the slug to the resource and its owner.

The request body MUST be:
- `slug` (string, required) — slug of the service or event being contacted
- `intencion` (enum, required) — one of: `Solicitar una cotización`, `Solicitar una propuesta comercial`, `Consultar disponibilidad`, `Realizar una consulta sobre el servicio`
- `mensaje` (string, optional, max 2000 chars) — initial message
- `attachments` (string[], optional, max 6 URLs) — attachments for the initial message

The `remitenteId` MUST be derived from the authenticated user's token.

The `estado` field is automatically set to `pendiente` on creation and follows this lifecycle:
`pendiente` → `en_curso` → `cerrada`

The `PATCH /api/contactos/:id/estado` endpoint accepts: `pendiente`, `en_curso`, `cerrada`.

### Requirement: On-Create Triggers

When creating a contact request, the system MUST:

1. Resolve `slug` → try `services`, then `events` → get `profileId`
2. Resolve `profileId` → get `userId` (the `propietarioId`)
3. Create the contact request with resolved `servicioId`/`eventoId`, `propietarioId`, and `intencion`
4. Create an `inbox_messages` row from the request's `mensaje` and `attachments` (initial message)
5. Create a notification for `propietarioId` with type `new_contact_request`
6. Send an email notification to `propietarioId` IF `email_notifications_enabled = true`
7. All failures (notification, email) MUST NOT block or roll back the request creation

#### Scenario: Happy path — service slug with full data
- GIVEN a service with slug `mi-servicio-de-foto` owned by User B
- WHEN User A sends `POST /api/contactos` with `{ "slug": "mi-servicio-de-foto", "intencion": "Solicitar una cotización", "mensaje": "Necesito fotos para mi boda", "attachments": ["https://ejemplo.com/referencia.jpg"] }`
- THEN the backend resolves the slug to the service and its owner
- AND a contact request is created with `servicioId` matching the service, `propietarioId` matching User B, `intencion` = "Solicitar una cotización", `estado` = "pendiente"
- AND an `inbox_messages` row is created with content and attachments

#### Scenario: Happy path — event slug
- GIVEN an event with slug `feria-2026` owned by User B
- WHEN User A sends `POST /api/contactos` with `{ "slug": "feria-2026", "intencion": "Consultar disponibilidad" }`
- THEN the backend resolves the slug to the event and its owner
- AND a contact request is created with `eventoId` matching the event

#### Scenario: Slug not found
- GIVEN no service or event exists with slug `nonexistent`
- WHEN User A sends `POST /api/contactos` with `{ "slug": "nonexistent", "intencion": "Solicitar una cotización" }`
- THEN the system MUST reject with 404 Not Found

#### Scenario: Email fails, creation succeeds
- GIVEN the email service is down
- WHEN User A submits a contact request with a valid slug and intencion
- THEN the request and initial message are saved successfully
- AND the notification is created
- AND no error is propagated to User A
- AND User A receives a success response

#### Scenario: Self-contact still blocked
- GIVEN User A attempts to send a contact request to their own service/event
- WHEN they submit the request
- THEN the system MUST reject (self-contact remains prohibited)
