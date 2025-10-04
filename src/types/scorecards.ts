/**
 * Scorecard-related types
 */

/**
 * Scorecard level colors
 */
export type ScorecardLevelColor =
  | 'paleBlue'
  | 'blue'
  | 'turquoise'
  | 'green'
  | 'yellow'
  | 'orange'
  | 'red'
  | 'pink'
  | 'purple'
  | 'darkGray'
  | 'lightGray';

/**
 * Scorecard level
 */
export interface ScorecardLevel {
  color: ScorecardLevelColor | string;
  title: string;
}

/**
 * Scorecard rule query
 */
export interface ScorecardRuleQuery {
  property?: string;
  operator?: string;
  value?: unknown;
  combinator?: 'and' | 'or';
  conditions?: ScorecardRuleQuery[];
}

/**
 * Scorecard rule
 */
export interface ScorecardRule {
  identifier: string;
  title: string;
  description?: string;
  level: string;
  query?: ScorecardRuleQuery;
}

/**
 * Scorecard
 */
export interface Scorecard {
  identifier: string;
  title?: string;
  blueprint: string;
  levels?: ScorecardLevel[];
  rules?: ScorecardRule[];
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
}

/**
 * Create scorecard input
 */
export interface CreateScorecardInput {
  identifier: string;
  title?: string;
  blueprint: string;
  levels?: ScorecardLevel[];
  rules?: ScorecardRule[];
}

/**
 * Update scorecard input
 */
export type UpdateScorecardInput = Partial<Omit<CreateScorecardInput, 'identifier'>>;

