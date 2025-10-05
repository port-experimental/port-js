/**
 * Example: Basic Entity Relations
 * 
 * Demonstrates how to work with entity relations in Port:
 * - Single relations (one-to-one)
 * - Many relations (one-to-many)
 * - Creating entities with relations
 * - Updating relations
 * 
 * Prerequisites:
 * - PORT_CLIENT_ID and PORT_CLIENT_SECRET environment variables
 * - 'service' and 'team' blueprints exist
 * 
 * Run: npx tsx examples/20-entity-relations-basic.ts
 */

import { PortClient } from '../src';

async function main() {
  console.log('🔗 Example: Basic Entity Relations\n');

  // Initialize client
  const client = new PortClient();

  try {
    // ============================================================
    // PART 1: Create entities with single relations
    // ============================================================
    console.log('📝 Part 1: Single Relations (One-to-One)\n');

    // Create a team first
    const team = await client.teams.create({
      name: 'backend_team',
      description: 'Backend development team',
      users: ['alice@company.com', 'bob@company.com'],
    });
    console.log(`✅ Created team: ${team.name}`);

    // Create a service with a team relation (single relation)
    const service = await client.entities.create({
      identifier: 'user-service',
      blueprint: 'service',
      title: 'User Service',
      properties: {
        stringProps: {
          description: 'Handles user authentication and profiles',
          language: 'typescript',
          environment: 'production',
        },
      },
      relations: {
        singleRelations: {
          team: 'backend_team',  // ✅ References the team we created
        },
      },
    });
    console.log(`✅ Created service: ${service.identifier}`);
    console.log(`   → Team: ${service.relations?.singleRelations?.team || 'N/A'}`);

    // ============================================================
    // PART 2: Create entities with many relations
    // ============================================================
    console.log('\n📝 Part 2: Many Relations (One-to-Many)\n');

    // Create another service
    const orderService = await client.entities.create({
      identifier: 'order-service',
      blueprint: 'service',
      title: 'Order Service',
      properties: {
        stringProps: {
          description: 'Manages orders and payments',
          language: 'java',
          environment: 'production',
        },
      },
      relations: {
        singleRelations: {
          team: 'backend_team',
        },
        manyRelations: {
          // Service depends on user-service
          dependencies: ['user-service'],
        },
      },
    });
    console.log(`✅ Created service: ${orderService.identifier}`);
    console.log(`   → Team: ${orderService.relations?.singleRelations?.team || 'N/A'}`);
    console.log(`   → Dependencies: ${orderService.relations?.manyRelations?.dependencies?.join(', ') || 'None'}`);

    // ============================================================
    // PART 3: Update relations
    // ============================================================
    console.log('\n📝 Part 3: Updating Relations\n');

    // Update user-service to show order-service depends on it
    const updatedService = await client.entities.update(
      'user-service',
      'service',
      {
        relations: {
          singleRelations: {
            team: 'backend_team',
          },
          manyRelations: {
            // Add dependents (services that depend on this one)
            dependents: ['order-service'],
          },
        },
      }
    );
    console.log(`✅ Updated service: ${updatedService.identifier}`);
    console.log(`   → Dependents: ${updatedService.relations?.manyRelations?.dependents?.join(', ') || 'None'}`);

    // ============================================================
    // PART 4: Query entities by relations
    // ============================================================
    console.log('\n📝 Part 4: Querying by Relations\n');

    // Search for services in the backend_team
    const teamServices = await client.entities.search({
      combinator: 'and',
      rules: [
        {
          property: '$blueprint',
          operator: '=',
          value: 'service',
        },
        {
          property: '$team',
          operator: '=',
          value: 'backend_team',
        },
      ],
    });
    console.log(`✅ Found ${teamServices.length} service(s) in backend_team:`);
    teamServices.forEach((svc) => {
      console.log(`   - ${svc.identifier}: ${svc.title}`);
    });

    // ============================================================
    // PART 5: Working with empty relations
    // ============================================================
    console.log('\n📝 Part 5: Empty Relations\n');

    // Create a service without relations
    const standAloneService = await client.entities.create({
      identifier: 'standalone-service',
      blueprint: 'service',
      title: 'Standalone Service',
      properties: {
        stringProps: {
          description: 'Independent service',
          language: 'go',
          environment: 'staging',
        },
      },
      relations: {
        manyRelations: {
          dependencies: [],  // ✅ Empty array is valid
          dependents: [],
        },
      },
    });
    console.log(`✅ Created standalone service: ${standAloneService.identifier}`);
    console.log(`   → Dependencies: ${standAloneService.relations?.manyRelations?.dependencies?.length || 0}`);

    // ============================================================
    // PART 6: Cleanup
    // ============================================================
    console.log('\n🗑️  Cleaning up...\n');

    await client.entities.delete('user-service', 'service');
    console.log('✅ Deleted user-service');

    await client.entities.delete('order-service', 'service');
    console.log('✅ Deleted order-service');

    await client.entities.delete('standalone-service', 'service');
    console.log('✅ Deleted standalone-service');

    await client.teams.delete('backend_team');
    console.log('✅ Deleted backend_team');

    // ============================================================
    // Summary
    // ============================================================
    console.log('\n' + '='.repeat(60));
    console.log('✅ Example completed successfully!');
    console.log('='.repeat(60));
    console.log('\n📚 Key Takeaways:');
    console.log('1. Single relations connect to ONE entity (e.g., team)');
    console.log('2. Many relations connect to MULTIPLE entities (e.g., dependencies)');
    console.log('3. Relations must be under singleRelations or manyRelations');
    console.log('4. Empty arrays are valid for many relations');
    console.log('5. Query entities by relations using search operators');

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

main();

