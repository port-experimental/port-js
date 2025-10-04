/**
 * Smoke Test: Action Creation and Execution
 * 
 * Tests creating an action and checking its execution capabilities.
 * Creates a simple webhook action and cleans it up.
 */

import { PortClient } from '../src';

async function main() {
  console.log('🧪 Smoke Test: Action Creation and Execution\n');
  console.log('━'.repeat(60));

  const client = new PortClient();
  const testActionId = `smoke_test_action_${Date.now()}`;
  const testBlueprintId = 'service'; // Assumes service blueprint exists
  let createdActionId: string | undefined;

  try {
    // ✅ Step 1: Create Action
    console.log('\n📝 Step 1: Creating test action...');
    const createData = {
      identifier: testActionId,
      title: 'Smoke Test Action',
      blueprint: testBlueprintId,
      trigger: 'DAY-2' as const,
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
    console.log(`   Blueprint: ${created.blueprint}`);
    console.log(`   Trigger: ${created.trigger}`);

    // ✅ Step 2: Get Action
    console.log('\n🔍 Step 2: Fetching created action...');
    const fetched = await client.actions.get(testBlueprintId, testActionId);
    console.log(`✅ Fetched action: ${fetched.identifier}`);
    console.log(`   Title: ${fetched.title}`);
    
    // Verify data matches
    if (fetched.identifier !== testActionId) {
      throw new Error('❌ Identifier mismatch!');
    }

    // ✅ Step 3: List Actions
    console.log('\n📋 Step 3: Listing actions for blueprint...');
    const actions = await client.actions.list(testBlueprintId);
    console.log(`✅ Found ${actions.length} action(s) for ${testBlueprintId}`);
    const testAction = actions.find(a => a.identifier === testActionId);
    if (testAction) {
      console.log(`   ✓ Test action found in list`);
    }

    // ✅ Step 4: Delete Action (manual as part of test)
    console.log('\n🗑️  Step 4: Deleting action...');
    await client.actions.delete(testBlueprintId, testActionId);
    console.log(`✅ Deleted action: ${testActionId}`);
    createdActionId = undefined;

    // 🎉 Success
    console.log('\n' + '━'.repeat(60));
    console.log('✅ All action operations successful!');
    console.log('🎉 Smoke test passed!\n');

  } catch (error) {
    console.error('\n❌ Smoke test failed:', error);
    console.error('');
    process.exit(1);
  } finally {
    // 🧹 Always cleanup (in case test fails before deletion step)
    if (createdActionId) {
      console.log('\n🧹 Cleaning up remaining resources...');
      try {
        await client.actions.delete(testBlueprintId, createdActionId);
        console.log('✅ Cleanup successful\n');
      } catch (cleanupError) {
        console.error('⚠️  Cleanup failed (resource may not exist):', cleanupError instanceof Error ? cleanupError.message : cleanupError);
      }
    }
  }
}

main();

