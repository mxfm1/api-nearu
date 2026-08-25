import { NotFoundError } from '@/src/shared/errors/common';
import type { IProfilesRepository } from '@/src/domains/profiles/repositories/profiles.repository.interface';
import type { RecommendationResult } from '../entities/recommendation.entity';
import type { IRecommendationsRepository } from '../repositories/recommendations.repository.interface';

export type IGetRecommendationsUseCase = ReturnType<typeof getRecommendationsUseCase>;

export const getRecommendationsUseCase = (
  profilesRepository: IProfilesRepository,
  recommendationsRepository: IRecommendationsRepository,
) => async (userId: string, limit = 12): Promise<RecommendationResult> => {
  const profile = await profilesRepository.findByUserId(userId);
  if (!profile) throw new NotFoundError('Profile');
  return recommendationsRepository.findForProfile(profile.id, Math.min(Math.max(limit, 1), 50));
};
