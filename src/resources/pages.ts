/**
 * Page resource for Port API
 * Handles page and dashboard CRUD operations and widget management
 */

import { BaseResource } from './base';
import { PortValidationError } from '../errors';
import type {
  Page,
  CreatePageInput,
  UpdatePageInput,
  ListPageOptions,
  PageWidget
} from '../types/pages';
import type {
  ApiPageResponse,
  ApiPagesResponse,
  ApiPage,
  ApiWidgetResponse,
  ApiWidget
} from '../types/responses';
import type { RequestOptions } from '../http-client';

/**
 * PageResource provides methods for managing Port pages and dashboards
 */
export class PageResource extends BaseResource {
  private readonly basePath = '/v1/pages';

  /**
   * Create a new page
   * 
   * @param data - Page creation data
   * @param options - Optional request options
   * @returns The created page
   * 
   * @example
   * ```typescript
   * const page = await client.pages.create({
   *   identifier: 'my-dashboard',
   *   title: 'My Dashboard',
   *   widgets: []
   * });
   * ```
   */
  async create(data: CreatePageInput, options?: RequestOptions): Promise<Page> {
    this.validateCreateInput(data);
    const response = await this.httpClient.post<ApiPageResponse>(this.basePath, data, options);
    return this.transformPage(response.page);
  }

  /**
   * Get a page by identifier
   * 
   * @param identifier - Page identifier
   * @param options - Optional request options
   * @returns The page
   */
  async get(identifier: string, options?: RequestOptions): Promise<Page> {
    this.validateIdentifier(identifier);
    const response = await this.httpClient.get<ApiPageResponse>(
      `${this.basePath}/${encodeURIComponent(identifier)}`,
      options
    );
    return this.transformPage(response.page);
  }

  /**
   * Update a page
   * 
   * @param identifier - Page identifier
   * @param data - Fields to update
   * @param options - Optional request options
   * @returns The updated page
   */
  async update(identifier: string, data: UpdatePageInput, options?: RequestOptions): Promise<Page> {
    this.validateIdentifier(identifier);
    const response = await this.httpClient.patch<ApiPageResponse>(
      `${this.basePath}/${encodeURIComponent(identifier)}`,
      data,
      options
    );
    return this.transformPage(response.page);
  }

  /**
   * Delete a page
   * 
   * @param identifier - Page identifier
   * @param options - Optional request options
   */
  async delete(identifier: string, options?: RequestOptions): Promise<void> {
    this.validateIdentifier(identifier);
    await this.httpClient.delete(`${this.basePath}/${encodeURIComponent(identifier)}`, options);
  }

  /**
   * List all pages
   * 
   * @param options - List options (e.g. compact)
   * @returns Array of pages
   */
  async list(options?: ListPageOptions & { requestOptions?: RequestOptions }): Promise<Page[]> {
    const url = this.buildUrl(this.basePath, { compact: options?.compact });
    const response = await this.httpClient.get<ApiPagesResponse>(url, options?.requestOptions);
    return (response.pages || []).map((page) => this.transformPage(page));
  }

  /**
   * Create a widget in a page
   * 
   * @param pageIdentifier - Page identifier
   * @param widget - Widget configuration
   * @param options - Optional request options
   * @returns The created widget
   */
  async createWidget(pageIdentifier: string, widget: PageWidget, options?: RequestOptions): Promise<PageWidget> {
    this.validateIdentifier(pageIdentifier);
    const response = await this.httpClient.post<ApiWidgetResponse>(
      `${this.basePath}/${encodeURIComponent(pageIdentifier)}/widgets`,
      { widget },
      options
    );
    return this.transformWidget(response.widget);
  }

  /**
   * Update a widget in a page
   * 
   * @param pageIdentifier - Page identifier
   * @param widgetId - Widget ID
   * @param widget - Fields to update
   * @param options - Optional request options
   * @returns The updated widget
   */
  async updateWidget(pageIdentifier: string, widgetId: string, widget: Partial<PageWidget>, options?: RequestOptions): Promise<PageWidget> {
    this.validateIdentifier(pageIdentifier);
    if (!widgetId) {
      throw new PortValidationError('Widget ID is required', [
        { field: 'widgetId', message: 'Required field' },
      ]);
    }
    const response = await this.httpClient.patch<ApiWidgetResponse>(
      `${this.basePath}/${encodeURIComponent(pageIdentifier)}/widgets/${encodeURIComponent(widgetId)}`,
      { widget },
      options
    );
    return this.transformWidget(response.widget);
  }

  /**
   * Delete a widget from a page
   * 
   * @param pageIdentifier - Page identifier
   * @param widgetId - Widget ID
   * @param options - Optional request options
   */
  async deleteWidget(pageIdentifier: string, widgetId: string, options?: RequestOptions): Promise<void> {
    this.validateIdentifier(pageIdentifier);
    if (!widgetId) {
      throw new PortValidationError('Widget ID is required', [
        { field: 'widgetId', message: 'Required field' },
      ]);
    }
    await this.httpClient.delete(
      `${this.basePath}/${encodeURIComponent(pageIdentifier)}/widgets/${encodeURIComponent(widgetId)}`,
      options
    );
  }

  /**
   * Validate page identifier
   */
  private validateIdentifier(identifier: string): void {
    if (!identifier || identifier.trim() === '') {
      throw new PortValidationError('Page identifier is required', [
        { field: 'identifier', message: 'Required field' },
      ]);
    }
  }

  /**
   * Validate create input
   */
  private validateCreateInput(data: CreatePageInput): void {
    if (!data.identifier || data.identifier.trim() === '') {
      throw new PortValidationError('Page identifier is required', [
        { field: 'identifier', message: 'Required field' },
      ]);
    }
  }

  /**
   * Transform API page to SDK page
   */
  private transformPage(page: ApiPage | Page): Page {
    return this.transformTimestamps(page) as Page;
  }

  private transformWidget(widget: ApiWidget | PageWidget): PageWidget {
    return this.transformTimestamps(widget) as PageWidget;
  }
}
