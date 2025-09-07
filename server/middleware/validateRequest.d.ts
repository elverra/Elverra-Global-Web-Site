import { RequestHandler } from 'express';
import { z } from 'zod';

declare module 'express-serve-static-core' {
  interface Request {
    validatedBody?: any;
    validatedParams?: any;
    validatedQuery?: any;
  }
}

export function validateRequest(schemas: {
  body?: z.ZodSchema;
  params?: z.ZodSchema;
  query?: z.ZodSchema;
}): RequestHandler;
