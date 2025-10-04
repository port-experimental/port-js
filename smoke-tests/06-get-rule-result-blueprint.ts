/**
 * Smoke Test: Fetch the '_rule_result' blueprint from Port API
 * Uses credentials from .env.local
 * 
 * Run: pnpm tsx smoke-tests/06-get-rule-result-blueprint.ts
 */

import { PortClient } from '../src/client';

async function testRuleResultBlueprint() {
  try {
    console.log('🚀 Initializing Port SDK client...');
    
    // Create client - will automatically load from .env.local
    const client = new PortClient();
    
    console.log('✅ Client initialized');
    console.log('');
    
    // Fetch the '_rule_result' blueprint (built-in system blueprint)
    console.log('✓ Fetching "_rule_result" blueprint...');
    const blueprint = await client.blueprints.get('_rule_result');
    
    console.log('✅ Blueprint found!');
    console.log('');
    console.log('Blueprint Details:');
    console.log('─────────────────────────────────────');
    console.log(`Identifier: ${blueprint.identifier}`);
    console.log(`Title: ${blueprint.title}`);
    console.log(`Description: ${blueprint.description || 'N/A'}`);
    console.log(`Created: ${blueprint.createdAt}`);
    console.log(`Updated: ${blueprint.updatedAt}`);
    console.log('');
    
    // Show properties count
    const propCount = Object.keys(blueprint.schema?.properties || {}).length;
    console.log(`📊 Properties: ${propCount}`);
    
    // Show relations count
    const relCount = Object.keys(blueprint.relations || {}).length;
    console.log(`🔗 Relations: ${relCount}`);
    
    // Show some property names if available
    if (propCount > 0) {
      const propNames = Object.keys(blueprint.schema?.properties || {}).slice(0, 5);
      console.log(`📝 Sample Properties: ${propNames.join(', ')}${propCount > 5 ? '...' : ''}`);
    }
    
    console.log('');
    console.log('✅ Test successful! Rule result blueprint retrieved correctly.');
    console.log('');
    console.log('ℹ️  Note: _rule_result is a built-in Port system blueprint for storing rule evaluation results.');
    
  } catch (error) {
    console.error('❌ Test failed!');
    console.error('');
    
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
      
      // Provide helpful hints based on error type
      if (error.message.includes('credentials')) {
        console.error('');
        console.error('💡 Hint: Make sure .env.local contains:');
        console.error('   PORT_CLIENT_ID=your-client-id');
        console.error('   PORT_CLIENT_SECRET=your-client-secret');
      } else if (error.message.includes('not found')) {
        console.error('');
        console.error('💡 Hint: The "_rule_result" blueprint does not exist.');
        console.error('   This is unusual as _rule_result is a built-in Port system blueprint.');
        console.error('   Check your Port account configuration.');
      } else if (error.message.includes('401') || error.message.includes('403')) {
        console.error('');
        console.error('💡 Hint: Authentication/authorization failed.');
        console.error('   Check your credentials have permission to access blueprints.');
      }
    } else {
      console.error(error);
    }
    
    process.exit(1);
  }
}

// Run the test
testRuleResultBlueprint();

