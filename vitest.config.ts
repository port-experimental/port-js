import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Test environment
    environment: 'node',
    
    // Global test setup
    globals: true,
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'json-summary', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'dist/',
        'tests/',
        'examples/',
        '**/*.test.ts',
        '**/*.config.ts',
        '**/types/**', // Type-only files
        'scripts/**', // Build scripts
        '**/*-config.ts', // Config files
        '**/http-client.ts', // Tested indirectly via all resource tests
      ],
      thresholds: {
        // Global thresholds
        statements: 65,
        branches: 80,
        functions: 57,
        lines: 65,
        // Per-file thresholds
        perFile: true,
      },
      all: true,
    },
    
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

