import { PortClient } from '../src';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.join(__dirname, '../.env.local') });

async function runTest(region: 'eu' | 'us') {
  console.log(`\n--- Testing with Region: ${region.toUpperCase()} ---`);

  const client = new PortClient({
    credentials: {
      clientId: (process.env.PORT_CLIENT_ID || '').trim(),
      clientSecret: (process.env.PORT_CLIENT_SECRET || '').trim(),
    },
    region: region,
  });

  try {
    const blueprints = await client.blueprints.list();
    console.log(`✅ [${region.toUpperCase()}] Connected! Found ${blueprints.length} blueprints.`);
    return { success: true, client, blueprints };
  } catch (error: any) {
    console.log(`❌ [${region.toUpperCase()}] failed: ${error.message}`);
    return { success: false, error };
  }
}

async function testLiveIntegration() {
  console.log('🚀 Starting Live Integration Test (Auto-Detection)...');

  const id = (process.env.PORT_CLIENT_ID || '').trim();
  const secret = (process.env.PORT_CLIENT_SECRET || '').trim();
  const envRegion = (process.env.PORT_REGION || '').trim().toLowerCase();

  console.log('Config Check:');
  console.log(`- PORT_CLIENT_ID: ${id ? `Set (Length: ${id.length})` : 'MISSING'}`);
  console.log(`- PORT_CLIENT_SECRET: ${secret ? `Set (Length: ${secret.length})` : 'MISSING'}`);
  console.log(`- PORT_REGION: ${envRegion || 'Not specified'}`);

  if (!id || !secret) {
    console.error('\n❌ ERROR: Credentials missing. Please check .env.local');
    return;
  }

  let result: Awaited<ReturnType<typeof runTest>>;
  if (envRegion === 'eu' || envRegion === 'us') {
    result = await runTest(envRegion as 'eu' | 'us');
  } else {
    // Try both if region not specified
    result = await runTest('eu');
    if (!result.success) {
      result = await runTest('us');
    }
  }

  if (!result || !result.success || !result.client || !result.blueprints) {
    console.error('\n❌ Final Result: FAILED on all attempts.');
    return;
  }

  const { client, blueprints } = result;

  try {
    const blueprintId = blueprints[0]?.identifier;
    if (blueprintId) {
      console.log(`\n--- Testing Entities for ${blueprintId} ---`);
      const count = await client.entities.getCount(blueprintId);
      console.log(`✅ Entity count: ${count}`);

      console.log('Testing Entity Stream...');
      let streamedCount = 0;
      for await (const entity of client.entities.stream({ blueprint: blueprintId, limit: 10 })) {
        streamedCount++;
        if (streamedCount >= 5) break;
      }
      console.log(`✅ Streamed ${streamedCount} entities.`);
    }

    console.log('\n--- Testing Pages & Widgets ---');
    const pageId = `test-page-${Date.now()}`;
    await client.pages.create({
      identifier: pageId,
      title: 'SDK Integration Test Page',
      widgets: []
    });
    console.log(`✅ Page created: ${pageId}`);

    console.log('\n--- Cleanup ---');
    await client.pages.delete(pageId);
    console.log('✅ Page deleted.');

    console.log('\n✨ ALL LIVE INTEGRATION TESTS PASSED!');
  } catch (error: any) {
    console.error('\n❌ Operation failed during test sequence:');
    console.error(error.message);
  }
}

testLiveIntegration();
