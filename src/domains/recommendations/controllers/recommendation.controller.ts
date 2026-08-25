import type { NextFunction, Request, Response } from 'express';
import type { IGetRecommendationsUseCase } from '../use-cases/get-recommendations.use-case';

export type IGetRecommendationsController = ReturnType<typeof getRecommendationsController>;

export const getRecommendationsController = (useCase: IGetRecommendationsUseCase) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      const limit = typeof req.query.limit === 'string' ? Number(req.query.limit) : 12;
      const data = await useCase(user.id, Number.isFinite(limit) ? limit : 12);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };
