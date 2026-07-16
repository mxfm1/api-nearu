export interface Application {
  id: string;
  eventId: string;
  applicantProfileId: string;
  coverLetter: string | null;
  portfolioUrls: string[];
  statusId: string;  // FK to statuses table
  createdAt: Date;
  updatedAt: Date;
}

export interface ApplicationWithDetails extends Application {
  eventTitle: string;
  eventStartAt: Date | null;
  eventStatusSlug: string | null;  // from statuses table
  eventStatusName: string | null;   // from statuses table
  applicantName: string | null;
  applicantLogoUrl: string | null;
  regionName: string | null;       // region of the applicant
  organizerProfileName: string | null; // name of the company that created the event
  score?: {
    totalScore: number;
    maxPossible: number;
    computedAt: Date | null;
    breakdown: Array<{
      ruleType: string;
      pointsEarned: number;
      pointsPossible: number;
      reason: string | null;
    }>;
  };
}

// Application status IDs (for reference, not enforced in code)
export const APPLICATION_STATUS_IDS = {
  PENDING: 'application_pending',    // Will be created in DB
  REVIEWING: 'application_reviewing', // Will be created in DB
  APPROVED: 'application_approved',   // Will be created in DB (user used 'accepted' but approved is more standard)
  REJECTED: 'application_rejected',   // Will be created in DB
} as const;

export interface ScoringRule {
  id: string;
  eventId: string;
  ruleType: RuleType;
  weight: number;
  config: Record<string, unknown> | null;
  createdAt: Date;
}

export type RuleType =
  | 'VERIFIED_PROFILE'
  | 'SAME_REGION'
  | 'HAS_WEBSITE'
  | 'ACCOUNT_AGE';

export interface ApplicationScore {
  id: string;
  applicationId: string;
  totalScore: number;
  maxPossible: number;
  computedAt: Date;
}

export interface ScoreBreakdown {
  id: string;
  scoreId: string;
  ruleType: RuleType;
  pointsEarned: number;
  pointsPossible: number;
  reason: string | null;
}

export interface ApplicationScoreWithBreakdown extends ApplicationScore {
  breakdown: ScoreBreakdown[];
}
