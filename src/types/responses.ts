/**
 * API Response types
 * These represent the actual API response structure from Port.io
 */

import type { Blueprint } from './blueprints';
import type { Entity } from './entities';
import type { Action, ActionRun } from './actions';
import type { Scorecard } from './scorecards';
import type { Integration, IntegrationLog } from './integrations';
import type {
  Organization,
  OrganizationSecret,
  OrganizationSettings,
} from './organization';
import type { App, AppSecret } from './apps';
import type { Migration } from './migrations';

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

/**
 * Integration API responses
 */
export interface ApiIntegrationResponse {
  integration: Integration | ApiIntegration;
  ok?: boolean;
}

export interface ApiIntegrationsResponse {
  integrations: (Integration | ApiIntegration)[];
  ok?: boolean;
}

export interface ApiIntegrationLogsResponse {
  logs: IntegrationLog[];
  ok?: boolean;
}

/**
 * Raw API Integration type (before transformation)
 */
export interface ApiIntegration extends Omit<Integration, 'createdAt' | 'updatedAt'> {
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Organization API responses
 */
export interface ApiOrganizationResponse {
  organization: Organization | ApiOrganization;
  ok?: boolean;
}

export interface ApiOrganizationSecretsResponse {
  secrets: (OrganizationSecret | ApiOrganizationSecret)[];
  ok?: boolean;
}

export interface ApiOrganizationSecretResponse {
  secret: OrganizationSecret | ApiOrganizationSecret;
  ok?: boolean;
}

/**
 * Raw API Organization type (before transformation)
 */
export interface ApiOrganization extends Omit<Organization, 'settings'> {
  settings?: Omit<OrganizationSettings, 'supportUserExpiresAt'> & {
    supportUserExpiresAt?: string;
  };
}

/**
 * Raw API Organization Secret type (before transformation)
 */
export interface ApiOrganizationSecret extends Omit<OrganizationSecret, 'createdAt' | 'updatedAt'> {
  createdAt?: string;
  updatedAt?: string;
}

/**
 * App API responses
 */
export interface ApiAppsResponse {
  apps: (App | ApiApp)[];
  ok?: boolean;
}

export interface ApiAppResponse {
  app: App | ApiApp;
  ok?: boolean;
}

export interface ApiAppSecretResponse {
  app: AppSecret | ApiAppSecret;
  ok?: boolean;
}

/**
 * Raw API App type (before transformation)
 */
export interface ApiApp extends Omit<App, 'createdAt' | 'updatedAt'> {
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Raw API App Secret type (before transformation)
 */
export interface ApiAppSecret extends Omit<AppSecret, 'createdAt' | 'updatedAt'> {
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Migration API responses
 */
export interface ApiMigrationsResponse {
  migrations: (Migration | ApiMigration)[];
  ok?: boolean;
}

export interface ApiMigrationResponse {
  migration: Migration | ApiMigration;
  ok?: boolean;
}

/**
 * Raw API Migration type (before transformation)
 */
export interface ApiMigration extends Omit<Migration, 'createdAt' | 'updatedAt' | 'completedAt'> {
  createdAt?: string;
  updatedAt?: string;
  completedAt?: string;
}

/**
 * Authentication API responses
 */
export interface ApiAccessTokenResponse {
  accessToken: string;
  expiresIn: number;
  tokenType: string;
  ok?: boolean;
}

