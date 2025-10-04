/**
 * Centralized validation utilities
 * 
 * Provides reusable validation functions for common patterns across resources.
 */

import { PortValidationError } from '../errors';

/**
 * Validation error details
 */
export interface ValidationErrorDetail {
  field: string;
  message: string;
}

/**
 * Validate that a string identifier is not empty
 * 
 * @param identifier - The identifier to validate
 * @param fieldName - The name of the field (for error messages)
 * @throws {PortValidationError} If identifier is empty or whitespace
 * 
 * @example
 * ```typescript
 * validateIdentifier('my-service', 'identifier');
 * // Passes
 * 
 * validateIdentifier('', 'identifier');
 * // Throws: PortValidationError
 * ```
 */
export function validateIdentifier(identifier: string, fieldName = 'identifier'): void {
  if (!identifier || identifier.trim() === '') {
    throw new PortValidationError(`${fieldName} is required`, [
      { field: fieldName, message: 'Required field' },
    ]);
  }
}

/**
 * Validate identifier format (alphanumeric, underscore, hyphen only)
 * 
 * @param identifier - The identifier to validate
 * @param fieldName - The name of the field (for error messages)
 * @throws {PortValidationError} If identifier contains invalid characters
 * 
 * @example
 * ```typescript
 * validateIdentifierFormat('my-service_123', 'identifier');
 * // Passes
 * 
 * validateIdentifierFormat('my service!', 'identifier');
 * // Throws: PortValidationError
 * ```
 */
export function validateIdentifierFormat(identifier: string, fieldName = 'identifier'): void {
  if (!/^[a-zA-Z0-9_-]+$/.test(identifier)) {
    throw new PortValidationError(
      `${fieldName} must contain only letters, numbers, underscores, and hyphens`,
      [{ field: fieldName, message: 'Invalid format' }]
    );
  }
}

/**
 * Validate that required fields are present in an object
 * 
 * @param data - The object to validate
 * @param requiredFields - Array of required field names
 * @returns Array of validation errors (empty if valid)
 * 
 * @example
 * ```typescript
 * const errors = validateRequiredFields(
 *   { identifier: 'test', title: '' },
 *   ['identifier', 'title']
 * );
 * // Returns: [{ field: 'title', message: 'Required field' }]
 * ```
 */
export function validateRequiredFields(
  data: Record<string, unknown>,
  requiredFields: string[]
): ValidationErrorDetail[] {
  const errors: ValidationErrorDetail[] = [];

  for (const field of requiredFields) {
    const value = data[field];
    if (value === undefined || value === null || value === '') {
      errors.push({ field, message: 'Required field' });
    }
  }

  return errors;
}

/**
 * Validate an array of identifiers
 * 
 * @param identifiers - Array of identifiers to validate
 * @param fieldName - The name of the field (for error messages)
 * @throws {PortValidationError} If any identifier is invalid
 * 
 * @example
 * ```typescript
 * validateIdentifiers(['id1', 'id2', 'id3'], 'entityIds');
 * // Passes
 * 
 * validateIdentifiers(['id1', '', 'id3'], 'entityIds');
 * // Throws: PortValidationError
 * ```
 */
export function validateIdentifiers(identifiers: string[], fieldName = 'identifiers'): void {
  if (!Array.isArray(identifiers)) {
    throw new PortValidationError(`${fieldName} must be an array`, [
      { field: fieldName, message: 'Must be an array' },
    ]);
  }

  if (identifiers.length === 0) {
    throw new PortValidationError(`${fieldName} cannot be empty`, [
      { field: fieldName, message: 'Cannot be empty' },
    ]);
  }

  const errors: ValidationErrorDetail[] = [];
  identifiers.forEach((id, index) => {
    if (!id || id.trim() === '') {
      errors.push({ field: `${fieldName}[${index}]`, message: 'Required field' });
    }
  });

  if (errors.length > 0) {
    throw new PortValidationError(`Invalid ${fieldName}`, errors);
  }
}

/**
 * Validate create input with identifier
 * 
 * @param data - The create input data
 * @param resourceType - The type of resource (for error messages)
 * @throws {PortValidationError} If identifier is missing or invalid
 * 
 * @example
 * ```typescript
 * validateCreateInput({ identifier: 'test', title: 'Test' }, 'Entity');
 * // Passes
 * 
 * validateCreateInput({ title: 'Test' }, 'Entity');
 * // Throws: PortValidationError
 * ```
 */
export function validateCreateInput(
  data: { identifier?: string; [key: string]: unknown },
  resourceType: string
): void {
  if (!data.identifier || data.identifier.trim() === '') {
    throw new PortValidationError(`${resourceType} identifier is required`, [
      { field: 'identifier', message: 'Required field' },
    ]);
  }
}

/**
 * Validate a blueprint identifier exists in data
 * 
 * @param data - The data containing blueprint
 * @param resourceType - The type of resource (for error messages)
 * @throws {PortValidationError} If blueprint is missing
 * 
 * @example
 * ```typescript
 * validateBlueprintInData({ blueprint: 'service' }, 'Entity');
 * // Passes
 * 
 * validateBlueprintInData({}, 'Entity');
 * // Throws: PortValidationError
 * ```
 */
export function validateBlueprintInData(
  data: { blueprint?: string; [key: string]: unknown },
  resourceType: string
): void {
  if (!data.blueprint || data.blueprint.trim() === '') {
    throw new PortValidationError(`${resourceType} blueprint is required`, [
      { field: 'blueprint', message: 'Required field' },
    ]);
  }
}

/**
 * Throw validation error if errors array is not empty
 * 
 * @param errors - Array of validation errors
 * @param message - Error message
 * @throws {PortValidationError} If errors array is not empty
 * 
 * @example
 * ```typescript
 * const errors = validateRequiredFields(data, ['id', 'name']);
 * throwIfErrors(errors, 'Invalid input');
 * ```
 */
export function throwIfErrors(errors: ValidationErrorDetail[], message: string): void {
  if (errors.length > 0) {
    throw new PortValidationError(message, errors);
  }
}

