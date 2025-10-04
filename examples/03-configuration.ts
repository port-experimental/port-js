/**
 * Example: Configuration Options
 * 
 * Description:
 * Demonstrates all available configuration options for the Port SDK:
 * - Credentials and authentication
 * - Region and base URL
 * - Timeout and retry settings
 * - Proxy configuration
 * - Logging configuration
 * 
 * Prerequisites:
 * - Port.io account with API credentials
 * 
 * Run:
 * pnpm tsx examples/03-configuration.ts
 */

import { PortClient } from '../src';
import { LogLevel } from '../src/logger';

// ============================================================================
// Example 1: Basic Configuration
// ============================================================================

function exampleBasicConfig() {
  console.log('📝 Example 1: Basic Configuration\n');

  const client = new PortClient({
    credentials: {
      clientId: process.env.PORT_CLIENT_ID!,
      clientSecret: process.env.PORT_CLIENT_SECRET!,
    },
  });

  console.log('✓ Basic client configured with:');
  console.log('  • OAuth2 credentials');
  console.log('  • Default region (EU)');
  console.log('  • Default timeout (30s)');
  console.log('  • Default retries (3 attempts)\n');

  return client;
}

// ============================================================================
// Example 2: Region Configuration
// ============================================================================

function exampleRegionConfig() {
  console.log('📝 Example 2: Region Configuration\n');

  // EU Region (default)
  const euClient = new PortClient({
    credentials: {
      clientId: process.env.PORT_CLIENT_ID!,
      clientSecret: process.env.PORT_CLIENT_SECRET!,
    },
    region: 'eu', // Explicit EU region
  });

  console.log('EU Client:');
  console.log('  Region: eu');
  console.log('  Base URL: https://api.port.io\n');

  // US Region
  // const usClient = new PortClient({
  //   credentials: { ... },
  //   region: 'us',
  // });

  return euClient;
}

// ============================================================================
// Example 3: Timeout Configuration
// ============================================================================

function exampleTimeoutConfig() {
  console.log('📝 Example 3: Timeout Configuration\n');

  // Short timeout for fast operations
  const fastClient = new PortClient({
    credentials: {
      clientId: process.env.PORT_CLIENT_ID!,
      clientSecret: process.env.PORT_CLIENT_SECRET!,
    },
    timeout: 10000, // 10 seconds
  });

  console.log('Fast Client:');
  console.log('  Timeout: 10 seconds');
  console.log('  Use case: Simple GET operations\n');

  // Long timeout for complex operations
  const slowClient = new PortClient({
    credentials: {
      clientId: process.env.PORT_CLIENT_ID!,
      clientSecret: process.env.PORT_CLIENT_SECRET!,
    },
    timeout: 60000, // 60 seconds
  });

  console.log('Slow Client:');
  console.log('  Timeout: 60 seconds');
  console.log('  Use case: Bulk operations, complex searches\n');

  return fastClient;
}

// ============================================================================
// Example 4: Retry Configuration
// ============================================================================

function exampleRetryConfig() {
  console.log('📝 Example 4: Retry Configuration\n');

  // Aggressive retries
  const aggressiveClient = new PortClient({
    credentials: {
      clientId: process.env.PORT_CLIENT_ID!,
      clientSecret: process.env.PORT_CLIENT_SECRET!,
    },
    maxRetries: 5,
    retryDelay: 500, // 500ms between retries
  });

  console.log('Aggressive Retry Client:');
  console.log('  Max retries: 5');
  console.log('  Retry delay: 500ms (with exponential backoff)');
  console.log('  Use case: Unreliable networks\n');

  // No retries
  const noRetryClient = new PortClient({
    credentials: {
      clientId: process.env.PORT_CLIENT_ID!,
      clientSecret: process.env.PORT_CLIENT_SECRET!,
    },
    maxRetries: 0,
  });

  console.log('No Retry Client:');
  console.log('  Max retries: 0');
  console.log('  Use case: Real-time operations, custom retry logic\n');

  return aggressiveClient;
}

