/**
 * Example: Request Cancellation
 * 
 * Demonstrates how to cancel in-flight requests using AbortController
 */

import { PortClient } from '../src/index';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

async function main() {
  const client = new PortClient({
    credentials: {
      clientId: process.env.PORT_CLIENT_ID!,
      clientSecret: process.env.PORT_CLIENT_SECRET!,
    },
  });

  console.log('🎯 Request Cancellation Examples\n');

  // Example 1: Manual cancellation
  console.log('1. Manual Request Cancellation');
  console.log('─────────────────────────────────');
  
  const controller1 = new AbortController();
  
  // Cancel after 100ms
  setTimeout(() => {
    console.log('⏱️  Cancelling request after 100ms...');
    controller1.abort('User cancelled the operation');
  }, 100);

  try {
    const entities = await client.entities.list({}, {
      signal: controller1.signal,
    });
    console.log(`✅ Fetched ${entities.length} entities`);
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.log('❌ Request was cancelled:', error.message);
    } else {
      console.error('Error:', error);
    }
  }

  console.log();

  // Example 2: Race between multiple requests
  console.log('2. Racing Requests (cancel losers)');
  console.log('─────────────────────────────────');

  const controllers = [
    new AbortController(),
    new AbortController(),
    new AbortController(),
  ];

  const requests = controllers.map((controller, index) => 
    client.entities.list({}, {
      signal: controller.signal,
    })
      .then(result => ({ index, result }))
      .catch(error => ({ index, error }))
  );

  // Wait for first successful response
  const winner = await Promise.race(requests);
  
  // Cancel all other requests
  controllers.forEach((controller, index) => {
    if (index !== winner.index) {
      controller.abort('Another request won the race');
    }
  });

  console.log(`🏆 Request ${winner.index + 1} won the race!`);
  if ('result' in winner) {
    console.log(`   Fetched ${winner.result.length} entities`);
  }

  console.log();

  // Example 3: Timeout alternative using AbortSignal
  console.log('3. Custom Timeout with AbortSignal');
  console.log('─────────────────────────────────');

  const controller3 = new AbortController();
  
  // Set custom timeout (e.g., 5 seconds)
  const timeoutId = setTimeout(() => {
    controller3.abort('Custom timeout after 5 seconds');
  }, 5000);

  try {
    const blueprints = await client.blueprints.list({
      signal: controller3.signal,
    });
    clearTimeout(timeoutId); // Clear timeout if request completes
    console.log(`✅ Fetched ${blueprints.length} blueprints`);
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.log('❌ Request timed out:', error.message);
    } else {
      console.error('Error:', error);
    }
  }

  console.log();

  // Example 4: Cancelling long-running operations
  console.log('4. User-Initiated Cancellation');
  console.log('─────────────────────────────────');

  const controller4 = new AbortController();

  // Simulate user clicking "Cancel" button
  const userCancelButton = setTimeout(() => {
    console.log('👤 User clicked Cancel button');
    controller4.abort('User cancelled the operation');
  }, 50);

  try {
    console.log('🔄 Starting long-running operation...');
    const entities = await client.entities.list({}, {
      signal: controller4.signal,
    });
    clearTimeout(userCancelButton);
    console.log(`✅ Operation completed: ${entities.length} entities`);
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.log('❌ Operation cancelled by user');
    }
  }

  console.log();

  // Example 5: Cancelling batch operations
  console.log('5. Cancelling Batch Operations');
  console.log('─────────────────────────────────');

  const controller5 = new AbortController();

  // Cancel after 200ms
  setTimeout(() => {
    console.log('⏱️  Cancelling batch operation...');
    controller5.abort('Batch operation cancelled');
  }, 200);

  const batchPromises = [
    client.blueprints.list({ signal: controller5.signal }),
    client.entities.list({}, { signal: controller5.signal }),
    client.actions.list({ signal: controller5.signal }),
  ];

  const results = await Promise.allSettled(batchPromises);

  results.forEach((result, index) => {
    const names = ['blueprints', 'entities', 'actions'];
    if (result.status === 'fulfilled') {
      console.log(`  ✅ ${names[index]}: ${result.value.length} items`);
    } else {
      console.log(`  ❌ ${names[index]}: ${result.reason.message}`);
    }
  });

  console.log();
  console.log('✨ Examples complete!');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

