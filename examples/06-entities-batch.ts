/**
 * Example: Entity Batch Operations
 * 
 * Description: Perform batch create, update, and delete operations efficiently
 * 
 * Prerequisites:
 * - PORT_CLIENT_ID and PORT_CLIENT_SECRET in .env file
 * - A blueprint named 'service' must exist
 * 
 * Usage:
 *   pnpm tsx examples/06-entities-batch.ts
 * 
 * Expected output:
 *   Creates, updates, and deletes multiple entities in batch operations
 */

import { PortClient } from '../src';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  // Validate credentials
  if (!process.env.PORT_CLIENT_ID || !process.env.PORT_CLIENT_SECRET) {
    console.error('❌ Missing credentials');
    process.exit(1);
  }

  console.log('📦 Entity Batch Operations Example\n');
  console.log('='.repeat(60));

  const client = new PortClient({
    credentials: {
      clientId: process.env.PORT_CLIENT_ID,
      clientSecret: process.env.PORT_CLIENT_SECRET,
    },
  });

  const timestamp = Date.now();
  const identifiers: string[] = [];

  try {
    // BATCH CREATE: Create multiple entities at once
    console.log('\n📝 Step 1: Batch creating 5 entities...');
    
    const entitiesToCreate = Array.from({ length: 5 }, (_, i) => ({
      identifier: `batch-service-${timestamp}-${i + 1}`,
      blueprint: 'service',
      title: `Batch Service ${i + 1}`,
      properties: {
        stringProps: {
          description: `Service ${i + 1} created in batch`,
          environment: i % 2 === 0 ? 'production' : 'development',
          language: i % 3 === 0 ? 'typescript' : 'python',
        },
        numberProps: {
          port: 3000 + i,
          replicas: i + 1,
        },
        booleanProps: {
          isActive: true,
        },
      },
    }));

    const startCreate = Date.now();
    const created = await client.entities.batchCreate(entitiesToCreate);
    const createTime = Date.now() - startCreate;

    identifiers.push(...created.map(e => e.identifier));

    console.log('✅ Batch create completed!');
    console.log(`   Created: ${created.length} entities`);
    console.log(`   Time: ${createTime}ms`);
    console.log(`   Avg: ${Math.round(createTime / created.length)}ms per entity`);

    created.forEach((entity, i) => {
      console.log(`   ${i + 1}. ${entity.title} (${entity.identifier})`);
    });

    // BATCH UPDATE: Update multiple entities at once
    console.log('\n✏️  Step 2: Batch updating entities...');
    
    const updates = identifiers.map((id, i) => ({
      identifier: id,
      data: {
        title: `Updated Batch Service ${i + 1}`,
        properties: {
          stringProps: {
            status: 'healthy',
            version: '2.0.0',
          },
          booleanProps: {
            isActive: true,
            hasMonitoring: true,
          },
        },
      },
    }));

    const startUpdate = Date.now();
    const updated = await client.entities.batchUpdate(updates);
    const updateTime = Date.now() - startUpdate;

    console.log('✅ Batch update completed!');
    console.log(`   Updated: ${updated.length} entities`);
    console.log(`   Time: ${updateTime}ms`);
    console.log(`   Avg: ${Math.round(updateTime / updated.length)}ms per entity`);

    // Show some updated entities
    console.log('\n   Sample updated entities:');
    updated.slice(0, 3).forEach(entity => {
      console.log(`   • ${entity.title}`);
      console.log(`     Status: ${entity.properties?.stringProps?.status}`);
      console.log(`     Version: ${entity.properties?.stringProps?.version}`);
    });

    // BATCH DELETE: Delete multiple entities at once
    console.log('\n🗑️  Step 3: Batch deleting entities...');
    
    const startDelete = Date.now();
    await client.entities.batchDelete(identifiers);
    const deleteTime = Date.now() - startDelete;

    console.log('✅ Batch delete completed!');
    console.log(`   Deleted: ${identifiers.length} entities`);
    console.log(`   Time: ${deleteTime}ms`);
    console.log(`   Avg: ${Math.round(deleteTime / identifiers.length)}ms per entity`);

    // Verify deletion
    console.log('\n🔍 Step 4: Verifying deletions...');
    
    let deletedCount = 0;
    for (const id of identifiers) {
      try {
        await client.entities.get(id);
      } catch (error: any) {
        if (error.name === 'PortNotFoundError') {
          deletedCount++;
        }
      }
    }

    console.log('✅ Deletion verified!');
    console.log(`   Confirmed deleted: ${deletedCount}/${identifiers.length} entities`);

    // Performance comparison
    console.log('\n📊 Performance Summary:');
    console.log('='.repeat(60));
    console.log(`   Batch Create: ${createTime}ms for ${created.length} entities`);
    console.log(`   Batch Update: ${updateTime}ms for ${updated.length} entities`);
    console.log(`   Batch Delete: ${deleteTime}ms for ${identifiers.length} entities`);
    console.log(`   Total time: ${createTime + updateTime + deleteTime}ms`);

    console.log('\n💡 Batch operations benefits:');
    console.log('   • Much faster than individual operations');
    console.log('   • Reduces API calls and network overhead');
    console.log('   • Ideal for bulk imports, migrations, or cleanup');
    console.log('   • Use for operations on 10+ entities');

    console.log('\n' + '='.repeat(60));
    console.log('\n✅ Batch operations completed successfully!');

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    
    // Clean up on error
    if (identifiers.length > 0) {
      console.log('\n🧹 Cleaning up...');
      try {
        await client.entities.batchDelete(identifiers);
      } catch {
        // Try individual deletes if batch fails
        for (const id of identifiers) {
          try {
            await client.entities.delete(id);
          } catch {
            // Ignore individual cleanup errors
          }
        }
      }
    }
    
    process.exit(1);
  }
}

main();

