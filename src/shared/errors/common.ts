import { AppError } from './app-error';
import type { ProfileVerificationChecklist } from '@/src/domains/requests/use-cases/get-profile-verification-checklist.use-case';

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

export class ProfileVerificationRequirementsNotMetError extends InputParseError {
  public readonly details: { checklist: ProfileVerificationChecklist };

  constructor(checklist: ProfileVerificationChecklist) {
    super('Tu perfil no cumple los requisitos obligatorios para solicitar verificación.');
    this.name = 'ProfileVerificationRequirementsNotMetError';
    (this as any).code = 'PROFILE_VERIFICATION_REQUIREMENTS_NOT_MET';
    this.details = { checklist };
  }
}
