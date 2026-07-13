import type { ScoringRule } from '../entities/application.entity';

export interface IScoringRulesRepository {
  findByEventId(eventId: string): Promise<ScoringRule[]>;
  findById(id: string): Promise<ScoringRule | null>;
  create(data: {
    eventId: string;
    ruleType: string;
    weight?: number;
    config?: Record<string, unknown> | null;
  }): Promise<ScoringRule>;
  createMany(data: Array<{
    eventId: string;
    ruleType: string;
    weight?: number;
    config?: Record<string, unknown> | null;
  }>): Promise<ScoringRule[]>;
  delete(id: string): Promise<void>;
  deleteByEventId(eventId: string): Promise<void>;
}
