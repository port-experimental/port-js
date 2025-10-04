import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UserResource } from '../../../src/resources/users';
import type { HttpClient } from '../../../src/http-client';
import { PortValidationError } from '../../../src/errors';
import { createMockHttpClient } from '../../helpers/mocks';

describe('UserResource', () => {
  let mockHttpClient: HttpClient;
  let userResource: UserResource;

  beforeEach(() => {
    mockHttpClient = createMockHttpClient() as unknown as HttpClient;
    userResource = new UserResource(mockHttpClient);
  });

  describe('invite()', () => {
    it('should invite a user with email only', async () => {
      const input = {
        email: 'alice@company.com',
      };

      const expected = {
        user: {
          id: 'user-123',
          email: 'alice@company.com',
          status: 'PENDING',
          createdAt: '2025-10-04T00:00:00Z',
          updatedAt: '2025-10-04T00:00:00Z',
        },
        ok: true,
      };

      vi.mocked(mockHttpClient.post).mockResolvedValue(expected);

      const result = await userResource.invite(input);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/v1/users/invite',
        { invitee: input },
        undefined
      );
      expect(result.email).toBe('alice@company.com');
      expect(result.id).toBe('user-123');
    });

    it('should invite a user with roles and teams', async () => {
      const input = {
        email: 'bob@company.com',
        roles: ['Admin', 'Developer'],
        teams: ['platform-team'],
      };

      const expected = {
        user: {
          id: 'user-456',
          email: 'bob@company.com',
          status: 'PENDING',
          createdAt: '2025-10-04T00:00:00Z',
          updatedAt: '2025-10-04T00:00:00Z',
        },
        ok: true,
      };

      vi.mocked(mockHttpClient.post).mockResolvedValue(expected);

      const result = await userResource.invite(input);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/v1/users/invite',
        { invitee: input },
        undefined
      );
      expect(result.email).toBe('bob@company.com');
    });

    it('should throw error for empty email', async () => {
      await expect(
        userResource.invite({ email: '' })
      ).rejects.toThrow(PortValidationError);

      expect(mockHttpClient.post).not.toHaveBeenCalled();
    });

    it('should throw error for missing email', async () => {
      await expect(
        userResource.invite({ email: '   ' })
      ).rejects.toThrow(PortValidationError);

      expect(mockHttpClient.post).not.toHaveBeenCalled();
    });

    it('should pass request options', async () => {
      const input = { email: 'charlie@company.com' };
      const options = { timeout: 5000 };

      const expected = {
        user: {
          id: 'user-789',
          email: 'charlie@company.com',
          status: 'PENDING',
          createdAt: '2025-10-04T00:00:00Z',
          updatedAt: '2025-10-04T00:00:00Z',
        },
        ok: true,
      };

      vi.mocked(mockHttpClient.post).mockResolvedValue(expected);

      await userResource.invite(input, options);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/v1/users/invite',
        { invitee: input },
        options
      );
    });
  });

  describe('get()', () => {
    it('should get a user by email', async () => {
      const expected = {
        user: {
          id: 'user-123',
          email: 'alice@company.com',
          firstName: 'Alice',
          lastName: 'Smith',
          status: 'VERIFIED',
          createdAt: '2025-10-04T00:00:00Z',
          updatedAt: '2025-10-04T00:00:00Z',
        },
        ok: true,
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(expected);

      const result = await userResource.get('alice@company.com');

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/v1/users/alice%40company.com',
        undefined
      );
      expect(result.email).toBe('alice@company.com');
      expect(result.firstName).toBe('Alice');
      expect(result.lastName).toBe('Smith');
    });

    it('should encode email with special characters', async () => {
      const email = 'user+test@company.com';

      const expected = {
        user: {
          id: 'user-123',
          email,
          status: 'VERIFIED',
          createdAt: '2025-10-04T00:00:00Z',
          updatedAt: '2025-10-04T00:00:00Z',
        },
        ok: true,
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(expected);

      await userResource.get(email);

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/v1/users/user%2Btest%40company.com',
        undefined
      );
    });

    it('should request with fields option', async () => {
      const expected = {
        user: {
          id: 'user-123',
          email: 'alice@company.com',
          status: 'VERIFIED',
          createdAt: '2025-10-04T00:00:00Z',
          updatedAt: '2025-10-04T00:00:00Z',
          roles: [{ name: 'Admin' }],
          teams: [{ name: 'platform-team' }],
        },
        ok: true,
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(expected);

      const result = await userResource.get('alice@company.com', {
        fields: ['roles', 'teams'],
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/v1/users/alice%40company.com?fields=roles%2Cteams',
        undefined
      );
      expect(result.roles).toEqual([{ name: 'Admin' }]);
      expect(result.teams).toEqual([{ name: 'platform-team' }]);
    });

    it('should throw error for empty email', async () => {
      await expect(
        userResource.get('')
      ).rejects.toThrow(PortValidationError);

      expect(mockHttpClient.get).not.toHaveBeenCalled();
    });

    it('should transform date strings to Date objects', async () => {
      const expected = {
        user: {
          id: 'user-123',
          email: 'alice@company.com',
          status: 'VERIFIED',
          createdAt: '2025-10-04T10:30:00Z',
          updatedAt: '2025-10-04T12:45:00Z',
        },
        ok: true,
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(expected);

      const result = await userResource.get('alice@company.com');

      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(result.createdAt.toISOString()).toBe('2025-10-04T10:30:00.000Z');
    });
  });

  describe('update()', () => {
    it('should update user roles', async () => {
      const updates = {
        roles: ['Admin', 'Developer'],
      };

      const expected = {
        user: {
          id: 'user-123',
          email: 'alice@company.com',
          status: 'VERIFIED',
          createdAt: '2025-10-04T00:00:00Z',
          updatedAt: '2025-10-04T01:00:00Z',
        },
        ok: true,
      };

      vi.mocked(mockHttpClient.patch).mockResolvedValue(expected);

      const result = await userResource.update('alice@company.com', updates);

      expect(mockHttpClient.patch).toHaveBeenCalledWith(
        '/v1/users/alice%40company.com',
        updates,
        undefined
      );
      expect(result.email).toBe('alice@company.com');
    });

    it('should update user teams', async () => {
      const updates = {
        teams: ['platform-team', 'security-team'],
      };

      const expected = {
        user: {
          id: 'user-123',
          email: 'bob@company.com',
          status: 'VERIFIED',
          createdAt: '2025-10-04T00:00:00Z',
          updatedAt: '2025-10-04T01:00:00Z',
        },
        ok: true,
      };

      vi.mocked(mockHttpClient.patch).mockResolvedValue(expected);

      await userResource.update('bob@company.com', updates);

      expect(mockHttpClient.patch).toHaveBeenCalledWith(
        '/v1/users/bob%40company.com',
        updates,
        undefined
      );
    });

    it('should update both roles and teams', async () => {
      const updates = {
        roles: ['Admin'],
        teams: ['platform-team'],
      };

      const expected = {
        user: {
          id: 'user-123',
          email: 'charlie@company.com',
          status: 'VERIFIED',
          createdAt: '2025-10-04T00:00:00Z',
          updatedAt: '2025-10-04T01:00:00Z',
        },
        ok: true,
      };

      vi.mocked(mockHttpClient.patch).mockResolvedValue(expected);

      await userResource.update('charlie@company.com', updates);

      expect(mockHttpClient.patch).toHaveBeenCalledWith(
        '/v1/users/charlie%40company.com',
        updates,
        undefined
      );
    });

    it('should encode email in URL', async () => {
      const email = 'user+test@company.com';

      const expected = {
        user: {
          id: 'user-123',
          email,
          status: 'VERIFIED',
          createdAt: '2025-10-04T00:00:00Z',
          updatedAt: '2025-10-04T01:00:00Z',
        },
        ok: true,
      };

      vi.mocked(mockHttpClient.patch).mockResolvedValue(expected);

      await userResource.update(email, { roles: ['Admin'] });

      expect(mockHttpClient.patch).toHaveBeenCalledWith(
        '/v1/users/user%2Btest%40company.com',
        { roles: ['Admin'] },
        undefined
      );
    });

    it('should throw error for empty email', async () => {
      await expect(
        userResource.update('', { roles: ['Admin'] })
      ).rejects.toThrow(PortValidationError);

      expect(mockHttpClient.patch).not.toHaveBeenCalled();
    });
  });

  describe('delete()', () => {
    it('should delete a user', async () => {
      vi.mocked(mockHttpClient.delete).mockResolvedValue(undefined);

      await userResource.delete('alice@company.com');

      expect(mockHttpClient.delete).toHaveBeenCalledWith(
        '/v1/users/alice%40company.com',
        undefined
      );
    });

    it('should encode email in URL', async () => {
      const email = 'user+test@company.com';

      vi.mocked(mockHttpClient.delete).mockResolvedValue(undefined);

      await userResource.delete(email);

      expect(mockHttpClient.delete).toHaveBeenCalledWith(
        '/v1/users/user%2Btest%40company.com',
        undefined
      );
    });

    it('should pass request options', async () => {
      const options = { timeout: 5000 };

      vi.mocked(mockHttpClient.delete).mockResolvedValue(undefined);

      await userResource.delete('alice@company.com', options);

      expect(mockHttpClient.delete).toHaveBeenCalledWith(
        '/v1/users/alice%40company.com',
        options
      );
    });

    it('should throw error for empty email', async () => {
      await expect(
        userResource.delete('')
      ).rejects.toThrow(PortValidationError);

      expect(mockHttpClient.delete).not.toHaveBeenCalled();
    });
  });

  describe('list()', () => {
    it('should list all users', async () => {
      const expected = {
        users: [
          {
            id: 'user-1',
            email: 'alice@company.com',
            firstName: 'Alice',
            status: 'VERIFIED',
            createdAt: '2025-10-04T00:00:00Z',
            updatedAt: '2025-10-04T00:00:00Z',
          },
          {
            id: 'user-2',
            email: 'bob@company.com',
            firstName: 'Bob',
            status: 'VERIFIED',
            createdAt: '2025-10-04T00:00:00Z',
            updatedAt: '2025-10-04T00:00:00Z',
          },
        ],
        ok: true,
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(expected);

      const result = await userResource.list();

      expect(mockHttpClient.get).toHaveBeenCalledWith('/v1/users', undefined);
      expect(result).toHaveLength(2);
      expect(result[0].email).toBe('alice@company.com');
      expect(result[1].email).toBe('bob@company.com');
    });

    it('should list users with fields option', async () => {
      const expected = {
        users: [
          {
            id: 'user-1',
            email: 'alice@company.com',
            status: 'VERIFIED',
            createdAt: '2025-10-04T00:00:00Z',
            updatedAt: '2025-10-04T00:00:00Z',
            roles: [{ name: 'Admin' }],
            teams: [{ name: 'platform-team' }],
          },
        ],
        ok: true,
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(expected);

      const result = await userResource.list({ fields: ['roles', 'teams'] });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/v1/users?fields=roles%2Cteams',
        undefined
      );
      expect(result[0].roles).toEqual([{ name: 'Admin' }]);
      expect(result[0].teams).toEqual([{ name: 'platform-team' }]);
    });

    it('should return empty array when no users', async () => {
      const expected = {
        users: [],
        ok: true,
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(expected);

      const result = await userResource.list();

      expect(result).toEqual([]);
    });

    it('should transform all users dates', async () => {
      const expected = {
        users: [
          {
            id: 'user-1',
            email: 'alice@company.com',
            status: 'VERIFIED',
            createdAt: '2025-10-04T00:00:00Z',
            updatedAt: '2025-10-04T01:00:00Z',
          },
        ],
        ok: true,
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(expected);

      const result = await userResource.list();

      expect(result[0].createdAt).toBeInstanceOf(Date);
      expect(result[0].updatedAt).toBeInstanceOf(Date);
    });
  });
});

