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

export function changePasswordController(
  usersRepository: IUsersRepository,
  createNotificationUseCase: ICreateNotificationUseCase,
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        res.status(400).json({ success: false, errorCode: 'INPUT_PARSE_ERROR' });
        return;
      }

      if (typeof newPassword !== 'string' || newPassword.length < 8) {
        res.status(400).json({ success: false, errorCode: 'INPUT_PARSE_ERROR' });
        return;
      }

      const user = (req as any).user;
      if (!user) {
        res.status(401).json({ success: false, errorCode: 'UNAUTHENTICATED' });
        return;
      }

      await auth.api.changePassword({
        body: { currentPassword, newPassword },
        headers: buildHeaders(req),
      });

      // Send notification (fire-and-forget) - account notifications bypass email preference
      createNotificationUseCase({
        userId: user.id,
        type: 'password_changed',
        title: 'Contraseña actualizada',
        body: 'Tu contraseña fue actualizada exitosamente. Si no realizaste este cambio, contacta a soporte.',
        metadata: {},
      }).catch(() => console.warn('[ChangePassword] Failed to create notification'));

      // Send email notification (account notifications bypass preference)
      usersRepository.findById(user.id)
        .then((userRecord) => {
          if (userRecord?.email) {
            return emailService.sendAccountChangeEmail({
              to: userRecord.email,
              userName: userRecord.name,
              changeType: 'password',
            });
          }
        })
        .catch(() => console.warn('[ChangePassword] Failed to send email'));

      res.json({ success: true, data: { message: 'Password changed successfully' } });
    } catch (error) {
      next(error);
    }
  };
}
