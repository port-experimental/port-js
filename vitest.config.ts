import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Test environment
    environment: 'node',
    
    // Global test setup
    globals: true,
    
    // Include only unit tests by default
    include: ['tests/unit/**/*.test.ts'],
    
    // Exclude integration tests
    exclude: [
      'node_modules',
      'dist',
      'tests/integration/**',
    ],
    
    // Test timeout
    testTimeout: 10000,
    
    // Parallel execution
    // threads: true,
    // maxThreads: 4,
    // minThreads: 1,
    
    // Mock configuration
    mockReset: true,
    clearMocks: true,
    restoreMocks: true,
    
    // Reporter
    reporters: ['verbose'],
  },
});

