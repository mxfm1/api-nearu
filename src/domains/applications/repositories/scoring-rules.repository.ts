import { eq, desc } from 'drizzle-orm';
import { db } from '@/src/shared/database';
import { publicationScoringRules } from '@/src/shared/database/schema';
import type { IScoringRulesRepository } from './scoring-rules.repository.interface';
import type { ScoringRule } from '../entities/application.entity';

export class ScoringRulesRepository implements IScoringRulesRepository {
  async findByEventId(eventId: string): Promise<ScoringRule[]> {
    try {
      const result = await db
        .select()
        .from(publicationScoringRules)
        .where(eq(publicationScoringRules.eventId, eventId))
        .orderBy(desc(publicationScoringRules.createdAt));

      return result as ScoringRule[];
    } catch (error) {
      console.error('[ScoringRulesRepository.findByEventId] Error:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<ScoringRule | null> {
    try {
      const result = await db
        .select()
        .from(publicationScoringRules)
        .where(eq(publicationScoringRules.id, id))
        .limit(1);

      if (!result[0]) return null;
      return result[0] as ScoringRule;
    } catch (error) {
      console.error('[ScoringRulesRepository.findById] Error:', error);
      throw error;
    }
  }

  async create(data: {
    eventId: string;
    ruleType: string;
    weight?: number;
    config?: Record<string, unknown> | null;
  }): Promise<ScoringRule> {
    try {
      const result = await db
        .insert(publicationScoringRules)
        .values({
          id: crypto.randomUUID(),
          eventId: data.eventId,
          ruleType: data.ruleType as any,
          weight: data.weight ?? 1,
          config: data.config ?? null,
        })
        .returning();
      return result[0] as ScoringRule;
    } catch (error) {
      console.error('[ScoringRulesRepository.create] Error:', error);
      throw error;
    }
  }

  async createMany(data: Array<{
    eventId: string;
    ruleType: string;
    weight?: number;
    config?: Record<string, unknown> | null;
  }>): Promise<ScoringRule[]> {
    try {
      const values = data.map((item) => ({
        id: crypto.randomUUID(),
        eventId: item.eventId,
        ruleType: item.ruleType as any,
        weight: item.weight ?? 1,
        config: item.config ?? null,
      }));

      const result = await db
        .insert(publicationScoringRules)
        .values(values)
        .returning();

      return result as ScoringRule[];
    } catch (error) {
      console.error('[ScoringRulesRepository.createMany] Error:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await db
        .delete(publicationScoringRules)
        .where(eq(publicationScoringRules.id, id));
    } catch (error) {
      console.error('[ScoringRulesRepository.delete] Error:', error);
      throw error;
    }
  }

  async deleteByEventId(eventId: string): Promise<void> {
    try {
      await db
        .delete(publicationScoringRules)
        .where(eq(publicationScoringRules.eventId, eventId));
    } catch (error) {
      console.error('[ScoringRulesRepository.deleteByEventId] Error:', error);
      throw error;
    }
  }
}
