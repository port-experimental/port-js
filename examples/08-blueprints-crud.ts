/**
 * Example: Blueprint CRUD Operations
 * 
 * Description:
 * Demonstrates complete CRUD (Create, Read, Update, Delete) operations for blueprints
 * 
 * Prerequisites:
 * - Port.io account with API credentials
 * - Permissions to create and delete blueprints
 * 
 * Run:
 * pnpm tsx examples/08-blueprints-crud.ts
 */

import { PortClient } from '../src';

async function main() {
  console.log('📘 Port SDK - Blueprint CRUD Operations\n');
  console.log('═'.repeat(80) + '\n');

  const client = new PortClient({
    credentials: {
      clientId: process.env.PORT_CLIENT_ID!,
      clientSecret: process.env.PORT_CLIENT_SECRET!,
    },
  });

  const timestamp = Date.now();
  const blueprintId = `example_microservice_${timestamp}`;

  try {
    // ========================================================================
    // CREATE: Create a new blueprint
    // ========================================================================
    console.log('📝 Step 1: Create Blueprint\n');

    const blueprint = await client.blueprints.create({
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
          version: {
            type: 'string',
            title: 'Version',
          },
          replicas: {
            type: 'number',
            title: 'Number of Replicas',
          },
          isPublic: {
            type: 'boolean',
            title: 'Publicly Accessible',
          },
          tags: {
            type: 'array',
            title: 'Tags',
            items: {
              type: 'string',
            },
          },
        },
        required: ['name', 'language'],
      },
    });

    console.log('✓ Blueprint created successfully');
    console.log(`  ID: ${blueprint.identifier}`);
    console.log(`  Title: ${blueprint.title}`);
    console.log(`  Properties: ${Object.keys(blueprint.schema?.properties || {}).length}`);
    console.log('');

    // ========================================================================
    // READ: Get the blueprint
    // ========================================================================
    console.log('📖 Step 2: Get Blueprint\n');

    const fetched = await client.blueprints.get(blueprintId);

    console.log('✓ Blueprint retrieved');
    console.log(`  ID: ${fetched.identifier}`);
    console.log(`  Title: ${fetched.title}`);
    console.log(`  Created: ${fetched.createdAt?.toLocaleString()}`);
    console.log(`  Updated: ${fetched.updatedAt?.toLocaleString()}`);
    console.log('');

    // ========================================================================
    // LIST: List all blueprints
    // ========================================================================
    console.log('📋 Step 3: List Blueprints\n');

    const blueprints = await client.blueprints.list();

    console.log(`✓ Found ${blueprints.length} blueprints`);
    console.log(`  First ${Math.min(10, blueprints.length)} blueprints:`);
    blueprints.slice(0, 10).forEach((bp, index) => {
      console.log(`  ${index + 1}. ${bp.identifier} - ${bp.title}`);
    });
    console.log('');

    // ========================================================================
    // UPDATE: Update the blueprint
    // ========================================================================
    console.log('✏️  Step 4: Update Blueprint\n');

    const updated = await client.blueprints.update(blueprintId, {
      title: 'Microservice (Updated)',
      description: 'An updated microservice blueprint',
      schema: {
        properties: {
          ...fetched.schema?.properties,
          healthCheck: {
            type: 'string',
            title: 'Health Check URL',
            format: 'url',
          },
        },
        required: ['name', 'language'],
      },
    });

    console.log('✓ Blueprint updated');
    console.log(`  Title: ${updated.title}`);
    console.log(`  Properties: ${Object.keys(updated.schema?.properties || {}).length}`);
    console.log('');

    // ========================================================================
    // DELETE: Delete the blueprint
    // ========================================================================
    console.log('🗑️  Step 5: Delete Blueprint\n');

    await client.blueprints.delete(blueprintId);

    console.log(`✓ Blueprint deleted: ${blueprintId}`);
    console.log('');

    // ========================================================================
    // VERIFY: Confirm deletion
    // ========================================================================
    console.log('✅ Step 6: Verify Deletion\n');

    try {
      await client.blueprints.get(blueprintId);
      console.log('⚠️  Blueprint still exists (unexpected)');
    } catch (error) {
      console.log('✓ Blueprint successfully deleted (404 error expected)');
    }
    console.log('');

    console.log('═'.repeat(80) + '\n');
    console.log('✅ All blueprint CRUD operations completed successfully!\n');

    console.log('📚 What you learned:');
    console.log('  • create() - Create a new blueprint with schema');
    console.log('  • get() - Retrieve a single blueprint');
    console.log('  • list() - List all blueprints with pagination');
    console.log('  • update() - Update blueprint properties and schema');
    console.log('  • delete() - Remove a blueprint\n');

    console.log('📚 Next Steps:');
    console.log('  • Try example 09-blueprints-schema.ts for complex schemas');
    console.log('  • Try example 10-blueprints-relations.ts for relationships');
    console.log('  • Read docs/api/blueprints.md for details\n');
  } catch (error) {
    console.error('❌ Error:', error);

    // Clean up if possible
    try {
      await client.blueprints.delete(blueprintId);
      console.log(`\n✓ Cleaned up blueprint: ${blueprintId}`);
    } catch {
      // Ignore cleanup errors
    }

    process.exit(1);
  }
}

main();

