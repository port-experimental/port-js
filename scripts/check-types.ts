#!/usr/bin/env tsx
/**
 * Type checking script
 * 
 * Validates that hand-written SDK types are compatible with
 * auto-generated types from OpenAPI spec.
 * 
 * Usage:
 *   pnpm tsx scripts/check-types.ts
 */

import * as fs from 'fs';
import * as path from 'path';

interface TypeCheckResult {
  compatible: boolean;
  warnings: string[];
  errors: string[];
}

/**
 * Check if api.ts exists and is recent
 */
function checkApiTypesFile(): TypeCheckResult {
  const result: TypeCheckResult = {
    compatible: true,
    warnings: [],
    errors: [],
  };

  const apiTypesPath = path.join(__dirname, '../src/types/api.ts');
  
  if (!fs.existsSync(apiTypesPath)) {
    result.compatible = false;
    result.errors.push('api.ts not found. Run: pnpm generate-types');
    return result;
  }

  const stats = fs.statSync(apiTypesPath);
  const ageInDays = (Date.now() - stats.mtimeMs) / (1000 * 60 * 60 * 24);

  if (ageInDays > 30) {
    result.warnings.push(
      `api.ts is ${Math.floor(ageInDays)} days old. Consider regenerating: pnpm generate-types`
    );
  }

  const sizeInMB = stats.size / (1024 * 1024);
  console.log(`✓ api.ts found (${sizeInMB.toFixed(2)} MB, ${Math.floor(ageInDays)} days old)`);

  return result;
}

/**
 * Check if hand-written type files exist
 */
function checkHandWrittenTypes(): TypeCheckResult {
  const result: TypeCheckResult = {
    compatible: true,
    warnings: [],
    errors: [],
  };

  const typeFiles = [
    'common.ts',
    'entities.ts',
    'blueprints.ts',
    'actions.ts',
    'scorecards.ts',
    'index.ts',
  ];

  for (const file of typeFiles) {
    const filePath = path.join(__dirname, '../src/types', file);
    if (!fs.existsSync(filePath)) {
      result.compatible = false;
      result.errors.push(`Missing type file: src/types/${file}`);
    } else {
      console.log(`✓ ${file} found`);
    }
  }

  return result;
}

/**
 * Check TypeScript compilation
 */
function checkTypeScriptCompilation(): TypeCheckResult {
  const result: TypeCheckResult = {
    compatible: true,
    warnings: [],
    errors: [],
  };

  console.log('\nChecking TypeScript compilation...');
  
  try {
    const { execSync } = require('child_process');
    execSync('pnpm type-check', { 
      stdio: 'pipe',
      cwd: path.join(__dirname, '..'),
    });
    console.log('✓ TypeScript compilation successful');
  } catch (error: any) {
    result.compatible = false;
    result.errors.push('TypeScript compilation failed');
    if (error.stdout) {
      result.errors.push(error.stdout.toString());
    }
  }

  return result;
}

/**
 * Main check function
 */
function main() {
  console.log('🔍 Checking Port SDK Type Compatibility\n');
  console.log('=' .repeat(60));
  
  const results: TypeCheckResult[] = [];

  // Check 1: API types file
  console.log('\n📄 Checking auto-generated types...');
  results.push(checkApiTypesFile());

  // Check 2: Hand-written types
  console.log('\n📝 Checking hand-written types...');
  results.push(checkHandWrittenTypes());

  // Check 3: TypeScript compilation
  results.push(checkTypeScriptCompilation());

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Summary:\n');

  const allErrors = results.flatMap(r => r.errors);
  const allWarnings = results.flatMap(r => r.warnings);

  if (allErrors.length === 0) {
    console.log('✅ All type checks passed!');
  } else {
    console.log('❌ Type check failed!\n');
    console.log('Errors:');
    allErrors.forEach(err => console.log(`  - ${err}`));
  }

  if (allWarnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    allWarnings.forEach(warn => console.log(`  - ${warn}`));
  }

  console.log('\n' + '='.repeat(60));

  // Exit with appropriate code
  if (allErrors.length > 0) {
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

