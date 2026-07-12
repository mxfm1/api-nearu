# Design: Applications (Event Postulation System)

## Architecture Decisions

### Decision 1: Separate Domain from Contact Requests

**Context**: The existing `contactRequests` table handles both service and event inquiries. Applications need different fields (cover letter, portfolio URLs) and different business rules (deduplication, scoring).

**Decision**: Create a new `applications` domain separate from `contact-requests`. This follows the Single Responsibility Principle and avoids polluting the contact request flow with application-specific logic.

**Rationale**: 
- Applications have unique lifecycle (pending → reviewing → accepted/rejected)
- Contact requests are simpler (pendiente → en_curso → cerrada)
- Scoring system is application-specific
- Clear separation of concerns

**Consequences**:
- New domain: `src/domains/applications/`
- New tables: `applications`, `publication_scoring_rules`, `application_scores`, `application_score_breakdown`
- Existing `contactRequests` remain unchanged for backward compatibility

### Decision 2: Scoring System Design

**Context**: Events need automatic candidate evaluation based on configurable rules.

**Decision**: Implement scoring as optional per-event configuration. Each rule has a `rule_type` (ENUM), `weight` (integer), and optional `config` (JSONB for CUSTOM_FIELD_MATCH).

**Rationale**:
- Flexibility: Events can have 0 to N scoring rules
- Extensibility: New rule types added to ENUM without schema changes
- Performance: Scores computed on-demand, not stored (until cached)
- Transparency: Breakdown shows exactly how score was calculated

**Consequences**:
- `publication_scoring_rules` table per event
- `application_scores` and `application_score_breakdown` for cached results
- Score computation in use case, not repository

### Decision 3: Status Flow

**Context**: Applications need clear status transitions managed by event organizers.

**Decision**: Use ENUM for application status: `pending`, `reviewing`, `accepted`, `rejected`. Transitions validated in use case.

**Rationale**:
- Simple state machine: pending → reviewing → accepted/rejected
- No going back (e.g., accepted → pending is invalid)
- Clear semantics for frontend

**Consequences**:
- Status validation in `updateApplicationStatus` use case
- Error on invalid transitions: `INPUT_PARSE_ERROR`

### Decision 4: Error Handling

**Context**: Duplicate applications must be prevented with clear error messages.

**Decision**: Use `ConflictError` (409) with code `APPLICATION_ALREADY_EXISTS` for duplicates.

**Rationale**:
- Matches existing error patterns (see `ConflictError` in `common.ts`)
- HTTP 409 Conflict is semantically correct
- Clear error code for frontend handling

**Consequences**:
- New error class or reuse `ConflictError` with custom code
- Frontend can check `errorCode` for specific handling

## Database Schema

### Table: applications

```sql
CREATE TABLE applications (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  applicant_profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  cover_letter TEXT,
  portfolio_urls JSONB DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  CONSTRAINT uq_application_event_profile UNIQUE (event_id, applicant_profile_id)
);

CREATE INDEX idx_applications_event_id ON applications(event_id);
CREATE INDEX idx_applications_applicant_id ON applications(applicant_profile_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_created_at ON applications(created_at);
```

### Table: publication_scoring_rules

```sql
CREATE TYPE rule_type AS ENUM (
  'VERIFIED_PROFILE',
  'SAME_REGION',
  'HAS_PORTFOLIO',
  'YEARS_EXPERIENCE',
  'HAS_WEBSITE',
  'HAS_SOCIAL_LINKS',
  'HAS_COMPANY_DESCRIPTION',
  'HAS_LOGO',
  'HAS_BANNER',
  'HAS_PREVIOUS_FEEDBACK',
  'AVERAGE_RATING',
  'NUMBER_OF_COMPLETED_JOBS',
  'NUMBER_OF_COMPLETED_EVENTS',
  'HAS_RESPONSE_HISTORY',
  'FAST_RESPONSE_TIME',
  'IS_PREMIUM_COMPANY',
  'CUSTOM_FIELD_MATCH'
);

CREATE TABLE publication_scoring_rules (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  rule_type rule_type NOT NULL,
  weight INTEGER NOT NULL DEFAULT 1,
  config JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  CONSTRAINT uq_rule_event_type UNIQUE (event_id, rule_type)
);

CREATE INDEX idx_scoring_rules_event_id ON publication_scoring_rules(event_id);
```

### Table: application_scores

