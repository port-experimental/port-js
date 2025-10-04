/**
 * Types for Port Scorecards
 */

/**
 * Scorecard rule level
 */
export type ScorecardLevel = 'Bronze' | 'Silver' | 'Gold';

/**
 * Query combinator
 */
export type QueryCombinator = 'and' | 'or';

/**
 * Query operator
 */
export type QueryOperator =
  | '='
  | '!='
  | '<'
  | '>'
  | '<='
  | '>='
  | 'contains'
  | 'doesNotContains'
  | 'isEmpty'
  | 'isNotEmpty'
  | 'in'
  | 'notIn'
  | 'between'
  | 'notBetween';

/**
 * Scorecard rule query condition
 */
export interface ScorecardQueryCondition {
  property: string;
  operator: QueryOperator;
  value?: unknown;
}

/**
 * Scorecard rule query
 */
export interface ScorecardQuery {
  combinator: QueryCombinator;
  conditions: ScorecardQueryCondition[];
}

/**
 * Scorecard rule
 */
export interface ScorecardRule {
  identifier: string;
  title: string;
  description?: string;
  level: ScorecardLevel;
  query: ScorecardQuery;
}

/**
 * Scorecard
 */
export interface Scorecard {
  identifier: string;
  title: string;
  description?: string;
  blueprint: string;
  rules: ScorecardRule[];
  createdAt: Date | string;
  updatedAt: Date | string;
  createdBy?: string;
  updatedBy?: string;
}

/**
 * Input for creating a scorecard
 */
export interface CreateScorecardInput {
  identifier: string;
  title: string;
  description?: string;
  blueprint: string;
  rules: ScorecardRule[];
}

/**
 * Input for updating a scorecard
 */
export interface UpdateScorecardInput {
  title?: string;
  description?: string;
  rules?: ScorecardRule[];
}
