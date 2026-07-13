import type { Request, Response, NextFunction } from 'express';
import type { ICreateContactRequestUseCase } from '../use-cases/create-contact-request.use-case';
import type { IGetInboxUseCase } from '../use-cases/get-inbox.use-case';
import type { IGetContactRequestDetailUseCase } from '../use-cases/get-contact-request-detail.use-case';
import type { IUpdateContactRequestStatusUseCase } from '../use-cases/update-contact-request-status.use-case';
import { presentContactRequest, presentContactRequests } from '../presenters/contact-request.presenter';
import { INTENCIONES } from '../validators/contact-request.validator';

export type ICreateContactRequestController = ReturnType<typeof createContactRequestController>;
export type IGetInboxController = ReturnType<typeof getInboxController>;
export type IGetContactRequestDetailController = ReturnType<typeof getContactRequestDetailController>;
export type IUpdateContactRequestStatusController = ReturnType<typeof updateContactRequestStatusController>;

export const createContactRequestController =
  (createContactRequestUseCase: ICreateContactRequestUseCase) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authUser = (req as any).user;
      const { slug, intencion, mensaje, attachments } = req.body;

      const request = await createContactRequestUseCase({
        slug,
        intencion,
        remitenteId: authUser.id,
        mensaje,
        attachments,
      });

      res.status(201).json({ success: true, data: request });
    } catch (error) {
      next(error);
    }
  };

export const getInboxController =
  (getInboxUseCase: IGetInboxUseCase) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authUser = (req as any).user;
      const tipo = req.query.tipo as string | undefined;
      const requests = await getInboxUseCase(authUser.id, tipo);
      res.json({ success: true, data: presentContactRequests(requests) });
    } catch (error) {
      next(error);
    }
  };

export const getContactRequestDetailController =
  (getContactRequestDetailUseCase: IGetContactRequestDetailUseCase) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authUser = (req as any).user;
      const request = await getContactRequestDetailUseCase(req.params.id, authUser.id);
      res.json({ success: true, data: presentContactRequest(request) });
    } catch (error) {
      next(error);
    }
  };

export const updateContactRequestStatusController =
  (updateContactRequestStatusUseCase: IUpdateContactRequestStatusUseCase) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authUser = (req as any).user;
      const request = await updateContactRequestStatusUseCase(req.params.id, authUser.id, req.body.estado);
      res.json({ success: true, data: request });
    } catch (error) {
      next(error);
    }
  };

export const listIntencionesController = (_req: Request, res: Response) => {
  res.json({ success: true, data: INTENCIONES });
};
