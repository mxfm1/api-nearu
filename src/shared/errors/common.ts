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

export class ForbiddenError extends AppError {
  constructor(message: string) {
    super(message, 403, 'FORBIDDEN');
    this.name = 'ForbiddenError';
  }
}

export class ApplicationAlreadyExistsError extends ConflictError {
  constructor() {
    super('Ya existe una postulación activa para este evento.');
    this.name = 'ApplicationAlreadyExistsError';
    (this as any).code = 'APPLICATION_ALREADY_EXISTS';
  }
}

export class EmptyScoringRulesError extends InputParseError {
  constructor() {
    super('Debe configurar al menos una regla de scoring para el evento.');
    this.name = 'EmptyScoringRulesError';
    (this as any).code = 'SCORING_RULES_EMPTY';
  }
}
