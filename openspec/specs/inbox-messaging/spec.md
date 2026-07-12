# Inbox Messaging Specification

## Purpose

Threaded messaging per contact request. Messages contain text content and optional JSONB attachments (URLs, max 6), ordered by creation date.

## Requirements

### Requirement: Send Message

Participants in a contact request MUST be able to send a message with text content and optional attachments.

Attachments MUST be URLs (validated by format), MUST NOT exceed 6 items, and MUST default to an empty array.

#### Scenario: Happy path with content
- GIVEN a contact request where sender is `remitenteId` or `propietarioId`
- WHEN the sender submits a message with valid content and 2 attachments
- THEN a new `inbox_messages` row is created with the content and attachments

#### Scenario: No attachments
- GIVEN a valid contact request
- WHEN a message with only text content is sent
- THEN the message is created with `attachments = []`

#### Scenario: Max attachments (6)
- GIVEN a valid contact request
- WHEN a message with exactly 6 valid attachment URLs is sent
- THEN the message is created with all 6 attachments stored

#### Scenario: Empty content and no attachments
- GIVEN a valid contact request
- WHEN a message with empty or whitespace-only content and no attachments is sent
- THEN the system MUST reject with 422 Validation Error

#### Scenario: Exceeds max attachments
- GIVEN a valid contact request
- WHEN a message with 7+ attachment URLs is sent
- THEN the system MUST reject with 422 Validation Error

#### Scenario: Non-participant sender
- GIVEN a contact request where the user is neither `remitenteId` nor `propietarioId`
- WHEN they attempt to send a message
- THEN the system MUST reject with 403 Forbidden

### Requirement: Get Thread

The system MUST return all messages for a contact request, ordered by `created_at` ascending. Only conversation participants MAY retrieve the thread.

#### Scenario: Happy path
- GIVEN a contact request with 3 messages from both participants
- WHEN a participant requests the thread
- THEN all 3 messages are returned in chronological order (oldest first)

#### Scenario: Non-participant access
- GIVEN a contact request
- WHEN a user who is not a participant requests the thread
- THEN the system MUST reject with 403 Forbidden

### Requirement: Contact Request Existence

The system MUST validate that the target `contact_request_id` exists and is accessible to the sender before creating messages or returning threads.

#### Scenario: Non-existent request
- GIVEN a non-existent `contact_request_id`
- WHEN a user attempts to send a message or get thread
- THEN the system MUST reject with 404 Not Found
