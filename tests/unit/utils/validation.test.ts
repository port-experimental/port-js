import { describe, it, expect } from 'vitest';
import {
  validateIdentifier,
  validateIdentifierFormat,
  validateRequiredFields,
  validateIdentifiers,
  validateCreateInput,
  validateBlueprintInData,
  throwIfErrors,
} from '../../../src/utils/validation';
import { PortValidationError } from '../../../src/errors';

describe('Validation Utilities', () => {
  describe('validateIdentifier', () => {
    it('should pass for valid identifier', () => {
      expect(() => validateIdentifier('test-id', 'identifier')).not.toThrow();
      expect(() => validateIdentifier('test_id_123', 'identifier')).not.toThrow();
      expect(() => validateIdentifier('123', 'identifier')).not.toThrow();
    });

    it('should throw for empty string', () => {
      expect(() => validateIdentifier('', 'identifier')).toThrow(PortValidationError);
    });

    it('should throw for whitespace only', () => {
      expect(() => validateIdentifier('   ', 'identifier')).toThrow(PortValidationError);
    });

    it('should use custom field name in error', () => {
      try {
        validateIdentifier('', 'customField');
      } catch (error) {
        expect(error).toBeInstanceOf(PortValidationError);
        expect((error as PortValidationError).message).toContain('customField');
      }
    });
  });

  describe('validateIdentifierFormat', () => {
    it('should pass for valid formats', () => {
      expect(() => validateIdentifierFormat('test-id', 'identifier')).not.toThrow();
      expect(() => validateIdentifierFormat('test_id_123', 'identifier')).not.toThrow();
      expect(() => validateIdentifierFormat('TestId-123_ABC', 'identifier')).not.toThrow();
    });

    it('should throw for invalid characters', () => {
      expect(() => validateIdentifierFormat('test id', 'identifier')).toThrow(PortValidationError);
      expect(() => validateIdentifierFormat('test@id', 'identifier')).toThrow(PortValidationError);
      expect(() => validateIdentifierFormat('test.id', 'identifier')).toThrow(PortValidationError);
      expect(() => validateIdentifierFormat('test/id', 'identifier')).toThrow(PortValidationError);
    });

    it('should include format message in error', () => {
      try {
        validateIdentifierFormat('test id', 'identifier');
      } catch (error) {
        expect(error).toBeInstanceOf(PortValidationError);
        expect((error as PortValidationError).message).toContain('letters, numbers, underscores, and hyphens');
      }
    });
  });

  describe('validateRequiredFields', () => {
    it('should return empty array for valid data', () => {
      const data = {
        identifier: 'test',
        title: 'Test',
        description: 'Test description',
      };
      const errors = validateRequiredFields(data, ['identifier', 'title']);
      expect(errors).toHaveLength(0);
    });

    it('should return errors for missing fields', () => {
      const data = {
        identifier: 'test',
        title: '',
      };
      const errors = validateRequiredFields(data, ['identifier', 'title', 'description']);
      expect(errors).toHaveLength(2);
      expect(errors[0].field).toBe('title');
      expect(errors[1].field).toBe('description');
    });

    it('should detect undefined values', () => {
      const data = {
        identifier: 'test',
        title: undefined,
      };
      const errors = validateRequiredFields(data, ['identifier', 'title']);
      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('title');
    });

    it('should detect null values', () => {
      const data = {
        identifier: 'test',
        title: null,
      };
      const errors = validateRequiredFields(data, ['identifier', 'title']);
      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('title');
    });
  });

  describe('validateIdentifiers', () => {
    it('should pass for valid array', () => {
      expect(() => validateIdentifiers(['id1', 'id2', 'id3'], 'ids')).not.toThrow();
    });

    it('should throw for non-array', () => {
      expect(() => validateIdentifiers('not-array' as any, 'ids')).toThrow(PortValidationError);
    });

    it('should throw for empty array', () => {
      expect(() => validateIdentifiers([], 'ids')).toThrow(PortValidationError);
    });

    it('should throw for array with empty strings', () => {
      expect(() => validateIdentifiers(['id1', '', 'id3'], 'ids')).toThrow(PortValidationError);
    });

    it('should throw for array with whitespace-only strings', () => {
      expect(() => validateIdentifiers(['id1', '   ', 'id3'], 'ids')).toThrow(PortValidationError);
    });

    it('should include index in error for invalid identifiers', () => {
      try {
        validateIdentifiers(['id1', '', 'id3'], 'ids');
      } catch (error) {
        expect(error).toBeInstanceOf(PortValidationError);
        const validationErrors = (error as PortValidationError).validationErrors;
        expect(validationErrors[0].field).toBe('ids[1]');
      }
    });
  });

  describe('validateCreateInput', () => {
    it('should pass for valid input', () => {
      const data = {
        identifier: 'test-id',
        title: 'Test',
      };
      expect(() => validateCreateInput(data, 'Entity')).not.toThrow();
    });

    it('should throw for missing identifier', () => {
      const data = {
        title: 'Test',
      };
      expect(() => validateCreateInput(data, 'Entity')).toThrow(PortValidationError);
    });

    it('should throw for empty identifier', () => {
      const data = {
        identifier: '',
        title: 'Test',
      };
      expect(() => validateCreateInput(data, 'Entity')).toThrow(PortValidationError);
    });

    it('should throw for whitespace-only identifier', () => {
      const data = {
        identifier: '   ',
        title: 'Test',
      };
      expect(() => validateCreateInput(data, 'Entity')).toThrow(PortValidationError);
    });

    it('should include resource type in error', () => {
      try {
        validateCreateInput({ title: 'Test' }, 'Blueprint');
      } catch (error) {
        expect(error).toBeInstanceOf(PortValidationError);
        expect((error as PortValidationError).message).toContain('Blueprint');
      }
    });
  });

  describe('validateBlueprintInData', () => {
    it('should pass for valid blueprint', () => {
      const data = {
        blueprint: 'service',
        identifier: 'test',
      };
      expect(() => validateBlueprintInData(data, 'Entity')).not.toThrow();
    });

    it('should throw for missing blueprint', () => {
      const data = {
        identifier: 'test',
      };
      expect(() => validateBlueprintInData(data, 'Entity')).toThrow(PortValidationError);
    });

    it('should throw for empty blueprint', () => {
      const data = {
        blueprint: '',
        identifier: 'test',
      };
      expect(() => validateBlueprintInData(data, 'Entity')).toThrow(PortValidationError);
    });

    it('should throw for whitespace-only blueprint', () => {
      const data = {
        blueprint: '   ',
        identifier: 'test',
      };
      expect(() => validateBlueprintInData(data, 'Entity')).toThrow(PortValidationError);
    });

    it('should include resource type in error', () => {
      try {
        validateBlueprintInData({ identifier: 'test' }, 'Scorecard');
      } catch (error) {
        expect(error).toBeInstanceOf(PortValidationError);
        expect((error as PortValidationError).message).toContain('Scorecard');
      }
    });
  });

  describe('throwIfErrors', () => {
    it('should not throw for empty errors array', () => {
      expect(() => throwIfErrors([], 'Test message')).not.toThrow();
    });

    it('should throw for non-empty errors array', () => {
      const errors = [
        { field: 'field1', message: 'Error 1' },
        { field: 'field2', message: 'Error 2' },
      ];
      expect(() => throwIfErrors(errors, 'Validation failed')).toThrow(PortValidationError);
    });

    it('should use custom message', () => {
      const errors = [{ field: 'field1', message: 'Error 1' }];
      try {
        throwIfErrors(errors, 'Custom error message');
      } catch (error) {
        expect(error).toBeInstanceOf(PortValidationError);
        expect((error as PortValidationError).message).toBe('Custom error message');
      }
    });

    it('should include all validation errors', () => {
      const errors = [
        { field: 'field1', message: 'Error 1' },
        { field: 'field2', message: 'Error 2' },
      ];
      try {
        throwIfErrors(errors, 'Validation failed');
      } catch (error) {
        expect(error).toBeInstanceOf(PortValidationError);
        expect((error as PortValidationError).validationErrors).toEqual(errors);
      }
    });
  });
});

