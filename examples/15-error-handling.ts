/**
 * Example: Error Handling and Retry Logic
 * 
 * Description:
 * Demonstrates comprehensive error handling patterns and retry strategies
 * 
 * Prerequisites:
 * - Port.io account with API credentials
 * 
 * Run:
 * pnpm tsx examples/15-error-handling.ts
 */

import { PortClient } from '../src';
import {
  PortError,
  PortAuthError,
  PortForbiddenError,
  PortNotFoundError,
  PortValidationError,
  PortRateLimitError,
  PortServerError,
  PortNetworkError,
  PortTimeoutError,
} from '../src/errors';

async function main() {
  console.log('⚠️  Port SDK - Error Handling Examples\n');
  console.log('═'.repeat(80) + '\n');

  const client = new PortClient({
    credentials: {
      clientId: process.env.PORT_CLIENT_ID!,
      clientSecret: process.env.PORT_CLIENT_SECRET!,
    },
  });

  // ========================================================================
  // Example 1: Not Found Error (404)
  // ========================================================================
  console.log('📝 Example 1: Handling Not Found Errors\n');

  try {
    await client.blueprints.get('non_existent_blueprint_12345');
  } catch (error) {
    if (error instanceof PortNotFoundError) {
      console.log('✓ Caught PortNotFoundError');
      console.log(`  Resource: ${error.resource}`);
      console.log(`  Identifier: ${error.identifier}`);
      console.log(`  Status: ${error.statusCode}`);
      console.log(`  Code: ${error.code}`);
      console.log('');
    }
  }

  // ========================================================================
  // Example 2: Validation Error (422)
  // ========================================================================
  console.log('📝 Example 2: Handling Validation Errors\n');

  try {
    // Try to create entity with missing required fields
    await client.entities.create({
      identifier: '',  // Invalid: empty
      blueprint: '',   // Invalid: empty
      title: 'Test',
    });
  } catch (error) {
    if (error instanceof PortValidationError) {
      console.log('✓ Caught PortValidationError');
      console.log(`  Message: ${error.message}`);
      console.log(`  Validation errors: ${error.validationErrors.length}`);
      error.validationErrors.forEach((ve) => {
        console.log(`    - ${ve.field}: ${ve.message}`);
      });
      console.log('');
    }
  }

  // ========================================================================
  // Example 3: Authentication Error (401)
  // ========================================================================
  console.log('📝 Example 3: Handling Authentication Errors\n');

  try {
    const badClient = new PortClient({
      credentials: {
        clientId: 'invalid_client_id',
        clientSecret: 'invalid_client_secret',
      },
    });

    await badClient.blueprints.list();
  } catch (error) {
    if (error instanceof PortAuthError) {
      console.log('✓ Caught PortAuthError');
      console.log(`  Message: ${error.message}`);
      console.log(`  Status: ${error.statusCode}`);
      console.log('  Action: Check credentials and retry');
      console.log('');
    }
  }

  // ========================================================================
  // Example 4: Generic Error Handling
  // ========================================================================
  console.log('📝 Example 4: Generic Error Handling Pattern\n');

  try {
    await client.blueprints.get('test');
  } catch (error) {
    if (error instanceof PortNotFoundError) {
      console.log('✓ Resource not found - handle gracefully');
    } else if (error instanceof PortAuthError) {
      console.log('✓ Authentication failed - refresh token');
    } else if (error instanceof PortValidationError) {
      console.log('✓ Validation failed - fix input');
    } else if (error instanceof PortRateLimitError) {
      console.log('✓ Rate limited - wait and retry');
    } else if (error instanceof PortServerError) {
      console.log('✓ Server error - retry with backoff');
    } else if (error instanceof PortNetworkError) {
      console.log('✓ Network error - check connection');
    } else if (error instanceof PortTimeoutError) {
      console.log('✓ Timeout - increase timeout or retry');
    } else if (error instanceof PortError) {
      console.log('✓ General Port error - log and handle');
    } else {
      console.log('✓ Unknown error - log and investigate');
    }
    console.log('');
  }

  // ========================================================================
  // Example 5: Retry with Exponential Backoff
  // ========================================================================
  console.log('📝 Example 5: Custom Retry Logic\n');

  async function retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    initialDelay: number = 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on client errors (4xx except 429)
        if (error instanceof PortValidationError ||
            error instanceof PortNotFoundError ||
            error instanceof PortForbiddenError) {
          throw error;
        }
        
        // Calculate delay with exponential backoff
        const delay = initialDelay * Math.pow(2, attempt);
        console.log(`  Attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError!;
  }

  try {
    const result = await retryWithBackoff(
      () => client.blueprints.get('test'),
      3,
      100
    );
  } catch (error) {
    console.log('✓ All retries exhausted');
    console.log(`  Final error: ${error instanceof Error ? error.message : error}`);
    console.log('');
  }

  // ========================================================================
  // Example 6: Graceful Degradation
  // ========================================================================
  console.log('📝 Example 6: Graceful Degradation\n');

  async function getBlueprintSafely(id: string) {
    try {
      return await client.blueprints.get(id);
    } catch (error) {
      if (error instanceof PortNotFoundError) {
        console.log(`  Blueprint '${id}' not found, using default`);
        return null;
      }
      throw error;  // Re-throw other errors
    }
  }

  const blueprint = await getBlueprintSafely('test');
  console.log(`✓ Gracefully handled: ${blueprint ? 'Found' : 'Not found, used fallback'}`);
  console.log('');

  // ========================================================================
  // Example 7: Error Logging
  // ========================================================================
  console.log('📝 Example 7: Structured Error Logging\n');

  try {
    await client.blueprints.get('test');
  } catch (error) {
    const errorInfo = {
      timestamp: new Date().toISOString(),
      type: error instanceof Error ? error.constructor.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      statusCode: error instanceof PortError ? error.statusCode : undefined,
      code: error instanceof PortError ? error.code : undefined,
      details: error instanceof PortError ? error.details : undefined,
    };

    console.log('✓ Structured error log:');
    console.log(JSON.stringify(errorInfo, null, 2));
    console.log('');
  }

  // ========================================================================
  // Example 8: Error Recovery
  // ========================================================================
  console.log('📝 Example 8: Error Recovery Strategy\n');

  async function createEntityWithRecovery(identifier: string) {
    const blueprintId = 'service';
    
    try {
      // Try to create entity
      return await client.entities.create({
        identifier,
        blueprint: blueprintId,
        title: 'Test Entity',
      });
    } catch (error) {
      if (error instanceof PortNotFoundError && error.resource === 'Blueprint') {
        console.log(`  Blueprint '${blueprintId}' not found, creating it first...`);
        
        // Recovery: Create the blueprint first
        await client.blueprints.create({
          identifier: blueprintId,
          title: 'Service',
          icon: 'Service',
          schema: {
            properties: {
              name: { type: 'string', title: 'Name' },
            },
          },
        });
        
        // Retry creating the entity
        return await client.entities.create({
          identifier,
          blueprint: blueprintId,
          title: 'Test Entity',
        });
      }
      throw error;
    }
  }

  try {
    await createEntityWithRecovery(`test_${Date.now()}`);
    console.log('✓ Entity created with recovery');
  } catch (error) {
    console.log('✓ Recovery attempted (blueprint might already exist)');
  }
  console.log('');

  console.log('═'.repeat(80) + '\n');
  console.log('✅ All error handling examples completed!\n');

  console.log('📚 Error Types:');
  console.log('  • PortAuthError (401) - Authentication failed');
  console.log('  • PortForbiddenError (403) - Permission denied');
  console.log('  • PortNotFoundError (404) - Resource not found');
  console.log('  • PortValidationError (422) - Invalid input');
  console.log('  • PortRateLimitError (429) - Too many requests');
  console.log('  • PortServerError (5xx) - Server error');
  console.log('  • PortNetworkError - Network failure');
  console.log('  • PortTimeoutError - Request timeout\n');

  console.log('📚 Best Practices:');
  console.log('  1. Always use try-catch for SDK calls');
  console.log('  2. Check specific error types');
  console.log('  3. Implement retry logic for transient errors');
  console.log('  4. Log errors with structured data');
  console.log('  5. Provide user-friendly error messages');
  console.log('  6. Implement graceful degradation');
  console.log('  7. Never expose sensitive data in errors\n');

  console.log('📚 Next Steps:');
  console.log('  • Read docs/guides/error-handling.md');
  console.log('  • Try example 16-logging-debugging.ts\n');
}

main().catch(console.error);

