import type { FastifyRequest, FastifyReply } from 'fastify';
import type { MessageType } from '../entities/message.entity';
import type { IThreadsGetThreadController, IThreadsGetMessagesController, IThreadsSendMessageController, IThreadsCloseThreadController, IThreadsListController, IThreadsGetByApplicationController } from './thread.controller.interface';
import type { IGetThreadUseCase } from '../use-cases/get-thread.use-case';
import type { IGetThreadMessagesUseCase } from '../use-cases/get-thread-messages.use-case';
import type { ISendMessageUseCase } from '../use-cases/send-message.use-case';
import type { ICloseThreadUseCase } from '../use-cases/close-thread.use-case';
import type { IListThreadsUseCase } from '../use-cases/list-threads.use-case';
import type { IGetThreadByApplicationUseCase } from '../use-cases/get-thread-by-application.use-case';

export const createThreadsGetThreadController = (getThreadUseCase: IGetThreadUseCase): IThreadsGetThreadController => {
  return async (request: FastifyRequest<{ Params: { threadId: string } }>, reply: FastifyReply) => {
    try {
      console.log('=== DEBUG GET /api/threads/:threadId request.params:', JSON.stringify(request.params));
      const { threadId } = request.params;
      const userId = (request as any).user?.id;

      console.log(`[GET /api/threads/:threadId] threadId=${threadId}, userId=${userId}`);
      const thread = await getThreadUseCase(threadId, userId);
      return reply.status(200).send(thread);
    } catch (error) {
      console.error(`[GET /api/threads/:threadId] ERROR:`, error);
      console.error('Stack:', error instanceof Error ? error.stack : undefined);
      return reply.status(500).send({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
    }
  };
};

export const createThreadsGetMessagesController = (getThreadMessagesUseCase: IGetThreadMessagesUseCase): IThreadsGetMessagesController => {
  return async (request: FastifyRequest<{ Params: { threadId: string } }>, reply: FastifyReply) => {
    try {
      console.log('=== DEBUG request.params:', JSON.stringify(request.params));
      console.log('=== DEBUG request.query:', JSON.stringify(request.query));
      console.log('=== DEBUG request.url:', request.url);
      const { threadId } = request.params;
      const userId = (request as any).user?.id;

      console.log(`[GET /api/threads/:threadId/messages] threadId=${threadId}, userId=${userId}`);
      const messages = await getThreadMessagesUseCase(threadId, userId);
      console.log(`[GET /api/threads/:threadId/messages] SUCCESS: ${messages.length} messages`);
      return reply.status(200).send(messages);
    } catch (error) {
      console.error(`[GET /api/threads/:threadId/messages] ERROR:`, error);
      console.error('Stack:', error instanceof Error ? error.stack : undefined);
      return reply.status(500).send({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        query: request.params,
      });
    }
  };
};

export const createThreadsSendMessageController = (sendMessageUseCase: ISendMessageUseCase): IThreadsSendMessageController => {
  return async (
    request: FastifyRequest<{ Params: { threadId: string }; Body: { content?: string; messageType?: MessageType } }>,
    reply: FastifyReply
  ) => {
    try {
      const { threadId } = request.params;
      const { content, messageType } = request.body ?? {};
      const userId = request.user.id;

      console.log(`[POST /api/threads/:threadId/messages]`);
      console.log(`  threadId: ${threadId}`);
      console.log(`  userId (from token): ${userId}`);
      console.log(`  content: ${content}`);
      console.log(`  messageType: ${messageType}`);
      console.log(`  request.user: ${JSON.stringify(request.user)}`);

      const message = await sendMessageUseCase({
        threadId,
        senderId: userId,
        content,
        messageType,
      });

      console.log(`[POST /api/threads/:threadId/messages] SUCCESS: messageId=${message.id}`);
      return reply.status(201).send(message);
    } catch (error) {
      console.error(`[POST /api/threads/:threadId/messages] ERROR:`, error);
      request.log.error(error);
      return reply.status(500).send({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : String(error),
        statusCode: (error as any)?.statusCode,
        code: (error as any)?.code,
        stack: error instanceof Error ? error.stack : undefined,
        body: request.body,
      });
    }
  };
};

export const createThreadsCloseThreadController = (closeThreadUseCase: ICloseThreadUseCase): IThreadsCloseThreadController => {
  return async (request: FastifyRequest<{ Params: { threadId: string } }>, reply: FastifyReply) => {
    try {
      const { threadId } = request.params;
      const userId = request.user.id;

      console.log(`[PATCH /api/threads/:threadId/close] threadId=${threadId}, userId=${userId}`);
      await closeThreadUseCase(threadId, userId);
      console.log(`[PATCH /api/threads/:threadId/close] SUCCESS`);
      return reply.status(200).send({ success: true });
    } catch (error) {
      console.error(`[PATCH /api/threads/:threadId/close] ERROR:`, error);
      request.log.error(error);
      return reply.status(500).send({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
    }
  };
};

export const createThreadsListController = (listThreadsUseCase: IListThreadsUseCase): IThreadsListController => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = request.user.id;

      console.log(`[GET /api/threads] userId=${userId}`);
      const threads = await listThreadsUseCase(userId);
      console.log(`[GET /api/threads] SUCCESS: ${threads.length} threads`);
      return reply.status(200).send(threads);
    } catch (error) {
      console.error(`[GET /api/threads] ERROR:`, error);
      request.log.error(error);
      return reply.status(500).send({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
    }
  };
};

export const createThreadsGetByApplicationController = (getThreadByApplicationUseCase: IGetThreadByApplicationUseCase): IThreadsGetByApplicationController => {
  return async (request: FastifyRequest<{ Params: { applicationId: string } }>, reply: FastifyReply) => {
    try {
      const { applicationId } = request.params;
      const userId = request.user.id;

      console.log(`[GET /api/threads/application/:applicationId] applicationId=${applicationId}, userId=${userId}`);
      const thread = await getThreadByApplicationUseCase(applicationId, userId);
      if (!thread) {
        console.log(`[GET /api/threads/application/:applicationId] NOT FOUND`);
        return reply.status(404).send({ error: 'Thread no encontrado' });
      }
      console.log(`[GET /api/threads/application/:applicationId] SUCCESS: threadId=${thread.id}`);
      return reply.status(200).send(thread);
    } catch (error) {
      console.error(`[GET /api/threads/application/:applicationId] ERROR:`, error);
      request.log.error(error);
      return reply.status(500).send({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
    }
  };
};
