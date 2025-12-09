/**
 * Example: Authentication
 * 
 * This example demonstrates how to:
 * - Create access tokens from client credentials
 * - Use tokens for API authentication
 * 
 * Run with: pnpm tsx examples/30-authentication.ts
 */

import { PortClient } from '../src';

async function main() {
  console.log('Authentication Example\n');
  console.log('━'.repeat(60));

  try {
    // ============================================================
    // Example 1: Create Access Token
    // ============================================================
    console.log('\nExample 1: Create access token');
    console.log('─'.repeat(60));
    
    // Note: In a real scenario, you would get these from environment variables
    // or a secure credential store
    const clientId = process.env.PORT_CLIENT_ID;
    const clientSecret = process.env.PORT_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
      console.log('[WARNING] PORT_CLIENT_ID and PORT_CLIENT_SECRET environment variables not set');
      console.log('   This example requires valid credentials to run.');
      console.log('   ');
      console.log('   To get your credentials:');
      console.log('   1. Go to https://app.getport.io');
      console.log('   2. Click the "..." button in the top right corner');
      console.log('   3. Click "Credentials"');
      console.log('   4. Copy your Client ID and Client Secret');
      console.log('   ');
      console.log('   Then set them as environment variables:');
      console.log('   export PORT_CLIENT_ID="your-client-id"');
      console.log('   export PORT_CLIENT_SECRET="your-client-secret"');
      return;
    }
    
    // Initialize a client (this will use the credentials for authentication)
    const client = new PortClient();
    
    // Create an access token
    const token = await client.auth.createAccessToken({
      clientId,
      clientSecret,
    });
    
    console.log('[OK] Access token created successfully!');
    console.log(`   Token Type: ${token.tokenType}`);
    console.log(`   Expires In: ${token.expiresIn} seconds (${Math.round(token.expiresIn / 60)} minutes)`);
    console.log(`   Access Token: ${token.accessToken.substring(0, 20)}... (truncated)`);
    console.log(`   Full Token: ${token.accessToken}`);

    // ============================================================
    // Example 2: Use Token for API Requests
    // ============================================================
    console.log('\nExample 2: Use token for API requests');
    console.log('─'.repeat(60));
    
    // Create a new client using the access token
    const tokenClient = new PortClient({
      credentials: {
        accessToken: token.accessToken,
      },
    });
    
    // Test the token by making an API call
    try {
      const org = await tokenClient.organization.get();
      console.log('[OK] Token is valid and working!');
      console.log(`   Organization: ${org.name}`);
    } catch (error) {
      console.log('[WARNING] Token validation failed:', error);
    }

    // ============================================================
    // Example 3: Token Expiration Handling
    // ============================================================
    console.log('\nExample 3: Token expiration handling');
    console.log('─'.repeat(60));
    
    const expirationDate = new Date(Date.now() + token.expiresIn * 1000);
    console.log(`[OK] Token expires at: ${expirationDate.toISOString()}`);
    console.log(`   Current time: ${new Date().toISOString()}`);
    console.log(`   Time until expiration: ${Math.round(token.expiresIn / 60)} minutes`);
    console.log('   ');
    console.log('   Note: The PortClient automatically handles token refresh');
    console.log('   when using clientId/clientSecret credentials.');
    console.log('   When using accessToken directly, you must handle expiration yourself.');

    // ============================================================
    // Example 4: Token Storage Best Practices
    // ============================================================
    console.log('\nExample 4: Token storage best practices');
    console.log('─'.repeat(60));
    
    console.log('[OK] Best practices for token storage:');
    console.log('   1. Never commit tokens to version control');
    console.log('   2. Store tokens in environment variables or secure vaults');
    console.log('   3. Use short-lived tokens when possible');
    console.log('   4. Rotate tokens regularly');
    console.log('   5. Use clientId/clientSecret for automatic token management');
    console.log('   ');
    console.log('   [OK] Good:');
    console.log('      const client = new PortClient({');
    console.log('        credentials: {');
    console.log('          clientId: process.env.PORT_CLIENT_ID,');
    console.log('          clientSecret: process.env.PORT_CLIENT_SECRET,');
    console.log('        },');
    console.log('      });');
    console.log('   ');
    console.log('   [ERROR] Bad:');
    console.log('      const client = new PortClient({');
    console.log('        credentials: {');
    console.log('          clientId: "hardcoded-id",');
    console.log('          clientSecret: "hardcoded-secret",');
    console.log('        },');
    console.log('      });');

    console.log('\n━'.repeat(60));
    console.log('[OK] All authentication operations completed successfully!\n');

  } catch (error) {
    console.error('\n[ERROR] Error:', error);
    
    if (error instanceof Error) {
      console.error(`   Message: ${error.message}`);
      if ('statusCode' in error) {
        console.error(`   Status Code: ${(error as { statusCode?: number }).statusCode}`);
      }
      
      if (error.message.includes('401') || error.message.includes('authentication')) {
        console.error('   ');
        console.error('   This error usually means:');
        console.error('   - Invalid client ID or client secret');
        console.error('   - Credentials have been revoked');
        console.error('   - Token has expired');
        console.error('   ');
        console.error('   Check your credentials in Port.io:');
        console.error('   https://app.getport.io > ... > Credentials');
      }
    }
    
    process.exit(1);
  }
}

main();
