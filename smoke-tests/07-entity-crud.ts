/**
 * Smoke Test: Entity CRUD Operations
 * 
 * Tests create, read, update, and delete operations for entities.
 * Requires a 'service' blueprint to exist in your Port instance.
 */

import { PortClient } from '../src';
import { PortNotFoundError } from '../src/errors';

async function main() {
  console.log('🧪 Smoke Test: Entity CRUD Operations\n');
  console.log('━'.repeat(60));

  // Initialize client
  const client = new PortClient();
  
  const testIdentifier = `smoke-test-${Date.now()}`;
  let createdEntityId: string | undefined;

  try {
    // ✅ Step 1: Create Entity
    console.log('\n📝 Step 1: Creating test entity...');
    const createData = {
      identifier: testIdentifier,
      title: 'Smoke Test Service',
      blueprint: 'service',
      properties: {
        stringProps: {
          name: 'Smoke Test Service',
          environment: 'test',
          language: 'typescript'
        },
        numberProps: {
          port: 3000
        },
        booleanProps: {
          isPublic: false
        }
      }
    };

    const created = await client.entities.create(createData);
    createdEntityId = created.identifier;
    console.log(`✅ Created entity: ${created.identifier}`);
    console.log(`   Title: ${created.title}`);
    console.log(`   Blueprint: ${created.blueprint}`);

    // ✅ Step 2: Get Entity
    console.log('\n🔍 Step 2: Fetching created entity...');
    const fetched = await client.entities.get('service', testIdentifier);
    console.log(`✅ Fetched entity: ${fetched.identifier}`);
    console.log(`   Title: ${fetched.title}`);
    
    // Verify data matches
    if (fetched.identifier !== testIdentifier) {
      throw new Error('❌ Identifier mismatch!');
    }

    // ✅ Step 3: Update Entity
    console.log('\n✏️  Step 3: Updating entity...');
    const updated = await client.entities.update(testIdentifier, {
      title: 'Updated Smoke Test Service',
      properties: {
        stringProps: {
          environment: 'production'
        }
      }
    }, 'service');
    console.log(`✅ Updated entity: ${updated.identifier}`);
    console.log(`   New title: ${updated.title}`);
    console.log(`   New environment: ${updated.properties?.stringProps?.environment}`);

    // ✅ Step 4: List Entities
    console.log('\n📋 Step 4: Listing entities...');
    const listResult = await client.entities.list({ blueprint: 'service', limit: 5 });
    console.log(`✅ Found ${listResult.data.length} entities`);
    console.log(`   Total: ${listResult.pagination?.total || 'N/A'}`);
    console.log(`   Has more: ${listResult.pagination?.hasMore || false}`);

    // ✅ Step 5: Search Entities
    console.log('\n🔎 Step 5: Searching for test entity...');
    const searchResults = await client.entities.search({
      combinator: 'and',
      rules: [
        {
          property: '$identifier',
          operator: '=',
          value: testIdentifier
        }
      ]
    });
    console.log(`✅ Search found ${searchResults.length} entity(ies)`);
    if (searchResults[0]) {
      console.log(`   Found: ${searchResults[0].identifier}`);
    }

    // ✅ Step 6: Delete Entity
    console.log('\n🗑️  Step 6: Deleting entity...');
    await client.entities.delete('service', testIdentifier);
    console.log(`✅ Deleted entity: ${testIdentifier}`);
    createdEntityId = undefined; // Mark as deleted

    // ✅ Step 7: Verify Deletion
    console.log('\n✔️  Step 7: Verifying deletion...');
    try {
      await client.entities.get('service', testIdentifier);
      throw new Error('❌ Entity should have been deleted!');
    } catch (error) {
      if (error instanceof PortNotFoundError) {
        console.log('✅ Confirmed: Entity no longer exists');
      } else {
        throw error;
      }
    }

    // 🎉 Success
    console.log('\n' + '━'.repeat(60));
    console.log('✅ All CRUD operations successful!');
    console.log('🎉 Smoke test passed!\n');

  } catch (error) {
    console.error('\n❌ Smoke test failed:', error);
    console.error('');
    
    // Cleanup on error
    if (createdEntityId) {
      console.log('🧹 Cleaning up...');
      try {
        await client.entities.delete('service', createdEntityId);
        console.log('✅ Cleanup successful\n');
      } catch (cleanupError) {
        console.error('⚠️  Cleanup failed:', cleanupError);
      }
    }
    
    process.exit(1);
  }
}

main();

