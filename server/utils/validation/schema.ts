/**
 * Schema Validation Utility Module
 * 
 * This module provides helper functions for working with Zod validation schemas.
 */

import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';

/**
 * Custom error class for validation errors
 */
export class ValidationError extends Error {
  public readonly errors: Record<string, string[]>;

  constructor(message: string, errors: Record<string, string[]> = {}) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

/**
 * Validate data against a schema and throw a formatted error if validation fails
 * @param schema Zod schema to validate against
 * @param data Data to validate
 * @returns Validated data with correct typing
 * @throws ValidationError if validation fails
 */
export function validateSchema<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const validationError = fromZodError(error);
      
      // Format errors for API response
      const formattedErrors: Record<string, string[]> = {};
      
      for (const issue of error.errors) {
        const path = issue.path.join('.');
        if (!formattedErrors[path]) {
          formattedErrors[path] = [];
        }
        formattedErrors[path].push(issue.message);
      }
      
      throw new ValidationError(validationError.message, formattedErrors);
    }
    throw error;
  }
}

/**
 * Safe validation that doesn't throw errors
 * @param schema Zod schema to validate against
 * @param data Data to validate
 * @returns Object with success flag and either validated data or errors
 */
export function safeValidate<T>(schema: z.ZodSchema<T>, data: unknown): { 
  success: boolean; 
  data?: T; 
  errors?: Record<string, string[]> 
} {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors: Record<string, string[]> = {};
      
      for (const issue of error.errors) {
        const path = issue.path.join('.') || 'general';
        if (!formattedErrors[path]) {
          formattedErrors[path] = [];
        }
        formattedErrors[path].push(issue.message);
      }
      
      return { success: false, errors: formattedErrors };
    }
    
    // For non-zod errors, return a generic error
    return { 
      success: false, 
      errors: { general: ['An unexpected error occurred during validation'] } 
    };
  }
}