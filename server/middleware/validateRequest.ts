import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';

export function validateRequest(schemas: {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
}) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Valider le corps de la requête
      if (schemas.body) {
        const result = await schemas.body.safeParseAsync(req.body);
        if (!result.success) {
          return res.status(400).json({
            success: false,
            error: 'Invalid request body',
            details: result.error.format(),
          });
        }
        req.body = result.data;
      }

      // Valider les paramètres d'URL
      if (schemas.params) {
        const result = await schemas.params.safeParseAsync(req.params);
        if (!result.success) {
          return res.status(400).json({
            success: false,
            error: 'Invalid URL parameters',
            details: result.error.format(),
          });
        }
        req.params = result.data;
      }

      // Valider les paramètres de requête
      if (schemas.query) {
        const result = await schemas.query.safeParseAsync(req.query);
        if (!result.success) {
          return res.status(400).json({
            success: false,
            error: 'Invalid query parameters',
            details: result.error.format(),
          });
        }
        req.query = result.data;
      }

      next();
    } catch (error) {
      console.error('Validation error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error during validation',
      });
    }
  };
}
