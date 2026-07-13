import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/app-error';
import type { ApiResponse } from '../errors/api-response';

export function createErrorMiddleware() {
  return (err: Error, _req: Request, res: Response, _next: NextFunction) => {
    if (res.headersSent) {
      console.error('[ErrorMiddleware] Headers already sent, cannot send error response');
      return;
    }

    if (err instanceof AppError && err.isOperational) {
      console.log(`[API] ${err.statusCode} ${err.code}: ${err.message}`);
      const response: ApiResponse = {
        success: false,
        errorCode: err.code,
      };
      res.status(err.statusCode).json(response);
      return;
    }

    console.error('\n=== UNEXPECTED ERROR ===');
    console.error('Type:', err.constructor.name);
    console.error('Message:', err.message);
    if (err.stack) console.error('Stack:', err.stack);
    console.error('========================\n');

    const response: ApiResponse = {
      success: false,
      errorCode: 'INTERNAL_SERVER_ERROR',
    };
    res.status(500).json(response);
  };
}
