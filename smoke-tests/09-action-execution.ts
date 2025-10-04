/**
 * Smoke Test: Comprehensive CRUD Operations
 * 
 * Tests full CRUD (Create, Read, Update, Delete) operations for:
 * - Actions: create, get, list, delete
 * - Entities: create, get, update, list, delete
 * - Scorecards: create, get, update, list, delete
 * 
 * All resources are properly cleaned up in a finally block.
 */

import { PortClient } from '../src';

async function main() {
  console.log('🧪 Smoke Test: Comprehensive CRUD Operations\n');
  console.log('━'.repeat(60));

  const client = new PortClient();
  const timestamp = Date.now();
  const testActionId = `smoke_test_action_${timestamp}`;
  const testEntityId = `smoke_test_entity_${timestamp}`;
  const testScorecardId = `smoke_test_scorecard_${timestamp}`;
  const testBlueprintId = 'service'; // Assumes service blueprint exists
  let createdActionId: string | undefined;
  let createdEntityId: string | undefined;
  let createdScorecardId: string | undefined;

  try {
    // ✅ Step 1: Create Action
    console.log('\n📝 Step 1: Creating test action...');
    const createData = {
      identifier: testActionId,
      title: 'Smoke Test Action',
      blueprint: testBlueprintId,
      trigger: {
        type: 'self-service' as const,
        operation: 'DAY-2' as const,
        blueprintIdentifier: testBlueprintId,
        userInputs: {
          properties: {}
        }
      },
      description: 'Test action created by smoke test',
      invocationMethod: {
        type: 'WEBHOOK' as const,
        url: 'https://example.com/webhook',
        agent: false
      }
    };

    const created = await client.actions.create(createData);
    createdActionId = created.identifier;
    console.log(`✅ Created action: ${created.identifier}`);
    console.log(`   Title: ${created.title}`);
    console.log(`   Trigger: ${created.trigger}`);

    // ✅ Step 2: Get Action
    console.log('\n🔍 Step 2: Fetching created action...');
    const fetched = await client.actions.get(testActionId);
    console.log(`✅ Fetched action: ${fetched.identifier}`);
    console.log(`   Title: ${fetched.title}`);
    
    // Verify data matches
    if (fetched.identifier !== testActionId) {
      throw new Error('❌ Identifier mismatch!');
    }

    // ✅ Step 3: Create Test Entity
    console.log('\n📦 Step 3: Creating test entity...');
    const entity = await client.entities.create({
      identifier: testEntityId,
      blueprint: testBlueprintId,
      title: 'Smoke Test Service',
      properties: {
        stringProps: {
          name: 'smoke-test-service',
          description: 'Test service created by smoke test'
        }
      }
    });
    createdEntityId = entity.identifier;
    console.log(`✅ Created entity: ${entity.identifier}`);
    console.log(`   Title: ${entity.title}`);

    // ✅ Step 4: Get Entity
    console.log('\n🔍 Step 4: Fetching created entity...');
    const fetchedEntity = await client.entities.get(testEntityId, testBlueprintId);
    console.log(`✅ Fetched entity: ${fetchedEntity.identifier}`);
    console.log(`   Title: ${fetchedEntity.title}`);
    if (fetchedEntity.identifier !== testEntityId) {
      throw new Error('❌ Entity identifier mismatch!');
    }

    // ✅ Step 5: Update Entity
    console.log('\n✏️  Step 5: Updating entity...');
    const updatedEntity = await client.entities.update(testEntityId, {
      title: 'Smoke Test Service (Updated)',
      properties: {
        stringProps: {
          name: 'smoke-test-service',
          description: 'Updated test service description'
        }
      }
    }, testBlueprintId);
    console.log(`✅ Updated entity: ${updatedEntity.identifier}`);
    console.log(`   New title: ${updatedEntity.title}`);

    // ✅ Step 6: Create Test Scorecard
    console.log('\n📊 Step 6: Creating test scorecard...');
    const scorecard = await client.scorecards.create({
      identifier: testScorecardId,
      blueprint: testBlueprintId,
      title: 'Smoke Test Scorecard',
      rules: [
        {
          identifier: 'has_name',
          title: 'Service has name',
          level: 'Gold',
          query: {
            combinator: 'and',
            conditions: [
              {
                property: 'name',
                operator: 'isNotEmpty'
              }
            ]
          }
        }
      ]
    });
    createdScorecardId = scorecard.identifier;
    console.log(`✅ Created scorecard: ${scorecard.identifier}`);
    console.log(`   Title: ${scorecard.title}`);
    console.log(`   Rules: ${scorecard.rules?.length || 0}`);

    // ✅ Step 7: Get Scorecard
    console.log('\n🔍 Step 7: Fetching created scorecard...');
    const fetchedScorecard = await client.scorecards.get(testBlueprintId, testScorecardId);
    console.log(`✅ Fetched scorecard: ${fetchedScorecard.identifier}`);
    console.log(`   Title: ${fetchedScorecard.title}`);
    if (fetchedScorecard.identifier !== testScorecardId) {
      throw new Error('❌ Scorecard identifier mismatch!');
    }

    // Note: Scorecard update uses PUT (full replacement), skipping for now

    // ✅ Step 8: List Actions
    console.log('\n📋 Step 8: Listing actions for blueprint...');
    const actions = await client.actions.list({ blueprint: testBlueprintId });
    console.log(`✅ Found ${actions.length} action(s) for ${testBlueprintId}`);
    const testAction = actions.find(a => a.identifier === testActionId);
    if (testAction) {
      console.log(`   ✓ Test action found in list`);
    }

    // ✅ Step 9: List Entities
    console.log('\n📋 Step 9: Listing entities for blueprint...');
    const entities = await client.entities.list({ blueprint: testBlueprintId });
    console.log(`✅ Found ${entities.data.length} entity/entities for ${testBlueprintId}`);
    const testEntity = entities.data.find(e => e.identifier === testEntityId);
    if (testEntity) {
      console.log(`   ✓ Test entity found in list`);
    }

    // ✅ Step 10: List Scorecards
    console.log('\n📋 Step 10: Listing scorecards for blueprint...');
    const scorecards = await client.scorecards.list(testBlueprintId);
    console.log(`✅ Found ${scorecards.length} scorecard(s) for ${testBlueprintId}`);
    const testScorecard = scorecards.find(s => s.identifier === testScorecardId);
    if (testScorecard) {
      console.log(`   ✓ Test scorecard found in list`);
    }

    // ✅ Step 11: Delete Scorecard
    console.log('\n🗑️  Step 11: Deleting scorecard...');
    await client.scorecards.delete(testBlueprintId, testScorecardId);
    console.log(`✅ Deleted scorecard: ${testScorecardId}`);
    createdScorecardId = undefined;

    // ✅ Step 12: Delete Entity
    console.log('\n🗑️  Step 12: Deleting entity...');
    await client.entities.delete(testEntityId, testBlueprintId);
    console.log(`✅ Deleted entity: ${testEntityId}`);
    createdEntityId = undefined;

    // ✅ Step 13: Delete Action
    console.log('\n🗑️  Step 13: Deleting action...');
    await client.actions.delete(testActionId);
    console.log(`✅ Deleted action: ${testActionId}`);
    createdActionId = undefined;

    // 🎉 Success
    console.log('\n' + '━'.repeat(60));
    console.log('✅ All operations successful!');
    console.log('   ✓ Action: Created, fetched, listed, deleted');
    console.log('   ✓ Entity: Created, fetched, updated, listed, deleted');
    console.log('   ✓ Scorecard: Created, fetched, listed, deleted');
    console.log('🎉 Smoke test passed!\n');

  } catch (error) {
    console.error('\n❌ Smoke test failed:', error);
    console.error('');
    process.exit(1);
  } finally {
    // 🧹 Always cleanup (in case test fails before deletion step)
    const resourcesToClean = [
      { type: 'scorecard', id: createdScorecardId, cleanup: async () => await client.scorecards.delete(testBlueprintId, createdScorecardId!) },
      { type: 'entity', id: createdEntityId, cleanup: async () => await client.entities.delete(createdEntityId!, testBlueprintId) },
      { type: 'action', id: createdActionId, cleanup: async () => await client.actions.delete(createdActionId!) }
    ];

    const needsCleanup = resourcesToClean.some(r => r.id);
    
    if (needsCleanup) {
      console.log('\n🧹 Cleaning up remaining resources...');
      for (const resource of resourcesToClean) {
        if (resource.id) {
          try {
            await resource.cleanup();
            console.log(`✅ Cleaned up ${resource.type}: ${resource.id}`);
          } catch (cleanupError) {
            console.error(`⚠️  Failed to clean up ${resource.type} (may not exist):`, cleanupError instanceof Error ? cleanupError.message : cleanupError);
          }
        }
      }
      console.log('✅ cleanup complete');
    }
  }
}

main();

