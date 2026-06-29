import { AppError } from './app-error';

export class InputParseError extends AppError {
  constructor(message: string, cause?: Error) {
    super(message, 400, 'INPUT_PARSE_ERROR', true, cause);
    this.name = 'InputParseError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT');
    this.name = 'ConflictError';
  }
}
