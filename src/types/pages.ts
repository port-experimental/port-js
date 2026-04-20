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
  | 'workflow-runs-history-table'
  | 'run-info'
  | 'user-info'
  | 'graph-entities-explorer'
  | 'bar-chart'
  | 'entities-pie-chart'
  | 'line-chart'
  | 'entities-number-chart'
  | 'iframe-widget'
  | 'markdown'
  | 'team-info'
  | 'recently-viewed-entities'
  | 'recently-used-actions'
  | 'my-entities'
  | 'grouper'
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
  type: PageWidgetType | (string & {});
  title?: string;
  description?: string;
  icon?: string;
  blueprint?: string;
  entity?: string;
  agentIdentifier?: string;
  useMCP?: boolean;
  actions?: Array<{ action: string }>;
  links?: Array<{ title: string; description?: string; url: string; icon?: string }>;
  dataset?: Record<string, unknown>;
  calculationBy?: 'entities' | 'property';
  unit?: 'none' | '$' | '€' | '£' | '%' | 'custom' | (string & {});
  chartType?: string;
  timeInterval?: 'hour' | 'day' | 'isoWeek' | 'month' | 'quarter' | (string & {});
  timeRange?: {
    preset: string;
  };
  query?: Record<string, unknown>;
  tableConfig?: Record<string, unknown>;
  [key: string]: unknown;
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
  layout?: Record<string, unknown>[];
  showInSidebar?: boolean;
  section?: string;
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
  layout?: Record<string, unknown>[];
  showInSidebar?: boolean;
  section?: string;
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
