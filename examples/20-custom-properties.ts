/**
 * Example: Custom Properties Management
 * 
 * This example demonstrates how to:
 * - Create blueprints with custom properties
 * - Add new custom properties to existing blueprints
 * - Modify custom properties
 * - Create entities with custom property values
 * - Update entity custom properties
 * 
 * Run with: pnpm tsx examples/20-custom-properties.ts
 */

import { PortClient } from '../src';

async function main() {
  const client = new PortClient();

  console.log('🎨 Custom Properties Management Example\n');
  console.log('━'.repeat(60));

  try {
    // ============================================================
    // Example 1: Create Blueprint with Custom Properties
    // ============================================================
    console.log('\n📦 Example 1: Create blueprint with custom properties');
    console.log('─'.repeat(60));
    
    const blueprint = await client.blueprints.create({
      identifier: 'custom-microservice',
      title: 'Microservice (Custom)',
      description: 'Blueprint with custom properties',
      schema: {
        properties: {
          // Standard properties
          name: {
            type: 'string',
            title: 'Service Name',
            required: true
          },
          
          // ✅ Custom properties - any names you want!
          deployment_region: {
            type: 'string',
            title: 'Deployment Region',
            description: 'AWS region where service is deployed',
            enum: ['us-east-1', 'us-west-2', 'eu-west-1']
          },
          
          sla_target: {
            type: 'number',
            title: 'SLA Target %',
            description: 'Target uptime percentage'
          },
          
          is_mission_critical: {
            type: 'boolean',
            title: 'Mission Critical',
            description: 'Is this a mission-critical service?'
          },
          
          tech_stack: {
            type: 'array',
            title: 'Technology Stack',
            description: 'Technologies used by this service'
          },
          
          custom_metadata: {
            type: 'object',
            title: 'Custom Metadata',
            description: 'Any additional metadata'
          }
        },
        required: ['name']
      }
    });
    
    console.log(`✅ Created blueprint: ${blueprint.identifier}`);
    console.log(`   Custom properties: ${Object.keys(blueprint.schema?.properties || {}).length}`);

    // ============================================================
    // Example 2: Add New Custom Property to Existing Blueprint
    // ============================================================
    console.log('\n➕ Example 2: Add new custom property');
    console.log('─'.repeat(60));
    
    const updatedBlueprint = await client.blueprints.update('custom-microservice', {
      schema: {
        properties: {
          ...blueprint.schema?.properties,
          
          // ✅ Add new custom property
          compliance_score: {
            type: 'number',
            title: 'Compliance Score',
            description: 'Security compliance score (0-100)'
          }
        }
      }
    });
    
    console.log(`✅ Added custom property: compliance_score`);
    console.log(`   Total properties now: ${Object.keys(updatedBlueprint.schema?.properties || {}).length}`);

    // ============================================================
    // Example 3: Modify Existing Custom Property
    // ============================================================
    console.log('\n✏️  Example 3: Modify custom property');
    console.log('─'.repeat(60));
    
    const modifiedBlueprint = await client.blueprints.update('custom-microservice', {
      schema: {
        properties: {
          ...updatedBlueprint.schema?.properties,
          
          // ✅ Modify existing property
          deployment_region: {
            type: 'string',
            title: 'Deployment Region (Updated)',
            description: 'AWS region - now with more regions!',
            enum: ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-south-1'] // Added new region
          }
        }
      }
    });
    
    const deploymentRegion = modifiedBlueprint.schema?.properties?.deployment_region;
    console.log(`✅ Modified property: deployment_region`);
    console.log(`   New enum values: ${(deploymentRegion as any)?.enum?.length || 0}`);

    // ============================================================
    // Example 4: Create Entity with Custom Property Values
    // ============================================================
    console.log('\n🏗️  Example 4: Create entity with custom properties');
    console.log('─'.repeat(60));
    
    const entity = await client.entities.create({
      identifier: 'payment-service',
      blueprint: 'custom-microservice',
      title: 'Payment Service',
      properties: {
        // ✅ Set custom property values
        stringProps: {
          name: 'payments-api',
          deployment_region: 'us-east-1'
        },
        numberProps: {
          sla_target: 99.95,
          compliance_score: 85
        },
        booleanProps: {
          is_mission_critical: true
        },
        arrayProps: {
          tech_stack: ['Node.js', 'TypeScript', 'PostgreSQL', 'Redis']
        },
        objectProps: {
          custom_metadata: {
            team: 'payments',
            cost_center: 'CC-1234',
            oncall: 'payments-oncall@company.com'
          }
        }
      }
    });
    
    console.log(`✅ Created entity: ${entity.identifier}`);
    console.log(`   Custom values set:`);
    console.log(`     - SLA Target: ${entity.properties?.numberProps?.sla_target}%`);
    console.log(`     - Region: ${entity.properties?.stringProps?.deployment_region}`);
    console.log(`     - Tech Stack: ${entity.properties?.arrayProps?.tech_stack?.length || 0} technologies`);

    // ============================================================
    // Example 5: Update Entity Custom Properties
    // ============================================================
    console.log('\n📝 Example 5: Update entity custom properties');
    console.log('─'.repeat(60));
    
    const updatedEntity = await client.entities.update('payment-service', {
      properties: {
        numberProps: {
          compliance_score: 92 // Improved!
        },
        arrayProps: {
          tech_stack: ['Node.js', 'TypeScript', 'PostgreSQL', 'Redis', 'Kafka'] // Added Kafka
        }
      }
    });
    
    console.log(`✅ Updated entity custom properties:`);
    console.log(`   - Compliance Score: ${entity.properties?.numberProps?.compliance_score} → ${updatedEntity.properties?.numberProps?.compliance_score}`);
    console.log(`   - Tech Stack: ${entity.properties?.arrayProps?.tech_stack?.length} → ${updatedEntity.properties?.arrayProps?.tech_stack?.length} items`);

    // ============================================================
    // Example 6: Add More Custom Properties to Entity
    // ============================================================
    console.log('\n➕ Example 6: Add new custom values to entity');
    console.log('─'.repeat(60));
    
    // First, add property to blueprint
    await client.blueprints.update('custom-microservice', {
      schema: {
        properties: {
          ...modifiedBlueprint.schema?.properties,
          last_deployed: {
            type: 'string',
            title: 'Last Deployed',
            format: 'date-time'
          }
        }
      }
    });
    
    // Then add value to entity
    await client.entities.update('payment-service', {
      properties: {
        stringProps: {
          last_deployed: new Date().toISOString()
        }
      }
    });
    
    console.log(`✅ Added new custom property and value`);
    console.log(`   - Property: last_deployed`);
    console.log(`   - Value: ${new Date().toISOString()}`);

    // ============================================================
    // Example 7: Demonstrate Flexibility
    // ============================================================
    console.log('\n🎯 Example 7: Demonstrating flexibility');
    console.log('─'.repeat(60));
    
    console.log('✅ Custom properties support:');
    console.log('   ✓ Any property names (no restrictions)');
    console.log('   ✓ All property types (string, number, boolean, array, object)');
    console.log('   ✓ Add properties at any time');
    console.log('   ✓ Modify properties at any time');
    console.log('   ✓ Delete properties (by omitting from update)');
    console.log('   ✓ Type-safe TypeScript throughout');
    console.log('   ✓ Port API validation');

    // Clean up
    console.log('\n🧹 Cleaning up...');
    await client.entities.delete('payment-service');
    await client.blueprints.delete('custom-microservice');
    console.log('✅ Cleanup complete');

    console.log('\n━'.repeat(60));
    console.log('✅ Custom properties demonstration complete!\n');

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

main();

