/**
 * Example: Audit Logs Query
 * 
 * This example demonstrates how to:
 * - Query all audit logs
 * - Filter logs by entity
 * - Filter logs by blueprint
 * - Filter logs by action type
 * - Filter logs by status
 * - Filter logs by time range
 * - Combine multiple filters
 * 
 * Run with: pnpm tsx examples/24-audit-logs.ts
 */

import { PortClient } from '../src';

async function main() {
  // Initialize the client (uses credentials from environment variables)
  const client = new PortClient();

  console.log('📋 Audit Logs Query Example\n');
  console.log('━'.repeat(60));

  // Use timestamp to ensure unique identifiers
  const timestamp = Date.now();
  const testEntityId = `audit-example-${timestamp}`;

  try {
    // ============================================================
    // Setup: Create a Test Entity to Generate Audit Logs
    // ============================================================
    console.log('\n📦 Setup: Creating test entity');
    console.log('─'.repeat(60));
    
    const entity = await client.entities.create({
      identifier: testEntityId,
      blueprint: 'service',
      title: 'Audit Example Service',
      properties: {
        stringProps: {
          name: 'audit-test',
          environment: 'development'
        }
      }
    });
    
    console.log(`✅ Created entity: ${entity.identifier}`);
    console.log('   This will generate CREATE audit log entries');

    // Wait for audit logs to be created
    console.log('   ⏳ Waiting for audit logs to propagate...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // ============================================================
    // Example 1: Query All Recent Audit Logs
    // ============================================================
    console.log('\n🔍 Example 1: Query recent audit logs');
    console.log('─'.repeat(60));
    
    const recentLogs = await client.audit.query({
      limit: 10
    });
    
    console.log(`✅ Found ${recentLogs.length} recent audit log(s)`);
    if (recentLogs.length > 0) {
      console.log('   Most recent logs:');
      recentLogs.slice(0, 3).forEach((log, idx) => {
        console.log(`   ${idx + 1}. Action: ${log.action}, Status: ${log.status}`);
        console.log(`      Entity: ${log.entity || 'N/A'}, Blueprint: ${log.blueprint || 'N/A'}`);
        console.log(`      Time: ${log.timestamp.toISOString()}`);
        console.log(`      User: ${log.userEmail || 'N/A'}`);
      });
    }

    // ============================================================
    // Example 2: Get Logs for Specific Entity
    // ============================================================
    console.log('\n📦 Example 2: Query logs for specific entity');
    console.log('─'.repeat(60));
    
    const entityLogs = await client.audit.getEntityLogs(testEntityId, 'service');
    
    console.log(`✅ Found ${entityLogs.length} log(s) for entity: ${testEntityId}`);
    if (entityLogs.length > 0) {
      entityLogs.forEach((log, idx) => {
        console.log(`   ${idx + 1}. Action: ${log.action}`);
        console.log(`      Status: ${log.status}`);
        console.log(`      Time: ${log.timestamp.toISOString()}`);
        if (log.diff) {
          console.log(`      Changes: ${JSON.stringify(log.diff).substring(0, 100)}...`);
        }
      });
    } else {
      console.log('   ⚠️  No logs found yet (may need more time to propagate)');
    }

    // ============================================================
    // Example 3: Query Logs by Blueprint
    // ============================================================
    console.log('\n🏗️  Example 3: Query logs by blueprint');
    console.log('─'.repeat(60));
    
    const blueprintLogs = await client.audit.query({
      blueprint: 'service',
      limit: 5
    });
    
    console.log(`✅ Found ${blueprintLogs.length} recent log(s) for 'service' blueprint`);
    const blueprintActions = new Set(blueprintLogs.map(log => log.action));
    console.log(`   Actions found: ${Array.from(blueprintActions).join(', ')}`);

    // ============================================================
    // Example 4: Query Logs by Action Type
    // ============================================================
    console.log('\n⚡ Example 4: Query logs by action type');
    console.log('─'.repeat(60));
    
    const createLogs = await client.audit.query({
      action: 'CREATE',
      limit: 5
    });
    
    console.log(`✅ Found ${createLogs.length} CREATE action log(s)`);
    if (createLogs.length > 0) {
      createLogs.forEach((log, idx) => {
        console.log(`   ${idx + 1}. ${log.resourceType || 'Resource'}: ${log.entity || log.identifier}`);
        console.log(`      Blueprint: ${log.blueprint || 'N/A'}`);
        console.log(`      Time: ${log.timestamp.toISOString()}`);
      });
    }

    // ============================================================
    // Example 5: Query Logs by Status
    // ============================================================
    console.log('\n✅ Example 5: Query logs by status');
    console.log('─'.repeat(60));
    
    const successLogs = await client.audit.query({
      status: 'SUCCESS',
      limit: 5
    });
    
    console.log(`✅ Found ${successLogs.length} successful action log(s)`);
    
    // Also query failed actions
    const failedLogs = await client.audit.query({
      status: 'FAILURE',
      limit: 5
    });
    
    console.log(`   Failed actions: ${failedLogs.length}`);

    // ============================================================
    // Example 6: Query Logs with Time Range
    // ============================================================
    console.log('\n📅 Example 6: Query logs with time range');
    console.log('─'.repeat(60));
    
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const now = new Date();
    
    const timeRangeLogs = await client.audit.query({
      from: oneHourAgo.toISOString(),
      to: now.toISOString(),
      limit: 10
    });
    
    console.log(`✅ Found ${timeRangeLogs.length} log(s) from last hour`);
    console.log(`   Time range: ${oneHourAgo.toISOString()} to ${now.toISOString()}`);

    // ============================================================
    // Example 7: Query with Multiple Filters
    // ============================================================
    console.log('\n🔎 Example 7: Query with combined filters');
    console.log('─'.repeat(60));
    
    const filteredLogs = await client.audit.query({
      blueprint: 'service',
      action: 'CREATE',
      status: 'SUCCESS',
      limit: 5
    });
    
    console.log(`✅ Found ${filteredLogs.length} log(s) matching all filters`);
    console.log('   Filters: blueprint=service, action=CREATE, status=SUCCESS');

    // ============================================================
    // Example 8: Update Entity (Generate More Audit Logs)
    // ============================================================
    console.log('\n✏️  Example 8: Update entity (generates UPDATE log)');
    console.log('─'.repeat(60));
    
    await client.entities.update(testEntityId, {
      title: 'Updated Audit Example Service',
      properties: {
        stringProps: {
          environment: 'staging'
        }
      }
    }, 'service');
    
    console.log(`✅ Updated entity: ${testEntityId}`);
    console.log('   This will generate UPDATE audit log entry');

    // Wait for new audit logs
    console.log('   ⏳ Waiting for audit logs to propagate...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // ============================================================
    // Example 9: Verify Audit Trail
    // ============================================================
    console.log('\n📝 Example 9: Verify complete audit trail');
    console.log('─'.repeat(60));
    
    const finalEntityLogs = await client.audit.getEntityLogs(testEntityId, 'service');
    
    console.log(`✅ Entity now has ${finalEntityLogs.length} audit log entry/entries`);
    
    const actions = new Set(finalEntityLogs.map(log => log.action));
    console.log(`   Actions recorded: ${Array.from(actions).join(', ')}`);
    
    // Show timeline
    if (finalEntityLogs.length > 0) {
      console.log('\n   Timeline:');
      finalEntityLogs.forEach((log, idx) => {
        console.log(`   ${idx + 1}. ${log.timestamp.toLocaleTimeString()} - ${log.action} (${log.status})`);
      });
    }

    // ============================================================
    // Example 10: Query Logs by User
    // ============================================================
    console.log('\n👤 Example 10: Query logs by user');
    console.log('─'.repeat(60));
    
    // Get user from the first log
    if (recentLogs.length > 0 && recentLogs[0].userEmail) {
      const userEmail = recentLogs[0].userEmail;
      const userLogs = await client.audit.getUserLogs(userEmail, {
        limit: 5
      });
      
      console.log(`✅ Found ${userLogs.length} log(s) for user: ${userEmail}`);
    } else {
      console.log('   ℹ️  No user email available in recent logs');
    }

    // ============================================================
    // Example 11: Audit Log Statistics
    // ============================================================
    console.log('\n📊 Example 11: Audit log statistics');
    console.log('─'.repeat(60));
    
    const allRecentLogs = await client.audit.query({ limit: 50 });
    
    // Count by action type
    const actionCounts: Record<string, number> = {};
    allRecentLogs.forEach(log => {
      actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
    });
    
    console.log('✅ Recent activity summary (last 50 logs):');
    Object.entries(actionCounts).forEach(([action, count]) => {
      console.log(`   ${action}: ${count}`);
    });
    
    // Count by status
    const statusCounts: Record<string, number> = {};
    allRecentLogs.forEach(log => {
      statusCounts[log.status] = (statusCounts[log.status] || 0) + 1;
    });
    
    console.log('\n   Status breakdown:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`);
    });

    // ============================================================
    // Clean Up: Delete Test Entity
    // ============================================================
    console.log('\n🗑️  Cleanup: Deleting test entity');
    console.log('─'.repeat(60));
    
    await client.entities.delete(testEntityId, 'service');
    console.log(`✅ Deleted entity: ${testEntityId}`);
    console.log('   This will generate DELETE audit log entry');

    console.log('\n━'.repeat(60));
    console.log('✅ All audit log operations completed successfully!\n');
    console.log('💡 Tip: Audit logs are immutable and preserved even after entity deletion');

  } catch (error) {
    console.error('\n❌ Error:', error);
    
    // Clean up on error
    try {
      console.log('\n🧹 Attempting cleanup...');
      await client.entities.delete(testEntityId, 'service').catch(() => {});
      console.log('✅ Cleanup complete');
    } catch (cleanupError) {
      console.error('⚠️  Cleanup failed:', cleanupError);
    }
    
    process.exit(1);
  }
}

main();
