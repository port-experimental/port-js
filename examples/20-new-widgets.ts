/**
 * Example 20: Using new widget and audit types
 * 
 * This example demonstrates the usage of the new widget types and
 * audit resource types added in the latest SDK update.
 */

import { PortClient } from '../src';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

async function main() {
  const client = new PortClient({
    baseUrl: 'https://api.port.io',
  });

  try {
    console.log('--- Testing New Widget Types ---');

    // Demonstrate usage of new widget types in a page creation
    // (Note: This is a dry-run demonstration of the types)
    const pageInput = {
      identifier: 'advanced-dashboard',
      title: 'Advanced Dashboard',
      widgets: [
        {
          type: 'workflow-runs-history-table',
          title: 'Workflow Runs History',
          query: {},
        },
        {
          type: 'ai-agent',
          title: 'Port AI Assistant',
          agentIdentifier: 'assistant-123',
          useMCP: true,
        },
        {
          type: 'graph-entities-explorer',
          title: 'Infrastructure Graph',
          dataset: { combinator: 'and', rules: [] },
        },
        {
          type: 'line-chart',
          title: 'Performance Trend',
          blueprint: 'service',
          timeInterval: 'quarter',
          timeRange: {
            preset: 'last2Years'
          },
          properties: ['latency']
        }
      ]
    };

    console.log('Successfully defined a page with new widget types:', JSON.stringify(pageInput, null, 2));

    console.log('\n--- Testing New Audit Resource Types ---');

    // Demonstrate usage of the new 'secret' audit resource type
    const queryOptions = {
      resources: ['secret', 'entity'],
      limit: 10
    };

    console.log('Audit query options with "secret" resource:', JSON.stringify(queryOptions, null, 2));

    // In a real scenario, you would call:
    // const logs = await client.audit.query(queryOptions);
    // console.log(`Fetched ${logs.length} audit logs`);

  } catch (error) {
    console.error('Error in example:', error);
  }
}

main();
