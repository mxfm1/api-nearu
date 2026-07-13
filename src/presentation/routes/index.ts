import { Router } from 'express';
import { toNodeHandler } from 'better-auth/node';
import { auth } from '@/src/shared/auth';
import { getInjection } from '@di/container';
import { validate } from '@/src/shared/middleware/validate.middleware';
import { createUserSchema, deleteUserSchema } from '@/src/domains/users/validators/user.validator';
import { createAuthMiddleware } from '@/src/shared/middleware/auth.middleware';
import { getMeController } from '@/src/domains/auth/controllers/me.controller';
import { updateMeController } from '@/src/domains/auth/controllers/update-me.controller';
import { changePasswordController } from '@/src/domains/auth/controllers/change-password.controller';
import { changeEmailController } from '@/src/domains/auth/controllers/change-email.controller';
import { forgotPasswordController } from '@/src/domains/auth/controllers/forgot-password.controller';
import { verifyEmailController } from '@/src/domains/auth/controllers/verify-email.controller';
import { createUserController } from '@/src/domains/users/controllers/users.controller';
import {
  listCategoriesController,
  listRegionsController,
  listLocationsController,
  listScoringRulesCatalogController,
} from '@/src/domains/catalog/controllers/catalog.controller';
import { getProfileSchema, updateProfileSchema } from '@/src/domains/profiles/validators/profile.validator';
import { createContactRequestSchema, getInboxSchema, updateContactRequestStatusSchema } from '@/src/domains/contact-requests/validators/contact-request.validator';
import { listIntencionesController } from '@/src/domains/contact-requests/controllers/contact-request.controller';
import { createServiceSchema, updateServiceSchema, getServiceSchema, deleteServiceSchema, listServicesSchema, addPortfolioItemSchema, deletePortfolioItemSchema } from '@/src/domains/services/validators/service.validator';
import { createEventSchema, updateEventSchema, getEventSchema, deleteEventSchema, listEventsSchema } from '@/src/domains/events/validators/event.validator';
import { sendMessageSchema, getThreadSchema } from '@/src/domains/messages/validators/message.validator';
import { markNotificationReadSchema, updateNotificationSettingsSchema } from '@/src/domains/notifications/validators/notification.validator';
import { createApplicationSchema, getApplicationSchema, listEventApplicationsSchema, updateApplicationStatusSchema, createScoringRulesSchema } from '@/src/domains/applications/validators/application.validator';

