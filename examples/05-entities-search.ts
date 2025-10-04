/**
 * Example: Entity Search Operations
 * 
 * Description: Search and filter entities using advanced queries
 * 
 * Prerequisites:
 * - PORT_CLIENT_ID and PORT_CLIENT_SECRET in .env file
 * - Some entities in your Port instance (creates examples if none exist)
 * 
 * Usage:
 *   pnpm tsx examples/05-entities-search.ts
 * 
 * Expected output:
 *   Demonstrates various search and filter operations
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

  console.log('🔍 Entity Search & Filter Example\n');
  console.log('='.repeat(60));

  const client = new PortClient({
    credentials: {
      clientId: process.env.PORT_CLIENT_ID,
      clientSecret: process.env.PORT_CLIENT_SECRET,
    },
  });

  const createdIdentifiers: string[] = [];

  try {
    // Create some sample entities for searching
    console.log('\n📝 Step 1: Creating sample entities...');
    
    const sampleEntities = [
      {
        identifier: `prod-service-${Date.now()}-1`,
        blueprint: 'service',
        title: 'Production API Service',
        properties: {
          stringProps: {
            environment: 'production',
            language: 'typescript',
            status: 'healthy',
          },
          numberProps: {
            replicas: 3,
          },
        },
      },
      {
        identifier: `dev-service-${Date.now()}-2`,
        blueprint: 'service',
        title: 'Development Test Service',
        properties: {
          stringProps: {
            environment: 'development',
            language: 'python',
            status: 'degraded',
          },
          numberProps: {
            replicas: 1,
          },
        },
      },
      {
        identifier: `staging-service-${Date.now()}-3`,
        blueprint: 'service',
        title: 'Staging Worker Service',
        properties: {
          stringProps: {
            environment: 'staging',
            language: 'typescript',
            status: 'healthy',
          },
          numberProps: {
            replicas: 2,
          },
        },
      },
    ];

    for (const entity of sampleEntities) {
      await client.entities.create(entity);
      createdIdentifiers.push(entity.identifier);
    }

    console.log(`✅ Created ${sampleEntities.length} sample entities`);

    // LIST: Get all entities (paginated)
    console.log('\n📋 Step 2: Listing all entities...');
    
    const allEntities = await client.entities.list({
      limit: 10,
    });

    console.log('✅ Retrieved entities:');
    console.log(`   Total: ${allEntities.pagination.total}`);
    console.log(`   Returned: ${allEntities.data.length}`);
    console.log(`   Has more: ${allEntities.pagination.hasMore}`);

    // SEARCH: Find entities by environment
    console.log('\n🔍 Step 3: Searching for production entities...');
    
    const prodEntities = await client.entities.search({
      blueprint: 'service',
      rules: [
        {
          property: 'environment',
          operator: '=',
          value: 'production',
        },
      ],
    });

    console.log('✅ Production entities found:');
    prodEntities.forEach(entity => {
      console.log(`   • ${entity.title} (${entity.identifier})`);
    });

    // SEARCH: Complex query with multiple conditions
    console.log('\n🔍 Step 4: Complex search (healthy TypeScript services)...');
    
    const healthyTypescript = await client.entities.search({
      blueprint: 'service',
      rules: [
        {
          property: 'language',
          operator: '=',
          value: 'typescript',
        },
        {
          property: 'status',
          operator: '=',
          value: 'healthy',
        },
      ],
      combinator: 'and',
    });

    console.log('✅ Healthy TypeScript services:');
    healthyTypescript.forEach(entity => {
      console.log(`   • ${entity.title}`);
    });

    // SEARCH: Using different operators
    console.log('\n🔍 Step 5: Search with comparison (replicas >= 2)...');
    
    const multiReplica = await client.entities.search({
      blueprint: 'service',
      rules: [
        {
          property: 'replicas',
          operator: '>=',
          value: 2,
        },
      ],
    });

    console.log('✅ Services with 2+ replicas:');
    multiReplica.forEach(entity => {
      console.log(`   • ${entity.title} (${entity.properties?.numberProps?.replicas} replicas)`);
    });

    // SEARCH: Text search
    console.log('\n🔍 Step 6: Text search for "API"...');
    
    const apiServices = await client.entities.search({
      blueprint: 'service',
      search: 'API',
    });

    console.log('✅ Services matching "API":');
    apiServices.forEach(entity => {
      console.log(`   • ${entity.title}`);
    });

    // LIST: Filter by blueprint
    console.log('\n📋 Step 7: List entities by blueprint...');
    
    const serviceEntities = await client.entities.list({
      blueprint: 'service',
      limit: 5,
    });

    console.log('✅ Service entities:');
    console.log(`   Found: ${serviceEntities.data.length}`);

    console.log('\n' + '='.repeat(60));
    console.log('\n✅ Search operations completed!');
    console.log('\n💡 Search tips:');
    console.log('   • Use specific blueprint for faster searches');
    console.log('   • Combine multiple rules with AND/OR');
    console.log('   • Available operators: =, !=, <, <=, >, >=, contains, isEmpty');

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    // Clean up created entities
    if (createdIdentifiers.length > 0) {
      console.log('\n🧹 Cleaning up sample entities...');
      for (const id of createdIdentifiers) {
        try {
          await client.entities.delete(id);
        } catch {
          // Ignore cleanup errors
        }
      }
      console.log('✅ Cleanup complete');
    }
  }
}

main();

