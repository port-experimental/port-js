/**
 * Example: Logging and Debugging
 * 
 * Description:
 * Demonstrates logging configuration, log levels, and debugging techniques
 * 
 * Prerequisites:
 * - Port.io account with API credentials
 * 
 * Run:
 * pnpm tsx examples/16-logging-debugging.ts
 * 
 * Run with debug logging:
 * PORT_LOG_LEVEL=debug pnpm tsx examples/16-logging-debugging.ts
 * 
 * Run with trace logging:
 * PORT_LOG_LEVEL=trace pnpm tsx examples/16-logging-debugging.ts
 */

import { PortClient, Logger, LogLevel, createLogger } from '../src';

async function main() {
  console.log('🔍 Port SDK - Logging and Debugging\n');
  console.log('═'.repeat(80) + '\n');

  // ========================================================================
  // Example 1: Default Logging (WARN level)
  // ========================================================================
  console.log('📝 Example 1: Default Logging\n');

  const defaultClient = new PortClient({
    credentials: {
      clientId: process.env.PORT_CLIENT_ID!,
      clientSecret: process.env.PORT_CLIENT_SECRET!,
    },
  });

  console.log('✓ Client created with default logging (WARN level)');
  console.log('  Only warnings and errors will be logged\n');

  // ========================================================================
  // Example 2: Info Level Logging
  // ========================================================================
  console.log('📝 Example 2: Info Level Logging\n');

  const infoClient = new PortClient({
    credentials: {
      clientId: process.env.PORT_CLIENT_ID!,
      clientSecret: process.env.PORT_CLIENT_SECRET!,
    },
    logger: {
      level: LogLevel.INFO,
      enabled: true,
    },
  });

  console.log('✓ Client created with INFO logging');
  console.log('  Info, warnings, and errors will be logged\n');

  // ========================================================================
  // Example 3: Debug Level Logging
  // ========================================================================
  console.log('📝 Example 3: Debug Level Logging\n');

  const debugClient = new PortClient({
    credentials: {
      clientId: process.env.PORT_CLIENT_ID!,
      clientSecret: process.env.PORT_CLIENT_SECRET!,
    },
    logger: {
      level: LogLevel.DEBUG,
      enabled: true,
    },
  });

  console.log('✓ Client created with DEBUG logging');
  console.log('  Detailed HTTP requests and responses will be logged');
  console.log('  Try listing blueprints to see debug logs:');
  
  await debugClient.blueprints.list();
  console.log('');

  // ========================================================================
  // Example 4: Trace Level Logging (Most Verbose)
  // ========================================================================
  console.log('📝 Example 4: Trace Level Logging\n');

  const traceClient = new PortClient({
    credentials: {
      clientId: process.env.PORT_CLIENT_ID!,
      clientSecret: process.env.PORT_CLIENT_SECRET!,
    },
    logger: {
      level: LogLevel.TRACE,
      enabled: true,
    },
  });

  console.log('✓ Client created with TRACE logging');
  console.log('  All internal operations will be logged\n');

  // ========================================================================
  // Example 5: Disabled Logging
  // ========================================================================
  console.log('📝 Example 5: Disabled Logging\n');

  const silentClient = new PortClient({
    credentials: {
      clientId: process.env.PORT_CLIENT_ID!,
      clientSecret: process.env.PORT_CLIENT_SECRET!,
    },
    logger: {
      enabled: false,
    },
  });

  console.log('✓ Client created with logging disabled');
  console.log('  No SDK logs will be output\n');

  // ========================================================================
  // Example 6: Environment Variable Configuration
  // ========================================================================
  console.log('📝 Example 6: Environment Variable Configuration\n');

  console.log('You can control logging via environment variables:');
  console.log('  PORT_LOG_LEVEL=error  # Only errors');
  console.log('  PORT_LOG_LEVEL=warn   # Warnings and errors (default)');
  console.log('  PORT_LOG_LEVEL=info   # Info, warnings, and errors');
  console.log('  PORT_LOG_LEVEL=debug  # Debug info + HTTP requests');
  console.log('  PORT_LOG_LEVEL=trace  # Everything\n');

  console.log(`Current log level from env: ${process.env.PORT_LOG_LEVEL || 'warn (default)'}`);
  console.log('');

  // ========================================================================
  // Example 7: Custom Logger
  // ========================================================================
  console.log('📝 Example 7: Custom Logger\n');

  const customLogger = createLogger({
    level: LogLevel.DEBUG,
    enabled: true,
  });

  // Use custom logger in application
  customLogger.info('Custom application log');
  customLogger.debug('Debug information', { userId: '123', action: 'list' });
  customLogger.error('An error occurred', { code: 'ERR_001' });

  console.log('✓ Custom logger created and used\n');

  // ========================================================================
  // Example 8: Child Loggers
  // ========================================================================
  console.log('📝 Example 8: Child Loggers\n');

  const parentLogger = createLogger({
    level: LogLevel.INFO,
    enabled: true,
  });

  const childLogger = parentLogger.child({ component: 'EntityService' });

  childLogger.info('Using child logger with context');
  console.log('✓ Child logger adds context to all logs\n');

  // ========================================================================
  // Example 9: Debugging API Calls
  // ========================================================================
  console.log('📝 Example 9: Debugging API Calls\n');

  console.log('When debugging API issues:');
  console.log('  1. Set PORT_LOG_LEVEL=debug to see HTTP requests/responses');
  console.log('  2. Check request headers, body, and parameters');
  console.log('  3. Inspect response status codes and bodies');
  console.log('  4. Look for retry attempts and error details\n');

  console.log('Example command:');
  console.log('  PORT_LOG_LEVEL=debug pnpm tsx examples/16-logging-debugging.ts\n');

  // ========================================================================
  // Example 10: Security - Sensitive Data Sanitization
  // ========================================================================
  console.log('📝 Example 10: Security - Sensitive Data Sanitization\n');

  console.log('✓ The SDK automatically sanitizes sensitive data:');
  console.log('  • Client secrets are masked');
  console.log('  • Access tokens are redacted');
  console.log('  • Authorization headers are hidden');
  console.log('  • Passwords and API keys are stripped\n');

  // Demonstrate sanitization
  const sensitiveData = {
    clientSecret: 'super_secret_value',
    accessToken: 'Bearer token123',
    password: 'mypassword',
    apiKey: 'key_12345',
    normalData: 'this is visible',
  };

  customLogger.debug('Logging sensitive data', sensitiveData);
  console.log('✓ Sensitive fields are automatically masked in logs\n');

  console.log('═'.repeat(80) + '\n');
  console.log('✅ All logging examples completed!\n');

  console.log('📚 Log Levels (in order):');
  console.log('  1. ERROR (0) - Only errors');
  console.log('  2. WARN (1) - Warnings + errors (default)');
  console.log('  3. INFO (2) - Info + warnings + errors');
  console.log('  4. DEBUG (3) - Debug + HTTP requests + all above');
  console.log('  5. TRACE (4) - Everything (most verbose)\n');

  console.log('📚 Best Practices:');
  console.log('  • Use WARN in production');
  console.log('  • Use INFO for general application logging');
  console.log('  • Use DEBUG when troubleshooting');
  console.log('  • Use TRACE only for deep debugging');
  console.log('  • Never log sensitive data manually');
  console.log('  • Use structured logging (JSON) for analysis\n');

  console.log('📚 Debugging Checklist:');
  console.log('  1. ✓ Enable debug logging: PORT_LOG_LEVEL=debug');
  console.log('  2. ✓ Check authentication credentials');
  console.log('  3. ✓ Verify base URL and region');
  console.log('  4. ✓ Inspect HTTP request/response');
  console.log('  5. ✓ Check for rate limiting (429)');
  console.log('  6. ✓ Review error messages and codes');
  console.log('  7. ✓ Test with simple operations first\n');

  console.log('📚 Next Steps:');
  console.log('  • Try example 17-proxy-config.ts for proxy setup');
  console.log('  • Read docs/guides/debugging.md for more tips\n');
}

main().catch(console.error);

