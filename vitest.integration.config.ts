import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Test environment
    environment: 'node',
    
    // Global test setup
    globals: true,
    
    // Include only integration tests
    include: ['tests/integration/**/*.test.ts'],
    
    // Exclude unit tests
    exclude: [
      'node_modules',
      'dist',
      'tests/unit/**',
    ],
    
    // Longer timeout for integration tests
    testTimeout: 60000,
    
    // Run integration tests sequentially (they may hit real API)
    // threads: false,
    
    // Reporter
    reporters: ['verbose'],
    
    // Setup for integration tests
    setupFiles: ['./tests/integration/setup.ts'],
  },
});

