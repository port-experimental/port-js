/**
 * Example: Entity Relations
 * 
 * Description:
 * Demonstrates how to work with entity relationships in Port:
 * - Single relations (one-to-one)
 * - Many relations (one-to-many)
 * - Getting related entities
 * - Bidirectional relations
 * 
 * Prerequisites:
 * - Port.io account with API credentials
 * - Understanding of blueprints and entities
 * 
 * Run:
 * pnpm tsx examples/07-entities-relations.ts
 */

import { PortClient } from '../src';

// ============================================================================
// Setup: Create Blueprints with Relations
// ============================================================================

async function setupBlueprints(client: PortClient) {
  console.log('📝 Setting up blueprints with relations...\n');

  const timestamp = Date.now();

  // Create Team blueprint
  const teamBlueprint = await client.blueprints.create({
    identifier: `example_team_${timestamp}`,
    title: 'Team',
    icon: 'Team',
    schema: {
      properties: {
        name: { type: 'string', title: 'Team Name' },
        slack: { type: 'string', title: 'Slack Channel' },
      },
      required: ['name'],
    },
  });

  // Create Service blueprint with relations
  const serviceBlueprint = await client.blueprints.create({
    identifier: `example_service_${timestamp}`,
    title: 'Service',
    icon: 'Service',
    schema: {
      properties: {
        name: { type: 'string', title: 'Service Name' },
        language: { type: 'string', title: 'Language' },
      },
      required: ['name'],
    },
    relations: {
      // Single relation: Each service belongs to one team
      team: {
        title: 'Team',
        target: teamBlueprint.identifier,
        required: false,
        many: false,
      },
      // Many relation: Each service can depend on multiple services
      dependencies: {
        title: 'Dependencies',
        target: serviceBlueprint.identifier,
        required: false,
        many: true,
      },
    },
  });

  console.log(`✓ Created team blueprint: ${teamBlueprint.identifier}`);
  console.log(`✓ Created service blueprint: ${serviceBlueprint.identifier}`);
  console.log(`✓ Defined relations:`);
  console.log(`  • team (single): Service → Team`);
  console.log(`  • dependencies (many): Service → Service\n`);

  return { teamBlueprint, serviceBlueprint };
}

// ============================================================================
// Example 1: Create Entities with Single Relations
// ============================================================================

async function exampleSingleRelations(
  client: PortClient,
  teamId: string,
  serviceId: string
) {
  console.log('📝 Example 1: Single Relations (One-to-One)\n');

  const timestamp = Date.now();

  // Create a team
  const team = await client.entities.create({
    identifier: `backend_team_${timestamp}`,
    blueprint: teamId,
    title: 'Backend Team',
    properties: {
      stringProps: {
        name: 'Backend Team',
        slack: '#backend',
      },
    },
  });

  console.log(`✓ Created team: ${team.identifier}\n`);

  // Create a service that belongs to this team
  const service = await client.entities.create({
    identifier: `user_service_${timestamp}`,
    blueprint: serviceId,
    title: 'User Service',
    properties: {
      stringProps: {
        name: 'User Service',
        language: 'TypeScript',
      },
    },
    relations: {
      singleRelations: {
        team: team.identifier, // Single relation
      },
    },
  });

  console.log('Service with single relation:');
  console.log(`  Service: ${service.identifier}`);
  console.log(`  Team: ${team.identifier}`);
  console.log(`  Relation type: Single (one-to-one)\n`);

  return { team, service };
}

// ============================================================================
// Example 2: Create Entities with Many Relations
// ============================================================================

async function exampleManyRelations(
  client: PortClient,
  teamId: string,
  serviceId: string,
  teamIdentifier: string
) {
  console.log('📝 Example 2: Many Relations (One-to-Many)\n');

  const timestamp = Date.now();

  // Create a database service
  const database = await client.entities.create({
    identifier: `database_service_${timestamp}`,
    blueprint: serviceId,
    title: 'Database Service',
    properties: {
      stringProps: {
        name: 'PostgreSQL Database',
        language: 'SQL',
      },
    },
    relations: {
      singleRelations: {
        team: teamIdentifier,
      },
    },
  });

  console.log(`✓ Created database service: ${database.identifier}`);

  // Create a cache service
  const cache = await client.entities.create({
    identifier: `cache_service_${timestamp}`,
    blueprint: serviceId,
    title: 'Cache Service',
    properties: {
      stringProps: {
        name: 'Redis Cache',
        language: 'Redis',
      },
    },
    relations: {
      singleRelations: {
        team: teamIdentifier,
      },
    },
  });

  console.log(`✓ Created cache service: ${cache.identifier}\n`);

  // Create an API service that depends on both
  const api = await client.entities.create({
    identifier: `api_service_${timestamp}`,
    blueprint: serviceId,
    title: 'API Service',
    properties: {
      stringProps: {
        name: 'REST API',
        language: 'TypeScript',
      },
    },
    relations: {
      singleRelations: {
        team: teamIdentifier,
      },
      manyRelations: {
        dependencies: [database.identifier, cache.identifier], // Many relations
      },
    },
  });

  console.log('API Service with many relations:');
  console.log(`  Service: ${api.identifier}`);
  console.log(`  Dependencies:`);
  console.log(`    - ${database.identifier}`);
  console.log(`    - ${cache.identifier}`);
  console.log(`  Relation type: Many (one-to-many)\n`);

  return { database, cache, api };
}

// ============================================================================
// Example 3: Get Related Entities
// ============================================================================

