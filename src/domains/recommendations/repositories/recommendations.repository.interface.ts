import type { RecommendationResult } from '../entities/recommendation.entity';

export interface IRecommendationsRepository {
  findForProfile(profileId: string, limit: number): Promise<RecommendationResult>;
}
