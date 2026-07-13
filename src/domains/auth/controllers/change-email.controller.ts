import type { Request, Response, NextFunction } from 'express';
import type { IUsersRepository } from '@/src/domains/users/repositories/users.repository.interface';
import type { ICreateNotificationUseCase } from '@/src/domains/notifications/use-cases/create-notification.use-case';
import { auth } from '@/src/shared/auth';
import { emailService } from '@/src/shared/email';

function buildHeaders(req: Request): Headers {
  const headers = new Headers();
  if (req.headers.cookie) headers.set('cookie', req.headers.cookie as string);
  if (req.headers.authorization) headers.set('authorization', req.headers.authorization as string);
  return headers;
}

export function changeEmailController(
  usersRepository: IUsersRepository,
  createNotificationUseCase: ICreateNotificationUseCase,
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { newEmail } = req.body;

      if (!newEmail) {
        res.status(400).json({ success: false, errorCode: 'INPUT_PARSE_ERROR' });
        return;
      }

      const user = (req as any).user;
      if (!user) {
        res.status(401).json({ success: false, errorCode: 'UNAUTHENTICATED' });
        return;
      }

      const result = await auth.api.changeEmail({
        body: { newEmail },
        headers: buildHeaders(req),
      });

      // Send notification (fire-and-forget) - account notifications bypass email preference
      createNotificationUseCase({
        userId: user.id,
        type: 'email_changed',
        title: 'Correo electrónico actualizado',
        body: `Tu correo electrónico fue actualizado a ${newEmail}. Si no realizaste este cambio, contacta a soporte.`,
        metadata: {},
      }).catch(() => console.warn('[ChangeEmail] Failed to create notification'));

      // Send email notification to the NEW email address
      emailService.sendAccountChangeEmail({
        to: newEmail,
        userName: user.name,
        changeType: 'email',
      }).catch(() => console.warn('[ChangeEmail] Failed to send email'));

      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };
}
