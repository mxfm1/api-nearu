import type { Request, Response, NextFunction } from 'express';
import type { IGetProfileUseCase } from '../use-cases/get-profile.use-case';
import type { IUpsertProfileUseCase } from '../use-cases/upsert-profile.use-case';
import type { IListProfilesUseCase } from '../use-cases/list-profiles.use-case';
import { presentProfile } from '../presenters/profile.presenter';

export type IGetProfileController = ReturnType<typeof getProfileController>;
export type IUpsertProfileController = ReturnType<typeof upsertProfileController>;
export type IListProfilesController = ReturnType<typeof listProfilesController>;

export const listProfilesController = (listProfilesUseCase: IListProfilesUseCase) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const profiles = await listProfilesUseCase({
        search: req.query.search as string | undefined,
        regionId: req.query.regionId as string | undefined,
        categoryId: req.query.categoryId as string | undefined,
        verified: req.query.verified === undefined ? undefined : req.query.verified === 'true',
        employeesMin: req.query.employeesMin ? Number(req.query.employeesMin) : undefined,
        employeesMax: req.query.employeesMax ? Number(req.query.employeesMax) : undefined,
        sort: req.query.sort as 'relevance' | 'newest' | 'oldest' | undefined,
      });
      res.json({ success: true, data: profiles.map(presentProfile) });
    } catch (error) {
      next(error);
    }
  };

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
