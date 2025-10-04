/**
 * Unit tests for ScorecardResource
 * Following TDD principles
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ScorecardResource } from '../../../src/resources/scorecards';
import type { HttpClient } from '../../../src/http-client';
import { PortValidationError, PortNotFoundError } from '../../../src/errors';

describe('ScorecardResource', () => {
  let mockHttpClient: HttpClient;
  let scorecardResource: ScorecardResource;

  beforeEach(() => {
    mockHttpClient = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    } as unknown as HttpClient;

    scorecardResource = new ScorecardResource(mockHttpClient);
  });

  describe('create', () => {
    it('should create a scorecard with valid data', async () => {
      const input = {
        identifier: 'security-scorecard',
        title: 'Security Scorecard',
        blueprint: 'service',
        rules: [
          {
            identifier: 'has-owner',
            title: 'Has Owner',
            level: 'Gold' as const,
            query: {
              combinator: 'and' as const,
              conditions: [
                {
                  property: 'owner',
                  operator: 'isNotEmpty' as const,
                },
              ],
            },
          },
        ],
      };

      const expected = {
        ...input,
        createdAt: '2025-10-04T00:00:00Z',
        updatedAt: '2025-10-04T00:00:00Z',
      };

      vi.mocked(mockHttpClient.post).mockResolvedValue(expected);

      const result = await scorecardResource.create(input);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/v1/blueprints/service/scorecards',
        input
      );
      expect(result.identifier).toBe('security-scorecard');
      expect(result.createdAt).toBeInstanceOf(Date);
    });

    it('should throw PortValidationError when identifier is missing', async () => {
      const input = {
        identifier: '',
        title: 'Test',
        blueprint: 'service',
        rules: [],
      };

      await expect(scorecardResource.create(input)).rejects.toThrow(
        PortValidationError
      );
      expect(mockHttpClient.post).not.toHaveBeenCalled();
    });

    it('should throw PortValidationError when title is missing', async () => {
      const input = {
        identifier: 'test',
        title: '',
        blueprint: 'service',
        rules: [],
      };

      await expect(scorecardResource.create(input)).rejects.toThrow(
        PortValidationError
      );
      expect(mockHttpClient.post).not.toHaveBeenCalled();
    });

    it('should throw PortValidationError when blueprint is missing', async () => {
      const input = {
        identifier: 'test',
        title: 'Test',
        blueprint: '',
        rules: [],
      };

      await expect(scorecardResource.create(input)).rejects.toThrow(
        PortValidationError
      );
      expect(mockHttpClient.post).not.toHaveBeenCalled();
    });
  });

  describe('get', () => {
    it('should fetch a scorecard by identifier', async () => {
      const expected = {
        identifier: 'security-scorecard',
        title: 'Security Scorecard',
        blueprint: 'service',
        rules: [],
        createdAt: '2025-10-04T00:00:00Z',
        updatedAt: '2025-10-04T00:00:00Z',
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(expected);

      const result = await scorecardResource.get('service', 'security-scorecard');

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/v1/blueprints/service/scorecards/security-scorecard'
      );
      expect(result.identifier).toBe('security-scorecard');
      expect(result.createdAt).toBeInstanceOf(Date);
    });

    it('should throw PortValidationError for empty blueprint', async () => {
      await expect(
        scorecardResource.get('', 'scorecard-id')
      ).rejects.toThrow(PortValidationError);
      expect(mockHttpClient.get).not.toHaveBeenCalled();
    });

    it('should throw PortValidationError for empty identifier', async () => {
      await expect(
        scorecardResource.get('service', '')
      ).rejects.toThrow(PortValidationError);
      expect(mockHttpClient.get).not.toHaveBeenCalled();
    });

    it('should throw PortNotFoundError when scorecard does not exist', async () => {
      vi.mocked(mockHttpClient.get).mockRejectedValue(
        new PortNotFoundError('scorecard', 'non-existent')
      );

      await expect(
        scorecardResource.get('service', 'non-existent')
      ).rejects.toThrow(PortNotFoundError);
    });
  });

  describe('update', () => {
    it('should update a scorecard', async () => {
      const updates = {
        title: 'Updated Security Scorecard',
        rules: [
          {
            identifier: 'new-rule',
            title: 'New Rule',
            level: 'Silver' as const,
            query: {
              combinator: 'and' as const,
              conditions: [],
            },
          },
        ],
      };

      const expected = {
        identifier: 'security-scorecard',
        blueprint: 'service',
        ...updates,
        createdAt: '2025-10-04T00:00:00Z',
        updatedAt: '2025-10-04T01:00:00Z',
      };

      vi.mocked(mockHttpClient.patch).mockResolvedValue(expected);

      const result = await scorecardResource.update(
        'service',
        'security-scorecard',
        updates
      );

      expect(mockHttpClient.patch).toHaveBeenCalledWith(
        '/v1/blueprints/service/scorecards/security-scorecard',
        updates
      );
      expect(result.title).toBe('Updated Security Scorecard');
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('should throw PortValidationError for empty blueprint', async () => {
      await expect(
        scorecardResource.update('', 'scorecard-id', { title: 'Test' })
      ).rejects.toThrow(PortValidationError);
      expect(mockHttpClient.patch).not.toHaveBeenCalled();
    });

    it('should throw PortValidationError for empty identifier', async () => {
      await expect(
        scorecardResource.update('service', '', { title: 'Test' })
      ).rejects.toThrow(PortValidationError);
      expect(mockHttpClient.patch).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete a scorecard', async () => {
      vi.mocked(mockHttpClient.delete).mockResolvedValue(undefined);

      await scorecardResource.delete('service', 'security-scorecard');

      expect(mockHttpClient.delete).toHaveBeenCalledWith(
        '/v1/blueprints/service/scorecards/security-scorecard'
      );
    });

    it('should throw PortValidationError for empty blueprint', async () => {
      await expect(
        scorecardResource.delete('', 'scorecard-id')
      ).rejects.toThrow(PortValidationError);
      expect(mockHttpClient.delete).not.toHaveBeenCalled();
    });

    it('should throw PortValidationError for empty identifier', async () => {
      await expect(
        scorecardResource.delete('service', '')
      ).rejects.toThrow(PortValidationError);
      expect(mockHttpClient.delete).not.toHaveBeenCalled();
    });

    it('should throw PortNotFoundError when scorecard does not exist', async () => {
      vi.mocked(mockHttpClient.delete).mockRejectedValue(
        new PortNotFoundError('scorecard', 'non-existent')
      );

      await expect(
        scorecardResource.delete('service', 'non-existent')
      ).rejects.toThrow(PortNotFoundError);
    });
  });

  describe('list', () => {
    it('should list all scorecards for a blueprint', async () => {
      const expected = {
        scorecards: [
          {
            identifier: 'scorecard-1',
            title: 'Scorecard 1',
            blueprint: 'service',
            rules: [],
            createdAt: '2025-10-04T00:00:00Z',
            updatedAt: '2025-10-04T00:00:00Z',
          },
          {
            identifier: 'scorecard-2',
            title: 'Scorecard 2',
            blueprint: 'service',
            rules: [],
            createdAt: '2025-10-04T00:00:00Z',
            updatedAt: '2025-10-04T00:00:00Z',
          },
        ],
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(expected);

      const result = await scorecardResource.list('service');

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/v1/blueprints/service/scorecards'
      );
      expect(result).toHaveLength(2);
      expect(result[0].identifier).toBe('scorecard-1');
      expect(result[0].createdAt).toBeInstanceOf(Date);
    });

    it('should throw PortValidationError for empty blueprint', async () => {
      await expect(scorecardResource.list('')).rejects.toThrow(
        PortValidationError
      );
      expect(mockHttpClient.get).not.toHaveBeenCalled();
    });

    it('should handle empty scorecard list', async () => {
      vi.mocked(mockHttpClient.get).mockResolvedValue({ scorecards: [] });

      const result = await scorecardResource.list('service');

      expect(result).toHaveLength(0);
    });
  });

  describe('Validation', () => {
    it('should validate identifier format allows alphanumeric, hyphens, underscores', async () => {
      const input = {
        identifier: 'valid-scorecard_123',
        title: 'Valid',
        blueprint: 'service',
        rules: [],
      };

      vi.mocked(mockHttpClient.post).mockResolvedValue({
        ...input,
        createdAt: '2025-10-04T00:00:00Z',
        updatedAt: '2025-10-04T00:00:00Z',
      });

      await expect(scorecardResource.create(input)).resolves.toBeDefined();
    });

    it('should reject identifiers with spaces', async () => {
      const input = {
        identifier: 'invalid scorecard',
        title: 'Invalid',
        blueprint: 'service',
        rules: [],
      };

      await expect(scorecardResource.create(input)).rejects.toThrow(
        PortValidationError
      );
    });

    it('should reject identifiers with special characters', async () => {
      const input = {
        identifier: 'invalid@scorecard!',
        title: 'Invalid',
        blueprint: 'service',
        rules: [],
      };

      await expect(scorecardResource.create(input)).rejects.toThrow(
        PortValidationError
      );
    });
  });

  describe('Date transformation', () => {
    it('should transform createdAt string to Date object', async () => {
      const scorecard = {
        identifier: 'test',
        title: 'Test',
        blueprint: 'service',
        rules: [],
        createdAt: '2025-10-04T12:00:00Z',
        updatedAt: '2025-10-04T12:00:00Z',
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(scorecard);

      const result = await scorecardResource.get('service', 'test');

      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.createdAt.toISOString()).toBe('2025-10-04T12:00:00.000Z');
    });

    it('should transform updatedAt string to Date object', async () => {
      const scorecard = {
        identifier: 'test',
        title: 'Test',
        blueprint: 'service',
        rules: [],
        createdAt: '2025-10-04T12:00:00Z',
        updatedAt: '2025-10-04T13:00:00Z',
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(scorecard);

      const result = await scorecardResource.get('service', 'test');

      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(result.updatedAt.toISOString()).toBe('2025-10-04T13:00:00.000Z');
    });
  });
});

