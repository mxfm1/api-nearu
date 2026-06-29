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
      // Operational errors (400, 401, 404, 409, etc.) — log and return clean response
      console.log(`[API] ${err.statusCode} ${err.code}: ${err.message}`);
      const response: ApiResponse = {
        success: false,
        error: { code: err.code, message: err.message },
      };
      res.status(err.statusCode).json(response);
      return;
    }

    // Real unexpected errors — log full details and return 500
    console.error('\n=== UNEXPECTED ERROR ===');
    console.error('Type:', err.constructor.name);
    console.error('Message:', err.message);
    if (err.stack) console.error('Stack:', err.stack);
    console.error('========================\n');

    const response: ApiResponse = {
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: process.env.NODE_ENV !== 'production' ? err.message : 'An unexpected error occurred',
      },
    };
    res.status(500).json(response);
  };
}
