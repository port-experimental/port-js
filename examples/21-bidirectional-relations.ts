/**
 * Example: Bidirectional Relations
 * 
 * Demonstrates maintaining bidirectional relations between entities.
 * When Entity A references Entity B, Entity B should reference Entity A back.
 * 
 * This is CRITICAL for Port to properly display relationships in the UI
 * and for relations to work correctly in actions and scorecards.
 * 
 * Prerequisites:
 * - PORT_CLIENT_ID and PORT_CLIENT_SECRET environment variables
 * - Blueprints: service, vulnerability, control
 * 
 * Run: npx tsx examples/21-bidirectional-relations.ts
 */

import { PortClient } from '../src';

async function main() {
  console.log('🔗 Example: Bidirectional Relations\n');

  const client = new PortClient();

  try {
    // ============================================================
    // PART 1: The Problem - One-way relations
    // ============================================================
    console.log('❌ Part 1: The Problem - One-way Relations (INCORRECT)\n');

    // Create a service
    const service = await client.entities.create({
      identifier: 'payment-service',
      blueprint: 'service',
      title: 'Payment Service',
      properties: {
        stringProps: {
          description: 'Handles payment processing',
          language: 'python',
        },
      },
      relations: {
        manyRelations: {
          vulnerabilities: [],  // Empty initially
        },
      },
    });
    console.log(`✅ Created service: ${service.identifier}`);

    // Create a vulnerability that references the service
    const vuln = await client.entities.create({
      identifier: 'vuln-001',
      blueprint: 'vulnerability',
      title: 'SQL Injection',
      properties: {
        stringProps: {
          severity: 'high',
          description: 'SQL injection vulnerability in payment endpoint',
        },
      },
      relations: {
        manyRelations: {
          services: ['payment-service'],  // ⚠️ Forward relation only
        },
      },
    });
    console.log(`✅ Created vulnerability: ${vuln.identifier}`);
    console.log(`   → Services: ${vuln.relations?.manyRelations?.services?.join(', ')}`);

    // ⚠️ PROBLEM: Service doesn't know about the vulnerability!
    const serviceCheck = await client.entities.get('payment-service', 'service');
    console.log(`\n⚠️  Problem: Service has ${serviceCheck.relations?.manyRelations?.vulnerabilities?.length || 0} vulnerabilities`);
    console.log('   (Should be 1, but is 0 because reverse relation is missing!)');

    // ============================================================
    // PART 2: The Solution - Bidirectional relations
    // ============================================================
    console.log('\n✅ Part 2: The Solution - Bidirectional Relations (CORRECT)\n');

    // Update service to include reverse relation
    const updatedService = await client.entities.update(
      'payment-service',
      'service',
      {
        relations: {
          manyRelations: {
            vulnerabilities: ['vuln-001'],  // ✅ Add reverse relation
          },
        },
      }
    );
    console.log(`✅ Updated service with bidirectional relation`);
    console.log(`   → Vulnerabilities: ${updatedService.relations?.manyRelations?.vulnerabilities?.join(', ')}`);

    // Verify both sides now
    const vulnCheck = await client.entities.get('vuln-001', 'vulnerability');
    const svcCheck = await client.entities.get('payment-service', 'service');
    
    console.log('\n✅ Verification:');
    console.log(`   Vulnerability → Services: ${vulnCheck.relations?.manyRelations?.services?.join(', ')}`);
    console.log(`   Service → Vulnerabilities: ${svcCheck.relations?.manyRelations?.vulnerabilities?.join(', ')}`);
    console.log('   Both sides are in sync! ✨');

    // ============================================================
    // PART 3: Complex example with multiple relations
    // ============================================================
    console.log('\n📝 Part 3: Complex Bidirectional Relations\n');

    // Create a security control
    const control = await client.entities.create({
      identifier: 'control-001',
      blueprint: 'control',
      title: 'Input Validation',
      properties: {
        stringProps: {
          type: 'preventive',
          description: 'Validates all user inputs',
        },
      },
      relations: {
        manyRelations: {
          services: ['payment-service'],  // Control applies to service
          vulnerabilities: ['vuln-001'],  // Control mitigates vulnerability
        },
      },
    });
    console.log(`✅ Created control: ${control.identifier}`);

    // Update service to reference control
    await client.entities.update('payment-service', 'service', {
      relations: {
        manyRelations: {
          vulnerabilities: ['vuln-001'],
          controls: ['control-001'],  // ✅ Bidirectional
        },
      },
    });
    console.log('✅ Updated service → control relation');

    // Update vulnerability to reference control
    await client.entities.update('vuln-001', 'vulnerability', {
      relations: {
        manyRelations: {
          services: ['payment-service'],
          controls: ['control-001'],  // ✅ Bidirectional
        },
      },
    });
    console.log('✅ Updated vulnerability → control relation');

    // Verify all relations
    const finalService = await client.entities.get('payment-service', 'service');
    const finalVuln = await client.entities.get('vuln-001', 'vulnerability');
    const finalControl = await client.entities.get('control-001', 'control');

    console.log('\n✅ Final Verification - All Relations:');
    console.log('\n📦 Service (payment-service):');
    console.log(`   → Vulnerabilities: ${finalService.relations?.manyRelations?.vulnerabilities?.join(', ') || 'None'}`);
    console.log(`   → Controls: ${finalService.relations?.manyRelations?.controls?.join(', ') || 'None'}`);
    
    console.log('\n🔴 Vulnerability (vuln-001):');
    console.log(`   → Services: ${finalVuln.relations?.manyRelations?.services?.join(', ') || 'None'}`);
    console.log(`   → Controls: ${finalVuln.relations?.manyRelations?.controls?.join(', ') || 'None'}`);
    
    console.log('\n🛡️  Control (control-001):');
    console.log(`   → Services: ${finalControl.relations?.manyRelations?.services?.join(', ') || 'None'}`);
    console.log(`   → Vulnerabilities: ${finalControl.relations?.manyRelations?.vulnerabilities?.join(', ') || 'None'}`);

    // ============================================================
    // PART 4: Helper function for maintaining bidirectional relations
    // ============================================================
    console.log('\n📝 Part 4: Helper Pattern for Bidirectional Relations\n');

    /**
     * Helper to add a bidirectional relation between two entities
     */
    async function addBidirectionalRelation(
      entityA: { identifier: string; blueprint: string; relationKey: string },
      entityB: { identifier: string; blueprint: string; relationKey: string }
    ) {
      // Get current state of both entities
      const [currentA, currentB] = await Promise.all([
        client.entities.get(entityA.identifier, entityA.blueprint),
        client.entities.get(entityB.identifier, entityB.blueprint),
      ]);

      // Get existing relations
      const aRelations = currentA.relations?.manyRelations?.[entityA.relationKey] || [];
      const bRelations = currentB.relations?.manyRelations?.[entityB.relationKey] || [];

      // Add if not already present
      if (!bRelations.includes(entityA.identifier)) {
        bRelations.push(entityA.identifier);
      }
      if (!aRelations.includes(entityB.identifier)) {
        aRelations.push(entityB.identifier);
      }

      // Update both entities
      await Promise.all([
        client.entities.update(entityA.identifier, entityA.blueprint, {
          relations: {
            manyRelations: {
              [entityA.relationKey]: aRelations,
            },
          },
        }),
        client.entities.update(entityB.identifier, entityB.blueprint, {
          relations: {
            manyRelations: {
              [entityB.relationKey]: bRelations,
            },
          },
        }),
      ]);

      console.log(`✅ Bidirectional relation established:`);
      console.log(`   ${entityA.identifier}.${entityA.relationKey} ↔ ${entityB.identifier}.${entityB.relationKey}`);
    }

    // Example usage
    console.log('Using helper function to maintain bidirectionality:');
    await addBidirectionalRelation(
      { identifier: 'payment-service', blueprint: 'service', relationKey: 'vulnerabilities' },
      { identifier: 'vuln-001', blueprint: 'vulnerability', relationKey: 'services' }
    );

    // ============================================================
    // Cleanup
    // ============================================================
    console.log('\n🗑️  Cleaning up...\n');

    await client.entities.delete('control-001', 'control');
    await client.entities.delete('vuln-001', 'vulnerability');
    await client.entities.delete('payment-service', 'service');
    console.log('✅ Cleanup complete');

    // ============================================================
    // Summary
    // ============================================================
    console.log('\n' + '='.repeat(60));
    console.log('✅ Example completed successfully!');
    console.log('='.repeat(60));
    console.log('\n📚 Key Takeaways:');
    console.log('');
    console.log('❌ WRONG: One-way relation');
    console.log('   Vulnerability → Service (forward only)');
    console.log('   Service has empty vulnerabilities array');
    console.log('');
    console.log('✅ CORRECT: Bidirectional relation');
    console.log('   Vulnerability → Service (forward)');
    console.log('   Service → Vulnerability (reverse)');
    console.log('   Both entities reference each other');
    console.log('');
    console.log('🎯 Best Practices:');
    console.log('1. Always maintain both directions of a relation');
    console.log('2. Update both entities when creating relations');
    console.log('3. Use helper functions to ensure consistency');
    console.log('4. Verify relations after creation');
    console.log('5. This ensures Port UI and actions work correctly');

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

main();

