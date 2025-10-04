/**
 * Smoke Test: Blueprint CRUD Operations
 * 
 * Tests create, read, update, and delete operations for blueprints.
 * Creates a temporary blueprint and cleans it up after testing.
 */

import { PortClient } from '../src';
import { PortNotFoundError } from '../src/errors';

async function main() {
  console.log('🧪 Smoke Test: Blueprint CRUD Operations\n');
  console.log('━'.repeat(60));

  // Initialize client
  const client = new PortClient();
  
  const testIdentifier = `smoke_test_bp_${Date.now()}`;
  let createdBlueprintId: string | undefined;

  try {
    // ✅ Step 1: Create Blueprint
    console.log('\n📝 Step 1: Creating test blueprint...');
    const createData = {
      identifier: testIdentifier,
      title: 'Smoke Test Blueprint',
      icon: 'Microservice',
      schema: {
        properties: {
          name: {
            type: 'string' as const,
            title: 'Name',
            description: 'The name of the resource'
          },
          status: {
            type: 'string' as const,
            title: 'Status',
            enum: ['active', 'inactive', 'maintenance'],
            description: 'Current status'
          },
          count: {
            type: 'number' as const,
            title: 'Count',
            description: 'Number of instances'
          }
        },
        required: []
      }
    };

    const created = await client.blueprints.create(createData);
    createdBlueprintId = created.identifier;
    console.log(`✅ Created blueprint: ${created.identifier}`);
    console.log(`   Title: ${created.title}`);
    console.log(`   Icon: ${created.icon}`);
    console.log(`   Properties: ${Object.keys(created.schema?.properties || {}).length}`);

    // ✅ Step 2: Get Blueprint
    console.log('\n🔍 Step 2: Fetching created blueprint...');
    const fetched = await client.blueprints.get(testIdentifier);
    console.log(`✅ Fetched blueprint: ${fetched.identifier}`);
    console.log(`   Title: ${fetched.title}`);
    
    // Verify data matches
    if (fetched.identifier !== testIdentifier) {
      throw new Error('❌ Identifier mismatch!');
    }

    // ✅ Step 3: Update Blueprint
    console.log('\n✏️  Step 3: Updating blueprint...');
    const updated = await client.blueprints.update(testIdentifier, {
      title: 'Updated Smoke Test Blueprint',
      description: 'This blueprint was updated by smoke test',
      schema: {
        properties: {
          name: {
            type: 'string' as const,
            title: 'Name',
            description: 'Updated description'
          },
          status: {
            type: 'string' as const,
            title: 'Status',
            enum: ['active', 'inactive', 'maintenance', 'deprecated']
          },
          count: {
            type: 'number' as const,
            title: 'Count'
          },
          newProperty: {
            type: 'boolean' as const,
            title: 'New Property',
            description: 'Added during update'
          }
        },
        required: []
      }
    });
    console.log(`✅ Updated blueprint: ${updated.identifier}`);
    console.log(`   New title: ${updated.title}`);
    console.log(`   New description: ${updated.description || 'N/A'}`);
    console.log(`   Properties: ${Object.keys(updated.schema?.properties || {}).length}`);

    // ✅ Step 4: List Blueprints
    console.log('\n📋 Step 4: Listing blueprints...');
    const blueprints = await client.blueprints.list();
    console.log(`✅ Found ${blueprints.length} blueprints`);
    const testBp = blueprints.find(bp => bp.identifier === testIdentifier);
    if (testBp) {
      console.log(`   ✓ Test blueprint found in list`);
    }

    // ✅ Step 5: Delete Blueprint (manual as part of test)
    console.log('\n🗑️  Step 5: Deleting blueprint...');
    await client.blueprints.delete(testIdentifier);
    console.log(`✅ Deleted blueprint: ${testIdentifier}`);
    createdBlueprintId = undefined; // Mark as deleted

    // ✅ Step 6: Verify Deletion
    console.log('\n✔️  Step 6: Verifying deletion...');
    try {
      await client.blueprints.get(testIdentifier);
      throw new Error('❌ Blueprint should have been deleted!');
    } catch (error) {
      if (error instanceof PortNotFoundError) {
        console.log('✅ Confirmed: Blueprint no longer exists');
      } else {
        throw error;
      }
    }

    // 🎉 Success
    console.log('\n' + '━'.repeat(60));
    console.log('✅ All blueprint CRUD operations successful!');
    console.log('🎉 Smoke test passed!\n');

  } catch (error) {
    console.error('\n❌ Smoke test failed:', error);
    console.error('');
    process.exit(1);
  } finally {
    // 🧹 Always cleanup (in case test fails before deletion step)
    if (createdBlueprintId) {
      console.log('\n🧹 Cleaning up remaining resources...');
      try {
        await client.blueprints.delete(createdBlueprintId);
        console.log('✅ Cleanup successful\n');
      } catch (cleanupError) {
        console.error('⚠️  Cleanup failed (resource may not exist):', cleanupError instanceof Error ? cleanupError.message : cleanupError);
      }
    }
  }
}

main();

