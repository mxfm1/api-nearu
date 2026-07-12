# Notifications Specification

## Purpose

In-app notification system with type discrimination. Users list, mark as read, and configure email notification preferences. Account emails always bypass the email toggle.

## Requirements

### Requirement: Notification Types

The system SHALL support these notification types: `new_contact_request`, `new_message`, `profile_update`, `account_change`.

Each notification MUST have a `type`, `title`, `message`, and optional JSONB `data` payload.

### Requirement: Create Notification

The system MUST create a notification for a target user with `read_at = null`.

#### Scenario: Notification created
- GIVEN an event that triggers a notification
- WHEN the system creates it
- THEN a `notifications` row appears in the user's list with `read_at = null`

### Requirement: List Notifications

The system MUST return the authenticated user's notifications ordered by `created_at` DESC.

#### Scenario: User has notifications
- GIVEN a user with 5 notifications
- WHEN they request their list
- THEN all 5 are returned newest-first

#### Scenario: Empty inbox
- GIVEN a user with no notifications
- WHEN they request the list
- THEN an empty array is returned

### Requirement: Mark Single as Read

The system MUST set `read_at` to current timestamp for a single notification. This operation MUST be idempotent.

#### Scenario: Happy path
- GIVEN an unread notification belonging to the user
- WHEN the user marks it as read
- THEN `read_at` is set

#### Scenario: Already read
- GIVEN a notification with `read_at` already set
- WHEN the user marks it again
- THEN the system returns success (idempotent)

#### Scenario: Other user's notification
- GIVEN a notification belonging to another user
- WHEN the current user attempts to mark it
- THEN the system MUST reject with 403 Forbidden

### Requirement: Mark All as Read

The system MUST mark ALL unread notifications for the authenticated user as read.

#### Scenario: Multiple unread
- GIVEN a user with 3 unread notifications
- WHEN they mark all as read
- THEN all 3 notifications have `read_at` set

#### Scenario: None unread
- GIVEN a user with 0 unread notifications
- WHEN they mark all as read
- THEN the system returns success (no-op)

### Requirement: Email Notification Settings

Users MUST be able to GET and UPDATE their `email_notifications_enabled` preference (defaults to `true`).

The system MUST check this setting before sending notification emails. Account emails (password reset, email change, verification) MUST be sent regardless.

#### Scenario: Get settings (default true)
- GIVEN a newly registered user
- WHEN they request their notification settings
- THEN `email_notifications_enabled` is returned as `true`

#### Scenario: Toggle off
- GIVEN a user with `email_notifications_enabled = true`
- WHEN they update to `false`
- THEN the setting is saved and notification emails are suppressed

#### Scenario: Toggle on
- GIVEN a user with `email_notifications_enabled = false`
- WHEN they update to `true`
- THEN the setting is saved and notification emails are sent

#### Scenario: Account email bypasses toggle
- GIVEN a user with `email_notifications_enabled = false`
- WHEN the system sends a password reset email
- THEN the email is sent regardless of the toggle
