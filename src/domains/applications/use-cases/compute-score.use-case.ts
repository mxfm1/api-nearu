import type { ApplicationScoreWithBreakdown, ScoringRule, RuleType } from '../entities/application.entity';
import type { IApplicationsRepository } from '../repositories/applications.repository.interface';
import type { IScoringRulesRepository } from '../repositories/scoring-rules.repository.interface';
import type { IProfilesRepository } from '@/src/domains/profiles/repositories/profiles.repository.interface';
import type { IUsersRepository } from '@/src/domains/users/repositories/users.repository.interface';
import type { IEventsRepository } from '@/src/domains/events/repositories/events.repository.interface';
import { db } from '@/src/shared/database';
import { locations } from '@/src/shared/database/schema';
import { eq } from 'drizzle-orm';

export type IComputeScoreUseCase = ReturnType<typeof computeScoreUseCase>;

export const computeScoreUseCase =
  (
    applicationsRepository: IApplicationsRepository,
    scoringRulesRepository: IScoringRulesRepository,
    profilesRepository: IProfilesRepository,
    usersRepository: IUsersRepository,
    eventsRepository: IEventsRepository,
  ) =>
  async (applicationId: string): Promise<ApplicationScoreWithBreakdown | null> => {
    // Get application
    const application = await applicationsRepository.findById(applicationId);
    if (!application) return null;

    // Get scoring rules for the event
    const rules = await scoringRulesRepository.findByEventId(application.eventId);
    if (rules.length === 0) return null;

    // Get applicant profile
    const profile = await profilesRepository.findById(application.applicantProfileId);
    if (!profile) return null;

    // Get user for emailVerified
    const user = await usersRepository.findById(profile.userId);

    // Get event for location comparison
    const event = await eventsRepository.findById(application.eventId);

    // Evaluate each rule
    const breakdown: Array<{
      ruleType: string;
      pointsEarned: number;
      pointsPossible: number;
      reason?: string | null;
    }> = [];

    let totalScore = 0;
    let maxPossible = 0;

    for (const rule of rules) {
      const result = await evaluateRule(rule, profile, user, event, application);
      breakdown.push(result);
      totalScore += result.pointsEarned;
      maxPossible += result.pointsPossible;
    }

    // Upsert score
    const score = await applicationsRepository.upsertScore({
      applicationId,
      totalScore,
      maxPossible,
      breakdown,
    });

    return score;
  };

async function evaluateRule(
  rule: ScoringRule,
  profile: any,
  user: any,
  event: any,
  application: any
): Promise<{
  ruleType: string;
  pointsEarned: number;
  pointsPossible: number;
  reason?: string | null;
}> {
  const weight = rule.weight;
  let earned = 0;
  let reason: string | null = null;

  switch (rule.ruleType) {
    case 'VERIFIED_PROFILE':
      if (profile.isVerified) {
        earned = weight;
        reason = 'Perfil verificado';
      }
      break;

    case 'SAME_REGION':
      if (profile.regionId && event?.locationId) {
        const eventLocation = await db.select().from(locations).where(eq(locations.id, event.locationId)).limit(1);

        if (eventLocation[0]?.regionId) {
          if (profile.regionId === eventLocation[0].regionId) {
            earned = weight;
            reason = 'Misma región que el evento';
          }
        }
      }
      break;

    case 'HAS_WEBSITE':
      if (profile.website) {
        earned = weight;
        reason = 'Sitio web configurado';
      }
      break;

    case 'ACCOUNT_AGE':
      if (user?.createdAt) {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        if (new Date(user.createdAt) < sixMonthsAgo) {
          earned = weight;
          reason = 'Cuenta con más de 6 meses';
        }
      }
      break;
  }

  return {
    ruleType: rule.ruleType,
    pointsEarned: earned,
    pointsPossible: weight,
    reason,
  };
}
