/**
 * API Response types
 * These represent the actual API response structure from Port.io
 */

import type { Blueprint } from './blueprints';
import type { Entity } from './entities';
import type { Action, ActionRun } from './actions';
import type { Scorecard } from './scorecards';

/**
 * Single item response wrapper
 */
export interface ApiItemResponse<T> {
  ok?: boolean;
  [key: string]: T | boolean | undefined;
}

/**
 * List response wrapper
 */
export interface ApiListResponse<T> {
  ok?: boolean;
  [key: string]: T[] | boolean | undefined;
}

/**
 * Blueprint API responses
 */
export interface ApiBlueprintResponse {
  blueprint: Blueprint | ApiBlueprint;
  ok?: boolean;
}

export interface ApiBlueprintsResponse {
  blueprints: (Blueprint | ApiBlueprint)[];
  ok?: boolean;
}

export interface ApiBlueprintRelationsResponse {
  relations: any[];
  ok?: boolean;
}

/**
 * Raw API Blueprint type (before transformation)
 */
export interface ApiBlueprint extends Omit<Blueprint, 'createdAt' | 'updatedAt'> {
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Entity API responses
 */
export interface ApiEntityResponse {
  entity: Entity | ApiEntity;
  ok?: boolean;
}

export interface ApiEntitiesResponse {
  entities: (Entity | ApiEntity)[];
  ok?: boolean;
}

/**
 * Raw API Entity type (before transformation)
 */
export interface ApiEntity extends Omit<Entity, 'createdAt' | 'updatedAt'> {
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Action API responses
 */
export interface ApiActionResponse {
  action: Action | ApiAction;
  ok?: boolean;
}

export interface ApiActionsResponse {
  actions: (Action | ApiAction)[];
  ok?: boolean;
}

export interface ApiActionRunResponse {
  run: ActionRun | ApiActionRun;
  ok?: boolean;
}

export interface ApiActionRunsResponse {
  runs: (ActionRun | ApiActionRun)[];
  ok?: boolean;
}

/**
 * Raw API Action types (before transformation)
 */
export interface ApiAction extends Omit<Action, 'createdAt' | 'updatedAt'> {
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiActionRun extends Omit<ActionRun, 'createdAt' | 'triggeredAt'> {
  createdAt?: string;
  triggeredAt?: string;
}

/**
 * Scorecard API responses
 */
export interface ApiScorecardResponse {
  scorecard: Scorecard | ApiScorecard;
  ok?: boolean;
}

export interface ApiScorecardsResponse {
  scorecards: (Scorecard | ApiScorecard)[];
  ok?: boolean;
}

/**
 * Raw API Scorecard type (before transformation)
 */
export interface ApiScorecard extends Omit<Scorecard, 'createdAt' | 'updatedAt'> {
  createdAt?: string;
  updatedAt?: string;
}

