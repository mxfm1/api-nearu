# Delta for Notifications — Notification Triggers

## ADDED Requirements

### Requirement: Notification Trigger — Application Created

When a user submits an application to an event, the system MUST create an in-app notification for the event owner and send an email if the owner's preferences allow it.

#### Scenario: Application created — owner receives notification
- GIVEN an event owned by profile P1 and a user with profile P2 applying to it
- WHEN the application is successfully created
- THEN a notification is created for the user who owns the event with type `NEW_APPLICATION`, `entity_type = 'APPLICATION'`, and `entity_id = application.id`
- AND `actor_profile_id` is set to P2's id

#### Scenario: Application created — email sent when enabled
- GIVEN an event owner with email notifications enabled for `NEW_APPLICATION`
- WHEN a user applies to their event
- THEN an email is sent to the owner's email address
- AND `email_sent_at` is set on the notification

#### Scenario: Application created — email skipped when disabled
- GIVEN an event owner with email notifications disabled for `NEW_APPLICATION`
- WHEN a user applies to their event
- THEN no email is sent
- AND `email_sent_at` remains null

### Requirement: Notification Trigger — Application Status Changed

When an event owner changes an application's status (to `reviewing`, `accepted`, or `rejected`), the system MUST create an in-app notification for the applicant and send an email if their preferences allow it.

#### Scenario: Application accepted — applicant notified
- GIVEN an application with status `pending` owned by profile P1
- WHEN the event owner changes the status to `accepted`
- THEN a notification is created for P1 with type `APPLICATION_ACCEPTED`, `entity_type = 'APPLICATION'`
- AND an email is sent to P1 if their email preference for `APPLICATION_ACCEPTED` is enabled

#### Scenario: Application rejected — applicant notified
- GIVEN an application with status `reviewing` owned by profile P1
- WHEN the event owner changes the status to `rejected`
- THEN a notification is created for P1 with type `APPLICATION_REJECTED`
- AND an email is sent if the applicant's email preference is enabled

#### Scenario: Application moved to reviewing
- GIVEN an application with status `pending` owned by profile P1
- WHEN the event owner changes the status to `reviewing`
- THEN a notification is created for P1 with type `APPLICATION_REVIEWING`

### Requirement: Notification Trigger — Account Changes

When a user changes their account settings, the system MUST create a notification for that user. Account notifications MUST bypass email preferences.

#### Scenario: Password changed — user notified
- GIVEN an authenticated user
- WHEN they successfully change their password via `/api/auth/change-password`
- THEN a notification is created for that user with type `PASSWORD_CHANGED`, `entity_type = 'ACCOUNT'`
- AND an email is sent regardless of the user's email notification preferences

#### Scenario: Email changed — user notified
- GIVEN an authenticated user
- WHEN they successfully change their email via `/api/auth/change-email`
- THEN a notification is created for that user with type `EMAIL_CHANGED`, `entity_type = 'ACCOUNT'`
- AND an email is sent to the new email address regardless of notification preferences

### Requirement: Notification Trigger — Notification Settings Changed

When a user updates their notification preferences, the system MUST create a notification for that user confirming the change.

#### Scenario: Notification settings updated — user notified
- GIVEN an authenticated user
- WHEN they update their notification preferences via `PATCH /api/notificaciones/config`
- THEN a notification is created for that user with type `ACCOUNT_CHANGE`, `entity_type = 'ACCOUNT'`
- AND the notification body describes the setting that was changed

## MODIFIED Requirements

### Requirement: Notification Types

(Previously: 4 types — `new_contact_request`, `new_message`, `profile_update`, `account_change`)

The system SHALL support these notification types:

**Application-related:** `NEW_APPLICATION`, `APPLICATION_REVIEWING`, `APPLICATION_ACCEPTED`, `APPLICATION_REJECTED`

**Account-related:** `EMAIL_CHANGED`, `PASSWORD_CHANGED`, `PROFILE_UPDATED`, `ACCOUNT_CHANGE`

**Profile-related:** `PROFILE_VERIFIED`, `PROFILE_REVALIDATION_REQUIRED`

**Event-related:** `EVENT_CLOSED`, `EVENT_FILLED`

**Message-related:** `NEW_MESSAGE`

**System:** `SYSTEM`

Each notification MUST have `id`, `user_id`, `actor_profile_id` (nullable), `type`, `title`, `body`, `entity_type` (nullable), `entity_id` (nullable), `action_url` (nullable), `is_read`, `read_at` (nullable), `email_sent_at` (nullable), `metadata` (JSONB, nullable), and `created_at`.

#### Scenario: Actor profile tracked for application notification
- GIVEN a user with profile P2 applies to an event owned by P1
- WHEN the notification is created
- THEN `actor_profile_id` is set to P2's id

#### Scenario: Actor is null for account notifications
- GIVEN a user changes their password
- WHEN the notification is created
- THEN `actor_profile_id` is null and `entity_type = 'ACCOUNT'`

### Requirement: Create Notification

(Previously: `read_at = null`, `message` field)

The system MUST create a notification with `is_read = false`, `read_at = null`, and `email_sent_at = null`. The notification body MUST be stored in the `body` field (renamed from `message`). Optional metadata SHOULD be stored in the `metadata` JSONB field.

#### Scenario: Notification with metadata
- GIVEN an application is created for event "Festival 2026"
- WHEN the notification is created for the event owner
- THEN `metadata` contains `{ eventTitle: "Festival 2026", applicationId: "..." }`

### Requirement: Mark Single as Read

(Previously: only set `read_at`)

The system MUST set `is_read = true` AND `read_at = current timestamp` when marking a notification as read. This operation MUST be idempotent.

#### Scenario: Mark as read sets is_read flag
- GIVEN an unread notification with `is_read = false`
- WHEN the user marks it as read
- THEN `is_read` is `true` AND `read_at` is set

### Requirement: Email Notification Preferences (Per-Type)

(Previously: single boolean `email_notifications_enabled`)

The system MUST support per-type email notification preferences. Each notification type MUST have its own `email_enabled` boolean. The system MUST default to `email_enabled = true` for all types when no preference is explicitly set. Account-related notifications (`PASSWORD_CHANGED`, `EMAIL_CHANGED`) MUST bypass email preferences and always send.

#### Scenario: Per-type preference — email disabled for applications only
- GIVEN a user with `email_enabled = false` for `NEW_APPLICATION` and `email_enabled = true` for `APPLICATION_ACCEPTED`
- WHEN an application is created for the user's event
- THEN no email is sent
- WHEN the application status changes to `accepted`
- THEN an email IS sent

#### Scenario: Account notification bypasses preferences
- GIVEN a user with `email_enabled = false` for `PASSWORD_CHANGED`
- WHEN the user changes their password
- THEN an email is still sent

#### Scenario: New user defaults to all email notifications enabled
- GIVEN a newly registered user with no notification preferences
- WHEN the system checks email preferences
- THEN all types default to `email_enabled = true`

### Requirement: List Notifications

(Previously: ordered by `created_at DESC`)

The system MUST return the authenticated user's notifications ordered by `created_at DESC`. Each notification MUST include `actor_profile_id`, `entity_type`, `entity_id`, and `action_url` when present.

#### Scenario: Notification with action URL
- GIVEN a notification of type `NEW_APPLICATION`
- WHEN the user retrieves their notifications
- THEN `action_url` points to the relevant application or event page

## REMOVED Requirements

### Requirement: Email Notification Settings (Boolean Toggle)

(Reason: Replaced by per-type `notification_preferences` table with per-type toggles)
