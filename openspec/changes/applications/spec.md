# Spec: Applications (Event Postulation System)

## 1. Create Application

### Scenario: Successfully create an application for an event

**Given** an authenticated user with profile "profile-123"
**And** an event "event-456" with status "published"
**And** no existing application from "profile-123" for "event-456"
**When** POST /api/applications with `{ eventId: "event-456", coverLetter: " interested in..." }`
**Then** create application with status "pending"
**And** return 201 with application data including `id`, `eventId`, `applicantProfileId`, `status`
**And** application has `createdAt` timestamp

### Scenario: Reject duplicate application

**Given** an authenticated user with profile "profile-123"
**And** an existing application from "profile-123" for "event-456"
**When** POST /api/applications with `{ eventId: "event-456" }`
**Then** return 409 with error code `APPLICATION_ALREADY_EXISTS`
**And** error message "Ya existe una postulación activa para este evento."

### Scenario: Application to non-existent event

**Given** an authenticated user with profile "profile-123"
**When** POST /api/applications with `{ eventId: "non-existent" }`
**Then** return 404 with error code `NOT_FOUND`
**And** error message "Evento no encontrado"

### Scenario: Application to event owned by same user

**Given** an authenticated user with profile "profile-123"
**And** an event "event-456" owned by "profile-123"
**When** POST /api/applications with `{ eventId: "event-456" }`
**Then** return 400 with error code `INPUT_PARSE_ERROR`
**And** error message "No puedes postular a tu propio evento"

## 2. List Applications for Event

### Scenario: Event owner lists all applications

**Given** an authenticated user with profile "profile-123"
**And** an event "event-456" owned by "profile-123"
**And** 3 applications from different profiles for "event-456"
**When** GET /api/events/event-456/applications
**Then** return 200 with array of 3 applications
**And** each application includes `applicantProfile` with `name`, `logoUrl`
**And** applications are sorted by `createdAt` descending

### Scenario: Non-owner cannot list applications

**Given** an authenticated user with profile "profile-789"
**And** an event "event-456" owned by "profile-123"
**When** GET /api/events/event-456/applications
**Then** return 403 with error code `FORBIDDEN`
**And** error message "No tienes permiso para ver estas postulaciones"

## 3. Get Application Detail

### Scenario: Application owner views their application

**Given** an authenticated user with profile "profile-123"
**And** an application "app-001" from "profile-123" for "event-456"
**When** GET /api/applications/app-001
**Then** return 200 with full application details
**And** includes `event` with `title`, `startAt`, `locationName`
**And** includes `score` if scoring rules exist for the event

### Scenario: Event owner views application detail

**Given** an authenticated user with profile "profile-123"
**And** an event "event-456" owned by "profile-123"
**And** an application "app-001" from "profile-789" for "event-456"
**When** GET /api/applications/app-001
**Then** return 200 with full application details
**And** includes `applicantProfile` with company info

### Scenario: Unauthorized user cannot view application

**Given** an authenticated user with profile "profile-999"
**And** an application "app-001" from "profile-123" for "event-456" owned by "profile-456"
**When** GET /api/applications/app-001
**Then** return 403 with error code `FORBIDDEN`

## 4. Update Application Status (Event Owner)

### Scenario: Accept application

**Given** an authenticated user with profile "profile-123"
**And** an event "event-456" owned by "profile-123"
**And** an application "app-001" with status "pending"
**When** PATCH /api/applications/app-001/status with `{ status: "accepted" }`
**Then** update application status to "accepted"
**And** return 200 with updated application
**And** create notification for applicant

### Scenario: Reject application

**Given** an authenticated user with profile "profile-123"
**And** an event "event-456" owned by "profile-123"
**And** an application "app-001" with status "pending"
**When** PATCH /api/applications/app-001/status with `{ status: "rejected" }`
**Then** update application status to "rejected"
**And** return 200 with updated application

### Scenario: Invalid status transition

**Given** an application "app-001" with status "accepted"
**When** PATCH /api/applications/app-001/status with `{ status: "pending" }`
**Then** return 400 with error code `INPUT_PARSE_ERROR`
**And** error message "Transición de estado no válida"

## 5. List My Applications (Applicant)

### Scenario: User lists their applications

**Given** an authenticated user with profile "profile-123"
**And** 2 applications from "profile-123" for different events
**When** GET /api/mis-aplicaciones
**Then** return 200 with array of 2 applications
**And** each application includes `event` with `title`, `startAt`, `status`
**And** applications are sorted by `createdAt` descending

## 6. Scoring Rules

### Scenario: Create scoring rule for event

**Given** an authenticated user with profile "profile-123"
**And** an event "event-456" owned by "profile-123"
**When** POST /api/events/event-456/scoring-rules with `{ ruleType: "VERIFIED_PROFILE", weight: 10 }`
**Then** create scoring rule
**And** return 201 with rule data

### Scenario: List scoring rules for event

**Given** an event "event-456" with 3 scoring rules
**When** GET /api/events/event-456/scoring-rules
**Then** return 200 with array of 3 rules
**And** each rule includes `ruleType`, `weight`, `config`

### Scenario: Delete scoring rule

**Given** an authenticated user with profile "profile-123"
**And** an event "event-456" owned by "profile-123"
**And** a scoring rule "rule-001" for "event-456"
**When** DELETE /api/events/event-456/scoring-rules/rule-001
**Then** delete the rule
**And** return 204

## 7. Score Calculation

### Scenario: Calculate score for application

**Given** an event "event-456" with scoring rules:
  - VERIFIED_PROFILE (weight: 10)
  - SAME_REGION (weight: 5)
  - HAS_PORTFOLIO (weight: 8)
**And** an application "app-001" from "profile-123"
**And** "profile-123" is verified, in same region, has portfolio
**When** score is computed
**Then** total_score = 23 (10 + 5 + 8)
**And** max_possible = 23
**And** breakdown includes 3 entries with points earned

### Scenario: Partial score

**Given** an event "event-456" with scoring rules:
  - VERIFIED_PROFILE (weight: 10)
  - HAS_PORTFOLIO (weight: 8)
**And** an application "app-002" from "profile-789"
**And** "profile-789" is NOT verified but HAS portfolio
**When** score is computed
**Then** total_score = 8
**And** max_possible = 18
**And** breakdown includes VERIFIED_PROFILE with 0 points and HAS_PORTFOLIO with 8 points

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `APPLICATION_ALREADY_EXISTS` | 409 | Duplicate application for same event |
| `APPLICATION_NOT_FOUND` | 404 | Application does not exist |
| `FORBIDDEN` | 403 | User not authorized for this action |
| `INPUT_PARSE_ERROR` | 400 | Invalid input or status transition |
| `NOT_FOUND` | 404 | Event does not exist |
