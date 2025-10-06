/**
 * Example: Webhook CRUD Operations
 * 
 * This example demonstrates how to:
 * - Create webhooks for external integrations
 * - Get webhook information
 * - Update webhook configuration
 * - List all webhooks
 * - Delete webhooks
 * 
 * Run with: pnpm tsx examples/23-webhooks-crud.ts
 */

import { PortClient } from '../src';

async function main() {
  // Initialize the client (uses credentials from environment variables)
  const client = new PortClient();

  console.log('🪝 Webhook CRUD Operations Example\n');
  console.log('━'.repeat(60));

  // Use timestamp to ensure unique identifiers
  const timestamp = Date.now();
  const testWebhookId = `example-webhook-${timestamp}`;

  try {
    // ============================================================
    // Example 1: Create a Webhook
    // ============================================================
    console.log('\n📦 Example 1: Create a webhook');
    console.log('─'.repeat(60));
    
    const newWebhook = await client.webhooks.create({
      identifier: testWebhookId,
      title: 'GitHub Integration Webhook',
      description: 'Webhook for syncing GitHub repositories',
      icon: 'Github',
      enabled: true,
      integrationType: 'custom',
      url: 'https://api.github.com/webhook/port',
      mappings: [
        {
          blueprint: 'service',
          filter: {
            combinator: 'and',
            rules: [
              {
                property: '$identifier',
                operator: '=',
                value: 'test-service'
              }
            ]
          }
        }
      ]
    });
    
    console.log(`✅ Created webhook: ${newWebhook.identifier}`);
    console.log(`   Title: ${newWebhook.title}`);
    console.log(`   URL: ${newWebhook.url}`);
    console.log(`   Enabled: ${newWebhook.enabled}`);
    console.log(`   Integration Type: ${newWebhook.integrationType}`);
    if (newWebhook.createdAt) {
      console.log(`   Created at: ${newWebhook.createdAt.toISOString()}`);
    }

    // ============================================================
    // Example 2: Get Webhook Information
    // ============================================================
    console.log('\n🔍 Example 2: Get webhook information');
    console.log('─'.repeat(60));
    
    const webhook = await client.webhooks.get(testWebhookId);
    
    console.log(`✅ Retrieved webhook: ${webhook.identifier}`);
    console.log(`   Title: ${webhook.title}`);
    console.log(`   Description: ${webhook.description}`);
    console.log(`   URL: ${webhook.url}`);
    console.log(`   Enabled: ${webhook.enabled}`);
    console.log(`   Mappings: ${webhook.mappings?.length || 0} blueprint(s)`);
    if (webhook.mappings) {
      webhook.mappings.forEach((mapping, idx) => {
        console.log(`     ${idx + 1}. Blueprint: ${mapping.blueprint}`);
      });
    }

    // ============================================================
    // Example 3: Update Webhook
    // ============================================================
    console.log('\n✏️  Example 3: Update webhook');
    console.log('─'.repeat(60));
    
    const updatedWebhook = await client.webhooks.update(testWebhookId, {
      title: 'Updated GitHub Integration',
      description: 'Updated webhook for syncing GitHub repos and issues',
      enabled: false, // Disable the webhook
      url: 'https://api.github.com/webhook/port/updated'
    });
    
    console.log(`✅ Updated webhook: ${updatedWebhook.identifier}`);
    console.log(`   New title: ${updatedWebhook.title}`);
    console.log(`   New description: ${updatedWebhook.description}`);
    console.log(`   New URL: ${updatedWebhook.url}`);
    console.log(`   Enabled: ${updatedWebhook.enabled}`);
    if (updatedWebhook.updatedAt) {
      console.log(`   Updated at: ${updatedWebhook.updatedAt.toISOString()}`);
    }

    // ============================================================
    // Example 4: List All Webhooks
    // ============================================================
    console.log('\n📋 Example 4: List all webhooks');
    console.log('─'.repeat(60));
    
    const webhooks = await client.webhooks.list();
    
    console.log(`✅ Found ${webhooks.length} webhook(s):`);
    webhooks.forEach((wh, idx) => {
      console.log(`   ${idx + 1}. ${wh.identifier}`);
      console.log(`      Title: ${wh.title}`);
      console.log(`      Enabled: ${wh.enabled}`);
      console.log(`      URL: ${wh.url}`);
    });

    // Verify our test webhook is in the list
    const testWebhook = webhooks.find(wh => wh.identifier === testWebhookId);
    if (testWebhook) {
      console.log(`\n   ✓ Test webhook found in list`);
    }

    // ============================================================
    // Example 5: Create Webhook with Security Configuration
    // ============================================================
    console.log('\n🔐 Example 5: Create webhook with security');
    console.log('─'.repeat(60));
    
    const secureWebhookId = `secure-webhook-${timestamp}`;
    const secureWebhook = await client.webhooks.create({
      identifier: secureWebhookId,
      title: 'Secure Webhook',
      description: 'Webhook with security headers',
      enabled: true,
      integrationType: 'custom',
      url: 'https://secure.example.com/webhook',
      security: {
        secret: 'webhook-secret-key',
        requestIdentifierPath: 'headers.X-Request-ID'
      },
      mappings: [
        {
          blueprint: 'service',
          filter: {
            combinator: 'and',
            rules: []
          }
        }
      ]
    });
    
    console.log(`✅ Created secure webhook: ${secureWebhook.identifier}`);
    console.log(`   Security configured: ${secureWebhook.security ? 'Yes' : 'No'}`);

    // ============================================================
    // Example 6: Create Webhook with Multiple Blueprint Mappings
    // ============================================================
    console.log('\n🔗 Example 6: Create webhook with multiple blueprints');
    console.log('─'.repeat(60));
    
    const multiWebhookId = `multi-blueprint-webhook-${timestamp}`;
    const multiWebhook = await client.webhooks.create({
      identifier: multiWebhookId,
      title: 'Multi-Blueprint Webhook',
      description: 'Syncs multiple entity types',
      enabled: true,
      integrationType: 'custom',
      url: 'https://integration.example.com/port',
      mappings: [
        {
          blueprint: 'service',
          filter: {
            combinator: 'and',
            rules: [
              {
                property: 'environment',
                operator: '=',
                value: 'production'
              }
            ]
          }
        },
        {
          blueprint: 'deployment',
          filter: {
            combinator: 'and',
            rules: [
              {
                property: 'status',
                operator: '=',
                value: 'completed'
              }
            ]
          }
        }
      ]
    });
    
    console.log(`✅ Created multi-blueprint webhook: ${multiWebhook.identifier}`);
    console.log(`   Mappings: ${multiWebhook.mappings?.length || 0} blueprint(s)`);
    multiWebhook.mappings?.forEach((mapping, idx) => {
      console.log(`     ${idx + 1}. ${mapping.blueprint}`);
    });

    // ============================================================
    // Example 7: Filter Webhooks by Status
    // ============================================================
    console.log('\n🔍 Example 7: Filter webhooks by status');
    console.log('─'.repeat(60));
    
    const allWebhooks = await client.webhooks.list();
    
    // Filter enabled webhooks (client-side filtering)
    const enabledWebhooks = allWebhooks.filter(wh => wh.enabled);
    const disabledWebhooks = allWebhooks.filter(wh => !wh.enabled);
    
    console.log(`✅ Webhook summary:`);
    console.log(`   Total: ${allWebhooks.length}`);
    console.log(`   Enabled: ${enabledWebhooks.length}`);
    console.log(`   Disabled: ${disabledWebhooks.length}`);

    // ============================================================
    // Clean Up: Delete Test Webhooks
    // ============================================================
    console.log('\n🗑️  Cleaning up: Deleting test webhooks');
    console.log('─'.repeat(60));
    
    await client.webhooks.delete(testWebhookId);
    console.log(`✅ Deleted webhook: ${testWebhookId}`);

    await client.webhooks.delete(secureWebhookId);
    console.log(`✅ Deleted webhook: ${secureWebhookId}`);

    await client.webhooks.delete(multiWebhookId);
    console.log(`✅ Deleted webhook: ${multiWebhookId}`);

    // Verify deletion
    try {
      await client.webhooks.get(testWebhookId);
      console.log('❌ Webhook still exists (unexpected)');
    } catch (error) {
      console.log('✅ Confirmed: Webhooks no longer exist');
    }

    console.log('\n━'.repeat(60));
    console.log('✅ All webhook operations completed successfully!\n');

  } catch (error) {
    console.error('\n❌ Error:', error);
    
    // Clean up on error
    try {
      console.log('\n🧹 Attempting cleanup...');
      await client.webhooks.delete(testWebhookId).catch(() => {});
      await client.webhooks.delete(`secure-webhook-${timestamp}`).catch(() => {});
      await client.webhooks.delete(`multi-blueprint-webhook-${timestamp}`).catch(() => {});
      console.log('✅ Cleanup complete');
    } catch (cleanupError) {
      console.error('⚠️  Cleanup failed:', cleanupError);
    }
    
    process.exit(1);
  }
}

main();
