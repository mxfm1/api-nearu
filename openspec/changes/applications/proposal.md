# Proposal: Applications (Event Postulation System)

## Context

nearU is a B2B marketplace for the Chilean business ecosystem. Currently, services work as a professional directory where companies publish services and interested companies send contact requests. However, **events** need a more sophisticated flow: companies publish events and other companies apply to be providers/collaborators, with automatic scoring to help organizers evaluate candidates.

The current contact request system (`contactRequests`) handles both services and events but lacks:
- Application-specific fields (cover letter, portfolio links)
- Automatic scoring based on company profile completeness
- Deduplication rules (one application per company per event)
- Scoring rules configuration per event

## Scope

### IN
- New `applications` table replacing `contactRequests` for event postulations
- `publication_scoring_rules` table for configurable scoring criteria per event
- `application_scores` and `application_score_breakdown` for computed scores
- ENUM `rule_type` with 17 scoring criteria (VERIFIED_PROFILE, SAME_REGION, etc.)
- UNIQUE constraint: `(event_id, applicant_profile_id)`
- Error code: `APPLICATION_ALREADY_EXISTS` (or `APPLICATION_DUPLICATED`)
- Use cases: create application, list applications for event, get application detail
- Repository pattern following existing Clean Architecture

### OUT
- Frontend changes (separate task)
- Email notifications for applications (future iteration)
- Conversations/messages within applications (uses existing inbox system)
- Premium features (IS_PREMIUM_COMPANY rule stub only)
- Admin dashboard for scoring rules management

## Entity Relationship Diagram

```
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────────────┐
│     events      │     │    applications       │     │      profiles       │
├─────────────────┤     ├──────────────────────┤     ├─────────────────────┤
│ id (PK)         │────<│ event_id (FK)        │     │ id (PK)             │
│ profile_id (FK) │     │ applicant_profile_id │>────│ user_id (FK)        │
│ title           │     │   (FK)               │     │ name                │
│ slug            │     │ cover_letter         │     │ location_id (FK)    │
│ ...             │     │ portfolio_urls       │     │ ...                 │
└─────────────────┘     │ status               │     └─────────────────────┘
                        │ score                │
                        │ created_at           │
                        │ updated_at           │
                        └──────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
         ┌──────────────────┐    ┌──────────────────────┐
         │ application_     │    │ publication_         │
         │ scores           │    │ scoring_rules        │
         ├──────────────────┤    ├──────────────────────┤
         │ id (PK)          │    │ id (PK)              │
         │ application_id   │    │ event_id (FK)        │
         │   (FK)           │    │ rule_type (ENUM)     │
         │ total_score      │    │ weight (integer)     │
         │ max_possible     │    │ config (jsonb)       │
         │ computed_at      │    │ created_at           │
         └──────────────────┘    └──────────────────────┘
                    │
         ┌──────────────────────┐
         │ application_score_   │
         │ breakdown            │
         ├──────────────────────┤
         │ id (PK)              │
         │ score_id (FK)        │
         │ rule_type (ENUM)     │
         │ points_earned        │
         │ points_possible      │
         │ reason               │
         └──────────────────────┘
```

## Business Rules

1. **One application per company per event**: UNIQUE(event_id, applicant_profile_id)
2. **Duplicate detection**: Before creating, check if application exists → throw APPLICATION_ALREADY_EXISTS
3. **Scoring**: Optional per event. If no rules defined, applications have no score.
4. **Status flow**: pending → reviewing → accepted/rejected (managed by event organizer)

## Error Handling

```json
{
  "success": false,
  "error": {
    "code": "APPLICATION_ALREADY_EXISTS",
    "message": "Ya existe una postulación activa para este evento."
  }
}
```

## Migration Plan

1. Create new tables (applications, publication_scoring_rules, application_scores, application_score_breakdown)
2. Add ENUM type for rule_type
3. Data migration: Existing event-related contactRequests remain as-is (backward compatible)
4. No destructive changes to existing tables
