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

async function getProfileIdByUserId(userId: string): Promise<string | null> {
  const profile = await db
    .select({ id: profiles.id })
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .limit(1);
  return profile[0]?.id ?? null;
}

export type ICreateEventController = ReturnType<typeof createEventController>;
export type IGetEventController = ReturnType<typeof getEventController>;
export type IUpdateEventController = ReturnType<typeof updateEventController>;
export type IListEventsController = ReturnType<typeof listEventsController>;
export type IDeleteEventController = ReturnType<typeof deleteEventController>;

export const createEventController =
  (createEventUseCase: ICreateEventUseCase) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authUser = (req as any).user;
      const profileId = await getProfileIdByUserId(authUser.id);
      if (!profileId) {
        res.status(400).json({
          success: false,
          error: { code: 'BAD_REQUEST', message: 'Debes crear un perfil de empresa antes de publicar eventos' },
        });
        return;
      }
      const event = await createEventUseCase({
        ...req.body,
        profileId,
        startAt: req.body.startAt ? new Date(req.body.startAt) : null,
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
      const filters = {
        profileId: req.query.profileId as string | undefined,
        categoryId: req.query.categoryId as string | undefined,
        locationId: req.query.locationId as string | undefined,
        eventStatus: req.query.eventStatus as string | undefined,
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
