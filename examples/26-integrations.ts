/**
 * Example: Integration Management
 * 
 * This example demonstrates how to:
 * - List all integrations
 * - Get integration details
 * - Update integration configuration
 * - View integration logs
 * - Trigger integration resync
 * - Delete integrations
 * 
 * Run with: pnpm tsx examples/26-integrations.ts
 */

import { PortClient } from '../src';

async function main() {
  // Initialize the client (uses credentials from environment variables)
  const client = new PortClient();

  console.log('🔌 Integration Management Example\n');
  console.log('━'.repeat(60));

  try {
    // ============================================================
    // Example 1: List All Integrations
    // ============================================================
    console.log('\n📋 Example 1: List all integrations');
    console.log('─'.repeat(60));
    
    const allIntegrations = await client.integrations.list();
    
    console.log(`✅ Found ${allIntegrations.length} integration(s):`);
    allIntegrations.forEach((integration, idx) => {
      console.log(`   ${idx + 1}. ${integration.identifier}`);
      console.log(`      Title: ${integration.title || 'N/A'}`);
      console.log(`      Type: ${integration.installationAppType || 'N/A'}`);
      console.log(`      Version: ${integration.version || 'N/A'}`);
      console.log(`      Actions Processing: ${integration.actionsProcessingEnabled ? 'Enabled' : 'Disabled'}`);
      if (integration.createdAt) {
        console.log(`      Created: ${integration.createdAt.toISOString()}`);
      }
    });

    // ============================================================
    // Example 2: Filter Integrations by Actions Processing
    // ============================================================
    console.log('\n🔍 Example 2: Filter integrations with actions processing enabled');
    console.log('─'.repeat(60));
    
    const integrationsWithActions = await client.integrations.list({
      actionsProcessingEnabled: true,
    });
    
    console.log(`✅ Found ${integrationsWithActions.length} integration(s) with actions processing enabled:`);
    integrationsWithActions.forEach((integration, idx) => {
      console.log(`   ${idx + 1}. ${integration.identifier} - ${integration.title || 'N/A'}`);
    });

    // ============================================================
    // Example 3: Get Integration Details
    // ============================================================
    if (allIntegrations.length > 0) {
      const firstIntegration = allIntegrations[0];
      
      console.log('\n🔍 Example 3: Get integration details');
      console.log('─'.repeat(60));
      
      const integration = await client.integrations.get(firstIntegration.identifier);
      
      console.log(`✅ Integration details for: ${integration.identifier}`);
      console.log(`   Title: ${integration.title || 'N/A'}`);
      console.log(`   Installation App Type: ${integration.installationAppType || 'N/A'}`);
      console.log(`   Version: ${integration.version || 'N/A'}`);
      console.log(`   Actions Processing Enabled: ${integration.actionsProcessingEnabled ? 'Yes' : 'No'}`);
      console.log(`   Installation ID: ${integration.installationId || 'N/A'}`);
      console.log(`   Log Ingest ID: ${integration.logIngestId || 'N/A'}`);
      
      if (integration.config) {
        console.log(`   Config:`);
        console.log(`     Delete Dependent Entities: ${integration.config.deleteDependentEntities ? 'Yes' : 'No'}`);
        console.log(`     Create Missing Related Entities: ${integration.config.createMissingRelatedEntities ? 'Yes' : 'No'}`);
        if (integration.config.resources) {
          console.log(`     Resources: ${integration.config.resources.length} mapping(s)`);
        }
      }
      
      if (integration.changelogDestination) {
        console.log(`   Changelog Destination: ${integration.changelogDestination.type || 'N/A'}`);
        if (integration.changelogDestination.type === 'WEBHOOK' && integration.changelogDestination.url) {
          console.log(`     URL: ${integration.changelogDestination.url}`);
        }
      }
      
      if (integration.createdAt) {
        console.log(`   Created: ${integration.createdAt.toISOString()}`);
      }
      if (integration.updatedAt) {
        console.log(`   Updated: ${integration.updatedAt.toISOString()}`);
      }

      // ============================================================
      // Example 4: Get Integration by Installation ID
      // ============================================================
      if (integration.installationId) {
        console.log('\n🔍 Example 4: Get integration by installation ID');
        console.log('─'.repeat(60));
        
        const integrationByInstallId = await client.integrations.get(integration.installationId, {
          byField: 'installationId',
        });
        
        console.log(`✅ Retrieved integration by installation ID: ${integrationByInstallId.identifier}`);
        console.log(`   Title: ${integrationByInstallId.title || 'N/A'}`);
      }

      // ============================================================
      // Example 5: Update Integration
      // ============================================================
      console.log('\n✏️  Example 5: Update integration');
      console.log('─'.repeat(60));
      
      const updatedIntegration = await client.integrations.update(integration.identifier, {
        title: `${integration.title || 'Integration'} (Updated)`,
        actionsProcessingEnabled: true,
      });
      
      console.log(`✅ Updated integration: ${updatedIntegration.identifier}`);
      console.log(`   New title: ${updatedIntegration.title}`);
      console.log(`   Actions Processing: ${updatedIntegration.actionsProcessingEnabled ? 'Enabled' : 'Disabled'}`);
      if (updatedIntegration.updatedAt) {
        console.log(`   Updated at: ${updatedIntegration.updatedAt.toISOString()}`);
      }

      // ============================================================
      // Example 6: Update Integration Config
      // ============================================================
      console.log('\n⚙️  Example 6: Update integration configuration');
      console.log('─'.repeat(60));
      
      // Note: This example shows the structure, but actual config depends on integration type
      // In practice, you would provide the full config structure for your integration
      console.log('ℹ️  Integration config update requires full configuration structure');
      console.log('   This would typically include resource mappings, selectors, etc.');
      console.log('   See Port.io documentation for integration-specific configuration.');

      // ============================================================
      // Example 7: Get Integration Logs
      // ============================================================
      console.log('\n📊 Example 7: Get integration logs');
      console.log('─'.repeat(60));
      
      const logs = await client.integrations.getLogs(integration.identifier, {
        limit: 10,
      });
      
      console.log(`✅ Retrieved ${logs.length} log entry(ies) for: ${integration.identifier}`);
      if (logs.length > 0) {
        logs.slice(0, 5).forEach((log, idx) => {
          console.log(`   ${idx + 1}. [${log.level || 'INFO'}] ${log.message || 'N/A'}`);
          if (log.timestamp) {
            console.log(`      Timestamp: ${log.timestamp}`);
          }
        });
        if (logs.length > 5) {
          console.log(`   ... and ${logs.length - 5} more log(s)`);
        }
      } else {
        console.log('   No logs available');
      }

      // ============================================================
      // Example 8: Get Integration Logs with Filters
      // ============================================================
      console.log('\n🔍 Example 8: Get integration logs with timestamp filter');
      console.log('─'.repeat(60));
      
      const recentLogs = await client.integrations.getLogs(integration.identifier, {
        limit: 20,
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Last 24 hours
        direction: 'down',
      });
      
      console.log(`✅ Retrieved ${recentLogs.length} recent log entry(ies)`);

      // ============================================================
      // Example 9: Trigger Integration Resync
      // ============================================================
      console.log('\n🔄 Example 9: Trigger integration resync');
      console.log('─'.repeat(60));
      
      const resyncedIntegration = await client.integrations.resync(integration.identifier);
      
      console.log(`✅ Triggered resync for: ${resyncedIntegration.identifier}`);
      console.log(`   Resync initiated at: ${new Date().toISOString()}`);
      console.log(`   Note: Resync is asynchronous. Check logs to monitor progress.`);
    } else {
      console.log('\n⚠️  No integrations found. Skipping integration-specific examples.');
      console.log('   Create an integration in Port.io first to see full functionality.');
    }

    console.log('\n━'.repeat(60));
    console.log('✅ All integration operations completed successfully!\n');

  } catch (error) {
    console.error('\n❌ Error:', error);
    
    if (error instanceof Error) {
      console.error(`   Message: ${error.message}`);
      if ('statusCode' in error) {
        console.error(`   Status Code: ${(error as { statusCode?: number }).statusCode}`);
      }
    }
    
    process.exit(1);
  }
}

main();

