import type { Application, ApplicationWithDetails, ApplicationScoreWithBreakdown } from '../entities/application.entity';

export interface IApplicationsRepository {
  findById(id: string): Promise<ApplicationWithDetails | null>;
  findByEventAndProfile(eventId: string, applicantProfileId: string): Promise<Application | null>;
  findByEventId(eventId: string, options?: { status?: string }): Promise<ApplicationWithDetails[]>;
  findByEventIdWithScoreDetails(eventId: string, options?: { status?: string }): Promise<ApplicationWithDetails[]>;
  findByApplicantProfileId(applicantProfileId: string): Promise<ApplicationWithDetails[]>;
  create(data: {
    eventId: string;
    applicantProfileId: string;
    coverLetter?: string | null;
    portfolioUrls?: string[];
    statusId?: string;
  }): Promise<Application>;
  updateStatus(id: string, statusId: string): Promise<Application>;
  findScoreByApplicationId(applicationId: string): Promise<ApplicationScoreWithBreakdown | null>;
  upsertScore(data: {
    applicationId: string;
    totalScore: number;
    maxPossible: number;
    breakdown: Array<{
      ruleType: string;
      pointsEarned: number;
      pointsPossible: number;
      reason?: string | null;
    }>;
  }): Promise<ApplicationScoreWithBreakdown>;
}
