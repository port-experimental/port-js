/**
 * Integration tests for Actions resource
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

describe.skipIf(!hasCredentials)('Actions Integration', () => {
  let client: PortClient;
  const timestamp = Date.now();
  const testBlueprintId = `test_action_bp_${timestamp}`;
  const testActionId = `test_action_${timestamp}`;
  const testEntityId = `test_action_entity_${timestamp}`;
  
  const createdActionIds: string[] = [];
  let createdBlueprintId: string | undefined;
  let createdEntityId: string | undefined;

  beforeAll(async () => {
    client = new PortClient();
    
    // Create test blueprint
    await client.blueprints.create({
      identifier: testBlueprintId,
      title: 'Action Test Blueprint',
      icon: 'Microservice',
      schema: {
        properties: {
          name: { type: 'string', title: 'Name' },
        },
        required: [],
      },
    });
    createdBlueprintId = testBlueprintId;

    // Create test entity
    const entity = await client.entities.create({
      identifier: testEntityId,
      blueprint: testBlueprintId,
      title: 'Test Action Entity',
      properties: {
        stringProps: { name: 'test' },
      },
    });
    createdEntityId = entity.identifier;
  }, 30000);

  afterAll(async () => {
    // Cleanup actions
    for (const actionId of createdActionIds) {
      try {
        await client.actions.delete(actionId);
      } catch (error) {
        console.warn(`Failed to delete action ${actionId}:`, error);
      }
    }

    // Cleanup entity
    if (createdEntityId && createdBlueprintId) {
      try {
        await client.entities.delete(createdEntityId, createdBlueprintId);
      } catch (error) {
        console.warn(`Failed to delete entity:`, error);
      }
    }

    // Cleanup blueprint
    if (createdBlueprintId) {
      try {
        await client.blueprints.delete(createdBlueprintId);
      } catch (error) {
        console.warn(`Failed to delete blueprint:`, error);
      }
    }
  }, 30000);

  it('should create an action', async () => {
    const action = await client.actions.create({
      identifier: testActionId,
      blueprint: testBlueprintId,
      title: 'Test Action',
      description: 'Integration test action',
      trigger: {
        type: 'self-service',
        operation: 'DAY-2',
        blueprintIdentifier: testBlueprintId,
        userInputs: {
          properties: {
            reason: {
              type: 'string',
              title: 'Reason',
            },
          },
          required: [],
        },
      },
      invocationMethod: {
        type: 'WEBHOOK',
        url: 'https://example.com/webhook',
        agent: false,
        synchronized: false,
      },
    });

    createdActionIds.push(action.identifier);

    expect(action.identifier).toBe(testActionId);
    expect(action.title).toBe('Test Action');
    expect(action.blueprint).toBe(testBlueprintId);
  }, 15000);

  it('should get an action', async () => {
    const action = await client.actions.get(testActionId);

    expect(action.identifier).toBe(testActionId);
    expect(action.title).toBe('Test Action');
  }, 10000);

  it('should list actions', async () => {
    const actions = await client.actions.list();

    expect(Array.isArray(actions)).toBe(true);
    
    const testAction = actions.find(a => a.identifier === testActionId);
    expect(testAction).toBeDefined();
    expect(testAction?.identifier).toBe(testActionId);
  }, 10000);

  it('should update an action', async () => {
    const updated = await client.actions.update(testActionId, {
      title: 'Updated Action Title',
      description: 'Updated description',
    });

    expect(updated.identifier).toBe(testActionId);
    expect(updated.title).toBe('Updated Action Title');
    expect(updated.description).toBe('Updated description');
  }, 15000);

  it('should execute an action', async () => {
    const execution = await client.actions.execute(testActionId, {
      entityIdentifier: testEntityId,
      properties: {
        reason: 'Integration test execution',
      },
    });

    expect(execution).toBeDefined();
    expect(execution.id).toBeDefined();
    expect(execution.action).toBeDefined();
    expect(execution.action.identifier).toBe(testActionId);
  }, 15000);

  it('should list runs for an action', async () => {
    const runs = await client.actions.listRuns(testActionId);

    expect(Array.isArray(runs)).toBe(true);
    // Should have at least one run from previous test
    expect(runs.length).toBeGreaterThan(0);
  }, 10000);

  it('should handle 404 for non-existent action', async () => {
    await expect(
      client.actions.get('non_existent_action_id')
    ).rejects.toThrow(PortNotFoundError);
  }, 10000);

  it('should delete an action', async () => {
    await client.actions.delete(testActionId);

    // Verify it's deleted
    await expect(
      client.actions.get(testActionId)
    ).rejects.toThrow(PortNotFoundError);

    // Remove from cleanup list
    const index = createdActionIds.indexOf(testActionId);
    if (index > -1) {
      createdActionIds.splice(index, 1);
    }
  }, 15000);
});
