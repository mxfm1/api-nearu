import type { Request, Response, NextFunction } from 'express';
import type { IGetProfileUseCase } from '../use-cases/get-profile.use-case';
import type { IUpsertProfileUseCase } from '../use-cases/upsert-profile.use-case';
import { presentProfile } from '../presenters/profile.presenter';

export type IGetProfileController = ReturnType<typeof getProfileController>;
export type IUpsertProfileController = ReturnType<typeof upsertProfileController>;

export const getProfileController =
  (getProfileUseCase: IGetProfileUseCase) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.params.userId as string;
      const profile = await getProfileUseCase(userId);
      res.json({ success: true, data: presentProfile(profile) });
    } catch (error) {
      next(error);
    }
  };

export const upsertProfileController =
  (upsertProfileUseCase: IUpsertProfileUseCase) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authUser = (req as any).user;
      const profile = await upsertProfileUseCase({
        userId: authUser.id,
        ...req.body,
      });
      res.json({ success: true, data: presentProfile(profile) });
    } catch (error) {
      next(error);
    }
  };
