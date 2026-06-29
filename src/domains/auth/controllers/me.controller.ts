import type { Request, Response } from 'express';
import { presentUser } from '@/src/domains/users/presenters/user.presenter';

export const getMeController = () => (req: Request, res: Response) => {
  const user = (req as any).user;
  res.json({ success: true, data: presentUser(user) });
};
