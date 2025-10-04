/**
 * Integration tests for PortClient
 * Tests client initialization and basic connectivity
 * 
 * Run with: pnpm test:integration
 * Requires: PORT_CLIENT_ID and PORT_CLIENT_SECRET in .env.local
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { PortClient } from '../../src/client';
import { PortAuthError } from '../../src/errors';

// Skip tests if credentials are not available
const hasCredentials = !!(
  process.env.PORT_CLIENT_ID && 
  process.env.PORT_CLIENT_SECRET
);

describe.skipIf(!hasCredentials)('PortClient Integration', () => {
  let client: PortClient;

  beforeAll(() => {
    if (!hasCredentials) {
      console.warn('⚠️  Skipping integration tests: PORT_CLIENT_ID and PORT_CLIENT_SECRET not set');
      return;
    }

    console.log('✓ Integration test credentials available');
  });

  describe('Client Initialization', () => {
    it('should initialize client with OAuth credentials', () => {
      client = new PortClient({
        credentials: {
          clientId: process.env.PORT_CLIENT_ID!,
          clientSecret: process.env.PORT_CLIENT_SECRET!,
        },
      });

      expect(client).toBeDefined();
      expect(client.entities).toBeDefined();
      expect(client.blueprints).toBeDefined();
      expect(client.actions).toBeDefined();
      expect(client.scorecards).toBeDefined();

      console.log('✓ Client initialized successfully');
    });

    it('should fail with invalid credentials', async () => {
      const badClient = new PortClient({
        credentials: {
          clientId: 'invalid_client_id',
          clientSecret: 'invalid_client_secret',
        },
      });

      // Try to list blueprints (should fail auth)
      await expect(badClient.blueprints.list()).rejects.toThrow(PortAuthError);

      console.log('✓ Correctly rejected invalid credentials');
    }, 10000);
  });

  describe('Region Configuration', () => {
    it('should connect to EU region by default', async () => {
      const euClient = new PortClient({
        credentials: {
          clientId: process.env.PORT_CLIENT_ID!,
          clientSecret: process.env.PORT_CLIENT_SECRET!,
        },
        // No region specified, should default to EU
      });

      // Should successfully list blueprints
      const response = await euClient.blueprints.list();
      expect(response.data).toBeInstanceOf(Array);

      console.log(`✓ Connected to EU region, found ${response.data.length} blueprints`);
    }, 10000);

    it('should connect with explicit region', async () => {
      const client = new PortClient({
        credentials: {
          clientId: process.env.PORT_CLIENT_ID!,
          clientSecret: process.env.PORT_CLIENT_SECRET!,
        },
        region: 'eu',
      });

      const response = await client.blueprints.list();
      expect(response.data).toBeInstanceOf(Array);

      console.log('✓ Explicit region configuration works');
    }, 10000);
  });

  describe('Resource Availability', () => {
    beforeAll(() => {
      client = new PortClient({
        credentials: {
          clientId: process.env.PORT_CLIENT_ID!,
          clientSecret: process.env.PORT_CLIENT_SECRET!,
        },
      });
    });

    it('should have entities resource available', async () => {
      expect(client.entities).toBeDefined();
      expect(typeof client.entities.list).toBe('function');

      console.log('✓ Entities resource available');
    });

    it('should have blueprints resource available', async () => {
      expect(client.blueprints).toBeDefined();
      expect(typeof client.blueprints.list).toBe('function');

      const response = await client.blueprints.list();
      expect(response.data).toBeInstanceOf(Array);

      console.log(`✓ Blueprints resource available (${response.data.length} blueprints)`);
    }, 10000);

    it('should have actions resource available', async () => {
      expect(client.actions).toBeDefined();
      expect(typeof client.actions.list).toBe('function');

      console.log('✓ Actions resource available');
    });

    it('should have scorecards resource available', async () => {
      expect(client.scorecards).toBeDefined();
      expect(typeof client.scorecards.list).toBe('function');

      console.log('✓ Scorecards resource available');
    });
  });

  describe('API Connectivity', () => {
    beforeAll(() => {
      client = new PortClient({
        credentials: {
          clientId: process.env.PORT_CLIENT_ID!,
          clientSecret: process.env.PORT_CLIENT_SECRET!,
        },
      });
    });

    it('should successfully authenticate and fetch data', async () => {
      const blueprints = await client.blueprints.list();

      expect(blueprints).toBeDefined();
      expect(blueprints.data).toBeInstanceOf(Array);
      expect(blueprints.pagination).toBeDefined();
      expect(blueprints.pagination.total).toBeGreaterThanOrEqual(0);

      console.log(`✓ Successfully authenticated and fetched ${blueprints.data.length} blueprints`);
    }, 10000);

    it('should handle pagination', async () => {
      const response = await client.blueprints.list({ limit: 5 });

      expect(response.data).toBeInstanceOf(Array);
      expect(response.data.length).toBeLessThanOrEqual(5);
      expect(response.pagination).toBeDefined();
      expect(response.pagination.limit).toBe(5);

      console.log(`✓ Pagination works (limit: 5, got: ${response.data.length})`);
    }, 10000);
  });

  describe('Error Handling', () => {
    beforeAll(() => {
      client = new PortClient({
        credentials: {
          clientId: process.env.PORT_CLIENT_ID!,
          clientSecret: process.env.PORT_CLIENT_SECRET!,
        },
      });
    });

    it('should handle 404 errors correctly', async () => {
      await expect(
        client.blueprints.get('definitely_does_not_exist_12345')
      ).rejects.toThrow();

      console.log('✓ 404 errors handled correctly');
    }, 10000);

    it('should include error details', async () => {
      try {
        await client.blueprints.get('non_existent_blueprint');
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeDefined();
        expect(error.message).toBeDefined();
        expect(error.statusCode).toBeDefined();

        console.log(`✓ Error details included: ${error.message}`);
      }
    }, 10000);
  });
});

