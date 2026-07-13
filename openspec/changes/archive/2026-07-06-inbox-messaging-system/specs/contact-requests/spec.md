# Delta for Contact Requests

## ADDED Requirements

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

### Requirement: On-Create Triggers

When creating a contact request, the system MUST:

1. Create an `inbox_messages` row from the request's `mensaje` field (initial message)
2. Create a notification for `propietarioId` with type `new_contact_request`
3. Send an email notification to `propietarioId` IF `email_notifications_enabled = true`
4. Email failure MUST NOT block or roll back the request creation

#### Scenario: Happy path — full flow
- GIVEN User A submits a contact request to User B with message "Interested in service"
- WHEN the request is created
- THEN an `inbox_messages` row is created with content "Interested in service"
- AND a notification of type `new_contact_request` is created for User B
- AND if User B has `email_notifications_enabled = true`, an email is sent

#### Scenario: Email fails, creation succeeds
- GIVEN the email service is down
- WHEN User A submits a contact request
- THEN the request and initial message are saved successfully
- AND the notification is created
- AND no error is propagated to User A
- AND User A receives a success response

#### Scenario: Self-contact still blocked
- GIVEN User A attempts to send a contact request to themselves
- WHEN they submit the request
- THEN the system MUST reject (self-contact remains prohibited)