```sql
CREATE TABLE application_scores (
  id TEXT PRIMARY KEY,
  application_id TEXT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  total_score INTEGER NOT NULL DEFAULT 0,
  max_possible INTEGER NOT NULL DEFAULT 0,
  computed_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  CONSTRAINT uq_score_application UNIQUE (application_id)
);

CREATE INDEX idx_scores_application_id ON application_scores(application_id);
```

### Table: application_score_breakdown

```sql
CREATE TABLE application_score_breakdown (
  id TEXT PRIMARY KEY,
  score_id TEXT NOT NULL REFERENCES application_scores(id) ON DELETE CASCADE,
  rule_type rule_type NOT NULL,
  points_earned INTEGER NOT NULL DEFAULT 0,
  points_possible INTEGER NOT NULL DEFAULT 0,
  reason TEXT,
  
  CONSTRAINT uq_breakdown_score_rule UNIQUE (score_id, rule_type)
);

CREATE INDEX idx_breakdown_score_id ON application_score_breakdown(score_id);
```

## Sequence Diagrams

### Create Application Flow

```
Client          Controller        UseCase         Repository        Database
  │                │                │                │                │
  │ POST /api/applications        │                │                │
  │───────────────>│                │                │                │
  │                │ createApplication(input)       │                │
  │                │───────────────>│                │                │
  │                │                │ findByEventAndProfile           │
  │                │                │───────────────>│                │
  │                │                │                │ SELECT * FROM applications
  │                │                │                │ WHERE event_id = ? AND applicant_profile_id = ?
  │                │                │<───────────────│                │
  │                │                │                │                │
  │                │                │ [if exists] throw APPLICATION_ALREADY_EXISTS
  │                │                │                │                │
  │                │                │ findByEventId(eventId)          │
  │                │                │───────────────>│                │
  │                │                │<───────────────│                │
  │                │                │                │                │
  │                │                │ [if user owns event] throw INPUT_PARSE_ERROR
  │                │                │                │                │
  │                │                │ create(data)   │                │
  │                │                │───────────────>│                │
  │                │                │                │ INSERT INTO applications
  │                │                │<───────────────│                │
  │                │ application    │                │                │
  │                │<───────────────│                │                │
  │ { success: true, data: application }           │                │
  │<───────────────│                │                │                │
```

### Score Calculation Flow

```
UseCase          Repository        ProfileRepo     EventsRepo       Database
  │                │                │                │                │
  │ computeScore(applicationId)    │                │                │
  │───────────────>│                │                │                │
  │                │ findById(applicantProfileId)    │                │
  │                │───────────────>│                │                │
  │                │ profile        │                │                │
  │                │<───────────────│                │                │
  │                │                │                │                │
  │                │ findScoringRulesByEventId       │                │
  │                │───────────────>│                │                │
  │                │ rules[]        │                │                │
  │                │<───────────────│                │                │
  │                │                │                │                │
  │ FOR EACH rule: │                │                │                │
  │   evaluate(rule, profile)       │                │                │
  │   add to breakdown              │                │                │
  │                │                │                │                │
  │                │ createScore({total, max, breakdown})             │
  │                │───────────────>│                │                │
  │                │                │ INSERT INTO application_scores
  │                │                │ INSERT INTO application_score_breakdown
  │                │<───────────────│                │                │
  │ score          │                │                │                │
  │<───────────────│                │                │                │
```

## File Structure

```
src/domains/applications/
├── controllers/
│   └── application.controller.ts
├── entities/
│   └── application.entity.ts
├── presenters/
│   └── application.presenter.ts
├── repositories/
│   ├── applications.repository.interface.ts
│   └── applications.repository.ts
├── use-cases/
│   ├── create-application.use-case.ts
│   ├── get-application.use-case.ts
│   ├── list-event-applications.use-case.ts
│   ├── list-my-applications.use-case.ts
│   └── update-application-status.use-case.ts
└── validators/
    └── application.validator.ts

src/shared/database/schema.ts (extend with new tables)
di/container.ts (add bindings)
di/types.ts (add symbols)
src/presentation/routes/index.ts (add routes)
```

## Migration Plan

1. **Phase 1**: Create new tables and ENUM type
   - `applications`
   - `publication_scoring_rules`
   - `application_scores`
   - `application_score_breakdown`
   - ENUM `rule_type`

2. **Phase 2**: Implement domain layer
   - Entity interfaces
   - Repository interface and implementation
   - Use cases
   - Controllers
   - Validators

3. **Phase 3**: Wire up DI and routes
   - Add DI symbols
   - Bind repositories and use cases
   - Add routes to router

4. **Phase 4**: (Future) Data migration
   - Migrate event-related contactRequests to applications (optional)
   - Keep contactRequests for service inquiries
