import type { ApplicationWithDetails, ApplicationScoreWithBreakdown } from '../entities/application.entity';

// Map statusId (UUID) to slug for API response - fallback only
const STATUS_TO_SLUG: Record<string, string> = {
  '10000000-0000-0000-0000-000000000001': 'pending',
  '10000000-0000-0000-0000-000000000002': 'reviewing',
  '10000000-0000-0000-0000-000000000003': 'accepted',
  '10000000-0000-0000-0000-000000000004': 'rejected',
};

export function presentApplication(application: ApplicationWithDetails & { score?: ApplicationScoreWithBreakdown }) {
  // Use real status from DB, fallback to mapped value
  const statusSlug = application.eventStatusSlug ?? STATUS_TO_SLUG[application.statusId] ?? 'pending';
  const statusName = application.eventStatusName ?? 'Desconocido';

  // Calculate percentage
  const scorePercentage = application.score && application.score.maxPossible > 0
    ? Math.round((application.score.totalScore / application.score.maxPossible) * 100)
    : null;

  return {
    id: application.id,
    eventId: application.eventId,
    applicantProfileId: application.applicantProfileId,
    coverLetter: application.coverLetter,
    portfolioUrls: application.portfolioUrls,
    statusId: application.statusId,
    status: statusSlug,
    statusName: statusName,
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
      industry: application.applicantIndustry,
    },
    organizerProfileName: application.organizerProfileName,
    region: application.regionName,
    score: application.score
      ? {
          totalScore: application.score.totalScore,
          maxPossible: application.score.maxPossible,
          percentage: scorePercentage,
          computedAt: application.score.computedAt,
          breakdown: application.score.breakdown.map((b) => ({
            ruleType: b.ruleType,
            pointsEarned: b.pointsEarned,
            pointsPossible: b.pointsPossible,
            percentage: b.pointsPossible > 0
              ? Math.round((b.pointsEarned / b.pointsPossible) * 100)
              : 0,
            reason: b.reason,
          })),
        }
      : undefined,
  };
}

export function presentApplications(applications: ApplicationWithDetails[]) {
  return applications.map((app) => presentApplication(app));
}
