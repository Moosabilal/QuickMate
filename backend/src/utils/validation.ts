// src/utils/validation.ts
// For comprehensive validation, express-validator is recommended and used in routes.
// This file serves as a simple utility for custom validation logic if needed.

import { body } from 'express-validator';

// Example of a reusable validation chain for category name
export const categoryNameValidation = [
  body('name')
    .isString().notEmpty().withMessage('Category name is required.')
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Category name must be between 2 and 100 characters.'),
];

// Example for commission value
export const commissionValueValidation = [
  body('commissionValue')
    .optional()
    .isFloat({ min: 0 }).withMessage('Commission value must be a non-negative number.')
    .custom((value, { req }) => {
      if (req.body.commissionType === 'percentage' && (value < 0 || value > 100)) {
        throw new Error('Percentage commission must be between 0 and 100.');
      }
      return true;
    }),
];