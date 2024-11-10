import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

export const validateVideo = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  
  body('url')
    .optional()
    .trim()
    .isURL()
    .withMessage('Must be a valid URL'),
  
  body('type')
    .optional()
    .isIn(['file', 'link'])
    .withMessage('Type must be either "file" or "link"'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),

  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        errors: errors.array()
      });
    }
    next();
  }
];
