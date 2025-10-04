/**
 * Example: End-to-End Workflow
 * 
 * Description:
 * Complete workflow demonstrating blueprint, entity, scorecard, and action creation
 * This simulates a real-world Port.io setup for a microservices architecture
 * 
 * Prerequisites:
 * - Port.io account with API credentials
 * 
 * Run:
 * pnpm tsx examples/18-end-to-end.ts
 */

import { PortClient, LogLevel } from '../src';

async function main() {
  console.log('🌟 Port SDK - End-to-End Workflow\n');
  console.log('═'.repeat(80) + '\n');
  console.log('This example demonstrates a complete Port.io setup:\n');
  console.log('  1. Create a Service blueprint');
  console.log('  2. Add a Production Readiness scorecard');
  console.log('  3. Create a Deploy action');
  console.log('  4. Create example service entities');
  console.log('  5. Clean up all resources\n');
  console.log('═'.repeat(80) + '\n');

  const client = new PortClient({
    credentials: {
      clientId: process.env.PORT_CLIENT_ID!,
      clientSecret: process.env.PORT_CLIENT_SECRET!,
    },
    logger: {
      level: LogLevel.INFO,
      enabled: true,
    },
  });

  const timestamp = Date.now();
  const blueprintId = `microservice_${timestamp}`;
  const scorecardId = `production_readiness_${timestamp}`;
  const actionId = `deploy_service_${timestamp}`;

  const createdEntityIds: string[] = [];

  try {
    // ========================================================================
    // STEP 1: Create Service Blueprint
    // ========================================================================
    console.log('📘 Step 1: Create Service Blueprint\n');

    await client.blueprints.create({
      identifier: blueprintId,
      title: 'Microservice',
      icon: 'Microservice',
      description: 'A microservice in our architecture',
      schema: {
        properties: {
          name: {
            type: 'string',
            title: 'Service Name',
            description: 'The name of the microservice',
          },
          language: {
            type: 'string',
            title: 'Programming Language',
            enum: ['TypeScript', 'Python', 'Go', 'Java', 'Rust'],
          },
          team: {
            type: 'string',
            title: 'Owning Team',
          },
          repository: {
            type: 'url',
            title: 'Repository URL',
          },
          hasTests: {
            type: 'boolean',
            title: 'Has Automated Tests',
          },
          coverage: {
            type: 'number',
            title: 'Test Coverage (%)',
          },
          hasDocumentation: {
            type: 'boolean',
            title: 'Has Documentation',
          },
          lastDeploy: {
            type: 'datetime',
            title: 'Last Deployment',
          },
        },
        required: ['name', 'language', 'team'],
      },
    });

    console.log(`✓ Created blueprint: ${blueprintId}\n`);

    // ========================================================================
    // STEP 2: Create Production Readiness Scorecard
    // ========================================================================
    console.log('📊 Step 2: Create Production Readiness Scorecard\n');

    await client.scorecards.create({
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
          identifier: 'has_documentation',
          title: 'Has Documentation',
          description: 'Service must have documentation',
          level: 'Silver',
          query: {
            combinator: 'and',
            conditions: [
              {
                property: 'hasDocumentation',
                operator: '=',
                value: true,
              },
            ],
          },
        },
      ],
    });

    console.log(`✓ Created scorecard: ${scorecardId}\n`);

    // ========================================================================
    // STEP 3: Create Deploy Action
    // ========================================================================
    console.log('⚡ Step 3: Create Deploy Action\n');

    await client.actions.create({
      identifier: actionId,
      title: 'Deploy Service',
      description: 'Deploy a microservice to production',
      icon: 'Deployment',
      blueprint: blueprintId,
      trigger: {
        type: 'self-service',
        operation: 'DAY-2',
        blueprintIdentifier: blueprintId,
        userInputs: {
          properties: {
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
          }
        }
      },
      invocationMethod: {
        type: 'WEBHOOK',
        url: 'https://example.com/webhook/deploy',
        agent: false,
        synchronized: false,
        method: 'POST',
      },
    });

    console.log(`✓ Created action: ${actionId}\n`);

    // ========================================================================
    // STEP 4: Create Example Entities
    // ========================================================================
    console.log('📝 Step 4: Create Example Service Entities\n');

    // Entity 1: User Service (Gold standard)
    const userService = await client.entities.create({
      identifier: `user_service_${timestamp}`,
      blueprint: blueprintId,
      title: 'User Service',
      properties: {
        stringProps: {
          name: 'user-service',
          language: 'TypeScript',
          team: 'Platform Team',
          repository: 'https://github.com/example/user-service',
        },
        booleanProps: {
          hasTests: true,
          hasDocumentation: true,
        },
        numberProps: {
          coverage: 95,
        },
      },
    });
    createdEntityIds.push(userService.identifier);
    console.log(`✓ Created entity: ${userService.title} (Gold standard)`);

    // Entity 2: Payment Service (Silver standard)
    const paymentService = await client.entities.create({
      identifier: `payment_service_${timestamp}`,
      blueprint: blueprintId,
      title: 'Payment Service',
      properties: {
        stringProps: {
          name: 'payment-service',
          language: 'Go',
          team: 'Commerce Team',
          repository: 'https://github.com/example/payment-service',
        },
        booleanProps: {
          hasTests: true,
          hasDocumentation: false,
        },
        numberProps: {
          coverage: 75,
        },
      },
    });
    createdEntityIds.push(paymentService.identifier);
    console.log(`✓ Created entity: ${paymentService.title} (Silver standard)`);

    // Entity 3: Notification Service (Needs improvement)
    const notificationService = await client.entities.create({
      identifier: `notification_service_${timestamp}`,
      blueprint: blueprintId,
      title: 'Notification Service',
      properties: {
        stringProps: {
          name: 'notification-service',
          language: 'Python',
          team: 'Communications Team',
          repository: 'https://github.com/example/notification-service',
        },
        booleanProps: {
          hasTests: false,
          hasDocumentation: false,
        },
        numberProps: {
          coverage: 30,
        },
      },
    });
    createdEntityIds.push(notificationService.identifier);
    console.log(`✓ Created entity: ${notificationService.title} (Needs improvement)`);

    console.log('');

    // ========================================================================
    // STEP 5: Verify Setup
    // ========================================================================
    console.log('✅ Step 5: Verify Complete Setup\n');

    const blueprint = await client.blueprints.get(blueprintId);
    console.log(`✓ Blueprint exists: ${blueprint.title}`);

    const scorecard = await client.scorecards.get(blueprintId, scorecardId);
    console.log(`✓ Scorecard exists: ${scorecard.title} (${scorecard.rules?.length} rules)`);

    const action = await client.actions.get(actionId);
    console.log(`✓ Action exists: ${action.title}`);

    const entities = await client.entities.list({ blueprint: blueprintId });
    console.log(`✓ Created ${createdEntityIds.length} service entities`);

    console.log('');
    console.log('═'.repeat(80) + '\n');
    console.log('🎉 Complete Port.io setup created successfully!\n');

    console.log('What was created:');
    console.log(`  • 1 Blueprint: ${blueprint.title}`);
    console.log(`  • 1 Scorecard: ${scorecard.title}`);
    console.log(`  • 1 Action: ${action.title}`);
    console.log(`  • ${createdEntityIds.length} Entities (services)\n`);

    console.log('You can now:');
    console.log('  • View entities in Port.io dashboard');
    console.log('  • Check production readiness scores');
    console.log('  • Execute deployment actions');
    console.log('  • Add more services and track quality\n');

    // ========================================================================
    // STEP 6: Cleanup
    // ========================================================================
    console.log('🧹 Step 6: Cleanup Resources\n');

    // Delete entities
    for (const entityId of createdEntityIds) {
      await client.entities.delete(entityId);
      console.log(`✓ Deleted entity: ${entityId}`);
    }

    // Delete action
    await client.actions.delete(actionId);
    console.log(`✓ Deleted action: ${actionId}`);

    // Delete scorecard
    await client.scorecards.delete(blueprintId, scorecardId);
    console.log(`✓ Deleted scorecard: ${scorecardId}`);

    // Delete blueprint
    await client.blueprints.delete(blueprintId);
    console.log(`✓ Deleted blueprint: ${blueprintId}`);

    console.log('');
    console.log('═'.repeat(80) + '\n');
    console.log('✅ End-to-end workflow completed successfully!\n');

    console.log('📚 What you learned:');
    console.log('  • How to structure a complete Port.io setup');
    console.log('  • Creating blueprints with rich schemas');
    console.log('  • Adding scorecards for quality tracking');
    console.log('  • Creating actions for automation');
    console.log('  • Managing multiple entities');
    console.log('  • Cleaning up resources properly\n');

    console.log('📚 Next Steps:');
    console.log('  • Customize the blueprint for your use case');
    console.log('  • Add more scorecard rules');
    console.log('  • Integrate actions with your CI/CD');
    console.log('  • Explore entity relationships');
    console.log('  • Set up webhooks for real-time updates\n');

    console.log('📖 Documentation:');
    console.log('  • README.md - Getting started');
    console.log('  • docs/ - Comprehensive guides');
    console.log('  • examples/ - More example code\n');

  } catch (error) {
    console.error('❌ Error occurred:', error);

    // Cleanup on error
    console.log('\n🧹 Attempting cleanup...\n');

    for (const entityId of createdEntityIds) {
      try {
        await client.entities.delete(entityId);
        console.log(`✓ Cleaned up entity: ${entityId}`);
      } catch {
        // Ignore cleanup errors
      }
    }

    try {
      await client.actions.delete(actionId);
      console.log(`✓ Cleaned up action: ${actionId}`);
    } catch {
      // Ignore
    }

    try {
      await client.scorecards.delete(blueprintId, scorecardId);
      console.log(`✓ Cleaned up scorecard: ${scorecardId}`);
    } catch {
      // Ignore
    }

    try {
      await client.blueprints.delete(blueprintId);
      console.log(`✓ Cleaned up blueprint: ${blueprintId}`);
    } catch {
      // Ignore
    }

    process.exit(1);
  }
}

main();

