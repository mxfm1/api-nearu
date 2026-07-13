import type { Request, Response, NextFunction } from 'express';
import type { ICreateServiceUseCase } from '../use-cases/create-service.use-case';
import type { IGetServiceUseCase } from '../use-cases/get-service.use-case';
import type { IUpdateServiceUseCase } from '../use-cases/update-service.use-case';
import type { IListServicesUseCase } from '../use-cases/list-services.use-case';
import type { IDeleteServiceUseCase } from '../use-cases/delete-service.use-case';
import type { IServicePortfolioRepository } from '../repositories/service-portfolio.repository.interface';
import { presentService, presentServices } from '../presenters/service.presenter';
import { eq } from 'drizzle-orm';
import { db } from '@/src/shared/database';
import { profiles } from '@/src/shared/database/schema';
import { getMissingFields } from '@/src/domains/profiles/config/profile.constants';

type ProfileCheck =
  | { exists: false }
  | { exists: true; profileId: string; isComplete: boolean; missingFields: string[] };

async function getProfileCheck(userId: string): Promise<ProfileCheck> {
  const result = await db
    .select({
      id: profiles.id,
      name: profiles.name,
      description: profiles.description,
      bannerUrl: profiles.bannerUrl,
      industry: profiles.industry,
      locationId: profiles.locationId,
      website: profiles.website,
      whatsapp: profiles.whatsapp,
    })
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .limit(1);
  const profile = result[0];
  if (!profile) return { exists: false };
  const missingFields = getMissingFields({ ...profile, socialLinks: [] });
  return {
    exists: true,
    profileId: profile.id,
    isComplete: missingFields.length === 0,
    missingFields,
  };
}

export type ICreateServiceController = ReturnType<typeof createServiceController>;
export type IGetServiceController = ReturnType<typeof getServiceController>;
export type IUpdateServiceController = ReturnType<typeof updateServiceController>;
export type IListServicesController = ReturnType<typeof listServicesController>;
export type IDeleteServiceController = ReturnType<typeof deleteServiceController>;
export type IAddPortfolioItemController = ReturnType<typeof addPortfolioItemController>;
export type IDeletePortfolioItemController = ReturnType<typeof deletePortfolioItemController>;
export type IMyServicesController = ReturnType<typeof myServicesController>;

export const createServiceController =
  (createServiceUseCase: ICreateServiceUseCase) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authUser = (req as any).user;
      const profile = await getProfileCheck(authUser.id);
      if (!profile.exists) {
        res.status(400).json({ success: false, errorCode: 'BAD_REQUEST' });
        return;
      }
      if (!profile.isComplete) {
        res.status(400).json({ success: false, errorCode: 'PROFILE_INCOMPLETE' });
        return;
      }
      const service = await createServiceUseCase({ ...req.body, profileId: profile.profileId });
      res.status(201).json({ success: true, data: service });
    } catch (error) {
      next(error);
    }
  };

export const getServiceController =
  (getServiceUseCase: IGetServiceUseCase) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const service = await getServiceUseCase(req.params.slugOrId);
      res.json({ success: true, data: presentService(service) });
    } catch (error) {
      next(error);
    }
  };

export const updateServiceController =
  (updateServiceUseCase: IUpdateServiceUseCase) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authUser = (req as any).user;
      const service = await updateServiceUseCase(req.params.id, authUser.id, req.body);
      res.json({ success: true, data: service });
    } catch (error) {
      next(error);
    }
  };

export const listServicesController =
  (listServicesUseCase: IListServicesUseCase) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters: Record<string, string | undefined> = {
        profileId: req.query.profileId as string | undefined,
        categoryId: req.query.categoryId as string | undefined,
        locationId: req.query.locationId as string | undefined,
        status: 'published',
        search: req.query.search as string | undefined,
      };

      const services = await listServicesUseCase(filters);
      res.json({ success: true, data: presentServices(services) });
    } catch (error) {
      next(error);
    }
  };

export const deleteServiceController =
  (deleteServiceUseCase: IDeleteServiceUseCase) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authUser = (req as any).user;
      await deleteServiceUseCase(req.params.id, authUser.id);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  };

export const addPortfolioItemController =
  (servicePortfolioRepository: IServicePortfolioRepository) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = await servicePortfolioRepository.create({
        serviceId: req.params.id,
        url: req.body.url,
        title: req.body.title,
        description: req.body.description,
        orden: req.body.orden,
      });
      res.status(201).json({ success: true, data: item });
    } catch (error) {
      next(error);
    }
  };

export const deletePortfolioItemController =
  (servicePortfolioRepository: IServicePortfolioRepository) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await servicePortfolioRepository.delete(req.params.portfolioId);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  };

export const myServicesController =
  (listServicesUseCase: IListServicesUseCase) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authUser = (req as any).user;
      const profile = await getProfileCheck(authUser.id);
      if (!profile.exists) {
        res.status(400).json({ success: false, errorCode: 'BAD_REQUEST' });
        return;
      }

      const services = await listServicesUseCase({ profileId: profile.profileId });
      res.json({ success: true, data: presentServices(services) });
    } catch (error) {
      next(error);
    }
  };
