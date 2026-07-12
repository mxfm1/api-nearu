import type { Request, Response, NextFunction } from 'express';
import type { ISendMessageUseCase } from '../use-cases/send-message.use-case';
import type { IGetThreadUseCase } from '../use-cases/get-thread.use-case';

export type ISendMessageController = ReturnType<typeof sendMessageController>;
export type IGetThreadController = ReturnType<typeof getThreadController>;

export const sendMessageController =
  (sendMessageUseCase: ISendMessageUseCase) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authUser = (req as any).user;
      const { contactRequestId, content, attachments } = req.body;

      const message = await sendMessageUseCase({
        contactRequestId,
        senderId: authUser.id,
        content,
        attachments,
      });

      res.status(201).json({ success: true, data: message });
    } catch (error) {
      next(error);
    }
  };

export const getThreadController =
  (getThreadUseCase: IGetThreadUseCase) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authUser = (req as any).user;
      const messages = await getThreadUseCase(req.params.contactRequestId as string, authUser.id);
      res.json({ success: true, data: messages });
    } catch (error) {
      next(error);
    }
  };
