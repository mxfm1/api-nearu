import type { ApplicationWithDetails, ApplicationScoreWithBreakdown } from '../entities/application.entity';

export function presentApplication(application: ApplicationWithDetails & { score?: ApplicationScoreWithBreakdown }) {
  return {
    id: application.id,
    eventId: application.eventId,
    applicantProfileId: application.applicantProfileId,
    coverLetter: application.coverLetter,
    portfolioUrls: application.portfolioUrls,
    status: application.status,
    createdAt: application.createdAt,
    updatedAt: application.updatedAt,
    event: {
      title: application.eventTitle,
      startAt: application.eventStartAt,
      statusSlug: application.eventStatusSlug,
    },
    applicantProfile: {
      name: application.applicantName,
      logoUrl: application.applicantLogoUrl,
    },
    locationName: application.locationName,
    score: application.score
      ? {
          totalScore: application.score.totalScore,
          maxPossible: application.score.maxPossible,
          computedAt: application.score.computedAt,
          breakdown: application.score.breakdown.map((b) => ({
            ruleType: b.ruleType,
            pointsEarned: b.pointsEarned,
            pointsPossible: b.pointsPossible,
            reason: b.reason,
          })),
        }
      : undefined,
  };
}

export function presentApplications(applications: ApplicationWithDetails[]) {
  return applications.map((app) => presentApplication(app));
}