// ============================================================================
// Example 5: Logging Configuration
// ============================================================================

async function exampleLoggingConfig() {
  console.log('📝 Example 5: Logging Configuration\n');

  // Error logging only (production)
  const productionClient = new PortClient({
    credentials: {
      clientId: process.env.PORT_CLIENT_ID!,
      clientSecret: process.env.PORT_CLIENT_SECRET!,
    },
    logger: {
      level: LogLevel.ERROR, // 0
      enabled: true,
    },
  });

  console.log('Production Client (ERROR level):');
  console.log('  Log level: ERROR (0)');
  console.log('  Only critical errors are logged\n');

  // Debug logging (development)
  const debugClient = new PortClient({
    credentials: {
      clientId: process.env.PORT_CLIENT_ID!,
      clientSecret: process.env.PORT_CLIENT_SECRET!,
    },
    logger: {
      level: LogLevel.DEBUG, // 3
      enabled: true,
    },
  });

  console.log('Debug Client (DEBUG level):');
  console.log('  Log level: DEBUG (3)');
  console.log('  Detailed request/response logging\n');

  // Trace logging (troubleshooting)
  const traceClient = new PortClient({
    credentials: {
      clientId: process.env.PORT_CLIENT_ID!,
      clientSecret: process.env.PORT_CLIENT_SECRET!,
    },
    logger: {
      level: LogLevel.TRACE, // 4
      enabled: true,
    },
  });

  console.log('Trace Client (TRACE level):');
  console.log('  Log level: TRACE (4)');
  console.log('  Maximum verbosity for troubleshooting\n');

  console.log('Testing ERROR level client (no logs expected):');
  await productionClient.blueprints.list({ limit: 1 });
  console.log('✓ Request completed (logs suppressed)\n');

  return productionClient;
}

// ============================================================================
// Example 6: Proxy Configuration
// ============================================================================

function exampleProxyConfig() {
  console.log('📝 Example 6: Proxy Configuration\n');

  // Simple proxy
  const simpleProxyClient = new PortClient({
    credentials: {
      clientId: process.env.PORT_CLIENT_ID!,
      clientSecret: process.env.PORT_CLIENT_SECRET!,
    },
    proxy: {
      url: 'http://proxy.company.com:8080',
    },
  });

  console.log('Simple Proxy Client:');
  console.log('  Proxy URL: http://proxy.company.com:8080');
  console.log('  No authentication\n');

  // Proxy with authentication
  const authProxyClient = new PortClient({
    credentials: {
      clientId: process.env.PORT_CLIENT_ID!,
      clientSecret: process.env.PORT_CLIENT_SECRET!,
    },
    proxy: {
      url: 'http://proxy.company.com:8080',
      auth: {
        username: 'proxy-user',
        password: 'proxy-pass',
      },
    },
  });

  console.log('Authenticated Proxy Client:');
  console.log('  Proxy URL: http://proxy.company.com:8080');
  console.log('  With authentication\n');

  console.log('ℹ️  Proxy can also be configured via environment:');
  console.log('  HTTP_PROXY=http://proxy:8080');
  console.log('  HTTPS_PROXY=http://proxy:8080');
  console.log('  NO_PROXY=localhost,127.0.0.1\n');

  return simpleProxyClient;
}

// ============================================================================
// Example 7: Complete Configuration
// ============================================================================

