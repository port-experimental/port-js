/**
 * Blueprint-related types
 */

/**
 * Blueprint property types
 */
export type BlueprintPropertyType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'object'
  | 'array'
  | 'url'
  | 'email'
  | 'user'
  | 'team'
  | 'datetime'
  | 'timer';

/**
 * Blueprint property format
 */
export type BlueprintPropertyFormat =
  | 'date'
  | 'date-time'
  | 'yaml'
  | 'entity'
  | 'entity-format'
  | 'markdown';

/**
 * Blueprint property
 */
export interface BlueprintProperty {
  type: BlueprintPropertyType;
  title?: string;
  description?: string;
  required?: boolean;
  default?: unknown;
  enum?: unknown[];
  enumColors?: Record<string, string>;
  format?: BlueprintPropertyFormat | string;
  items?: BlueprintProperty;
  properties?: Record<string, BlueprintProperty>;
  icon?: string;
  spec?: string;
  specAuthentication?: Record<string, unknown>;
}

/**
 * Blueprint relation
 */
export interface BlueprintRelation {
  target: string;
  title?: string;
  description?: string;
  required?: boolean;
  many?: boolean;
}

/**
 * Blueprint mirror property
 */
export interface BlueprintMirrorProperty {
  title?: string;
  path: string;
}

/**
 * Blueprint calculation property
 */
export interface BlueprintCalculationProperty {
  title?: string;
  calculation: string;
  type: BlueprintPropertyType;
  colorized?: boolean;
  colors?: Record<string, string>;
}

/**
 * Aggregation function types
 */
export type AggregationFunction = 'count' | 'sum' | 'average' | 'min' | 'max';

/**
 * Blueprint aggregation property
 */
export interface BlueprintAggregationProperty {
  title?: string;
  target: string;
  query?: Record<string, unknown>;
  calculationSpec: {
    calculationBy: 'entities' | 'property';
    func: AggregationFunction;
    property?: string;
  };
}

/**
 * Blueprint changelog destination
 */
export interface BlueprintChangelogDestination {
  type: string;
  agent?: boolean;
  url?: string;
}

/**
 * Blueprint schema
 */
export interface BlueprintSchema {
  properties?: Record<string, BlueprintProperty>;
  required?: string[];
}

/**
 * Blueprint
 */
export interface Blueprint {
  identifier: string;
  title?: string;
  description?: string;
  icon?: string;
  schema?: BlueprintSchema;
  relations?: Record<string, BlueprintRelation>;
  mirrorProperties?: Record<string, BlueprintMirrorProperty>;
  calculationProperties?: Record<string, BlueprintCalculationProperty>;
  aggregationProperties?: Record<string, BlueprintAggregationProperty>;
  changelogDestination?: BlueprintChangelogDestination;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
}

/**
 * Create blueprint input
 */
export interface CreateBlueprintInput {
  identifier: string;
  title?: string;
  description?: string;
  icon?: string;
  schema?: BlueprintSchema;
  relations?: Record<string, BlueprintRelation>;
  mirrorProperties?: Record<string, BlueprintMirrorProperty>;
  calculationProperties?: Record<string, BlueprintCalculationProperty>;
  aggregationProperties?: Record<string, BlueprintAggregationProperty>;
  changelogDestination?: BlueprintChangelogDestination;
}

/**
 * Update blueprint input
 */
export type UpdateBlueprintInput = Partial<CreateBlueprintInput>;

