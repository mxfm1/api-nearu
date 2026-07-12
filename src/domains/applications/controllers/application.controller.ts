import type { Request, Response, NextFunction } from 'express';
import type { ICreateApplicationUseCase } from '../use-cases/create-application.use-case';
import type { IGetApplicationUseCase } from '../use-cases/get-application.use-case';
import type { IListEventApplicationsUseCase } from '../use-cases/list-event-applications.use-case';
import type { IListMyApplicationsUseCase } from '../use-cases/list-my-applications.use-case';
import type { IUpdateApplicationStatusUseCase } from '../use-cases/update-application-status.use-case';
import type { ICreateScoringRulesUseCase } from '../use-cases/create-scoring-rules.use-case';
import type { IScoringRulesRepository } from '../repositories/scoring-rules.repository.interface';
import type { IEventsRepository } from '@/src/domains/events/repositories/events.repository.interface';
import type { IProfilesRepository } from '@/src/domains/profiles/repositories/profiles.repository.interface';
import { presentApplication, presentApplications } from '../presenters/application.presenter';
import { NotFoundError } from '@/src/shared/errors/common';

export type ICreateApplicationController = ReturnType<typeof createApplicationController>;
export type IGetApplicationController = ReturnType<typeof getApplicationController>;
export type IListEventApplicationsController = ReturnType<typeof listEventApplicationsController>;
export type IListMyApplicationsController = ReturnType<typeof listMyApplicationsController>;
export type IUpdateApplicationStatusController = ReturnType<typeof updateApplicationStatusController>;
export type IListScoringRulesController = ReturnType<typeof listScoringRulesController>;
export type ICreateScoringRulesController = ReturnType<typeof createScoringRulesController>;

export const createApplicationController =
  (createApplicationUseCase: ICreateApplicationUseCase, profilesRepository: IProfilesRepository) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authUser = (req as any).user;
      const { eventId, coverLetter, portfolioUrls } = req.body;

      // Get user's profile
      const profile = await profilesRepository.findByUserId(authUser.id);
      if (!profile) {
        throw new NotFoundError('Perfil no encontrado');
      }

      const application = await createApplicationUseCase({
        eventId,
        applicantProfileId: profile.id,
        coverLetter,
        portfolioUrls,
      });

      res.status(201).json({ success: true, data: application });
    } catch (error) {
      next(error);
    }
  };

export const getApplicationController =
  (getApplicationUseCase: IGetApplicationUseCase) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authUser = (req as any).user;
      const application = await getApplicationUseCase(req.params.id, authUser.id);
      res.json({ success: true, data: presentApplication(application) });
    } catch (error) {
      next(error);
    }
  };

export const listEventApplicationsController =
  (listEventApplicationsUseCase: IListEventApplicationsUseCase) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authUser = (req as any).user;
      const applications = await listEventApplicationsUseCase(req.params.eventId, authUser.id);
      res.json({ success: true, data: presentApplications(applications) });
    } catch (error) {
      next(error);
    }
  };

export const listMyApplicationsController =
  (listMyApplicationsUseCase: IListMyApplicationsUseCase) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authUser = (req as any).user;
      const applications = await listMyApplicationsUseCase(authUser.id);
      res.json({ success: true, data: presentApplications(applications) });
    } catch (error) {
      next(error);
    }
  };

export const updateApplicationStatusController =
  (updateApplicationStatusUseCase: IUpdateApplicationStatusUseCase) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authUser = (req as any).user;
      const { status } = req.body;
      const application = await updateApplicationStatusUseCase(req.params.id, authUser.id, status);
      res.json({ success: true, data: application });
    } catch (error) {
      next(error);
    }
  };

export const listScoringRulesController =
  (scoringRulesRepository: IScoringRulesRepository, eventsRepository: IEventsRepository) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { eventId } = req.params;

      const event = await eventsRepository.findById(eventId);
      if (!event) {
        throw new NotFoundError('Evento no encontrado');
      }

      const rules = await scoringRulesRepository.findByEventId(eventId);
      res.json({ success: true, data: rules });
    } catch (error) {
      next(error);
    }
  };

export const createScoringRulesController =
  (createScoringRulesUseCase: ICreateScoringRulesUseCase) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authUser = (req as any).user;
      const { eventId } = req.params;
      const { rules } = req.body;

      const createdRules = await createScoringRulesUseCase(eventId, authUser.id, rules);
      res.json({ success: true, data: createdRules });
    } catch (error) {
      next(error);
    }
  };
