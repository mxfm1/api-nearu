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
      if (user?.emailVerified) {
        earned = weight;
        reason = 'Perfil verificado';
      }
      break;

    case 'SAME_REGION':
      if (profile.locationId && event?.locationId) {
        // Get region IDs from locations
        const profileLocation = await db.select().from(locations).where(eq(locations.id, profile.locationId)).limit(1);
        const eventLocation = await db.select().from(locations).where(eq(locations.id, event.locationId)).limit(1);
        
        if (profileLocation[0]?.regionId && eventLocation[0]?.regionId) {
          if (profileLocation[0].regionId === eventLocation[0].regionId) {
            earned = weight;
            reason = 'Misma región que el evento';
          }
        }
      }
      break;

    case 'HAS_PORTFOLIO':
      // Portfolio is stored in service_portfolio, not directly on profile
      // For simplicity, check if profile has any services (could be enhanced)
      earned = 0; // Would need to check service_portfolio table
      reason = 'Requiere verificación de portafolio';
      break;

    case 'YEARS_EXPERIENCE':
      // Would need to check a yearsExperience field on profile or services
      earned = 0;
      reason = 'Requiere campo de años de experiencia';
      break;

    case 'HAS_WEBSITE':
      if (profile.website) {
        earned = weight;
        reason = 'Sitio web configurado';
      }
      break;

    case 'HAS_SOCIAL_LINKS':
      if (profile.socialLinks && profile.socialLinks.length > 0) {
        earned = weight;
        reason = `${profile.socialLinks.length} redes sociales configuradas`;
      }
      break;

    case 'HAS_COMPANY_DESCRIPTION':
      if (profile.description && profile.description.length >= 50) {
        earned = weight;
        reason = 'Descripción empresarial completa';
      }
      break;

    case 'HAS_LOGO':
      if (profile.logoUrl) {
        earned = weight;
        reason = 'Logo configurado';
      }
      break;

    case 'HAS_BANNER':
      if (profile.bannerUrl) {
        earned = weight;
        reason = 'Banner configurado';
      }
      break;

    case 'HAS_PREVIOUS_FEEDBACK':
      // Would need to check reviews/feedback table
      earned = 0;
      reason = 'Requiere historial de feedback';
      break;

    case 'AVERAGE_RATING':
      // Would need to check reviews/feedback table
      earned = 0;
      reason = 'Requiere cálculo de calificación promedio';
      break;

    case 'NUMBER_OF_COMPLETED_JOBS':
      // Would need to check completed services/jobs
      earned = 0;
      reason = 'Requiere conteo de trabajos completados';
      break;

    case 'NUMBER_OF_COMPLETED_EVENTS':
      // Would need to check completed events
      earned = 0;
      reason = 'Requiere conteo de eventos completados';
      break;

    case 'HAS_RESPONSE_HISTORY':
      // Would need to check message response rates
      earned = 0;
      reason = 'Requiere historial de respuestas';
      break;

    case 'FAST_RESPONSE_TIME':
      // Would need to check average response time
      earned = 0;
      reason = 'Requiere cálculo de tiempo de respuesta';
      break;

    case 'IS_PREMIUM_COMPANY':
      // Premium feature stub
      earned = 0;
      reason = 'Funcionalidad premium (próximamente)';
      break;

    case 'CUSTOM_FIELD_MATCH':
      // Would need to evaluate custom config against application data
      if (rule.config) {
        earned = 0;
        reason = 'Requiere evaluación de campos personalizados';
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
