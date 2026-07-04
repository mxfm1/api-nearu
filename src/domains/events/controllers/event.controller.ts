import type { Request, Response, NextFunction } from 'express';
import type { ICreateEventUseCase } from '../use-cases/create-event.use-case';
import type { IGetEventUseCase } from '../use-cases/get-event.use-case';
import type { IUpdateEventUseCase } from '../use-cases/update-event.use-case';
import type { IListEventsUseCase } from '../use-cases/list-events.use-case';
import type { IDeleteEventUseCase } from '../use-cases/delete-event.use-case';
import { presentEvent, presentEvents } from '../presenters/event.presenter';
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
      location: profiles.location,
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

export type ICreateEventController = ReturnType<typeof createEventController>;
export type IGetEventController = ReturnType<typeof getEventController>;
export type IUpdateEventController = ReturnType<typeof updateEventController>;
export type IListEventsController = ReturnType<typeof listEventsController>;
export type IDeleteEventController = ReturnType<typeof deleteEventController>;
export type IMyEventsController = ReturnType<typeof myEventsController>;
export type IGetMyEventController = ReturnType<typeof getMyEventController>;

export const createEventController =
  (createEventUseCase: ICreateEventUseCase) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authUser = (req as any).user;
      const profile = await getProfileCheck(authUser.id);
      if (!profile.exists) {
        res.status(400).json({
          success: false,
          error: { code: 'BAD_REQUEST', message: 'Debes crear un perfil de empresa antes de publicar eventos' },
        });
        return;
      }
      if (!profile.isComplete) {
        res.status(400).json({
          success: false,
          error: {
            code: 'PROFILE_INCOMPLETE',
            message: 'Completá tu perfil antes de publicar eventos',
            missingFields: profile.missingFields,
          },
        });
        return;
      }
      const event = await createEventUseCase({
        ...req.body,
        profileId: profile.profileId,
      });
      res.status(201).json({ success: true, data: event });
    } catch (error) {
      next(error);
    }
  };

export const getEventController =
  (getEventUseCase: IGetEventUseCase) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const event = await getEventUseCase(req.params.slugOrId);
      res.json({ success: true, data: presentEvent(event) });
    } catch (error) {
      next(error);
    }
  };

export const updateEventController =
  (updateEventUseCase: IUpdateEventUseCase) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authUser = (req as any).user;
      const event = await updateEventUseCase(req.params.id, authUser.id, req.body);
      res.json({ success: true, data: event });
    } catch (error) {
      next(error);
    }
  };

export const listEventsController =
  (listEventsUseCase: IListEventsUseCase) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters: Record<string, string | boolean | undefined> = {
        profileId: req.query.profileId as string | undefined,
        categoryId: req.query.categoryId as string | undefined,
        locationId: req.query.locationId as string | undefined,
        eventStatus: 'published',
        search: req.query.search as string | undefined,
        upcoming: req.query.upcoming === 'true',
      };

      const events = await listEventsUseCase(filters);
      res.json({ success: true, data: presentEvents(events) });
    } catch (error) {
      next(error);
    }
  };

export const deleteEventController =
  (deleteEventUseCase: IDeleteEventUseCase) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authUser = (req as any).user;
      await deleteEventUseCase(req.params.id, authUser.id);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  };

export const myEventsController =
  (listEventsUseCase: IListEventsUseCase) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authUser = (req as any).user;
      const profile = await getProfileCheck(authUser.id);
      if (!profile.exists) {
        res.status(400).json({
          success: false,
          error: { code: 'BAD_REQUEST', message: 'Debes crear un perfil de empresa antes de publicar eventos' },
        });
        return;
      }

      const events = await listEventsUseCase({ profileId: profile.profileId });
      res.json({ success: true, data: presentEvents(events) });
    } catch (error) {
      next(error);
    }
  };

export const getMyEventController =
  (getEventUseCase: IGetEventUseCase) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authUser = (req as any).user;
      const profile = await getProfileCheck(authUser.id);
      if (!profile.exists) {
        res.status(400).json({
          success: false,
          error: { code: 'BAD_REQUEST', message: 'Debes crear un perfil de empresa' },
        });
        return;
      }

      const event = await getEventUseCase(req.params.id);
      if (event.profileId !== profile.profileId) {
        res.status(403).json({
          success: false,
          error: { code: 'FORBIDDEN', message: 'No tienes permiso para ver este evento' },
        });
        return;
      }

      res.json({ success: true, data: presentEvent(event) });
    } catch (error) {
      next(error);
    }
  };
