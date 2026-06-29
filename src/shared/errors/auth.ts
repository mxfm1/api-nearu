import { AppError } from './app-error';

export class UnauthenticatedError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'UNAUTHENTICATED');
    this.name = 'UnauthenticatedError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, 403, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}
