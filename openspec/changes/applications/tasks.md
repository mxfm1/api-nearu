# Tasks: Applications (Event Postulation System)

## Phase 1: Database Schema (Foundation)

- [x] 1.1 Add ENUM type `rule_type` to schema.ts with all 17 values
- [x] 1.2 Add `applications` table to schema.ts with UNIQUE constraint
- [x] 1.3 Add `publicationScoringRules` table to schema.ts
- [x] 1.4 Add `applicationScores` table to schema.ts
- [x] 1.5 Add `applicationScoreBreakdown` table to schema.ts
- [x] 1.6 Add Drizzle relations for all new tables
- [x] 1.7 Add error class `ApplicationAlreadyExistsError` to common.ts

## Phase 2: Entity Layer

- [x] 2.1 Create `application.entity.ts` with Application, ApplicationWithDetails interfaces
- [x] 2.2 Create `scoring-rule.entity.ts` with ScoringRule, RuleType enum
- [x] 2.3 Create `application-score.entity.ts` with ApplicationScore, ScoreBreakdown interfaces

## Phase 3: Repository Layer

- [x] 3.1 Create `applications.repository.interface.ts` with IApplicationsRepository
- [x] 3.2 Create `applications.repository.ts` implementing Drizzle queries
- [x] 3.3 Create `scoring-rules.repository.interface.ts` with IScoringRulesRepository
- [x] 3.4 Create `scoring-rules.repository.ts` implementing Drizzle queries

## Phase 4: Use Cases

- [x] 4.1 Create `create-application.use-case.ts` with duplicate detection
- [x] 4.2 Create `get-application.use-case.ts` with authorization check
- [x] 4.3 Create `list-event-applications.use-case.ts` for event owners
- [x] 4.4 Create `list-my-applications.use-case.ts` for applicants
- [x] 4.5 Create `update-application-status.use-case.ts` with state validation
- [x] 4.6 Create `compute-score.use-case.ts` for score calculation

## Phase 5: Controller & Validator Layers

- [x] 5.1 Create `application.validator.ts` with Zod schemas
- [x] 5.2 Create `application.controller.ts` with CRUD handlers
- [x] 5.3 Create `application.presenter.ts` for response formatting

## Phase 6: DI & Routes

- [x] 6.1 Add DI symbols to `di/types.ts`
- [x] 6.2 Bind repositories and use cases in `di/container.ts`
- [x] 6.3 Add routes to `src/presentation/routes/index.ts`

## Phase 7: Verification

- [x] 7.1 Run `npx tsc --noEmit` to verify type correctness (0 new errors introduced)
- [x] 7.2 Verify all imports resolve correctly
