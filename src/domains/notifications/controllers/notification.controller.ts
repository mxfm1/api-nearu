import type { Request, Response, NextFunction } from 'express';
import type { IListNotificationsUseCase } from '../use-cases/list-notifications.use-case';
import type { IMarkNotificationReadUseCase, IMarkAllNotificationsReadUseCase } from '../use-cases/mark-read.use-case';
import type { IGetNotificationSettingsUseCase } from '../use-cases/get-settings.use-case';
import type { IUpdateNotificationSettingsUseCase } from '../use-cases/update-settings.use-case';

export type IListNotificationsController = ReturnType<typeof listNotificationsController>;
export type IMarkNotificationReadController = ReturnType<typeof markNotificationReadController>;
export type IMarkAllNotificationsReadController = ReturnType<typeof markAllNotificationsReadController>;
export type IGetNotificationSettingsController = ReturnType<typeof getNotificationSettingsController>;
export type IUpdateNotificationSettingsController = ReturnType<typeof updateNotificationSettingsController>;

export const listNotificationsController =
  (listNotificationsUseCase: IListNotificationsUseCase) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authUser = (req as any).user;
      const notifications = await listNotificationsUseCase(authUser.id);
      res.json({ success: true, data: notifications });
    } catch (error) {
      next(error);
    }
  };

export const markNotificationReadController =
  (markNotificationReadUseCase: IMarkNotificationReadUseCase) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authUser = (req as any).user;
      const notification = await markNotificationReadUseCase(req.params.id as string, authUser.id);
      res.json({ success: true, data: notification });
    } catch (error) {
      next(error);
    }
  };

export const markAllNotificationsReadController =
  (markAllNotificationsReadUseCase: IMarkAllNotificationsReadUseCase) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authUser = (req as any).user;
      await markAllNotificationsReadUseCase(authUser.id);
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  };

export const getNotificationSettingsController =
  (getNotificationSettingsUseCase: IGetNotificationSettingsUseCase) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authUser = (req as any).user;
      const settings = await getNotificationSettingsUseCase(authUser.id);
      res.json({ success: true, data: settings });
    } catch (error) {
      next(error);
    }
  };

export const updateNotificationSettingsController =
  (updateNotificationSettingsUseCase: IUpdateNotificationSettingsUseCase) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authUser = (req as any).user;
      const { emailNotificationsEnabled } = req.body;
      const settings = await updateNotificationSettingsUseCase(authUser.id, emailNotificationsEnabled);
      res.json({ success: true, data: settings });
    } catch (error) {
      next(error);
    }
  };