function exampleCompleteConfig() {
  console.log('📝 Example 7: Complete Configuration\n');

  const client = new PortClient({
    // Authentication
    credentials: {
      clientId: process.env.PORT_CLIENT_ID!,
      clientSecret: process.env.PORT_CLIENT_SECRET!,
    },

    // Region & URL
    region: 'eu',
    // baseUrl: 'https://api.port.io', // Alternative to region

    // Network settings
    timeout: 30000,
    maxRetries: 3,
    retryDelay: 1000,

    // Proxy (optional)
    proxy: process.env.HTTP_PROXY
      ? {
          url: process.env.HTTP_PROXY,
        }
      : undefined,

    // Logging
    logger: {
      level: process.env.NODE_ENV === 'production' 
        ? LogLevel.WARN 
        : LogLevel.DEBUG,
      enabled: true,
    },
  });

  console.log('Complete Configuration:');
  console.log('  ✓ Credentials: OAuth2');
  console.log('  ✓ Region: eu');
  console.log('  ✓ Timeout: 30s');
  console.log('  ✓ Max retries: 3');
  console.log('  ✓ Retry delay: 1s (exponential)');
  console.log('  ✓ Proxy: ' + (process.env.HTTP_PROXY ? 'Configured' : 'Not configured'));
  console.log('  ✓ Logging: ' + (process.env.NODE_ENV === 'production' ? 'WARN' : 'DEBUG'));
  console.log('');

  return client;
}

// ============================================================================
// Example 8: Environment-Based Configuration
// ============================================================================

function exampleEnvironmentBasedConfig() {
  console.log('📝 Example 8: Environment-Based Configuration\n');

  const isDevelopment = process.env.NODE_ENV !== 'production';
  const isCI = process.env.CI === 'true';

  const client = new PortClient({
    credentials: {
      clientId: process.env.PORT_CLIENT_ID!,
      clientSecret: process.env.PORT_CLIENT_SECRET!,
    },

    // Adjust settings based on environment
    timeout: isDevelopment ? 60000 : 30000,
    maxRetries: isCI ? 5 : 3,
    
    logger: {
      enabled: !isCI, // Disable logs in CI
      level: isDevelopment ? LogLevel.DEBUG : LogLevel.WARN,
    },
  });

  console.log('Environment-Based Configuration:');
  console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`  Is CI: ${isCI}`);
  console.log(`  Timeout: ${isDevelopment ? '60s' : '30s'}`);
  console.log(`  Retries: ${isCI ? '5' : '3'}`);
  console.log(`  Logging: ${isCI ? 'Disabled' : 'Enabled'}`);
  console.log(`  Log Level: ${isDevelopment ? 'DEBUG' : 'WARN'}\n`);

  return client;
}

// ============================================================================
// Main Execution
// ============================================================================

async function main() {
  console.log('⚙️  Port SDK - Configuration Examples\n');
  console.log('═'.repeat(80) + '\n');

  try {
    exampleBasicConfig();
    console.log('─'.repeat(80) + '\n');

    exampleRegionConfig();
    console.log('─'.repeat(80) + '\n');

    exampleTimeoutConfig();
    console.log('─'.repeat(80) + '\n');

    exampleRetryConfig();
    console.log('─'.repeat(80) + '\n');

    await exampleLoggingConfig();
    console.log('─'.repeat(80) + '\n');

    exampleProxyConfig();
    console.log('─'.repeat(80) + '\n');

    exampleCompleteConfig();
    console.log('─'.repeat(80) + '\n');

    exampleEnvironmentBasedConfig();
    console.log('═'.repeat(80) + '\n');

    console.log('✅ All configuration examples completed!\n');

    console.log('📚 Configuration Summary:');
    console.log('  • credentials: OAuth2 or JWT');
    console.log('  • region: "eu" | "us"');
    console.log('  • baseUrl: Custom API URL');
    console.log('  • timeout: Request timeout in ms');
    console.log('  • maxRetries: Number of retry attempts');
    console.log('  • retryDelay: Delay between retries (ms)');
    console.log('  • proxy: Corporate proxy settings');
    console.log('  • logger: Logging configuration\n');

    console.log('📚 Next Steps:');
    console.log('  • Try example 04-entities-crud.ts');
    console.log('  • Read docs/getting-started/configuration.md');
    console.log('  • Check out 16-logging-debugging.ts for more logging examples\n');
  } catch (error) {
    console.error('❌ Error running examples:', error);
    process.exit(1);
  }
}

// Run the examples
main();

