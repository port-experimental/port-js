/**
 * Example: Authentication Methods
 * 
 * Description:
 * Demonstrates all authentication methods supported by the Port SDK:
 * 1. OAuth2 (Client Credentials) - Most common
 * 2. JWT Access Token - For temporary access
 * 3. Environment Variables - Automatic configuration
 * 
 * Prerequisites:
 * - Port.io account with API credentials
 * - .env file configured (for env var example)
 * 
 * Run:
 * pnpm tsx examples/02-authentication.ts
 */

import { PortClient } from '../src';
import { PortAuthError } from '../src/errors';

// ============================================================================
// Example 1: OAuth2 Authentication (Most Common)
// ============================================================================

async function exampleOAuth2() {
  console.log('📝 Example 1: OAuth2 Authentication\n');

  const client = new PortClient({
    credentials: {
      clientId: process.env.PORT_CLIENT_ID!,
      clientSecret: process.env.PORT_CLIENT_SECRET!,
    },
  });

  try {
    // The SDK automatically handles token fetching and refresh
    const blueprints = await client.blueprints.list();
    console.log(`✓ Successfully authenticated with OAuth2`);
    console.log(`✓ Found ${blueprints.data.length} blueprints\n`);
  } catch (error) {
    if (error instanceof PortAuthError) {
      console.error('✗ Authentication failed');
      console.error('  Check your CLIENT_ID and CLIENT_SECRET\n');
    }
    throw error;
  }
}

// ============================================================================
// Example 2: JWT Access Token Authentication
// ============================================================================

async function exampleJWT() {
  console.log('📝 Example 2: JWT Token Authentication\n');

  // Note: In production, you would obtain the JWT token from your auth system
  // For demonstration, we'll fetch it using OAuth first
  
  // Step 1: Get a JWT token (typically from your auth system)
  const tempClient = new PortClient({
    credentials: {
      clientId: process.env.PORT_CLIENT_ID!,
      clientSecret: process.env.PORT_CLIENT_SECRET!,
    },
  });

  // For demo purposes, we'll use OAuth to get a token
  // In real scenarios, you'd receive this token from your auth flow
  console.log('⚠️  Note: In production, obtain JWT from your auth system');
  console.log('   This example uses OAuth to demonstrate JWT usage\n');

  // Step 2: Use the JWT token directly
  try {
    const jwtClient = new PortClient({
      credentials: {
        accessToken: 'your-jwt-token-here', // Replace with actual token
      },
    });

    // This would work with a valid JWT token
    // await jwtClient.blueprints.list();
    console.log('✓ JWT authentication configured');
    console.log('  (Actual API call skipped - provide valid token to test)\n');
  } catch (error) {
    console.log('⚠️  Expected: JWT token not valid for demo\n');
  }
}

// ============================================================================
// Example 3: Environment Variable Authentication
// ============================================================================

async function exampleEnvironmentVariables() {
  console.log('📝 Example 3: Environment Variable Authentication\n');

  // The SDK automatically reads these environment variables:
  // - PORT_CLIENT_ID
  // - PORT_CLIENT_SECRET
  // - PORT_BASE_URL (optional)
  // - PORT_REGION (optional)

  console.log('Environment variables detected:');
  console.log(`  PORT_CLIENT_ID: ${process.env.PORT_CLIENT_ID ? '✓ Set' : '✗ Not set'}`);
  console.log(`  PORT_CLIENT_SECRET: ${process.env.PORT_CLIENT_SECRET ? '✓ Set' : '✗ Not set'}`);
  console.log(`  PORT_REGION: ${process.env.PORT_REGION || 'eu (default)'}`);
  console.log('');

  if (process.env.PORT_CLIENT_ID && process.env.PORT_CLIENT_SECRET) {
    // Initialize without explicit credentials
    // SDK will automatically use environment variables
    const client = new PortClient();

    const blueprints = await client.blueprints.list();
    console.log('✓ Successfully authenticated using environment variables');
    console.log(`✓ Found ${blueprints.data.length} blueprints\n`);
  } else {
    console.log('⚠️  Set PORT_CLIENT_ID and PORT_CLIENT_SECRET to test this\n');
  }
}

