/**
 * Smoke Test: Audit Logs Query
 * 
 * Tests querying audit logs with various filters.
 * Creates a test entity to generate audit logs, then queries them.
 * 
 * Prerequisites:
 * - PORT_CLIENT_ID and PORT_CLIENT_SECRET in .env.local
 * - 'service' blueprint must exist in your Port instance
 * 
 * Run with: pnpm smoke:audit
 */

import { PortClient } from '../src';

async function main() {
  console.log('🧪 Smoke Test: Audit Logs Query\n');
  console.log('━'.repeat(60));

  // Initialize client
  const client = new PortClient();
  
  const testEntityId = `smoke-test-audit-${Date.now()}`;
  let createdEntityId: string | undefined;

  try {
    // ✅ Step 1: Create an Entity to Generate Audit Logs
    console.log('\n📝 Step 1: Creating test entity (generates audit logs)...');
    const entity = await client.entities.create({
      identifier: testEntityId,
      blueprint: 'service',
      title: 'Audit Test Service',
      properties: {
        stringProps: {
          name: 'audit-test',
          environment: 'test'
        }
      }
    });
    createdEntityId = entity.identifier;
    console.log(`✅ Created entity: ${entity.identifier}`);
    console.log(`   This should generate CREATE audit log entry`);

    // Wait a moment for audit log to be created
    await new Promise(resolve => setTimeout(resolve, 1000));

    // ✅ Step 2: Query All Audit Logs (limited)
    console.log('\n🔍 Step 2: Querying recent audit logs...');
    const allLogs = await client.audit.query({
      limit: 10
    });
    console.log(`✅ Found ${allLogs.length} recent audit log(s)`);
    if (allLogs.length > 0) {
      const recent = allLogs[0];
      console.log(`   Most recent log:`);
      console.log(`     Action: ${recent.action}`);
      console.log(`     Status: ${recent.status}`);
      console.log(`     Timestamp: ${recent.timestamp.toISOString()}`);
    }

    // ✅ Step 3: Query Logs for Specific Entity
    console.log('\n📊 Step 3: Querying logs for test entity...');
    const entityLogs = await client.audit.getEntityLogs(testEntityId);
    console.log(`✅ Found ${entityLogs.length} log(s) for entity ${testEntityId}`);
    if (entityLogs.length > 0) {
      entityLogs.forEach((log, idx) => {
        console.log(`   Log ${idx + 1}:`);
        console.log(`     Action: ${log.action}`);
        console.log(`     Status: ${log.status}`);
        console.log(`     Time: ${log.timestamp.toISOString()}`);
      });
    } else {
      console.log('   ⚠️  No logs found yet (may need more time to propagate)');
    }

    // ✅ Step 4: Query Logs by Blueprint
    console.log('\n🏗️  Step 4: Querying logs by blueprint...');
    const blueprintLogs = await client.audit.query({
      blueprint: 'service',
      limit: 5
    });
    console.log(`✅ Found ${blueprintLogs.length} recent log(s) for 'service' blueprint`);

    // ✅ Step 5: Query Logs by Action Type
    console.log('\n⚡ Step 5: Querying CREATE action logs...');
    const createLogs = await client.audit.query({
      action: 'CREATE',
      limit: 5
    });
    console.log(`✅ Found ${createLogs.length} CREATE action log(s)`);

    // ✅ Step 6: Query Logs by Status
    console.log('\n✅ Step 6: Querying successful action logs...');
    const successLogs = await client.audit.query({
      status: 'SUCCESS',
      limit: 5
    });
    console.log(`✅ Found ${successLogs.length} successful action log(s)`);

    // ✅ Step 7: Query Logs with Time Range
    console.log('\n📅 Step 7: Querying logs from last hour...');
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentLogs = await client.audit.query({
      startTime: oneHourAgo,
      limit: 10
    });
    console.log(`✅ Found ${recentLogs.length} log(s) from last hour`);

    // ✅ Step 8: Query Logs with Multiple Filters
    console.log('\n🔎 Step 8: Querying with combined filters...');
    const filteredLogs = await client.audit.query({
      blueprint: 'service',
      action: 'CREATE',
      status: 'SUCCESS',
      limit: 5
    });
    console.log(`✅ Found ${filteredLogs.length} log(s) matching all filters`);
    console.log(`   (blueprint=service, action=CREATE, status=SUCCESS)`);

    // ✅ Step 9: Update Entity (Generate More Audit Logs)
    console.log('\n✏️  Step 9: Updating entity (generates UPDATE audit log)...');
    await client.entities.update(testEntityId, {
      title: 'Updated Audit Test Service',
      properties: {
        stringProps: {
          environment: 'production'
        }
      }
    }, 'service');
    console.log(`✅ Updated entity: ${testEntityId}`);
    console.log(`   This should generate UPDATE audit log entry`);

    // Wait a moment for audit log to be created
    await new Promise(resolve => setTimeout(resolve, 1000));

    // ✅ Step 10: Verify Multiple Actions in Audit Log
    console.log('\n📝 Step 10: Verifying audit trail...');
    const finalEntityLogs = await client.audit.getEntityLogs(testEntityId);
    console.log(`✅ Entity now has ${finalEntityLogs.length} audit log entry/entries`);
    
    const actions = new Set(finalEntityLogs.map(log => log.action));
    console.log(`   Actions recorded: ${Array.from(actions).join(', ')}`);
    
    // ✅ Step 11: Clean Up Entity
    console.log('\n🗑️  Step 11: Deleting test entity...');
    await client.entities.delete('service', testEntityId);
    console.log(`✅ Deleted entity: ${testEntityId}`);
    console.log(`   This should generate DELETE audit log entry`);
    createdEntityId = undefined;

    // 🎉 Success
    console.log('\n' + '━'.repeat(60));
    console.log('✅ All audit log query operations successful!');
    console.log('   ✓ Query all logs');
    console.log('   ✓ Query by entity');
    console.log('   ✓ Query by blueprint');
    console.log('   ✓ Query by action type');
    console.log('   ✓ Query by status');
    console.log('   ✓ Query by time range');
    console.log('   ✓ Query with multiple filters');
    console.log('🎉 Smoke test passed!\n');

  } catch (error) {
    console.error('\n❌ Smoke test failed:', error);
    console.error('');
    process.exit(1);
  } finally {
    // 🧹 Always cleanup (in case test fails before deletion step)
    if (createdEntityId) {
      console.log('\n🧹 Cleaning up remaining resources...');
      try {
        await client.entities.delete('service', createdEntityId);
        console.log(`✅ Cleaned up entity: ${createdEntityId}`);
      } catch (cleanupError) {
        console.error('⚠️  Cleanup failed (resource may not exist):', cleanupError instanceof Error ? cleanupError.message : cleanupError);
      }
      console.log('✅ Cleanup complete\n');
    }
  }
}

main();
