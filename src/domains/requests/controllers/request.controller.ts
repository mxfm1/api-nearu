import type { NextFunction, Request, Response } from 'express';
import type { ICreateRequestUseCase } from '../use-cases/create-request.use-case';
import type { IListRequestsUseCase } from '../use-cases/list-requests.use-case';
import type { IListMyRequestsUseCase } from '../use-cases/list-my-requests.use-case';
import type { IUpdateRequestStatusUseCase } from '../use-cases/update-request-status.use-case';
import type { IGetProfileVerificationChecklistUseCase } from '../use-cases/get-profile-verification-checklist.use-case';
import { presentRequest, presentRequests } from '../presenters/request.presenter';

export type ICreateRequestController = ReturnType<typeof createRequestController>;
export type IListRequestsController = ReturnType<typeof listRequestsController>;
export type IListMyRequestsController = ReturnType<typeof listMyRequestsController>;
export type IUpdateRequestStatusController = ReturnType<typeof updateRequestStatusController>;
export type IGetProfileVerificationChecklistController = ReturnType<typeof getProfileVerificationChecklistController>;

export const createRequestController = (useCase: ICreateRequestUseCase) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      const request = await useCase({ userId: user.id, ...req.body });
      res.status(201).json({ success: true, data: presentRequest(request) });
    } catch (error) {
      next(error);
    }
  };

export const listRequestsController = (useCase: IListRequestsUseCase) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const status = typeof req.query.status === 'string' ? req.query.status as any : undefined;
      const requests = await useCase(status);
      res.json({ success: true, data: presentRequests(requests) });
    } catch (error) {
      next(error);
    }
  };

export const listMyRequestsController = (useCase: IListMyRequestsUseCase) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      const status = typeof req.query.status === 'string' ? req.query.status as any : undefined;
      const requests = await useCase(user.id, status);
      res.json({ success: true, data: presentRequests(requests) });
    } catch (error) {
      next(error);
    }
  };

export const updateRequestStatusController = (useCase: IUpdateRequestStatusUseCase) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      const request = await useCase({
        requestId: String(req.params.id),
        reviewerUserId: user.id,
        status: req.body.status,
        comment: req.body.comment,
      });
      res.json({ success: true, data: presentRequest(request) });
    } catch (error) {
      next(error);
    }
  };

export const getProfileVerificationChecklistController = (useCase: IGetProfileVerificationChecklistUseCase) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      const checklist = await useCase(user.id);
      res.json({ success: true, data: checklist });
    } catch (error) {
      next(error);
    }
  };
