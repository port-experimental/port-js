/**
 * Setup file for integration tests
 * Runs before integration tests to validate environment
 */
import { beforeAll } from 'vitest';

beforeAll(() => {
  // Validate required environment variables
  const requiredEnvVars = ['PORT_CLIENT_ID', 'PORT_CLIENT_SECRET'];
  const missing = requiredEnvVars.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.warn(`
⚠️  Integration tests require Port.io credentials.
    
Missing environment variables:
${missing.map((key) => `  - ${key}`).join('\n')}

To run integration tests:
1. Create a Port.io API client at https://app.port.io
2. Set environment variables:
   export PORT_CLIENT_ID="your-client-id"
   export PORT_CLIENT_SECRET="your-client-secret"
3. Run: pnpm test:integration

Integration tests will be skipped.
    `);
  }

  // Set test timeout for integration tests
  if (typeof global.testTimeout === 'undefined') {
    global.testTimeout = 60000; // 60 seconds
  }
});

