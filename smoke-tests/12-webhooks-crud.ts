/**
 * Smoke Test: Webhook CRUD Operations
 * 
 * Tests create, read, update, delete operations for webhooks.
 * All resources are properly cleaned up in a finally block.
 * 
 * Prerequisites:
 * - PORT_CLIENT_ID and PORT_CLIENT_SECRET in .env.local
 * - 'service' blueprint must exist in your Port instance
 * 
 * Run with: pnpm smoke:webhooks
 */

import { PortClient } from '../src';
import { PortNotFoundError } from '../src/errors';

async function main() {
  console.log('🧪 Smoke Test: Webhook CRUD Operations\n');
  console.log('━'.repeat(60));

  // Initialize client
  const client = new PortClient();
  
  const testIdentifier = `smoke-test-webhook-${Date.now()}`;
  let createdWebhookId: string | undefined;

  try {
    // ✅ Step 1: Create Webhook
    console.log('\n📝 Step 1: Creating test webhook...');
    const createData = {
      identifier: testIdentifier,
      title: 'Smoke Test Webhook',
      description: 'Test webhook created by smoke test',
      icon: 'Webhook',
      enabled: true,
      integrationType: 'custom' as const,
      url: 'https://example.com/webhook',
      mappings: [
        {
          blueprint: 'service',
          filter: {
            combinator: 'and' as const,
            rules: [
              {
                property: '$identifier',
                operator: '=' as const,
                value: 'test'
              }
            ]
          }
        }
      ]
    };

    const created = await client.webhooks.create(createData);
    createdWebhookId = created.identifier;
    console.log(`✅ Created webhook: ${created.identifier}`);
    console.log(`   Title: ${created.title}`);
    console.log(`   URL: ${created.url}`);
    console.log(`   Enabled: ${created.enabled}`);
    console.log(`   Integration: ${created.integrationType}`);

    // ✅ Step 2: Get Webhook
    console.log('\n🔍 Step 2: Fetching created webhook...');
    const fetched = await client.webhooks.get(testIdentifier);
    console.log(`✅ Fetched webhook: ${fetched.identifier}`);
    console.log(`   Title: ${fetched.title}`);
    console.log(`   URL: ${fetched.url}`);
    
    // Verify data matches
    if (fetched.identifier !== testIdentifier) {
      throw new Error('❌ Identifier mismatch!');
    }
    if (fetched.url !== 'https://example.com/webhook') {
      throw new Error('❌ URL mismatch!');
    }

    // ✅ Step 3: Update Webhook
    console.log('\n✏️  Step 3: Updating webhook...');
    const updated = await client.webhooks.update(testIdentifier, {
      title: 'Updated Smoke Test Webhook',
      description: 'Updated webhook description',
      enabled: false,
      url: 'https://example.com/webhook/updated'
    });
    console.log(`✅ Updated webhook: ${updated.identifier}`);
    console.log(`   New title: ${updated.title}`);
    console.log(`   New URL: ${updated.url}`);
    console.log(`   Enabled: ${updated.enabled}`);

    // ✅ Step 4: List Webhooks
    console.log('\n📋 Step 4: Listing webhooks...');
    const webhooks = await client.webhooks.list();
    console.log(`✅ Found ${webhooks.length} webhook(s)`);
    const testWebhook = webhooks.find(wh => wh.identifier === testIdentifier);
    if (testWebhook) {
      console.log(`   ✓ Test webhook found in list`);
      console.log(`   Title: ${testWebhook.title}`);
      console.log(`   Enabled: ${testWebhook.enabled}`);
    } else {
      throw new Error('❌ Test webhook not found in list!');
    }

    // ✅ Step 5: Delete Webhook
    console.log('\n🗑️  Step 5: Deleting webhook...');
    await client.webhooks.delete(testIdentifier);
    console.log(`✅ Deleted webhook: ${testIdentifier}`);
    createdWebhookId = undefined; // Mark as deleted

    // ✅ Step 6: Verify Deletion
    console.log('\n✔️  Step 6: Verifying deletion...');
    try {
      await client.webhooks.get(testIdentifier);
      throw new Error('❌ Webhook should have been deleted!');
    } catch (error) {
      if (error instanceof PortNotFoundError) {
        console.log('✅ Confirmed: Webhook no longer exists');
      } else {
        throw error;
      }
    }

    // 🎉 Success
    console.log('\n' + '━'.repeat(60));
    console.log('✅ All webhook CRUD operations successful!');
    console.log('   ✓ Webhook: Created, fetched, updated, listed, deleted');
    console.log('🎉 Smoke test passed!\n');

  } catch (error) {
    console.error('\n❌ Smoke test failed:', error);
    console.error('');
    process.exit(1);
  } finally {
    // 🧹 Always cleanup (in case test fails before deletion step)
    if (createdWebhookId) {
      console.log('\n🧹 Cleaning up remaining resources...');
      try {
        await client.webhooks.delete(createdWebhookId);
        console.log(`✅ Cleaned up webhook: ${createdWebhookId}`);
      } catch (cleanupError) {
        console.error('⚠️  Cleanup failed (resource may not exist):', cleanupError instanceof Error ? cleanupError.message : cleanupError);
      }
      console.log('✅ Cleanup complete\n');
    }
  }
}

main();
