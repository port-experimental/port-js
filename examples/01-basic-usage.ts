/**
 * Example: Basic Usage
 * 
 * Description: Getting started with the Port SDK - initialize client and perform basic operations
 * 
 * Prerequisites:
 * - PORT_CLIENT_ID and PORT_CLIENT_SECRET in .env file
 * 
 * Usage:
 *   pnpm tsx examples/01-basic-usage.ts
 * 
 * Expected output:
 *   ✅ SDK initialized successfully
 *   ✅ Ready to use Port API
 */

import { PortClient } from '../src';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function main() {
  // Validate credentials
  if (!process.env.PORT_CLIENT_ID || !process.env.PORT_CLIENT_SECRET) {
    console.error('❌ Missing credentials');
    console.error('Please set PORT_CLIENT_ID and PORT_CLIENT_SECRET in .env file');
    console.error('See .env.example for reference');
    process.exit(1);
  }

  console.log('🚀 Port SDK - Basic Usage\n');
  console.log('='.repeat(60));

  try {
    // Initialize the Port SDK client
    console.log('\n📝 Step 1: Initializing Port SDK client...');
    
    const client = new PortClient({
      credentials: {
        clientId: process.env.PORT_CLIENT_ID,
        clientSecret: process.env.PORT_CLIENT_SECRET,
      },
      region: 'eu', // or 'us' for US region
    });

    console.log('✅ Client initialized successfully!');

    // The client is now ready to use
    console.log('\n📊 Available resources:');
    console.log('  • client.entities    - Manage entities');
    console.log('  • client.blueprints  - Manage blueprints (coming soon)');
    console.log('  • client.actions     - Manage actions (coming soon)');
    console.log('  • client.scorecards  - Manage scorecards (coming soon)');

    console.log('\n' + '='.repeat(60));
    console.log('\n✅ SDK is ready! Check out other examples to learn more:');
    console.log('  • 02-authentication.ts - Different authentication methods');
    console.log('  • 04-entities-crud.ts - Entity CRUD operations');
    console.log('  • 05-entities-search.ts - Search and filter entities');
    
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

// Run the example
main();

