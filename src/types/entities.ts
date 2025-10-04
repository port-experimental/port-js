/**
 * Entity-related types
 */

import { PaginationOptions, SearchRule, SearchCombinator } from './common';

/**
 * Entity properties
 */
export interface EntityProperties {
  stringProps?: Record<string, string>;
  numberProps?: Record<string, number>;
  booleanProps?: Record<string, boolean>;
  arrayProps?: Record<string, unknown[]>;
  objectProps?: Record<string, Record<string, unknown>>;
}

/**
 * Entity relations
 */
export interface EntityRelations {
  singleRelations?: Record<string, string>;
  manyRelations?: Record<string, string[]>;
}

/**
 * Entity
 */
export interface Entity {
  identifier: string;
  blueprint: string;
  title?: string;
  team?: string;
  icon?: string;
  properties?: EntityProperties;
  relations?: EntityRelations;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
}

/**
 * Create entity input
 */
export interface CreateEntityInput {
  identifier: string;
  blueprint: string;
  title?: string;
  team?: string;
  icon?: string;
  properties?: EntityProperties;
  relations?: EntityRelations;
}

/**
 * Update entity input
 */
export interface UpdateEntityInput {
  title?: string;
  team?: string;
  icon?: string;
  properties?: EntityProperties;
  relations?: EntityRelations;
}

/**
 * List entities options
 */
export interface ListEntityOptions extends PaginationOptions {
  blueprint?: string;
  team?: string;
  include?: string[];
}

/**
 * Entity search query
 */
export interface EntitySearchQuery {
  blueprint?: string;
  search?: string;
  rules?: SearchRule[];
  combinator?: SearchCombinator;
  limit?: number;
  offset?: number;
  include?: string[];
}

/**
 * Batch update input for entities
 */
export interface BatchUpdateEntityInput {
  identifier: string;
  data: UpdateEntityInput;
}

