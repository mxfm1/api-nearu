import type { FastifyRequest, FastifyReply } from 'fastify';
import type { MessageType } from '../entities/message.entity';

export type IThreadsGetThreadController = (request: FastifyRequest<{ Params: { threadId: string } }>, reply: FastifyReply) => Promise<any>;
export type IThreadsGetMessagesController = (request: FastifyRequest<{ Params: { threadId: string } }>, reply: FastifyReply) => Promise<any>;
export type IThreadsSendMessageController = (
  request: FastifyRequest<{ Params: { threadId: string }; Body: { content?: string; messageType?: MessageType } }>,
  reply: FastifyReply
) => Promise<any>;
export type IThreadsCloseThreadController = (request: FastifyRequest<{ Params: { threadId: string } }>, reply: FastifyReply) => Promise<any>;
export type IThreadsListController = (request: FastifyRequest, reply: FastifyReply) => Promise<any>;
export type IThreadsGetByApplicationController = (request: FastifyRequest<{ Params: { applicationId: string } }>, reply: FastifyReply) => Promise<any>;

export interface IThreadsController {
  getThread: IThreadsGetThreadController;
  getMessages: IThreadsGetMessagesController;
  sendMessage: IThreadsSendMessageController;
  closeThread: IThreadsCloseThreadController;
  list: IThreadsListController;
  getByApplication: IThreadsGetByApplicationController;
}
