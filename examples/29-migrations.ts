/**
 * Example: Migrations Management
 * 
 * This example demonstrates how to:
 * - List migrations
 * - Get migration details
 * - Create new migrations
 * - Cancel running migrations
 * 
 * Run with: pnpm tsx examples/29-migrations.ts
 */

import { PortClient } from '../src';

async function main() {
  // Initialize the client (uses credentials from environment variables)
  const client = new PortClient();

  console.log('Migrations Management Example\n');
  console.log('━'.repeat(60));

  try {
    // ============================================================
    // Example 1: List All Migrations
    // ============================================================
    console.log('\nExample 1: List all migrations');
    console.log('─'.repeat(60));
    
    const allMigrations = await client.migrations.list();
    
    console.log(`[OK] Found ${allMigrations.length} migration(s):`);
    allMigrations.forEach((migration, idx) => {
      console.log(`   ${idx + 1}. Migration: ${migration.id}`);
      console.log(`      Status: ${migration.status}`);
      if (migration.sourceBlueprint) {
        console.log(`      Source Blueprint: ${migration.sourceBlueprint}`);
      }
      if (migration.targetBlueprint) {
        console.log(`      Target Blueprint: ${migration.targetBlueprint}`);
      }
      if (migration.progress !== undefined) {
        console.log(`      Progress: ${migration.progress}%`);
      }
      if (migration.createdAt) {
        console.log(`      Created: ${migration.createdAt.toISOString()}`);
      }
      if (migration.completedAt) {
        console.log(`      Completed: ${migration.completedAt.toISOString()}`);
      }
    });

    // ============================================================
    // Example 2: Filter Migrations by Status
    // ============================================================
    console.log('\nExample 2: Filter migrations by status');
    console.log('─'.repeat(60));
    
    const runningMigrations = await client.migrations.list({
      status: ['RUNNING', 'PENDING', 'INITIALIZING'],
    });
    
    console.log(`[OK] Found ${runningMigrations.length} active migration(s):`);
    runningMigrations.forEach((migration, idx) => {
      console.log(`   ${idx + 1}. ${migration.id} - ${migration.status}`);
      if (migration.progress !== undefined) {
        console.log(`      Progress: ${migration.progress}%`);
      }
    });

    // ============================================================
    // Example 3: Filter Migrations by Blueprint
    // ============================================================
    console.log('\nExample 3: Filter migrations by blueprint');
    console.log('─'.repeat(60));
    
    // Note: Replace 'service' with an actual blueprint identifier
    const blueprintMigrations = await client.migrations.list({
      blueprint: 'service',
    });
    
    console.log(`[OK] Found ${blueprintMigrations.length} migration(s) for blueprint 'service':`);
    blueprintMigrations.forEach((migration, idx) => {
      console.log(`   ${idx + 1}. ${migration.id} - ${migration.status}`);
    });

    // ============================================================
    // Example 4: Get Migration Details
    // ============================================================
    if (allMigrations.length > 0) {
      const firstMigration = allMigrations[0];
      
      console.log('\nExample 4: Get migration details');
      console.log('─'.repeat(60));
      
      const migration = await client.migrations.get(firstMigration.id);
      
      console.log(`[OK] Migration details for: ${migration.id}`);
      console.log(`   Status: ${migration.status}`);
      if (migration.sourceBlueprint) {
        console.log(`   Source Blueprint: ${migration.sourceBlueprint}`);
      }
      if (migration.targetBlueprint) {
        console.log(`   Target Blueprint: ${migration.targetBlueprint}`);
      }
      if (migration.actor) {
        console.log(`   Actor: ${migration.actor}`);
      }
      if (migration.progress !== undefined) {
        console.log(`   Progress: ${migration.progress}%`);
      }
      if (migration.createdAt) {
        console.log(`   Created: ${migration.createdAt.toISOString()}`);
      }
      if (migration.updatedAt) {
        console.log(`   Updated: ${migration.updatedAt.toISOString()}`);
      }
      if (migration.completedAt) {
        console.log(`   Completed: ${migration.completedAt.toISOString()}`);
      }
      if (migration.error) {
        console.log(`   Error: ${migration.error}`);
      }
      if (migration.details) {
        console.log(`   Details: ${JSON.stringify(migration.details, null, 2)}`);
      }

      // ============================================================
      // Example 5: Create a Migration
      // ============================================================
      console.log('\nExample 5: Create a migration');
      console.log('─'.repeat(60));
      
      // Note: This example shows the structure but doesn't actually create
      // to avoid creating unnecessary migrations
      console.log('Note: Example migration creation:');
      console.log('   const migration = await client.migrations.create({');
      console.log('     sourceBlueprint: "old-service",');
      console.log('     mapping: {');
      console.log('       blueprint: "new-service",');
      console.log('       filter: \'.environment == "production"\',');
      console.log('       entity: {');
      console.log('         identifier: ".identifier",');
      console.log('         title: ".title",');
      console.log('         properties: {');
      console.log('           environment: ".environment",');
      console.log('           region: ".region",');
      console.log('         },');
      console.log('         relations: {');
      console.log('           team: ".team",');
      console.log('         },');
      console.log('       },');
      console.log('     },');
      console.log('   });');

      // ============================================================
      // Example 6: Cancel a Migration
      // ============================================================
      console.log('\nExample 6: Cancel a migration');
      console.log('─'.repeat(60));
      
      // Note: This example shows the structure but doesn't actually cancel
      // to avoid cancelling running migrations
      console.log('Note: Example migration cancellation:');
      console.log(`   await client.migrations.cancel('${migration.id}', {`);
      console.log('     reason: "Migration no longer needed",');
      console.log('   });');
      console.log('   ');
      console.log('   // Or cancel without reason:');
      console.log(`   await client.migrations.cancel('${migration.id}');`);
    } else {
      console.log('\n[WARNING] No migrations found. Skipping migration-specific examples.');
      console.log('   Create a migration first to see full functionality.');
    }

    // ============================================================
    // Example 7: Monitor Migration Progress
    // ============================================================
    console.log('\nExample 7: Monitor migration progress');
    console.log('─'.repeat(60));
    
    const activeMigrations = await client.migrations.list({
      status: ['RUNNING', 'PENDING', 'INITIALIZING'],
    });
    
    if (activeMigrations.length > 0) {
      console.log(`[OK] Monitoring ${activeMigrations.length} active migration(s):`);
      for (const migration of activeMigrations) {
        const details = await client.migrations.get(migration.id);
        console.log(`   ${details.id}: ${details.status}`);
        if (details.progress !== undefined) {
          console.log(`      Progress: ${details.progress}%`);
        }
        if (details.error) {
          console.log(`      Error: ${details.error}`);
        }
      }
    } else {
      console.log('[OK] No active migrations to monitor');
    }

    console.log('\n━'.repeat(60));
    console.log('[OK] All migration operations completed successfully!\n');

  } catch (error) {
    console.error('\n[ERROR] Error:', error);
    
    if (error instanceof Error) {
      console.error(`   Message: ${error.message}`);
      if ('statusCode' in error) {
        console.error(`   Status Code: ${(error as { statusCode?: number }).statusCode}`);
      }
    }
    
    process.exit(1);
  }
}

main();
