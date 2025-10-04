/**
 * Public type definitions for Port SDK
 * 
 * This file exports all user-facing types in an organized manner.
 * The large auto-generated `api.ts` file is kept separate and is not
 * meant to be imported directly by SDK users.
 * 
 * @packageDocumentation
 */

// Re-export organized types from domain-specific files
export * from './common';
export * from './entities';
export * from './blueprints';
export * from './actions';
export * from './scorecards';

/**
 * Note about types/api.ts:
 * 
 * The `types/api.ts` file is auto-generated from the OpenAPI specification
 * and contains 22,000+ lines. This is intentional and expected for
 * auto-generated code.
 * 
 * SDK users should import from this index file or the specific domain files:
 * - types/common.ts - Common types (pagination, search, etc.)
 * - types/entities.ts - Entity-related types
 * - types/blueprints.ts - Blueprint-related types
 * - types/actions.ts - Action-related types
 * - types/scorecards.ts - Scorecard-related types
 * 
 * The auto-generated types/api.ts is used internally by the SDK but
 * rarely needs to be accessed directly.
 */

