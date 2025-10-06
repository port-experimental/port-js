import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Test environment
    environment: 'node',
    
    // Global test setup
    globals: true,
    
    // Include only performance tests
    include: ['tests/performance/**/*.test.ts'],
    
    // Exclude everything else
    exclude: [
      'node_modules',
      'dist',
      'tests/unit/**',
      'tests/integration/**',
    ],
    
    // Longer timeout for performance tests
    testTimeout: 60000, // 60 seconds
    
    // Sequential execution for accurate benchmarks
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true, // Run tests sequentially in a single process
      },
    },
    
    // Mock configuration
    mockReset: true,
    clearMocks: true,
    restoreMocks: true,
    
    // Reporter
    reporters: ['verbose'],
  },
});
