/**
 * Integration tests for EntityResource
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

describe.skipIf(!hasCredentials)('EntityResource Integration', () => {
  let client: PortClient;
  const testBlueprintId = `test_entity_bp_${Date.now()}`;
  const testEntityIds: string[] = [];

  beforeAll(async () => {
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

    // Create test blueprint for entities
    await client.blueprints.create({
      identifier: testBlueprintId,
      title: 'Test Entity Blueprint',
      icon: 'Service',
      schema: {
        properties: {
          name: {
            type: 'string',
            title: 'Name',
          },
          status: {
            type: 'string',
            title: 'Status',
            enum: ['active', 'inactive', 'pending'],
          },
          count: {
            type: 'number',
            title: 'Count',
          },
          enabled: {
            type: 'boolean',
            title: 'Enabled',
          },
          tags: {
            type: 'array',
            title: 'Tags',
            items: {
              type: 'string',
            },
          },
        },
        required: ['name'],
      },
    });

    console.log(`✓ Created test blueprint: ${testBlueprintId}`);
  }, 20000);

  afterAll(async () => {
    if (!client) return;

    // Clean up: delete test entities
    for (const entityId of testEntityIds) {
      try {
        await client.entities.delete(entityId, testBlueprintId);
        console.log(`✓ Cleaned up entity: ${entityId}`);
      } catch (error) {
        console.warn(`⚠️  Could not clean up entity ${entityId}:`, error);
      }
    }

    // Clean up: delete test blueprint
    try {
      await client.blueprints.delete(testBlueprintId);
      console.log(`✓ Cleaned up blueprint: ${testBlueprintId}`);
    } catch (error) {
      console.warn(`⚠️  Could not clean up blueprint:`, error);
    }
  }, 30000);

  describe('Entity CRUD Operations', () => {
    const entityId = `test_entity_${Date.now()}`;

    it('should create a new entity', async () => {
      const entity = await client.entities.create({
        identifier: entityId,
        blueprint: testBlueprintId,
        title: 'Test Entity',
        properties: {
          stringProps: {
            name: 'Test Service',
            status: 'active',
          },
          numberProps: {
            count: 42,
          },
          booleanProps: {
            enabled: true,
          },
          arrayProps: {
            stringItems: {
              tags: ['test', 'integration'],
            },
          },
        },
      });

      expect(entity).toBeDefined();
      expect(entity.identifier).toBe(entityId);
      expect(entity.blueprint).toBe(testBlueprintId);
      expect(entity.title).toBe('Test Entity');

      testEntityIds.push(entityId);
      console.log(`✓ Created entity: ${entity.identifier}`);
    }, 15000);

    it('should get the created entity', async () => {
      const entity = await client.entities.get(entityId, testBlueprintId);

      expect(entity).toBeDefined();
      expect(entity.identifier).toBe(entityId);
      expect(entity.blueprint).toBe(testBlueprintId);
      expect(entity.properties?.stringProps?.name).toBe('Test Service');
      expect(entity.createdAt).toBeInstanceOf(Date);
      expect(entity.updatedAt).toBeInstanceOf(Date);

      console.log(`✓ Retrieved entity: ${entity.identifier}`);
    }, 10000);

    it('should update the entity', async () => {
      const updated = await client.entities.update(entityId, testBlueprintId, {
        title: 'Updated Test Entity',
        properties: {
          stringProps: {
            status: 'inactive',
          },
          numberProps: {
            count: 100,
          },
        },
      });

      expect(updated).toBeDefined();
      expect(updated.identifier).toBe(entityId);
      expect(updated.title).toBe('Updated Test Entity');
      expect(updated.properties?.stringProps?.status).toBe('inactive');
      expect(updated.properties?.numberProps?.count).toBe(100);

      console.log(`✓ Updated entity: ${updated.identifier}`);
    }, 10000);

    it('should list entities from the blueprint', async () => {
      const response = await client.entities.list(testBlueprintId, {
        limit: 50,
      });

      expect(response).toBeDefined();
      expect(response.data).toBeInstanceOf(Array);
      expect(response.data.length).toBeGreaterThan(0);

      const testEntity = response.data.find((e) => e.identifier === entityId);
      expect(testEntity).toBeDefined();

      console.log(`✓ Listed ${response.data.length} entities`);
    }, 10000);

    it('should throw PortNotFoundError for non-existent entity', async () => {
      await expect(
        client.entities.get('non_existent_entity_xyz_123', testBlueprintId)
      ).rejects.toThrow(PortNotFoundError);

      console.log('✓ Correctly threw PortNotFoundError');
    }, 10000);
  });

  describe('Entity Search', () => {
    beforeAll(async () => {
      // Create additional test entities for search
      const entities = [
        {
          identifier: `search_test_1_${Date.now()}`,
          title: 'Search Test Alpha',
          properties: {
            stringProps: { name: 'Alpha Service', status: 'active' },
          },
        },
        {
          identifier: `search_test_2_${Date.now()}`,
          title: 'Search Test Beta',
          properties: {
            stringProps: { name: 'Beta Service', status: 'inactive' },
          },
        },
      ];

      for (const data of entities) {
        const entity = await client.entities.create({
          ...data,
          blueprint: testBlueprintId,
        });
        testEntityIds.push(entity.identifier);
      }

      console.log('✓ Created search test entities');
    }, 20000);

    it('should search entities by query', async () => {
      const results = await client.entities.search({
        combinator: 'and',
        rules: [
          {
            property: '$blueprint',
            operator: '=',
            value: testBlueprintId,
          },
          {
            property: 'status',
            operator: '=',
            value: 'active',
          },
        ],
      });

      expect(results).toBeInstanceOf(Array);
      expect(results.length).toBeGreaterThan(0);

      console.log(`✓ Found ${results.length} active entities`);
    }, 15000);
  });

  describe('Batch Operations', () => {
    const batchIds = [
      `batch_test_1_${Date.now()}`,
      `batch_test_2_${Date.now()}`,
      `batch_test_3_${Date.now()}`,
    ];

    it('should batch create entities', async () => {
      const entities = batchIds.map((id) => ({
        identifier: id,
        blueprint: testBlueprintId,
        title: `Batch Entity ${id}`,
        properties: {
          stringProps: {
            name: `Batch Service ${id}`,
            status: 'pending',
          },
        },
      }));

      const created = await client.entities.batchCreate(entities);

      expect(created).toBeInstanceOf(Array);
      expect(created.length).toBe(3);

      testEntityIds.push(...batchIds);
      console.log(`✓ Batch created ${created.length} entities`);
    }, 20000);

    it('should batch update entities', async () => {
      const updates = batchIds.map((id) => ({
        identifier: id,
        blueprint: testBlueprintId,
        data: {
          properties: {
            stringProps: {
              status: 'active',
            },
          },
        },
      }));

      const updated = await client.entities.batchUpdate(updates);

      expect(updated).toBeInstanceOf(Array);
      expect(updated.length).toBe(3);

      console.log(`✓ Batch updated ${updated.length} entities`);
    }, 20000);

    it('should batch delete entities', async () => {
      await client.entities.batchDelete(
        batchIds.map((id) => ({
          identifier: id,
          blueprint: testBlueprintId,
        }))
      );

      // Remove from cleanup list since they're already deleted
      batchIds.forEach((id) => {
        const index = testEntityIds.indexOf(id);
        if (index > -1) testEntityIds.splice(index, 1);
      });

      console.log(`✓ Batch deleted ${batchIds.length} entities`);
    }, 20000);
  });
});

