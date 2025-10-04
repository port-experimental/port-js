/**
 * Example: Scorecard CRUD Operations
 * 
 * Description:
 * Demonstrates creating, reading, updating, and deleting scorecards
 * 
 * Prerequisites:
 * - Port.io account with API credentials
 * - A blueprint to attach the scorecard to
 * 
 * Run:
 * pnpm tsx examples/13-scorecards-crud.ts
 */

import { PortClient } from '../src';

async function main() {
  console.log('📊 Port SDK - Scorecard CRUD Operations\n');
  console.log('═'.repeat(80) + '\n');

  const client = new PortClient({
    credentials: {
      clientId: process.env.PORT_CLIENT_ID!,
      clientSecret: process.env.PORT_CLIENT_SECRET!,
    },
  });

  const timestamp = Date.now();
  const blueprintId = `example_service_${timestamp}`;
  const scorecardId = `example_scorecard_${timestamp}`;

  try {
    // ========================================================================
    // SETUP: Create a blueprint for the scorecard
    // ========================================================================
    console.log('🏗️  Setup: Create Blueprint\n');

    await client.blueprints.create({
      identifier: blueprintId,
      title: 'Service',
      icon: 'Service',
      schema: {
        properties: {
          name: { type: 'string', title: 'Name' },
          hasTests: { type: 'boolean', title: 'Has Tests' },
          coverage: { type: 'number', title: 'Test Coverage %' },
          lastDeploy: { type: 'string', title: 'Last Deploy', format: 'date-time' },
        },
        required: ['name'],
      },
    });

    console.log(`✓ Created blueprint: ${blueprintId}\n`);

    // ========================================================================
    // CREATE: Create a scorecard
    // ========================================================================
    console.log('📝 Step 1: Create Scorecard\n');

    const scorecard = await client.scorecards.create({
      identifier: scorecardId,
      title: 'Production Readiness',
      blueprint: blueprintId,
      rules: [
        {
          identifier: 'has_tests',
          title: 'Has Automated Tests',
          description: 'Service must have automated tests',
          level: 'Gold',
          query: {
            combinator: 'and',
            conditions: [
              {
                property: 'hasTests',
                operator: '=',
                value: true,
              },
            ],
          },
        },
        {
          identifier: 'high_coverage',
          title: 'High Test Coverage',
          description: 'Test coverage must be above 80%',
          level: 'Gold',
          query: {
            combinator: 'and',
            conditions: [
              {
                property: 'coverage',
                operator: '>=',
                value: 80,
              },
            ],
          },
        },
        {
          identifier: 'recent_deploy',
          title: 'Recently Deployed',
          description: 'Deployed within last 30 days',
          level: 'Silver',
          query: {
            combinator: 'and',
            conditions: [
              {
                property: 'lastDeploy',
                operator: 'between',
                value: {
                  preset: 'lastMonth',
                },
              },
            ],
          },
        },
      ],
    });

    console.log('✓ Scorecard created');
    console.log(`  ID: ${scorecard.identifier}`);
    console.log(`  Title: ${scorecard.title}`);
    console.log(`  Blueprint: ${scorecard.blueprint}`);
    console.log(`  Rules: ${scorecard.rules?.length || 0}`);
    console.log('');

    // ========================================================================
    // READ: Get the scorecard
    // ========================================================================
    console.log('📖 Step 2: Get Scorecard\n');

    const fetched = await client.scorecards.get(blueprintId, scorecardId);

    console.log('✓ Scorecard retrieved');
    console.log(`  ID: ${fetched.identifier}`);
    console.log(`  Title: ${fetched.title}`);
    console.log(`  Rules:`);
    fetched.rules?.forEach((rule, index) => {
      console.log(`    ${index + 1}. ${rule.title} (${rule.level})`);
    });
    console.log('');

    // ========================================================================
    // LIST: List all scorecards
    // ========================================================================
    console.log('📋 Step 3: List Scorecards\n');

    const scorecards = await client.scorecards.list(blueprintId);

    console.log(`✓ Found ${scorecards.length} scorecards`);
    scorecards.forEach((sc, index) => {
      console.log(`  ${index + 1}. ${sc.identifier} - ${sc.title} (${sc.blueprint})`);
    });
    console.log('');

    // ========================================================================
    // UPDATE: Update the scorecard
    // ========================================================================
    console.log('✏️  Step 4: Update Scorecard\n');

    const updated = await client.scorecards.update(blueprintId, scorecardId, {
      title: 'Production Readiness (Updated)',
      rules: [
        ...fetched.rules!,
        {
          identifier: 'has_documentation',
          title: 'Has Documentation',
          description: 'Service must have README',
          level: 'Bronze',
          query: {
            combinator: 'and',
            conditions: [
              {
                property: 'name',
                operator: '!=',
                value: null,
              },
            ],
          },
        },
      ],
    });

    console.log('✓ Scorecard updated');
    console.log(`  Title: ${updated.title}`);
    console.log(`  Rules: ${updated.rules?.length || 0} (added 1)`);
    console.log('');

    // ========================================================================
    // DELETE: Delete the scorecard
    // ========================================================================
    console.log('🗑️  Step 5: Delete Scorecard\n');

    await client.scorecards.delete(blueprintId, scorecardId);

    console.log(`✓ Scorecard deleted: ${scorecardId}`);
    console.log('');

    // ========================================================================
    // CLEANUP: Delete blueprint
    // ========================================================================
    console.log('🧹 Cleanup: Delete Blueprint\n');

    await client.blueprints.delete(blueprintId);

    console.log(`✓ Blueprint deleted: ${blueprintId}`);
    console.log('');

    console.log('═'.repeat(80) + '\n');
    console.log('✅ All scorecard operations completed successfully!\n');

    console.log('📚 What you learned:');
    console.log('  • create() - Create scorecards with rules');
    console.log('  • get() - Retrieve a scorecard');
    console.log('  • list() - List all scorecards');
    console.log('  • update() - Update scorecard rules');
    console.log('  • delete() - Remove a scorecard\n');

    console.log('📚 Scorecard Levels:');
    console.log('  • Gold - Critical requirements');
    console.log('  • Silver - Important requirements');
    console.log('  • Bronze - Nice-to-have requirements\n');

    console.log('📚 Next Steps:');
    console.log('  • Try example 14-scorecards-rules.ts for advanced rules');
    console.log('  • Read docs/api/scorecards.md for details\n');
  } catch (error) {
    console.error('❌ Error:', error);

    // Clean up
    try {
      await client.scorecards.delete(blueprintId, scorecardId);
      await client.blueprints.delete(blueprintId);
      console.log('\n✓ Cleanup completed');
    } catch {
      // Ignore cleanup errors
    }

    process.exit(1);
  }
}

main();

