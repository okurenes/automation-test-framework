import { type APIRequestContext, type APIResponse, request } from '@playwright/test';
import { ENV } from '../../config/env.config';
import { Logger } from './logger';

export interface ApiRequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string>;
  data?: unknown;
  timeout?: number;
}

export class ApiHelper {
  private context: APIRequestContext | null = null;
  private readonly logger = new Logger('ApiHelper');
  private readonly baseURL: string;

  constructor(baseURL?: string) {
    this.baseURL = baseURL || ENV.apiBaseURL;
  }

  async init(): Promise<void> {
    this.context = await request.newContext({
      baseURL: this.baseURL,
      extraHTTPHeaders: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });
  }

  private getContext(): APIRequestContext {
    if (!this.context) {
      throw new Error('ApiHelper not initialized. Call init() first.');
    }
    return this.context;
  }

  async get(endpoint: string, options?: ApiRequestOptions): Promise<APIResponse> {
    this.logger.info(`GET ${endpoint}`);
    const response = await this.getContext().get(endpoint, {
      headers: options?.headers,
      params: options?.params,
      timeout: options?.timeout || 15000,
    });
    this.logger.info(`Response: ${response.status()} ${response.statusText()}`);
    return response;
  }

  async post(endpoint: string, options?: ApiRequestOptions): Promise<APIResponse> {
    this.logger.info(`POST ${endpoint}`);
    const response = await this.getContext().post(endpoint, {
      headers: options?.headers,
      data: options?.data,
      timeout: options?.timeout || 15000,
    });
    this.logger.info(`Response: ${response.status()} ${response.statusText()}`);
    return response;
  }

  async put(endpoint: string, options?: ApiRequestOptions): Promise<APIResponse> {
    this.logger.info(`PUT ${endpoint}`);
    const response = await this.getContext().put(endpoint, {
      headers: options?.headers,
      data: options?.data,
      timeout: options?.timeout || 15000,
    });
    this.logger.info(`Response: ${response.status()} ${response.statusText()}`);
    return response;
  }

  async patch(endpoint: string, options?: ApiRequestOptions): Promise<APIResponse> {
    this.logger.info(`PATCH ${endpoint}`);
    const response = await this.getContext().patch(endpoint, {
      headers: options?.headers,
      data: options?.data,
      timeout: options?.timeout || 15000,
    });
    this.logger.info(`Response: ${response.status()} ${response.statusText()}`);
    return response;
  }

  async delete(endpoint: string, options?: ApiRequestOptions): Promise<APIResponse> {
    this.logger.info(`DELETE ${endpoint}`);
    const response = await this.getContext().delete(endpoint, {
      headers: options?.headers,
      timeout: options?.timeout || 15000,
    });
    this.logger.info(`Response: ${response.status()} ${response.statusText()}`);
    return response;
  }

  async getJSON<T>(endpoint: string, options?: ApiRequestOptions): Promise<T> {
    const response = await this.get(endpoint, options);
    return response.json() as Promise<T>;
  }

  async postJSON<T>(endpoint: string, options?: ApiRequestOptions): Promise<T> {
    const response = await this.post(endpoint, options);
    return response.json() as Promise<T>;
  }

  async dispose(): Promise<void> {
    if (this.context) {
      await this.context.dispose();
      this.context = null;
    }
  }
}
