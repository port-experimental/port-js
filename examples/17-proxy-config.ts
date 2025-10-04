/**
 * Example: Proxy Configuration
 * 
 * Description:
 * Demonstrates how to configure HTTP/HTTPS proxies for corporate networks
 * 
 * Prerequisites:
 * - Port.io account with API credentials
 * - Optional: Corporate proxy server
 * 
 * Run:
 * pnpm tsx examples/17-proxy-config.ts
 * 
 * Run with proxy environment variables:
 * HTTP_PROXY=http://proxy.example.com:8080 pnpm tsx examples/17-proxy-config.ts
 */

import { PortClient } from '../src';

async function main() {
  console.log('🌐 Port SDK - Proxy Configuration\n');
  console.log('═'.repeat(80) + '\n');

  // ========================================================================
  // Example 1: No Proxy (Direct Connection)
  // ========================================================================
  console.log('📝 Example 1: Direct Connection (No Proxy)\n');

  const directClient = new PortClient({
    credentials: {
      clientId: process.env.PORT_CLIENT_ID!,
      clientSecret: process.env.PORT_CLIENT_SECRET!,
    },
  });

  console.log('✓ Client created with direct connection');
  console.log('  No proxy configuration\n');

  // ========================================================================
  // Example 2: Explicit Proxy Configuration
  // ========================================================================
  console.log('📝 Example 2: Explicit Proxy Configuration\n');

  const proxyClient = new PortClient({
    credentials: {
      clientId: process.env.PORT_CLIENT_ID!,
      clientSecret: process.env.PORT_CLIENT_SECRET!,
    },
    proxy: {
      url: 'http://proxy.example.com:8080',
    },
  });

  console.log('✓ Client created with explicit proxy');
  console.log('  Proxy: http://proxy.example.com:8080');
  console.log('  Note: This example uses a fake proxy URL\n');

  // ========================================================================
  // Example 3: Proxy with Authentication
  // ========================================================================
  console.log('📝 Example 3: Proxy with Authentication\n');

  const authProxyClient = new PortClient({
    credentials: {
      clientId: process.env.PORT_CLIENT_ID!,
      clientSecret: process.env.PORT_CLIENT_SECRET!,
    },
    proxy: {
      url: 'http://proxy.example.com:8080',
      auth: {
        username: 'proxy_user',
        password: 'proxy_password',
      },
    },
  });

  console.log('✓ Client created with authenticated proxy');
  console.log('  Proxy: http://proxy.example.com:8080');
  console.log('  Authentication: Yes (credentials provided)\n');

  // ========================================================================
  // Example 4: Environment Variable Configuration
  // ========================================================================
  console.log('📝 Example 4: Environment Variable Configuration\n');

  console.log('The SDK automatically reads proxy settings from environment:');
  console.log('  HTTP_PROXY  - Proxy for HTTP requests');
  console.log('  HTTPS_PROXY - Proxy for HTTPS requests');
  console.log('  NO_PROXY    - Hosts to bypass proxy\n');

  console.log('Current environment variables:');
  console.log(`  HTTP_PROXY:  ${process.env.HTTP_PROXY || '(not set)'}`);
  console.log(`  HTTPS_PROXY: ${process.env.HTTPS_PROXY || '(not set)'}`);
  console.log(`  NO_PROXY:    ${process.env.NO_PROXY || '(not set)'}`);
  console.log('');

  const envClient = new PortClient({
    credentials: {
      clientId: process.env.PORT_CLIENT_ID!,
      clientSecret: process.env.PORT_CLIENT_SECRET!,
    },
    // No explicit proxy config - will use environment variables
  });

  console.log('✓ Client created using environment variable proxy config\n');

  // ========================================================================
  // Example 5: NO_PROXY Configuration
  // ========================================================================
  console.log('📝 Example 5: NO_PROXY Configuration\n');

  console.log('NO_PROXY bypasses proxy for specific hosts:');
  console.log('  NO_PROXY=localhost,127.0.0.1,.internal.com\n');

  console.log('Common NO_PROXY patterns:');
  console.log('  • localhost - Local machine');
  console.log('  • 127.0.0.1 - Loopback IP');
  console.log('  • .internal.com - Internal domain and subdomains');
  console.log('  • 192.168.0.0/16 - Private network range\n');

  // ========================================================================
  // Example 6: Testing Proxy Configuration
  // ========================================================================
  console.log('📝 Example 6: Testing Proxy Configuration\n');

  try {
    // Try to use the direct client (should work)
    console.log('Testing direct connection...');
    const blueprints = await directClient.blueprints.list();
    console.log(`✓ Success! Found ${blueprints.length} blueprints`);
  } catch (error) {
    console.log('✗ Failed - check credentials and network');
  }
  console.log('');

  // ========================================================================
  // Example 7: Proxy Configuration Precedence
  // ========================================================================
  console.log('📝 Example 7: Configuration Precedence\n');

  console.log('Proxy configuration priority (highest to lowest):');
  console.log('  1. Explicit config passed to PortClient constructor');
  console.log('  2. Environment variables (HTTP_PROXY, HTTPS_PROXY)');
  console.log('  3. No proxy (direct connection)\n');

  console.log('Example:');
  console.log('  const client = new PortClient({');
  console.log('    credentials: { ... },');
  console.log('    proxy: {  // ← This takes highest priority');
  console.log('      url: "http://proxy.corp.com:8080"');
  console.log('    }');
  console.log('  });\n');

  // ========================================================================
  // Example 8: Troubleshooting Proxy Issues
  // ========================================================================
  console.log('📝 Example 8: Troubleshooting Proxy Issues\n');

  console.log('Common proxy problems and solutions:\n');

  console.log('1. Connection timeout:');
  console.log('   • Check proxy URL and port');
  console.log('   • Verify proxy is reachable');
  console.log('   • Increase timeout: timeout: 60000\n');

  console.log('2. Authentication fails:');
  console.log('   • Verify proxy username/password');
  console.log('   • Check if proxy requires domain (DOMAIN\\username)');
  console.log('   • Try URL encoding: http://user%40domain:pass@proxy:8080\n');

  console.log('3. SSL/TLS errors:');
  console.log('   • Check if proxy supports HTTPS CONNECT method');
  console.log('   • Verify corporate SSL certificates are trusted\n');

  console.log('4. Connection works but API calls fail:');
  console.log('   • Check NO_PROXY doesn\'t exclude Port.io');
  console.log('   • Verify proxy allows api.port.io and api.us.port.io');
  console.log('   • Check firewall rules on proxy\n');

  // ========================================================================
  // Example 9: Corporate Network Setup
  // ========================================================================
  console.log('📝 Example 9: Corporate Network Setup\n');

  console.log('Typical corporate network setup:\n');

  console.log('# In your .env file:');
  console.log('PORT_CLIENT_ID=your_client_id');
  console.log('PORT_CLIENT_SECRET=your_client_secret');
  console.log('HTTP_PROXY=http://proxy.corp.com:8080');
  console.log('HTTPS_PROXY=http://proxy.corp.com:8080');
  console.log('NO_PROXY=localhost,127.0.0.1,.internal.corp.com\n');

  console.log('# In your code:');
  console.log('const client = new PortClient({');
  console.log('  credentials: {');
  console.log('    clientId: process.env.PORT_CLIENT_ID!,');
  console.log('    clientSecret: process.env.PORT_CLIENT_SECRET!,');
  console.log('  },');
  console.log('  // Proxy auto-configured from environment');
  console.log('});\n');

  // ========================================================================
  // Example 10: Proxy URL Formats
  // ========================================================================
  console.log('📝 Example 10: Proxy URL Formats\n');

  console.log('Supported proxy URL formats:\n');

  console.log('Basic:');
  console.log('  http://proxy.example.com:8080\n');

  console.log('With authentication:');
  console.log('  http://username:password@proxy.example.com:8080\n');

  console.log('HTTPS proxy:');
  console.log('  https://proxy.example.com:8443\n');

  console.log('With URL-encoded credentials:');
  console.log('  http://user%40domain.com:p%40ssw0rd@proxy:8080\n');

  console.log('SOCKS proxy (if supported):');
  console.log('  socks5://proxy.example.com:1080\n');

  console.log('═'.repeat(80) + '\n');
  console.log('✅ All proxy configuration examples completed!\n');

  console.log('📚 Proxy Types:');
  console.log('  • HTTP Proxy - Standard HTTP/HTTPS proxy');
  console.log('  • Authenticated Proxy - Requires username/password');
  console.log('  • Transparent Proxy - No configuration needed');
  console.log('  • Forward Proxy - Corporate network proxy\n');

  console.log('📚 Best Practices:');
  console.log('  1. Use environment variables for flexibility');
  console.log('  2. Don\'t hardcode proxy credentials');
  console.log('  3. Configure NO_PROXY for internal services');
  console.log('  4. Test proxy config with debug logging');
  console.log('  5. Use HTTPS for authenticated proxies');
  console.log('  6. Keep proxy credentials secure\n');

  console.log('📚 Quick Start Commands:');
  console.log('  # Set proxy for current session');
  console.log('  export HTTP_PROXY=http://proxy.corp.com:8080');
  console.log('  export HTTPS_PROXY=http://proxy.corp.com:8080\n');

  console.log('  # Run with proxy');
  console.log('  pnpm tsx your-script.ts\n');

  console.log('  # Debug proxy connection');
  console.log('  PORT_LOG_LEVEL=debug pnpm tsx your-script.ts\n');

  console.log('📚 Next Steps:');
  console.log('  • Try example 18-end-to-end.ts for complete workflow');
  console.log('  • Read docs/guides/proxy-setup.md for details\n');
}

main().catch(console.error);

