/**
 * Integration tests for Teams and Users resources
 * 
 * These tests run against the real Port API
 * Prerequisites: PORT_CLIENT_ID and PORT_CLIENT_SECRET in .env.local
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PortClient } from '../../src';
import { PortNotFoundError } from '../../src/errors';

const hasCredentials = !!(
  process.env.PORT_CLIENT_ID && 
  process.env.PORT_CLIENT_SECRET
);

describe.skipIf(!hasCredentials)('Teams & Users Integration', () => {
  let client: PortClient;
  const timestamp = Date.now();
  const testTeamId = `test_team_${timestamp}`;
  
  const createdTeamIds: string[] = [];

  beforeAll(async () => {
    client = new PortClient();
  });

  afterAll(async () => {
    // Cleanup teams
    for (const teamId of createdTeamIds) {
      try {
        await client.teams.delete(teamId);
      } catch (error) {
        console.warn(`Failed to delete team ${teamId}:`, error);
      }
    }
  }, 30000);

  describe('Teams', () => {
    it('should create a team', async () => {
      const team = await client.teams.create({
        name: testTeamId,
        description: 'Integration test team',
        users: [],
      });

      createdTeamIds.push(team.name);

      expect(team.name).toBe(testTeamId);
      expect(team.description).toBe('Integration test team');
      expect(team.provider).toBe('port');
    }, 15000);

    it('should get a team', async () => {
      const team = await client.teams.get(testTeamId);

      expect(team.name).toBe(testTeamId);
      expect(team.description).toBe('Integration test team');
    }, 10000);

    it('should list teams', async () => {
      const teams = await client.teams.list();

      expect(Array.isArray(teams)).toBe(true);
      
      const testTeam = teams.find(t => t.name === testTeamId);
      expect(testTeam).toBeDefined();
    }, 10000);

    it('should update a team', async () => {
      const updated = await client.teams.update(testTeamId, {
        description: 'Updated team description',
      });

      expect(updated.name).toBe(testTeamId);
      expect(updated.description).toBe('Updated team description');
    }, 15000);

    it('should handle 404 for non-existent team', async () => {
      await expect(
        client.teams.get('non_existent_team_id')
      ).rejects.toThrow(PortNotFoundError);
    }, 10000);

    it('should delete a team', async () => {
      await client.teams.delete(testTeamId);

      // Verify it's deleted
      await expect(
        client.teams.get(testTeamId)
      ).rejects.toThrow(PortNotFoundError);

      // Remove from cleanup list
      const index = createdTeamIds.indexOf(testTeamId);
      if (index > -1) {
        createdTeamIds.splice(index, 1);
      }
    }, 15000);
  });

  describe('Users', () => {
    it('should list users', async () => {
      const users = await client.users.list();

      expect(Array.isArray(users)).toBe(true);
      expect(users.length).toBeGreaterThan(0);
      
      // Check structure of first user
      if (users.length > 0) {
        const user = users[0];
        expect(user.email).toBeDefined();
        expect(user.status).toBeDefined();
        expect(user.createdAt).toBeInstanceOf(Date);
      }
    }, 10000);

    it('should get user details', async () => {
      // Get first user from list
      const users = await client.users.list();
      if (users.length === 0) {
        console.warn('No users available for testing');
        return;
      }

      const userEmail = users[0].email;
      const user = await client.users.get(userEmail);

      expect(user.email).toBe(userEmail);
      expect(user.status).toBeDefined();
      expect(user.createdAt).toBeInstanceOf(Date);
    }, 10000);

    it('should list users with roles and teams', async () => {
      const users = await client.users.list({
        fields: ['roles', 'teams'],
      });

      expect(Array.isArray(users)).toBe(true);
      
      // Some users should have roles or teams
      if (users.length > 0) {
        const userWithData = users.find(u => 
          (u.roles && u.roles.length > 0) || 
          (u.teams && u.teams.length > 0)
        );
        
        if (userWithData) {
          if (userWithData.roles) {
            expect(Array.isArray(userWithData.roles)).toBe(true);
          }
          if (userWithData.teams) {
            expect(Array.isArray(userWithData.teams)).toBe(true);
          }
        }
      }
    }, 15000);

    it('should handle 404 for non-existent user', async () => {
      await expect(
        client.users.get('non_existent_user@example.com')
      ).rejects.toThrow(PortNotFoundError);
    }, 10000);
  });
});
