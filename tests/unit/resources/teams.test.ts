import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TeamResource } from '../../../src/resources/teams';
import type { HttpClient } from '../../../src/http-client';
import { createMockHttpClient } from '../../helpers/mocks';
import { PortValidationError } from '../../../src/errors';

describe('TeamResource', () => {
  let mockHttpClient: HttpClient;
  let teamResource: TeamResource;

  beforeEach(() => {
    mockHttpClient = createMockHttpClient() as unknown as HttpClient;
    teamResource = new TeamResource(mockHttpClient);
  });

  describe('create', () => {
    it('should create a team with valid data', async () => {
      const input = {
        name: 'platform-team',
        description: 'Platform Engineering Team',
        users: ['alice@company.com', 'bob@company.com'],
      };

      const expected = {
        team: {
          id: 'team-123',
          name: 'platform-team',
          description: 'Platform Engineering Team',
          provider: 'port',
          createdAt: '2025-10-04T00:00:00Z',
          updatedAt: '2025-10-04T00:00:00Z',
        },
        ok: true,
      };

      vi.mocked(mockHttpClient.post).mockResolvedValue(expected);

      const result = await teamResource.create(input);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/v1/teams',
        {
          name: input.name,
          description: input.description,
          users: input.users,
        },
        undefined
      );
      expect(result.name).toBe('platform-team');
      expect(result.description).toBe('Platform Engineering Team');
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('should create a team without description', async () => {
      const input = {
        name: 'backend-team',
      };

      const expected = {
        team: {
          id: 'team-456',
          name: 'backend-team',
          provider: 'port',
          createdAt: '2025-10-04T00:00:00Z',
          updatedAt: '2025-10-04T00:00:00Z',
        },
        ok: true,
      };

      vi.mocked(mockHttpClient.post).mockResolvedValue(expected);

      const result = await teamResource.create(input);

      expect(result.name).toBe('backend-team');
      expect(result.description).toBeUndefined();
    });

    it('should throw PortValidationError when name is empty', async () => {
      await expect(
        teamResource.create({ name: '' })
      ).rejects.toThrow(PortValidationError);
      expect(mockHttpClient.post).not.toHaveBeenCalled();
    });

    it('should throw PortValidationError when name is whitespace', async () => {
      await expect(
        teamResource.create({ name: '   ' })
      ).rejects.toThrow(PortValidationError);
      expect(mockHttpClient.post).not.toHaveBeenCalled();
    });

    it('should create team with name in request body', async () => {
      const input = {
        name: 'new-team',
        description: 'Test team',
      };

      const expected = {
        team: {
          id: 'team-789',
          name: 'new-team',
          provider: 'port',
          createdAt: '2025-10-04T00:00:00Z',
          updatedAt: '2025-10-04T00:00:00Z',
        },
        ok: true,
      };

      vi.mocked(mockHttpClient.post).mockResolvedValue(expected);

      await teamResource.create(input);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/v1/teams',
        expect.objectContaining({
          name: 'new-team',
          description: 'Test team'
        }),
        undefined
      );
    });
  });

  describe('get', () => {
    it('should fetch a team by name', async () => {
      const expected = {
        team: {
          id: 'team-123',
          name: 'platform-team',
          description: 'Platform Engineering',
          provider: 'port',
          createdAt: '2025-10-04T00:00:00Z',
          updatedAt: '2025-10-04T00:00:00Z',
          users: [
            {
              email: 'alice@company.com',
              firstName: 'Alice',
              lastName: 'Smith',
              status: 'active',
            },
          ],
        },
        ok: true,
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(expected);

      const result = await teamResource.get('platform-team');

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/v1/teams/platform-team',
        undefined
      );
      expect(result.name).toBe('platform-team');
      expect(result.users).toHaveLength(1);
      expect(result.users?.[0].email).toBe('alice@company.com');
    });

    it('should throw PortValidationError for empty name', async () => {
      await expect(teamResource.get('')).rejects.toThrow(PortValidationError);
      expect(mockHttpClient.get).not.toHaveBeenCalled();
    });

    it('should URL-encode team name', async () => {
      const expected = {
        team: {
          id: 'team-123',
          name: 'team/name',
          provider: 'port',
          createdAt: '2025-10-04T00:00:00Z',
          updatedAt: '2025-10-04T00:00:00Z',
        },
        ok: true,
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(expected);

      await teamResource.get('team/name');

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/v1/teams/team%2Fname',
        undefined
      );
    });
  });

  describe('update', () => {
    it('should update a team with partial data', async () => {
      const updates = {
        description: 'Updated description',
        users: ['alice@company.com', 'charlie@company.com'],
      };

      const expected = {
        team: {
          id: 'team-123',
          name: 'platform-team',
          description: 'Updated description',
          provider: 'port',
          createdAt: '2025-10-04T00:00:00Z',
          updatedAt: '2025-10-04T01:00:00Z',
        },
        ok: true,
      };

      vi.mocked(mockHttpClient.patch).mockResolvedValue(expected);

      const result = await teamResource.update('platform-team', updates);

      expect(mockHttpClient.patch).toHaveBeenCalledWith(
        '/v1/teams/platform-team',
        updates,
        undefined
      );
      expect(result.description).toBe('Updated description');
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('should throw PortValidationError for empty name', async () => {
      await expect(
        teamResource.update('', { description: 'Test' })
      ).rejects.toThrow(PortValidationError);
      expect(mockHttpClient.patch).not.toHaveBeenCalled();
    });
  });

  describe('change', () => {
    it('should replace team data completely', async () => {
      const data = {
        description: 'New description',
        users: ['newuser@company.com'],
      };

      const expected = {
        team: {
          id: 'team-123',
          name: 'platform-team',
          description: 'New description',
          provider: 'port',
          createdAt: '2025-10-04T00:00:00Z',
          updatedAt: '2025-10-04T02:00:00Z',
        },
        ok: true,
      };

      vi.mocked(mockHttpClient.put).mockResolvedValue(expected);

      const result = await teamResource.change('platform-team', data);

      expect(mockHttpClient.put).toHaveBeenCalledWith(
        '/v1/teams/platform-team',
        data,
        undefined
      );
      expect(result.description).toBe('New description');
    });

    it('should throw PortValidationError for empty name', async () => {
      await expect(
        teamResource.change('', { description: 'Test' })
      ).rejects.toThrow(PortValidationError);
      expect(mockHttpClient.put).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete a team by name', async () => {
      vi.mocked(mockHttpClient.delete).mockResolvedValue(undefined);

      await teamResource.delete('old-team');

      expect(mockHttpClient.delete).toHaveBeenCalledWith(
        '/v1/teams/old-team',
        undefined
      );
    });

    it('should throw PortValidationError for empty name', async () => {
      await expect(teamResource.delete('')).rejects.toThrow(
        PortValidationError
      );
      expect(mockHttpClient.delete).not.toHaveBeenCalled();
    });
  });

  describe('list', () => {
    it('should list all teams', async () => {
      const expected = {
        teams: [
          {
            id: 'team-1',
            name: 'platform-team',
            provider: 'port',
            createdAt: '2025-10-04T00:00:00Z',
            updatedAt: '2025-10-04T00:00:00Z',
          },
          {
            id: 'team-2',
            name: 'backend-team',
            provider: 'port',
            createdAt: '2025-10-04T00:00:00Z',
            updatedAt: '2025-10-04T00:00:00Z',
          },
        ],
        ok: true,
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(expected);

      const result = await teamResource.list();

      expect(mockHttpClient.get).toHaveBeenCalledWith('/v1/teams', undefined);
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('platform-team');
      expect(result[1].name).toBe('backend-team');
    });

    it('should list teams with specific fields', async () => {
      const expected = {
        teams: [
          {
            id: 'team-1',
            name: 'platform-team',
            users: [
              {
                email: 'alice@company.com',
                firstName: 'Alice',
              },
            ],
            createdAt: '2025-10-04T00:00:00Z',
            updatedAt: '2025-10-04T00:00:00Z',
          },
        ],
        ok: true,
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(expected);

      const result = await teamResource.list({
        fields: ['name', 'users.email', 'users.firstName'],
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/v1/teams?fields=name&fields=users.email&fields=users.firstName',
        undefined
      );
      expect(result).toHaveLength(1);
      expect(result[0].users?.[0].email).toBe('alice@company.com');
    });

    it('should handle empty teams array', async () => {
      const expected = {
        teams: [],
        ok: true,
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(expected);

      const result = await teamResource.list();

      expect(result).toHaveLength(0);
    });

    it('should handle missing teams property', async () => {
      const expected = {
        ok: true,
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(expected);

      const result = await teamResource.list();

      expect(result).toHaveLength(0);
    });
  });

  describe('date transformation', () => {
    it('should convert date strings to Date objects', async () => {
      const expected = {
        team: {
          id: 'team-123',
          name: 'test-team',
          provider: 'port',
          createdAt: '2025-10-04T10:30:00.000Z',
          updatedAt: '2025-10-04T15:45:00.000Z',
        },
        ok: true,
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(expected);

      const result = await teamResource.get('test-team');

      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(result.createdAt.toISOString()).toBe('2025-10-04T10:30:00.000Z');
      expect(result.updatedAt.toISOString()).toBe('2025-10-04T15:45:00.000Z');
    });
  });
});

