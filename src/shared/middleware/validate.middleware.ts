import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';
import { InputParseError } from '../errors/common';

export function validate(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse({ body: req.body, query: req.query, params: req.params });
    if (!result.success) throw new InputParseError('Invalid request data', result.error as unknown as Error);
    req.body = result.data.body;
    req.query = result.data.query;
    req.params = result.data.params;
    next();
  };
}
