/**
 * Example: Action Runs Monitoring
 * 
 * This example demonstrates how to:
 * - Execute actions and create runs
 * - Get action run details
 * - List action runs with filters
 * - Get action run logs
 * - Monitor run status
 * - Update approval status
 * 
 * Run with: pnpm tsx examples/25-action-runs.ts
 */

import { PortClient } from '../src';

async function main() {
  // Initialize the client (uses credentials from environment variables)
  const client = new PortClient();

  console.log('🏃 Action Runs Monitoring Example\n');
  console.log('━'.repeat(60));

  // Use timestamp to ensure unique identifiers
  const timestamp = Date.now();
  const testActionId = `example-action-${timestamp}`;
  const testEntityId = `example-entity-${timestamp}`;

  try {
    // ============================================================
    // Setup: Create Test Entity and Action
    // ============================================================
    console.log('\n📦 Setup: Creating test resources');
    console.log('─'.repeat(60));
    
    // Create entity
    const entity = await client.entities.create({
      identifier: testEntityId,
      blueprint: 'service',
      title: 'Action Runs Test Service',
      properties: {
        stringProps: {
          name: 'action-runs-test',
          environment: 'development'
        }
      }
    });
    console.log(`✅ Created entity: ${entity.identifier}`);

    // Create action
    const action = await client.actions.create({
      identifier: testActionId,
      blueprint: 'service',
      title: 'Example Deploy Action',
      description: 'Deploy service to environment',
      trigger: {
        type: 'self-service',
        operation: 'DAY-2',
        blueprintIdentifier: 'service',
        userInputs: {
          properties: {
            targetEnvironment: {
              type: 'string',
              title: 'Target Environment',
              description: 'Environment to deploy to',
              enum: ['development', 'staging', 'production']
            },
            reason: {
              type: 'string',
              title: 'Deployment Reason',
              description: 'Why this deployment is needed'
            }
          },
          required: ['targetEnvironment']
        }
      },
      invocationMethod: {
        type: 'WEBHOOK',
        url: 'https://example.com/webhook/deploy',
        agent: false,
        synchronized: false
      }
    });
    console.log(`✅ Created action: ${action.identifier}`);

    // ============================================================
    // Example 1: Execute Action
    // ============================================================
    console.log('\n🚀 Example 1: Execute action');
    console.log('─'.repeat(60));
    
    const execution = await client.actions.execute(testActionId, {
      entityIdentifier: testEntityId,
      properties: {
        targetEnvironment: 'staging',
        reason: 'Testing action runs monitoring'
      }
    });
    
    console.log('✅ Action executed successfully!');
    console.log(`   Run ID: ${execution.id}`);
    console.log(`   Action: ${execution.action.identifier}`);
    console.log(`   Status: ${execution.status || 'INITIATED'}`);
    console.log(`   Created: ${execution.createdAt.toISOString()}`);

    const runId = execution.id;

    // ============================================================
    // Example 2: Get Action Run Details
    // ============================================================
    console.log('\n🔍 Example 2: Get action run details');
    console.log('─'.repeat(60));
    
    const runDetails = await client.actionRuns.get(runId);
    
    console.log('✅ Retrieved run details:');
    console.log(`   Run ID: ${runDetails.id}`);
    console.log(`   Status: ${runDetails.status}`);
    console.log(`   Status Label: ${runDetails.statusLabel || 'N/A'}`);
    console.log(`   Action: ${runDetails.action.identifier}`);
    console.log(`   Blueprint: ${runDetails.blueprint?.identifier || 'N/A'}`);
    console.log(`   Entity: ${runDetails.entity?.identifier || 'N/A'}`);
    console.log(`   Created by: ${runDetails.createdBy || 'N/A'}`);
    console.log(`   Created at: ${runDetails.createdAt.toISOString()}`);
    
    if (runDetails.properties) {
      console.log('   Properties:');
      Object.entries(runDetails.properties).forEach(([key, value]) => {
        console.log(`     ${key}: ${value}`);
      });
    }

    // ============================================================
    // Example 3: List All Recent Action Runs
    // ============================================================
    console.log('\n📋 Example 3: List recent action runs');
    console.log('─'.repeat(60));
    
    const allRuns = await client.actionRuns.list();
    
    console.log(`✅ Found ${allRuns.length} recent run(s)`);
    if (allRuns.length > 0) {
      console.log('   Most recent runs:');
      allRuns.slice(0, 5).forEach((run, idx) => {
        console.log(`   ${idx + 1}. ${run.action.identifier} - ${run.status}`);
        console.log(`      Entity: ${run.entity?.identifier || 'N/A'}`);
        console.log(`      Created: ${run.createdAt.toISOString()}`);
      });
    }

    // ============================================================
    // Example 4: List Runs for Specific Entity
    // ============================================================
    console.log('\n📦 Example 4: List runs for specific entity');
    console.log('─'.repeat(60));
    
    const entityRuns = await client.actionRuns.list({
      entity: testEntityId
    });
    
    console.log(`✅ Found ${entityRuns.length} run(s) for entity: ${testEntityId}`);
    if (entityRuns.length > 0) {
      entityRuns.forEach((run, idx) => {
        console.log(`   ${idx + 1}. Action: ${run.action.identifier}`);
        console.log(`      Status: ${run.status}`);
        console.log(`      Time: ${run.createdAt.toLocaleTimeString()}`);
      });
    }

    // ============================================================
    // Example 5: List Runs for Specific Action
    // ============================================================
    console.log('\n⚡ Example 5: List runs for specific action');
    console.log('─'.repeat(60));
    
    const actionRuns = await client.actionRuns.listForAction(testActionId);
    
    console.log(`✅ Found ${actionRuns.length} run(s) for action: ${testActionId}`);
    if (actionRuns.length > 0) {
      actionRuns.forEach((run, idx) => {
        console.log(`   ${idx + 1}. Run ID: ${run.id}`);
        console.log(`      Status: ${run.status}`);
        console.log(`      Entity: ${run.entity?.identifier || 'N/A'}`);
      });
    }

    // ============================================================
    // Example 6: List Runs by Blueprint
    // ============================================================
    console.log('\n🏗️  Example 6: List runs by blueprint');
    console.log('─'.repeat(60));
    
    const blueprintRuns = await client.actionRuns.list({
      blueprint: 'service'
    });
    
    console.log(`✅ Found ${blueprintRuns.length} run(s) for 'service' blueprint`);

    // ============================================================
    // Example 7: List Active Runs Only
    // ============================================================
    console.log('\n⏳ Example 7: List active runs');
    console.log('─'.repeat(60));
    
    const activeRuns = await client.actionRuns.list({
      active: true
    });
    
    console.log(`✅ Found ${activeRuns.length} active run(s)`);
    if (activeRuns.length > 0) {
      console.log('   Currently running:');
      activeRuns.forEach((run, idx) => {
        console.log(`   ${idx + 1}. ${run.action.identifier} - ${run.status}`);
        const duration = Date.now() - run.createdAt.getTime();
        console.log(`      Running for: ${Math.round(duration / 1000)}s`);
      });
    }

    // ============================================================
    // Example 8: Get Action Run Logs
    // ============================================================
    console.log('\n📝 Example 8: Get action run logs');
    console.log('─'.repeat(60));
    
    const logs = await client.actionRuns.getLogs(runId);
    
    console.log(`✅ Retrieved ${logs.logs.length} log entry/entries`);
    if (logs.logs.length > 0) {
      console.log('   Recent logs:');
      logs.logs.slice(0, 10).forEach((log, idx) => {
        const timestamp = new Date(log.timestamp).toLocaleTimeString();
        const level = log.level || 'INFO';
        console.log(`   ${idx + 1}. [${timestamp}] [${level}] ${log.message}`);
      });
    } else {
      console.log('   (No logs available yet - webhook may not have been called)');
    }

    // ============================================================
    // Example 9: Filter Runs with Multiple Criteria
    // ============================================================
    console.log('\n🔎 Example 9: Filter with multiple criteria');
    console.log('─'.repeat(60));
    
    const filteredRuns = await client.actionRuns.list({
      blueprint: 'service',
      entity: testEntityId,
      active: false
    });
    
    console.log(`✅ Found ${filteredRuns.length} run(s) matching filters`);
    console.log('   Filters: blueprint=service, entity=test-entity, active=false');

    // ============================================================
    // Example 10: Run Statistics
    // ============================================================
    console.log('\n📊 Example 10: Action run statistics');
    console.log('─'.repeat(60));
    
    const stats = {
      total: allRuns.length,
      byStatus: {} as Record<string, number>,
      byAction: {} as Record<string, number>
    };
    
    allRuns.forEach(run => {
      // Count by status
      stats.byStatus[run.status] = (stats.byStatus[run.status] || 0) + 1;
      
      // Count by action
      const actionId = run.action.identifier;
      stats.byAction[actionId] = (stats.byAction[actionId] || 0) + 1;
    });
    
    console.log('✅ Statistics:');
    console.log(`   Total runs: ${stats.total}`);
    console.log('\n   By status:');
    Object.entries(stats.byStatus).forEach(([status, count]) => {
      console.log(`     ${status}: ${count}`);
    });
    console.log('\n   Most used actions:');
    Object.entries(stats.byAction)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .forEach(([action, count]) => {
        console.log(`     ${action}: ${count} run(s)`);
      });

    // ============================================================
    // Example 11: Monitor Run Status (Polling)
    // ============================================================
    console.log('\n⏱️  Example 11: Monitor run status');
    console.log('─'.repeat(60));
    
    console.log(`   Monitoring run: ${runId}`);
    console.log('   Checking status every 2 seconds (max 3 checks)...');
    
    for (let i = 0; i < 3; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const currentRun = await client.actionRuns.get(runId);
      console.log(`   Check ${i + 1}: Status = ${currentRun.status}`);
      
      // Check if run is complete
      if (currentRun.endedAt) {
        console.log(`   ✅ Run completed at: ${currentRun.endedAt.toISOString()}`);
        const duration = currentRun.endedAt.getTime() - currentRun.createdAt.getTime();
        console.log(`   Duration: ${Math.round(duration / 1000)}s`);
        break;
      }
    }

    // ============================================================
    // Example 12: Paginated Results
    // ============================================================
    console.log('\n📄 Example 12: Paginated results');
    console.log('─'.repeat(60));
    
    const page1 = await client.actionRuns.list({
      page: 1,
      pageSize: 5
    });
    
    console.log(`✅ Page 1: ${page1.length} run(s)`);
    
    const page2 = await client.actionRuns.list({
      page: 2,
      pageSize: 5
    });
    
    console.log(`   Page 2: ${page2.length} run(s)`);

    // ============================================================
    // Clean Up: Delete Test Resources
    // ============================================================
    console.log('\n🗑️  Cleanup: Deleting test resources');
    console.log('─'.repeat(60));
    
    await client.actions.delete(testActionId);
    console.log(`✅ Deleted action: ${testActionId}`);

    await client.entities.delete(testEntityId, 'service');
    console.log(`✅ Deleted entity: ${testEntityId}`);

    console.log('\n━'.repeat(60));
    console.log('✅ All action run operations completed successfully!\n');
    console.log('💡 Tip: Action runs are preserved even after the action is deleted');

  } catch (error) {
    console.error('\n❌ Error:', error);
    
    // Clean up on error
    try {
      console.log('\n🧹 Attempting cleanup...');
      await client.actions.delete(testActionId).catch(() => {});
      await client.entities.delete(testEntityId, 'service').catch(() => {});
      console.log('✅ Cleanup complete');
    } catch (cleanupError) {
      console.error('⚠️  Cleanup failed:', cleanupError);
    }
    
    process.exit(1);
  }
}

main();
