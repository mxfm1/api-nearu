import type { ScoringRule } from '../entities/application.entity';
import type { IScoringRulesRepository } from '../repositories/scoring-rules.repository.interface';
import type { IEventsRepository } from '@/src/domains/events/repositories/events.repository.interface';
import { NotFoundError, ForbiddenError, EmptyScoringRulesError } from '@/src/shared/errors/common';

export type ICreateScoringRulesUseCase = ReturnType<typeof createScoringRulesUseCase>;

export const createScoringRulesUseCase =
  (
    scoringRulesRepository: IScoringRulesRepository,
    eventsRepository: IEventsRepository,
  ) =>
  async (
    eventId: string,
    userId: string,
    rules: Array<{
      ruleType: string;
      weight?: number;
      config?: Record<string, unknown> | null;
    }>
  ): Promise<ScoringRule[]> => {
    // Verify event exists
    const event = await eventsRepository.findById(eventId);
    if (!event) {
      throw new NotFoundError('Evento no encontrado');
    }

    // Verify user owns the event
    if (event.profileId !== userId) {
      throw new ForbiddenError('No tienes permiso para modificar las reglas de este evento');
    }

    // Validate rules array is not empty
    if (!rules || rules.length === 0) {
      throw new EmptyScoringRulesError();
    }

    // Delete existing rules for this event
    await scoringRulesRepository.deleteByEventId(eventId);

    // Create new rules
    const rulesWithEventId = rules.map((rule) => ({
      eventId,
      ruleType: rule.ruleType,
      weight: rule.weight,
      config: rule.config,
    }));

    const createdRules = await scoringRulesRepository.createMany(rulesWithEventId);

    return createdRules;
  };
