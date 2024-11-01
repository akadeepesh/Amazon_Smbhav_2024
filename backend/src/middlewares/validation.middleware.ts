import { Request, Response, NextFunction } from 'express';
import { ZodSchema, z } from 'zod';

// More specific type for the validation middleware
export const validateRequest = 
  (schema: ZodSchema) => 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = await schema.parseAsync(req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          status: 'error',
          errors: error.errors,
        });
      }
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
};