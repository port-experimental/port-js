/**
 * Example: Entity CRUD Operations
 * 
 * Description: Create, Read, Update, and Delete entities in Port
 * 
 * Prerequisites:
 * - PORT_CLIENT_ID and PORT_CLIENT_SECRET in .env file
 * - A blueprint named 'service' must exist in your Port instance
 * 
 * Usage:
 *   pnpm tsx examples/04-entities-crud.ts
 * 
 * Expected output:
 *   Creates a test entity, retrieves it, updates it, and finally deletes it
 */

import { PortClient } from '../src';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  // Validate credentials
  if (!process.env.PORT_CLIENT_ID || !process.env.PORT_CLIENT_SECRET) {
    console.error('❌ Missing credentials');
    console.error('Set PORT_CLIENT_ID and PORT_CLIENT_SECRET');
    process.exit(1);
  }

  console.log('🔧 Entity CRUD Operations Example\n');
  console.log('='.repeat(60));

  // Initialize client
  const client = new PortClient({
    credentials: {
      clientId: process.env.PORT_CLIENT_ID,
      clientSecret: process.env.PORT_CLIENT_SECRET,
    },
  });

  // Generate a unique identifier for this example
  const testIdentifier = `example-service-${Date.now()}`;

  try {
    // CREATE: Create a new entity
    console.log('\n📝 Step 1: Creating a new entity...');
    
    const created = await client.entities.create({
      identifier: testIdentifier,
      blueprint: 'service',
      title: 'Example Service',
      properties: {
        stringProps: {
          description: 'A test service created by the SDK example',
          environment: 'development',
          language: 'typescript',
        },
        numberProps: {
          port: 3000,
        },
        booleanProps: {
          isActive: true,
        },
      },
      relations: {
        singleRelations: {
          // Add relations if your blueprint has them
          // team: 'backend-team',
        },
        manyRelations: {
          // dependencies: ['database', 'cache'],
        },
      },
    });

    console.log('✅ Entity created!');
    console.log('   Identifier:', created.identifier);
    console.log('   Title:', created.title);
    console.log('   Blueprint:', created.blueprint);

    // READ: Get the entity we just created
    console.log('\n📖 Step 2: Reading the entity...');
    
    const fetched = await client.entities.get(testIdentifier);
    
    console.log('✅ Entity retrieved!');
    console.log('   Identifier:', fetched.identifier);
    console.log('   Title:', fetched.title);
    console.log('   Created at:', fetched.createdAt?.toISOString());

    // UPDATE: Modify the entity
    console.log('\n✏️  Step 3: Updating the entity...');
    
    const updated = await client.entities.update(testIdentifier, {
      title: 'Updated Example Service',
      properties: {
        stringProps: {
          description: 'Updated description',
          status: 'healthy',
        },
        booleanProps: {
          isActive: true,
          hasMonitoring: true,
        },
      },
    });

    console.log('✅ Entity updated!');
    console.log('   New title:', updated.title);
    console.log('   Updated at:', updated.updatedAt?.toISOString());

    // DELETE: Remove the entity
    console.log('\n🗑️  Step 4: Deleting the entity...');
    
    await client.entities.delete(testIdentifier);
    
    console.log('✅ Entity deleted successfully!');

    // Verify deletion
    console.log('\n🔍 Step 5: Verifying deletion...');
    
    try {
      await client.entities.get(testIdentifier);
      console.log('❌ Entity still exists (unexpected)');
    } catch (error: any) {
      if (error.name === 'PortNotFoundError') {
        console.log('✅ Entity confirmed deleted');
      } else {
        throw error;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('\n✅ CRUD operations completed successfully!');
    console.log('\n💡 Next steps:');
    console.log('   • Try 05-entities-search.ts for searching entities');
    console.log('   • Try 06-entities-batch.ts for batch operations');

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    
    // Clean up on error
    try {
      await client.entities.delete(testIdentifier);
      console.log('🧹 Cleaned up test entity');
    } catch {
      // Ignore cleanup errors
    }
    
    process.exit(1);
  }
}

main();

