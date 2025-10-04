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
        'smoke-tests/**', // Manual verification scripts
        '**/*.test.ts',
        '**/*.config.ts',
        '**/types/**', // Type-only files
        'scripts/**', // Build scripts
        '**/*-config.ts', // Config files
      ],
      thresholds: {
        // Global thresholds - realistic based on current coverage
        statements: 75,
        branches: 78,
        functions: 85,
        lines: 75,
        // Per-file thresholds
        perFile: false, // Disable per-file to allow some files to be lower
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

