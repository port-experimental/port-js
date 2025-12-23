/**
 * Page-related types
 */

/**
 * Page widget types
 */
export type PageWidgetType =
  | 'ai-agent'
  | 'entity-info'
  | 'entity-details'
  | 'action-runs-table-widget'
  | 'action-card-widget'
  | 'links-widget'
  | 'table-entities-explorer'
  | 'table-entities-explorer-by-direction'
  | 'table-audit-log'
  | 'users-table'
  | 'teams-table'
  | 'runs-table'
  | 'markdown-widget'
  | 'v2-pie-chart-widget'
  | 'v2-bar-chart-widget'
  | 'v2-line-chart-widget'
  | 'v2-number-chart-widget';

/**
 * Page widget interface (simplified, using any for complex configs for now)
 * In a real-world scenario, we might want to define each widget type specifically.
 */
export interface PageWidget {
  id?: string;
  type: PageWidgetType | string;
  title?: string;
  description?: string;
  icon?: string;
  [key: string]: any;
}

/**
 * Page interface
 */
export interface Page {
  identifier: string;
  blueprint?: string;
  title?: string;
  description?: string;
  icon?: string;
  sidebar?: 'catalog' | null | string;
  parent?: string | null;
  after?: string | null;
  locked?: boolean;
  requiredQueryParams?: string[];
  widgets?: PageWidget[];
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
}

/**
 * Create page input
 */
export interface CreatePageInput {
  identifier: string;
  blueprint?: string;
  title?: string;
  description?: string;
  icon?: string;
  sidebar?: 'catalog' | null | string;
  parent?: string | null;
  after?: string | null;
  locked?: boolean;
  requiredQueryParams?: string[];
  widgets?: PageWidget[];
}

/**
 * Update page input
 */
export type UpdatePageInput = Partial<CreatePageInput>;

/**
 * List pages options
 */
export interface ListPageOptions {
  compact?: boolean;
}
