/**
 * Integration tests for BlueprintResource
 * Tests against real Port API (requires credentials)
 * 
 * Run with: pnpm test:integration
 * Requires: PORT_CLIENT_ID and PORT_CLIENT_SECRET in .env.local
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PortClient } from '../../src/client';
import { PortNotFoundError } from '../../src/errors';

// Skip tests if credentials are not available
const hasCredentials = !!(
  process.env.PORT_CLIENT_ID && 
  process.env.PORT_CLIENT_SECRET
);

describe.skipIf(!hasCredentials)('BlueprintResource Integration', () => {
  let client: PortClient;
  const testBlueprintId = `test_blueprint_${Date.now()}`;
  let createdBlueprintId: string;

  beforeAll(() => {
    if (!hasCredentials) {
      console.warn('⚠️  Skipping integration tests: PORT_CLIENT_ID and PORT_CLIENT_SECRET not set');
      return;
    }

    client = new PortClient({
      credentials: {
        clientId: process.env.PORT_CLIENT_ID!,
        clientSecret: process.env.PORT_CLIENT_SECRET!,
      },
      logger: {
        level: 1, // ERROR only
        enabled: true,
      },
    });

    console.log('✓ Integration test client initialized');
  });

  afterAll(async () => {
    if (!client || !createdBlueprintId) return;

    // Clean up: delete test blueprint
    try {
      await client.blueprints.delete(createdBlueprintId);
      console.log(`✓ Cleaned up test blueprint: ${createdBlueprintId}`);
    } catch (error) {
      console.warn(`⚠️  Could not clean up blueprint ${createdBlueprintId}:`, error);
    }
  });

  describe('Blueprint CRUD Operations', () => {
    it('should create a new blueprint', async () => {
      const blueprint = await client.blueprints.create({
        identifier: testBlueprintId,
        title: 'Test Blueprint',
        description: 'Integration test blueprint',
        icon: 'Blueprint',
        schema: {
          properties: {
            name: {
              type: 'string',
              title: 'Name',
            },
            environment: {
              type: 'string',
              title: 'Environment',
              enum: ['dev', 'staging', 'production'],
            },
            version: {
              type: 'number',
              title: 'Version',
            },
            isActive: {
              type: 'boolean',
              title: 'Active',
            },
          },
          required: ['name'],
        },
      });

      expect(blueprint).toBeDefined();
      expect(blueprint.identifier).toBe(testBlueprintId);
      expect(blueprint.title).toBe('Test Blueprint');
      expect(blueprint.schema?.properties).toHaveProperty('name');

      createdBlueprintId = blueprint.identifier;
      console.log(`✓ Created blueprint: ${blueprint.identifier}`);
    }, 15000);

    it('should get the created blueprint', async () => {
      const blueprint = await client.blueprints.get(testBlueprintId);

      expect(blueprint).toBeDefined();
      expect(blueprint.identifier).toBe(testBlueprintId);
      expect(blueprint.title).toBe('Test Blueprint');
      expect(blueprint.createdAt).toBeInstanceOf(Date);
      expect(blueprint.updatedAt).toBeInstanceOf(Date);

      console.log(`✓ Retrieved blueprint: ${blueprint.identifier}`);
    }, 10000);

    it('should list blueprints including the test blueprint', async () => {
      const response = await client.blueprints.list();

      expect(response).toBeDefined();
      expect(response.data).toBeInstanceOf(Array);
      expect(response.data.length).toBeGreaterThan(0);

      const testBlueprint = response.data.find(
        (bp) => bp.identifier === testBlueprintId
      );
      expect(testBlueprint).toBeDefined();

      console.log(`✓ Listed ${response.data.length} blueprints`);
    }, 10000);

    it('should update the blueprint', async () => {
      const updated = await client.blueprints.update(testBlueprintId, {
        title: 'Updated Test Blueprint',
        description: 'Updated description',
      });

      expect(updated).toBeDefined();
      expect(updated.identifier).toBe(testBlueprintId);
      expect(updated.title).toBe('Updated Test Blueprint');
      expect(updated.description).toBe('Updated description');

      console.log(`✓ Updated blueprint: ${updated.identifier}`);
    }, 10000);

    it('should throw PortNotFoundError for non-existent blueprint', async () => {
      await expect(
        client.blueprints.get('non_existent_blueprint_xyz_123')
      ).rejects.toThrow(PortNotFoundError);

      console.log('✓ Correctly threw PortNotFoundError');
    }, 10000);
  });

  describe('Blueprint Relations', () => {
    it('should get blueprint relations', async () => {
      const relations = await client.blueprints.getRelations(testBlueprintId);

      expect(relations).toBeDefined();
      expect(Array.isArray(relations)).toBe(true);

      console.log(`✓ Retrieved ${relations.length} relations`);
    }, 10000);
  });

  describe('System Blueprints', () => {
    it('should fetch _team system blueprint', async () => {
      const teamBlueprint = await client.blueprints.get('_team');

      expect(teamBlueprint).toBeDefined();
      expect(teamBlueprint.identifier).toBe('_team');
      expect(teamBlueprint.schema).toBeDefined();

      console.log('✓ Retrieved _team system blueprint');
    }, 10000);

    it('should fetch _user system blueprint', async () => {
      const userBlueprint = await client.blueprints.get('_user');

      expect(userBlueprint).toBeDefined();
      expect(userBlueprint.identifier).toBe('_user');
      expect(userBlueprint.schema).toBeDefined();

      console.log('✓ Retrieved _user system blueprint');
    }, 10000);
  });
});