export function createRouter() {
  const router = Router();

  // Health
  router.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });
  router.get('/api/categorias', listCategoriesController);
  router.get('/api/regiones', listRegionsController);
  router.get('/api/ubicaciones', listLocationsController);
  router.get('/api/scoring-rules/catalog', listScoringRulesCatalogController);

  // Users: public
  router.get('/api/users/:id', getInjection('IGetUserController'));
  router.post('/api/users', validate(createUserSchema), createUserController());

  // Auth middleware (used by custom protected routes)
  const authMiddleware = createAuthMiddleware(getInjection('IAuthenticationService'));

  // ──────────────────────────────────────────────
  // CUSTOM AUTH ROUTES (before Better Auth catch-all)
  // ──────────────────────────────────────────────
  // Protected
  router.get('/api/auth/me', authMiddleware, getMeController());
  router.patch('/api/users/me', authMiddleware, updateMeController());
  router.post('/api/auth/change-password', authMiddleware, changePasswordController(
    getInjection('IUsersRepository'),
    getInjection('ICreateNotificationUseCase'),
  ));
  router.post('/api/auth/change-email', authMiddleware, changeEmailController(
    getInjection('IUsersRepository'),
    getInjection('ICreateNotificationUseCase'),
  ));
  router.delete('/api/users/:id', authMiddleware, validate(deleteUserSchema), getInjection('IDeleteUserController'));

  // ──────────────────────────────────────────────
  // PROFILES
  // ──────────────────────────────────────────────
  router.get('/api/profiles/:userId', validate(getProfileSchema), getInjection('IGetProfileController'));
  router.patch('/api/profiles/me', authMiddleware, validate(updateProfileSchema), getInjection('IUpsertProfileController'));

  // ──────────────────────────────────────────────
  // CONTACT REQUESTS (Inbox)
  // ──────────────────────────────────────────────
  router.get('/api/contactos/intenciones', listIntencionesController);
  router.get('/api/contactos/inbox', authMiddleware, validate(getInboxSchema), getInjection('IGetInboxController'));
  router.get('/api/contactos/:id', authMiddleware, getInjection('IGetContactRequestDetailController'));
  router.post('/api/contactos', authMiddleware, validate(createContactRequestSchema), getInjection('ICreateContactRequestController'));
  router.patch('/api/contactos/:id/estado', authMiddleware, validate(updateContactRequestStatusSchema), getInjection('IUpdateContactRequestStatusController'));

  // ──────────────────────────────────────────────
  // MESSAGES (threaded inbox)
  // ──────────────────────────────────────────────
  router.post('/api/mensajes', authMiddleware, validate(sendMessageSchema), getInjection('ISendMessageController'));
  router.get('/api/mensajes/:contactRequestId', authMiddleware, validate(getThreadSchema), getInjection('IGetThreadController'));

  // ──────────────────────────────────────────────
  // NOTIFICATIONS
  // ──────────────────────────────────────────────
  router.get('/api/notificaciones', authMiddleware, getInjection('IListNotificationsController'));
  router.patch('/api/notificaciones/:id/read', authMiddleware, validate(markNotificationReadSchema), getInjection('IMarkNotificationReadController'));
  router.patch('/api/notificaciones/read-all', authMiddleware, getInjection('IMarkAllNotificationsReadController'));
  router.get('/api/notificaciones/config', authMiddleware, getInjection('IGetNotificationSettingsController'));
  router.patch('/api/notificaciones/config', authMiddleware, validate(updateNotificationSettingsSchema), getInjection('IUpdateNotificationSettingsController'));

  // ──────────────────────────────────────────────
  // SERVICES
  // ──────────────────────────────────────────────
  // Public
  router.get('/api/servicios', validate(listServicesSchema), getInjection('IListServicesController'));
  router.get('/api/servicios/:slugOrId', validate(getServiceSchema), getInjection('IGetServiceController'));
  // Protected
  router.post('/api/servicios', authMiddleware, validate(createServiceSchema), getInjection('ICreateServiceController'));
  router.patch('/api/servicios/:id', authMiddleware, validate(updateServiceSchema), getInjection('IUpdateServiceController'));
  router.delete('/api/servicios/:id', authMiddleware, validate(deleteServiceSchema), getInjection('IDeleteServiceController'));
  // My services (protected)
  router.get('/api/mis-servicios', authMiddleware, getInjection('IMyServicesController'));
  // Portfolio (protected)
  router.post('/api/servicios/:id/portfolio', authMiddleware, validate(addPortfolioItemSchema), getInjection('IAddPortfolioItemController'));
  router.delete('/api/servicios/:id/portfolio/:portfolioId', authMiddleware, validate(deletePortfolioItemSchema), getInjection('IDeletePortfolioItemController'));

  // ──────────────────────────────────────────────
  // EVENTS
  // ──────────────────────────────────────────────
  // Public
  router.get('/api/eventos', validate(listEventsSchema), getInjection('IListEventsController'));
  router.get('/api/eventos/:slugOrId', validate(getEventSchema), getInjection('IGetEventController'));
  // My events (protected)
  router.get('/api/mis-eventos', authMiddleware, getInjection('IMyEventsController'));
  router.get('/api/mis-eventos/:id', authMiddleware, getInjection('IGetMyEventController'));
  // Protected
  router.post('/api/eventos', authMiddleware, validate(createEventSchema), getInjection('ICreateEventController'));
  router.patch('/api/eventos/:id', authMiddleware, validate(updateEventSchema), getInjection('IUpdateEventController'));
  router.delete('/api/eventos/:id', authMiddleware, validate(deleteEventSchema), getInjection('IDeleteEventController'));

  // ──────────────────────────────────────────────
  // APPLICATIONS (event postulations)
  // ──────────────────────────────────────────────
  // Protected
  router.post('/api/applications', authMiddleware, validate(createApplicationSchema), getInjection('ICreateApplicationController'));
  router.get('/api/applications/:id', authMiddleware, validate(getApplicationSchema), getInjection('IGetApplicationController'));
  router.get('/api/events/:eventId/applications', authMiddleware, validate(listEventApplicationsSchema), getInjection('IListEventApplicationsController'));
  router.get('/api/events/:eventId/applications/score-details', authMiddleware, validate(listEventApplicationsSchema), getInjection('IListEventApplicationsWithScoreController'));
  router.get('/api/mis-aplicaciones', authMiddleware, getInjection('IListMyApplicationsController'));
  router.get('/api/events/:eventId/my-application', authMiddleware, getInjection('IGetMyApplicationByEventController'));
  router.patch('/api/applications/:id/status', authMiddleware, validate(updateApplicationStatusSchema), getInjection('IUpdateApplicationStatusController'));

  // ──────────────────────────────────────────────
  // THREADS (post-acceptance communication)
  // ──────────────────────────────────────────────
  router.get('/api/threads', authMiddleware, getInjection('IThreadsListController'));
  router.get('/api/threads/application/:applicationId', authMiddleware, getInjection('IThreadsGetByApplicationController'));
  router.get('/api/threads/:threadId', authMiddleware, getInjection('IThreadsGetThreadController'));
  router.get('/api/threads/:threadId/messages', authMiddleware, getInjection('IThreadsGetMessagesController'));
  router.post('/api/threads/:threadId/messages', authMiddleware, getInjection('IThreadsSendMessageController'));
  router.patch('/api/threads/:threadId/close', authMiddleware, getInjection('IThreadsCloseThreadController'));

  // ──────────────────────────────────────────────
  // SCORING RULES (per event)
  // ──────────────────────────────────────────────
  router.get('/api/events/:eventId/scoring-rules', authMiddleware, getInjection('IListScoringRulesController'));
  router.post('/api/events/:eventId/scoring-rules', authMiddleware, validate(createScoringRulesSchema), getInjection('ICreateScoringRulesController'));

  // Public (supplement Better Auth's internal routes)
  router.post('/api/auth/forgot-password', forgotPasswordController());
  router.post('/api/auth/verify-email', verifyEmailController());

  // ──────────────────────────────────────────────
  // BETTER AUTH — catches everything else under /api/auth/*
  //   POST /api/auth/sign-up/email          → register
  //   POST /api/auth/sign-in/email          → login
  //   POST /api/auth/sign-out               → logout
  //   POST /api/auth/reset-password         → reset password with token
  //   POST /api/auth/send-verification-email → resend verification email
  //   GET  /api/auth/sign-in/google         → Google OAuth
  //   GET  /api/auth/callback/google        → Google OAuth callback
  // ──────────────────────────────────────────────
  router.all('/api/auth/*', toNodeHandler(auth));

  return router;
}
