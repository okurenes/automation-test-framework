import { type Page, type Route, type Request } from '@playwright/test';
import { Logger } from './logger';

export interface NetworkLog {
  url: string;
  method: string;
  status: number;
  responseTime: number;
  timestamp: Date;
}

export class NetworkHelper {
  private readonly page: Page;
  private readonly logger = new Logger('NetworkHelper');
  private networkLogs: NetworkLog[] = [];
  private isMonitoring = false;

  constructor(page: Page) {
    this.page = page;
  }

  // ─── Request Interception ─────────────────────────────────────

  async blockImages(): Promise<void> {
    this.logger.info('Blocking image requests');
    await this.page.route('**/*.{png,jpg,jpeg,gif,svg,webp}', (route) => route.abort());
  }

  async blockAnalytics(): Promise<void> {
    this.logger.info('Blocking analytics requests');
    const analyticsPatterns = [
      '**/google-analytics.com/**',
      '**/googletagmanager.com/**',
      '**/facebook.net/**',
      '**/hotjar.com/**',
      '**/segment.com/**',
    ];
    for (const pattern of analyticsPatterns) {
      await this.page.route(pattern, (route) => route.abort());
    }
  }

  async mockApiResponse(
    urlPattern: string,
    responseData: unknown,
    status = 200,
  ): Promise<void> {
    this.logger.info(`Mocking API: ${urlPattern} -> ${status}`);
    await this.page.route(urlPattern, (route: Route) =>
      route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(responseData),
      }),
    );
  }

  async interceptAndModifyRequest(
    urlPattern: string,
    modifier: (route: Route, request: Request) => Promise<void>,
  ): Promise<void> {
    await this.page.route(urlPattern, modifier);
  }

  async simulateSlowNetwork(latencyMs = 3000): Promise<void> {
    this.logger.info(`Simulating slow network: ${latencyMs}ms latency`);
    await this.page.route('**/*', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, latencyMs));
      await route.continue();
    });
  }

  async simulateOffline(): Promise<void> {
    this.logger.info('Simulating offline mode');
    await this.page.context().setOffline(true);
  }

  async simulateOnline(): Promise<void> {
    this.logger.info('Restoring online mode');
    await this.page.context().setOffline(false);
  }

  // ─── Network Monitoring ───────────────────────────────────────

  startMonitoring(): void {
    if (this.isMonitoring) return;
    this.isMonitoring = true;
    this.networkLogs = [];
    this.logger.info('Network monitoring started');

    this.page.on('response', (response) => {
      const request = response.request();
      const timing = request.timing();
      this.networkLogs.push({
        url: request.url(),
        method: request.method(),
        status: response.status(),
        responseTime: timing.responseEnd - timing.requestStart,
        timestamp: new Date(),
      });
    });
  }

  stopMonitoring(): NetworkLog[] {
    this.isMonitoring = false;
    this.logger.info(`Network monitoring stopped. ${this.networkLogs.length} requests captured.`);
    return [...this.networkLogs];
  }

  getFailedRequests(): NetworkLog[] {
    return this.networkLogs.filter((log) => log.status >= 400);
  }

  getSlowRequests(thresholdMs = 3000): NetworkLog[] {
    return this.networkLogs.filter((log) => log.responseTime > thresholdMs);
  }

  getRequestsByUrl(urlPattern: string): NetworkLog[] {
    return this.networkLogs.filter((log) => log.url.includes(urlPattern));
  }

  clearLogs(): void {
    this.networkLogs = [];
  }

  // ─── Wait Helpers ─────────────────────────────────────────────

  async waitForApiCall(urlPattern: string, method = 'GET'): Promise<NetworkLog | undefined> {
    const response = await this.page.waitForResponse(
      (res) => res.url().includes(urlPattern) && res.request().method() === method,
    );
    const request = response.request();
    const timing = request.timing();
    return {
      url: request.url(),
      method: request.method(),
      status: response.status(),
      responseTime: timing.responseEnd - timing.requestStart,
      timestamp: new Date(),
    };
  }

  async waitForAllNetworkIdle(timeout = 5000): Promise<void> {
    await this.page.waitForLoadState('networkidle', { timeout });
  }
}
