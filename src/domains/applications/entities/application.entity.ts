export type ApplicationStatus = 'pending' | 'reviewing' | 'accepted' | 'rejected';

export interface Application {
  id: string;
  eventId: string;
  applicantProfileId: string;
  coverLetter: string | null;
  portfolioUrls: string[];
  status: ApplicationStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApplicationWithDetails extends Application {
  eventTitle: string;
  eventStartAt: Date | null;
  eventStatusSlug: string | null;
  applicantName: string | null;
  applicantLogoUrl: string | null;
  locationName: string | null;
}

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
  | 'HAS_PORTFOLIO'
  | 'YEARS_EXPERIENCE'
  | 'HAS_WEBSITE'
  | 'HAS_SOCIAL_LINKS'
  | 'HAS_COMPANY_DESCRIPTION'
  | 'HAS_LOGO'
  | 'HAS_BANNER'
  | 'HAS_PREVIOUS_FEEDBACK'
  | 'AVERAGE_RATING'
  | 'NUMBER_OF_COMPLETED_JOBS'
  | 'NUMBER_OF_COMPLETED_EVENTS'
  | 'HAS_RESPONSE_HISTORY'
  | 'FAST_RESPONSE_TIME'
  | 'IS_PREMIUM_COMPANY'
  | 'CUSTOM_FIELD_MATCH';

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