// ============================================================================
// Example 4: Region-Specific Authentication
// ============================================================================

async function exampleRegionSpecific() {
  console.log('📝 Example 4: Region-Specific Authentication\n');

  // EU Region (Default)
  const euClient = new PortClient({
    credentials: {
      clientId: process.env.PORT_CLIENT_ID!,
      clientSecret: process.env.PORT_CLIENT_SECRET!,
    },
    region: 'eu',
  });

  console.log('EU Client:');
  console.log('  Region: eu');
  console.log('  Base URL: https://api.port.io');
  const euBlueprints = await euClient.blueprints.list();
  console.log(`  Blueprints: ${euBlueprints.data.length}\n`);

  // US Region
  // Uncomment if you have a US account:
  /*
  const usClient = new PortClient({
    credentials: {
      clientId: process.env.PORT_US_CLIENT_ID!,
      clientSecret: process.env.PORT_US_CLIENT_SECRET!,
    },
    region: 'us',
  });

  console.log('US Client:');
  console.log('  Region: us');
  console.log('  Base URL: https://api.us.port.io');
  const usBlueprints = await usClient.blueprints.list();
  console.log(`  Blueprints: ${usBlueprints.data.length}\n`);
  */

  console.log('ℹ️  Tip: Set region based on your Port account location\n');
}

// ============================================================================
// Example 5: Custom Base URL
// ============================================================================

async function exampleCustomBaseUrl() {
  console.log('📝 Example 5: Custom Base URL\n');

  // For self-hosted or custom Port instances
  const client = new PortClient({
    credentials: {
      clientId: process.env.PORT_CLIENT_ID!,
      clientSecret: process.env.PORT_CLIENT_SECRET!,
    },
    baseUrl: 'https://api.port.io', // Replace with your custom URL
  });

  console.log('Custom Base URL configured:');
  console.log('  Base URL: https://api.port.io');
  console.log('  ℹ️  Change this for self-hosted instances\n');

  const blueprints = await client.blueprints.list();
  console.log(`✓ Successfully connected to custom URL`);
  console.log(`✓ Found ${blueprints.data.length} blueprints\n`);
}

// ============================================================================
// Example 6: Authentication Error Handling
// ============================================================================

async function exampleErrorHandling() {
  console.log('📝 Example 6: Authentication Error Handling\n');

  try {
    // Intentionally use invalid credentials
    const client = new PortClient({
      credentials: {
        clientId: 'invalid_client_id',
        clientSecret: 'invalid_client_secret',
      },
    });

    await client.blueprints.list();
  } catch (error) {
    if (error instanceof PortAuthError) {
      console.log('✓ Correctly caught PortAuthError');
      console.log(`  Message: ${error.message}`);
      console.log(`  Code: ${error.code}`);
      console.log(`  Status: ${error.statusCode}\n`);
    }
  }

  console.log('Best Practices:');
  console.log('  ✓ Always wrap API calls in try-catch');
  console.log('  ✓ Check for PortAuthError specifically');
  console.log('  ✓ Log authentication errors for debugging');
  console.log('  ✓ Never expose credentials in error messages\n');
}

// ============================================================================
// Main Execution
// ============================================================================

async function main() {
  console.log('🔐 Port SDK - Authentication Examples\n');
  console.log('═'.repeat(80) + '\n');

  try {
    await exampleOAuth2();
    console.log('─'.repeat(80) + '\n');

    await exampleJWT();
    console.log('─'.repeat(80) + '\n');

    await exampleEnvironmentVariables();
    console.log('─'.repeat(80) + '\n');

    await exampleRegionSpecific();
    console.log('─'.repeat(80) + '\n');

    await exampleCustomBaseUrl();
    console.log('─'.repeat(80) + '\n');

    await exampleErrorHandling();
    console.log('═'.repeat(80) + '\n');

    console.log('✅ All authentication examples completed!\n');

    console.log('📚 Next Steps:');
    console.log('  • Try example 03-configuration.ts for more options');
    console.log('  • Check out 04-entities-crud.ts to work with entities');
    console.log('  • Read docs/getting-started/authentication.md for details\n');
  } catch (error) {
    console.error('❌ Error running examples:', error);
    process.exit(1);
  }
}

// Run the examples
main();

