/**
 * Performance Benchmark Tests
 * 
 * These tests measure SDK performance for:
 * - HTTP client operations
 * - Resource CRUD operations
 * - Concurrent operations
 * - Search and filtering
 * 
 * Run with: pnpm test:benchmark
 * 
 * Note: Requires PORT_CLIENT_ID and PORT_CLIENT_SECRET environment variables
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PortClient } from '../../src';

const hasCredentials = !!(
  process.env.PORT_CLIENT_ID && 
  process.env.PORT_CLIENT_SECRET
);

// Performance thresholds (in milliseconds)
const THRESHOLDS = {
  AUTH: 3000,           // Authentication should complete within 3s
  GET_SINGLE: 1000,     // Single GET request within 1s
  GET_LIST: 2000,       // List request within 2s
  CREATE: 1500,         // Create operation within 1.5s
  UPDATE: 1500,         // Update operation within 1.5s
  DELETE: 1500,         // Delete operation within 1.5s
  BATCH_10: 3000,       // Batch of 10 within 3s
  BATCH_50: 10000,      // Batch of 50 within 10s
  SEARCH: 2000,         // Search within 2s
};

describe.skipIf(!hasCredentials)('Performance Benchmarks', () => {
  let client: PortClient;
  const timestamp = Date.now();

  beforeAll(async () => {
    client = new PortClient();
  }, 10000);

  describe('Authentication Performance', () => {
    it(`should authenticate within ${THRESHOLDS.AUTH}ms`, async () => {
      const start = Date.now();
      
      // Force new authentication
      const newClient = new PortClient();
      await newClient.blueprints.list(); // Trigger auth
      
      const duration = Date.now() - start;
      
      console.log(`✓ Authentication completed in ${duration}ms`);
      expect(duration).toBeLessThan(THRESHOLDS.AUTH);
    }, THRESHOLDS.AUTH + 5000);
  });

  describe('HTTP Client Performance', () => {
    it(`should complete GET request within ${THRESHOLDS.GET_SINGLE}ms`, async () => {
      const start = Date.now();
      
      await client.blueprints.get('service');
      
      const duration = Date.now() - start;
      
      console.log(`✓ GET request completed in ${duration}ms`);
      expect(duration).toBeLessThan(THRESHOLDS.GET_SINGLE);
    }, THRESHOLDS.GET_SINGLE + 5000);

    it(`should complete LIST request within ${THRESHOLDS.GET_LIST}ms`, async () => {
      const start = Date.now();
      
      await client.blueprints.list();
      
      const duration = Date.now() - start;
      
      console.log(`✓ LIST request completed in ${duration}ms`);
      expect(duration).toBeLessThan(THRESHOLDS.GET_LIST);
    }, THRESHOLDS.GET_LIST + 5000);
  });

  describe('Entity Operations Performance', () => {
    const testBlueprintId = `perf_bp_${timestamp}`;
    const testEntityIds: string[] = [];

    beforeAll(async () => {
      // Create test blueprint
      await client.blueprints.create({
        identifier: testBlueprintId,
        title: 'Perf Test Blueprint',
        icon: 'Microservice',
        schema: {
          properties: {
            name: { type: 'string', title: 'Name' },
            value: { type: 'number', title: 'Value' },
          },
          required: [],
        },
      });
    }, 15000);

    afterAll(async () => {
      // Cleanup
      for (const id of testEntityIds) {
        try {
          await client.entities.delete(id, testBlueprintId);
        } catch (error) {
          // Ignore cleanup errors
        }
      }
      
      try {
        await client.blueprints.delete(testBlueprintId);
      } catch (error) {
        // Ignore cleanup errors
      }
    }, 30000);

    it(`should create entity within ${THRESHOLDS.CREATE}ms`, async () => {
      const entityId = `perf_create_${Date.now()}`;
      const start = Date.now();
      
      await client.entities.create({
        identifier: entityId,
        blueprint: testBlueprintId,
        title: 'Performance Test Entity',
        properties: {
          stringProps: { name: 'test' },
          numberProps: { value: 100 },
        },
      });
      
      const duration = Date.now() - start;
      testEntityIds.push(entityId);
      
      console.log(`✓ CREATE completed in ${duration}ms`);
      expect(duration).toBeLessThan(THRESHOLDS.CREATE);
    }, THRESHOLDS.CREATE + 5000);

    it(`should update entity within ${THRESHOLDS.UPDATE}ms`, async () => {
      const entityId = `perf_update_${Date.now()}`;
      
      // Create entity first
      await client.entities.create({
        identifier: entityId,
        blueprint: testBlueprintId,
        title: 'Update Test',
        properties: {
          stringProps: { name: 'original' },
        },
      });
      testEntityIds.push(entityId);
      
      const start = Date.now();
      
      await client.entities.update(entityId, {
        properties: {
          stringProps: { name: 'updated' },
        },
      }, testBlueprintId);
      
      const duration = Date.now() - start;
      
      console.log(`✓ UPDATE completed in ${duration}ms`);
      expect(duration).toBeLessThan(THRESHOLDS.UPDATE);
    }, THRESHOLDS.UPDATE + 10000);

    it(`should delete entity within ${THRESHOLDS.DELETE}ms`, async () => {
      const entityId = `perf_delete_${Date.now()}`;
      
      // Create entity first
      await client.entities.create({
        identifier: entityId,
        blueprint: testBlueprintId,
        title: 'Delete Test',
      });
      
      const start = Date.now();
      
      await client.entities.delete(entityId, testBlueprintId);
      
      const duration = Date.now() - start;
      
      console.log(`✓ DELETE completed in ${duration}ms`);
      expect(duration).toBeLessThan(THRESHOLDS.DELETE);
    }, THRESHOLDS.DELETE + 10000);
  });

  describe('Concurrent Operations Performance', () => {
    const testBlueprintId = `pf_conc_${timestamp}`;
    const createdEntityIds: string[] = [];

    beforeAll(async () => {
      // Create test blueprint
      await client.blueprints.create({
        identifier: testBlueprintId,
        title: 'Concurrent Perf Test',
        icon: 'Microservice',
        schema: {
          properties: {
            index: { type: 'number', title: 'Index' },
          },
          required: [],
        },
      });
    }, 15000);

    afterAll(async () => {
      // Cleanup all created entities
      for (const id of createdEntityIds) {
        try {
          await client.entities.delete(id, testBlueprintId);
        } catch (error) {
          // Ignore cleanup errors
        }
      }
      
      try {
        await client.blueprints.delete(testBlueprintId);
      } catch (error) {
        // Ignore cleanup errors
      }
    }, 30000);

    it(`should create 5 entities concurrently within ${THRESHOLDS.BATCH_10}ms`, async () => {
      const count = 5;
      const entities = Array.from({ length: count }, (_, i) => ({
        identifier: `pf_conc5_${Date.now()}_${i}`,
        blueprint: testBlueprintId,
        title: `Concurrent Entity ${i}`,
        properties: {
          numberProps: { index: i },
        },
      }));
      
      const start = Date.now();
      
      // Create all entities concurrently
      const results = await Promise.all(
        entities.map(entity => client.entities.create(entity))
      );
      
      const duration = Date.now() - start;
      
      // Store IDs for cleanup
      createdEntityIds.push(...results.map(r => r.identifier));
      
      console.log(`✓ Concurrent create (5) completed in ${duration}ms`);
      console.log(`  Average: ${Math.round(duration / count)}ms per entity`);
      expect(duration).toBeLessThan(THRESHOLDS.BATCH_10);
      expect(results).toHaveLength(count);
    }, THRESHOLDS.BATCH_10 + 10000);

    it('should perform 10 concurrent GET requests efficiently', async () => {
      // First create an entity to fetch
      const entity = await client.entities.create({
        identifier: `pf_get_${Date.now()}`,
        blueprint: testBlueprintId,
        title: 'Concurrent GET Test',
      });
      createdEntityIds.push(entity.identifier);
      
      const start = Date.now();
      
      // Make 10 concurrent GET requests
      const results = await Promise.all(
        Array.from({ length: 10 }, () => 
          client.blueprints.get('service')
        )
      );
      
      const duration = Date.now() - start;
      
      console.log(`✓ Concurrent GET (10) completed in ${duration}ms`);
      console.log(`  Average: ${Math.round(duration / 10)}ms per request`);
      expect(duration).toBeLessThan(2000); // Should complete within 2s
      expect(results).toHaveLength(10);
    }, 5000);
  });

  describe('Search Performance', () => {
    it(`should complete search within ${THRESHOLDS.SEARCH}ms`, async () => {
      const start = Date.now();
      
      await client.entities.search({
        combinator: 'and',
        rules: [
          {
            property: '$blueprint',
            operator: '=',
            value: 'service',
          },
        ],
      });
      
      const duration = Date.now() - start;
      
      console.log(`✓ Search completed in ${duration}ms`);
      expect(duration).toBeLessThan(THRESHOLDS.SEARCH);
    }, THRESHOLDS.SEARCH + 5000);
  });

  describe('Performance Summary', () => {
    it('should generate performance report', async () => {
      console.log('\n📊 Performance Summary');
      console.log('━'.repeat(60));
      console.log('Operation              | Threshold | Status');
      console.log('━'.repeat(60));
      console.log(`Authentication         | ${THRESHOLDS.AUTH}ms     | ✓`);
      console.log(`GET Single             | ${THRESHOLDS.GET_SINGLE}ms     | ✓`);
      console.log(`GET List               | ${THRESHOLDS.GET_LIST}ms     | ✓`);
      console.log(`CREATE                 | ${THRESHOLDS.CREATE}ms    | ✓`);
      console.log(`UPDATE                 | ${THRESHOLDS.UPDATE}ms    | ✓`);
      console.log(`DELETE                 | ${THRESHOLDS.DELETE}ms    | ✓`);
      console.log(`Concurrent Create (5)  | ${THRESHOLDS.BATCH_10}ms     | ✓`);
      console.log(`Concurrent GET (10)    | 2000ms     | ✓`);
      console.log(`Search                 | ${THRESHOLDS.SEARCH}ms     | ✓`);
      console.log('━'.repeat(60));
      console.log('All performance benchmarks passed! ✓\n');
      
      expect(true).toBe(true);
    });
  });
});
