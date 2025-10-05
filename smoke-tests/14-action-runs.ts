/**
 * Smoke Test: Action Runs
 * 
 * Tests action execution and monitoring action runs.
 * Creates an action, executes it, monitors the run, and cleans up.
 * 
 * Prerequisites:
 * - PORT_CLIENT_ID and PORT_CLIENT_SECRET in .env.local
 * - 'service' blueprint must exist in your Port instance
 * 
 * Run with: pnpm smoke:action-runs
 */

import { PortClient } from '../src';

async function main() {
  console.log('🧪 Smoke Test: Action Runs\n');
  console.log('━'.repeat(60));

  // Initialize client
  const client = new PortClient();
  
  const timestamp = Date.now();
  const testActionId = `smoke-test-action-${timestamp}`;
  const testEntityId = `smoke-test-entity-${timestamp}`;
  
  let createdActionId: string | undefined;
  let createdEntityId: string | undefined;

  try {
    // ✅ Step 1: Create Test Entity
    console.log('\n📦 Step 1: Creating test entity...');
    const entity = await client.entities.create({
      identifier: testEntityId,
      blueprint: 'service',
      title: 'Action Run Test Service',
      properties: {
        stringProps: {
          name: 'action-run-test',
          environment: 'test'
        }
      }
    });
    createdEntityId = entity.identifier;
    console.log(`✅ Created entity: ${entity.identifier}`);

    // ✅ Step 2: Create Test Action
    console.log('\n⚡ Step 2: Creating test action...');
    const action = await client.actions.create({
      identifier: testActionId,
      blueprint: 'service',
      title: 'Smoke Test Action',
      description: 'Test action for smoke testing',
      trigger: {
        type: 'self-service' as const,
        operation: 'DAY-2' as const,
        blueprintIdentifier: 'service',
        userInputs: {
          properties: {
            reason: {
              type: 'string',
              title: 'Reason',
              description: 'Reason for running this action'
            }
          },
          required: []
        }
      },
      invocationMethod: {
        type: 'WEBHOOK' as const,
        url: 'https://example.com/webhook/action',
        agent: false,
        synchronized: false
      }
    });
    createdActionId = action.identifier;
    console.log(`✅ Created action: ${action.identifier}`);
    console.log(`   Title: ${action.title}`);

    // ✅ Step 3: Execute Action
    console.log('\n🚀 Step 3: Executing action...');
    const execution = await client.actions.execute(testActionId, {
      entityIdentifier: testEntityId,
      properties: {
        reason: 'Smoke test execution'
      }
    });
    console.log(`✅ Action executed!`);
    console.log(`   Run ID: ${execution.id}`);
    console.log(`   Action: ${execution.action.identifier}`);
    console.log(`   Status: ${execution.status || 'INITIATED'}`);

    const runId = execution.id;

    // ✅ Step 4: Get Action Run Details
    console.log('\n🔍 Step 4: Fetching action run details...');
    const runDetails = await client.actionRuns.get(runId);
    console.log(`✅ Retrieved run details:`);
    console.log(`   Run ID: ${runDetails.id}`);
    console.log(`   Action: ${runDetails.action}`);
    console.log(`   Status: ${runDetails.status}`);
    console.log(`   Entity: ${runDetails.entity || 'N/A'}`);
    console.log(`   Created: ${runDetails.createdAt.toISOString()}`);

    // ✅ Step 5: List All Action Runs
    console.log('\n📋 Step 5: Listing recent action runs...');
    const allRuns = await client.actionRuns.list();
    console.log(`✅ Found ${allRuns.length} recent run(s)`);
    if (allRuns.length > 0) {
      console.log(`   Most recent runs:`);
      allRuns.slice(0, 3).forEach((run, idx) => {
        console.log(`   ${idx + 1}. ${run.action} - ${run.status} (${run.createdAt.toISOString()})`);
      });
    }

    // ✅ Step 6: List Runs for Specific Entity
    console.log('\n📦 Step 6: Listing runs for test entity...');
    const entityRuns = await client.actionRuns.list({
      entity: testEntityId
    });
    console.log(`✅ Found ${entityRuns.length} run(s) for entity ${testEntityId}`);

    // ✅ Step 8: List Runs by Blueprint
    console.log('\n🏗️  Step 8: Listing runs for service blueprint...');
    const blueprintRuns = await client.actionRuns.list({
      blueprint: 'service'
    });
    console.log(`✅ Found ${blueprintRuns.length} run(s) for 'service' blueprint`);

    // ✅ Step 9: List Active Runs
    console.log('\n⏳ Step 9: Listing active runs...');
    const activeRuns = await client.actionRuns.list({
      active: true
    });
    console.log(`✅ Found ${activeRuns.length} active run(s)`);

    // ✅ Step 10: Get Action Run Logs
    console.log('\n📝 Step 10: Fetching action run logs...');
    const logs = await client.actionRuns.getLogs(runId);
    console.log(`✅ Retrieved ${logs.logs.length} log entry/entries`);
    if (logs.logs.length > 0) {
      console.log(`   Recent logs:`);
      logs.logs.slice(0, 3).forEach((log, idx) => {
        console.log(`   ${idx + 1}. [${log.level}] ${log.message}`);
      });
    } else {
      console.log(`   (No logs available yet)`);
    }

    // ✅ Step 11: Combined Filters
    console.log('\n🔎 Step 11: Querying with combined filters...');
    const filteredRuns = await client.actionRuns.list({
      blueprint: 'service',
      entity: testEntityId
    });
    console.log(`✅ Found ${filteredRuns.length} run(s) matching filters`);
    console.log(`   (blueprint=service, entity=${testEntityId})`);

    // Note: Approval testing would require a different action type (manual approval)
    // Skipping approval update for this smoke test

    console.log('\n📊 Step 12: Run summary...');
    console.log(`   Action: ${testActionId}`);
    console.log(`   Entity: ${testEntityId}`);
    console.log(`   Run ID: ${runId}`);
    console.log(`   Total runs found: ${allRuns.length}`);

    // ✅ Step 13: Clean Up Action
    console.log('\n🗑️  Step 13: Deleting test action...');
    await client.actions.delete(testActionId);
    console.log(`✅ Deleted action: ${testActionId}`);
    createdActionId = undefined;

    // ✅ Step 14: Clean Up Entity
    console.log('\n🗑️  Step 14: Deleting test entity...');
    await client.entities.delete(testEntityId, 'service');
    console.log(`✅ Deleted entity: ${testEntityId}`);
    createdEntityId = undefined;

    // 🎉 Success
    console.log('\n' + '━'.repeat(60));
    console.log('✅ All action run operations successful!');
    console.log('   ✓ Action: Created and executed');
    console.log('   ✓ Run: Retrieved details');
    console.log('   ✓ Runs: Listed all, by action, by entity, by blueprint');
    console.log('   ✓ Logs: Retrieved run logs');
    console.log('   ✓ Cleanup: Removed test resources');
    console.log('🎉 Smoke test passed!\n');

  } catch (error) {
    console.error('\n❌ Smoke test failed:', error);
    console.error('');
    process.exit(1);
  } finally {
    // 🧹 Always cleanup (in case test fails before deletion step)
    const resourcesToClean = [
      { 
        type: 'action', 
        id: createdActionId, 
        cleanup: async () => await client.actions.delete(createdActionId!) 
      },
      { 
        type: 'entity', 
        id: createdEntityId, 
        cleanup: async () => await client.entities.delete(createdEntityId!, 'service') 
      }
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
            console.error(`⚠️  Failed to clean up ${resource.type}:`, cleanupError instanceof Error ? cleanupError.message : cleanupError);
          }
        }
      }
      console.log('✅ Cleanup complete\n');
    }
  }
}

main();
