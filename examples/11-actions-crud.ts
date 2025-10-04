/**
 * Example: Action CRUD Operations
 * 
 * Description:
 * Demonstrates creating, reading, updating, deleting, and executing actions
 * 
 * Prerequisites:
 * - Port.io account with API credentials
 * - A blueprint to attach the action to
 * 
 * Run:
 * pnpm tsx examples/11-actions-crud.ts
 */

import { PortClient } from '../src';

async function main() {
  console.log('⚡ Port SDK - Action CRUD Operations\n');
  console.log('═'.repeat(80) + '\n');

  const client = new PortClient({
    credentials: {
      clientId: process.env.PORT_CLIENT_ID!,
      clientSecret: process.env.PORT_CLIENT_SECRET!,
    },
  });

  const timestamp = Date.now();
  const blueprintId = `example_service_${timestamp}`;
  const actionId = `example_deploy_${timestamp}`;

  try {
    // ========================================================================
    // SETUP: Create a blueprint for the action
    // ========================================================================
    console.log('🏗️  Setup: Create Blueprint\n');

    await client.blueprints.create({
      identifier: blueprintId,
      title: 'Service',
      icon: 'Service',
      schema: {
        properties: {
          name: { type: 'string', title: 'Name' },
          version: { type: 'string', title: 'Version' },
        },
        required: ['name'],
      },
    });

    console.log(`✓ Created blueprint: ${blueprintId}\n`);

    // ========================================================================
    // CREATE: Create an action
    // ========================================================================
    console.log('📝 Step 1: Create Action\n');

    const action = await client.actions.create({
      identifier: actionId,
      title: 'Deploy Service',
      description: 'Deploy a service to production',
      icon: 'Deployment',
      blueprint: blueprintId,
      trigger: 'DAY-2',
      userInputs: {
        environment: {
          type: 'string',
          title: 'Environment',
          enum: ['staging', 'production'],
          default: 'staging',
        },
        version: {
          type: 'string',
          title: 'Version to deploy',
        },
      },
      invocationMethod: {
        type: 'WEBHOOK',
        url: 'https://example.com/webhook/deploy',
        agent: false,
        synchronized: false,
        method: 'POST',
      },
    });

    console.log('✓ Action created');
    console.log(`  ID: ${action.identifier}`);
    console.log(`  Title: ${action.title}`);
    console.log(`  Blueprint: ${action.blueprint}`);
    console.log('');

    // ========================================================================
    // READ: Get the action
    // ========================================================================
    console.log('📖 Step 2: Get Action\n');

    const fetched = await client.actions.get(actionId);

    console.log('✓ Action retrieved');
    console.log(`  ID: ${fetched.identifier}`);
    console.log(`  Title: ${fetched.title}`);
    console.log(`  Description: ${fetched.description}`);
    console.log(`  Created: ${fetched.createdAt?.toLocaleString()}`);
    console.log('');

    // ========================================================================
    // LIST: List all actions
    // ========================================================================
    console.log('📋 Step 3: List Actions\n');

    const actions = await client.actions.list();

    console.log(`✓ Found ${actions.length} actions`);
    console.log(`  First ${Math.min(5, actions.length)} actions:`);
    actions.slice(0, 5).forEach((a, index) => {
      console.log(`  ${index + 1}. ${a.identifier} - ${a.title}`);
    });
    console.log('');

    // ========================================================================
    // UPDATE: Update the action
    // ========================================================================
    console.log('✏️  Step 4: Update Action\n');

    const updated = await client.actions.update(actionId, {
      title: 'Deploy Service (Updated)',
      description: 'Deploy a service to production or staging',
    });

    console.log('✓ Action updated');
    console.log(`  Title: ${updated.title}`);
    console.log(`  Description: ${updated.description}`);
    console.log('');

    // ========================================================================
    // EXECUTE: Execute the action (note: will fail as webhook is fake)
    // ========================================================================
    console.log('🚀 Step 5: Execute Action\n');

    try {
      const run = await client.actions.execute(actionId, {
        environment: 'staging',
        version: '1.0.0',
      });

      console.log('✓ Action executed');
      console.log(`  Run ID: ${run.id}`);
      console.log(`  Status: ${run.status}`);
    } catch (error) {
      console.log('⚠️  Action execution failed (expected - webhook URL is fake)');
      console.log(`  This is normal for this example`);
    }
    console.log('');

    // ========================================================================
    // DELETE: Delete the action
    // ========================================================================
    console.log('🗑️  Step 6: Delete Action\n');

    await client.actions.delete(actionId);

    console.log(`✓ Action deleted: ${actionId}`);
    console.log('');

    // ========================================================================
    // CLEANUP: Delete blueprint
    // ========================================================================
    console.log('🧹 Cleanup: Delete Blueprint\n');

    await client.blueprints.delete(blueprintId);

    console.log(`✓ Blueprint deleted: ${blueprintId}`);
    console.log('');

    console.log('═'.repeat(80) + '\n');
    console.log('✅ All action operations completed successfully!\n');

    console.log('📚 What you learned:');
    console.log('  • create() - Create actions with triggers and invocation methods');
    console.log('  • get() - Retrieve an action');
    console.log('  • list() - List all actions');
    console.log('  • update() - Update action properties');
    console.log('  • execute() - Execute an action with inputs');
    console.log('  • delete() - Remove an action\n');

    console.log('📚 Trigger Types:');
    console.log('  • self-service - User-initiated actions');
    console.log('  • automation - Event-driven actions');
    console.log('  • timer - Scheduled actions\n');

    console.log('📚 Invocation Methods:');
    console.log('  • webhook - HTTP webhook');
    console.log('  • kafka - Kafka message');
    console.log('  • github - GitHub workflow\n');

    console.log('📚 Next Steps:');
    console.log('  • Try example 12-actions-execution.ts for more execution patterns');
    console.log('  • Read docs/api/actions.md for details\n');
  } catch (error) {
    console.error('❌ Error:', error);

    // Clean up
    try {
      await client.actions.delete(actionId);
      await client.blueprints.delete(blueprintId);
      console.log('\n✓ Cleanup completed');
    } catch {
      // Ignore cleanup errors
    }

    process.exit(1);
  }
}

main();