async function exampleGetRelated(
  client: PortClient,
  serviceId: string,
  apiIdentifier: string
) {
  console.log('📝 Example 3: Get Related Entities\n');

  // Get dependencies of the API service
  const dependencies = await client.entities.getRelated(
    apiIdentifier,
    'dependencies',
    serviceId
  );

  console.log(`Dependencies of ${apiIdentifier}:`);
  dependencies.forEach((dep) => {
    console.log(`  • ${dep.identifier}: ${dep.title}`);
  });
  console.log('');
}

// ============================================================================
// Example 4: Update Relations
// ============================================================================

async function exampleUpdateRelations(
  client: PortClient,
  serviceId: string,
  apiIdentifier: string,
  newDependency: string
) {
  console.log('📝 Example 4: Update Relations\n');

  // Get current dependencies
  const current = await client.entities.get(apiIdentifier, serviceId);
  const currentDeps = current.relations?.manyRelations?.dependencies || [];

  console.log(`Current dependencies: ${currentDeps.length}`);

  // Add a new dependency
  const updated = await client.entities.update(apiIdentifier, serviceId, {
    relations: {
      manyRelations: {
        dependencies: [...currentDeps, newDependency],
      },
    },
  });

  const newDeps = updated.relations?.manyRelations?.dependencies || [];
  console.log(`Updated dependencies: ${newDeps.length}`);
  console.log(`✓ Added new dependency: ${newDependency}\n`);
}

// ============================================================================
// Example 5: Remove Relations
// ============================================================================

async function exampleRemoveRelations(
  client: PortClient,
  serviceId: string,
  apiIdentifier: string
) {
  console.log('📝 Example 5: Remove Relations\n');

  // Remove all dependencies
  await client.entities.update(apiIdentifier, serviceId, {
    relations: {
      manyRelations: {
        dependencies: [],
      },
    },
  });

  console.log(`✓ Removed all dependencies from ${apiIdentifier}\n`);
}

// ============================================================================
// Cleanup
// ============================================================================

async function cleanup(
  client: PortClient,
  entityIds: string[],
  blueprintIds: string[]
) {
  console.log('🧹 Cleaning up...\n');

  // Delete entities first
  for (const id of entityIds) {
    try {
      await client.entities.delete(id, blueprintIds[1]); // service blueprint
      console.log(`✓ Deleted entity: ${id}`);
    } catch (error) {
      console.log(`⚠️  Could not delete entity ${id}`);
    }
  }

  // Delete team entity
  try {
    await client.entities.delete(entityIds[0], blueprintIds[0]);
    console.log(`✓ Deleted team entity`);
  } catch (error) {
    console.log(`⚠️  Could not delete team entity`);
  }

  // Delete blueprints
  for (const id of blueprintIds.reverse()) {
    try {
      await client.blueprints.delete(id);
      console.log(`✓ Deleted blueprint: ${id}`);
    } catch (error) {
      console.log(`⚠️  Could not delete blueprint ${id}`);
    }
  }

  console.log('');
}

// ============================================================================
// Main Execution
// ============================================================================

async function main() {
  console.log('🔗 Port SDK - Entity Relations Examples\n');
  console.log('═'.repeat(80) + '\n');

  const client = new PortClient({
    credentials: {
      clientId: process.env.PORT_CLIENT_ID!,
      clientSecret: process.env.PORT_CLIENT_SECRET!,
    },
  });

  const entityIds: string[] = [];
  let blueprintIds: string[] = [];

  try {
    // Setup
    const { teamBlueprint, serviceBlueprint } = await setupBlueprints(client);
    blueprintIds = [teamBlueprint.identifier, serviceBlueprint.identifier];

    console.log('─'.repeat(80) + '\n');

    // Example 1: Single relations
    const { team, service } = await exampleSingleRelations(
      client,
      teamBlueprint.identifier,
      serviceBlueprint.identifier
    );
    entityIds.push(team.identifier, service.identifier);

    console.log('─'.repeat(80) + '\n');

    // Example 2: Many relations
    const { database, cache, api } = await exampleManyRelations(
      client,
      teamBlueprint.identifier,
      serviceBlueprint.identifier,
      team.identifier
    );
    entityIds.push(database.identifier, cache.identifier, api.identifier);

    console.log('─'.repeat(80) + '\n');

    // Example 3: Get related
    await exampleGetRelated(client, serviceBlueprint.identifier, api.identifier);

    console.log('─'.repeat(80) + '\n');

    // Example 4: Update relations
    await exampleUpdateRelations(
      client,
      serviceBlueprint.identifier,
      api.identifier,
      service.identifier
    );

    console.log('─'.repeat(80) + '\n');

    // Example 5: Remove relations
    await exampleRemoveRelations(client, serviceBlueprint.identifier, api.identifier);

    console.log('═'.repeat(80) + '\n');

    // Cleanup
    await cleanup(client, entityIds, blueprintIds);

    console.log('═'.repeat(80) + '\n');
    console.log('✅ All entity relation examples completed!\n');

    console.log('📚 Key Concepts:');
    console.log('  • Single relations: One-to-one relationships');
    console.log('  • Many relations: One-to-many relationships');
    console.log('  • Relations defined in blueprint schema');
    console.log('  • Relations set when creating entities');
    console.log('  • Relations can be updated separately\n');

    console.log('📚 Next Steps:');
    console.log('  • Try example 08-blueprints-crud.ts');
    console.log('  • Check out 10-blueprints-relations.ts');
    console.log('  • Read docs/api/entities.md for more details\n');
  } catch (error) {
    console.error('❌ Error running examples:', error);

    // Attempt cleanup
    if (entityIds.length > 0 || blueprintIds.length > 0) {
      console.log('\nAttempting cleanup after error...');
      await cleanup(client, entityIds, blueprintIds);
    }

    process.exit(1);
  }
}

// Run the examples
main();

