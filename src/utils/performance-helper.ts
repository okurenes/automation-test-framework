import { type Page } from '@playwright/test';
import { Logger } from './logger';

export interface CoreWebVitals {
  LCP: number | null;   // Largest Contentful Paint (ms)
  FID: number | null;   // First Input Delay (ms)
  CLS: number | null;   // Cumulative Layout Shift
  FCP: number | null;   // First Contentful Paint (ms)
  TTFB: number | null;  // Time to First Byte (ms)
  TTI: number | null;   // Time to Interactive (ms)
}

export interface PageLoadMetrics {
  navigationStart: number;
  domContentLoaded: number;
  loadComplete: number;
  domInteractive: number;
  totalLoadTime: number;
  domContentLoadedTime: number;
  domInteractiveTime: number;
}

export interface ResourceMetrics {
  totalResources: number;
  totalSize: number;
  resourcesByType: Record<string, { count: number; size: number }>;
  slowestResources: Array<{ name: string; duration: number; size: number }>;
}

export interface PerformanceReport {
  url: string;
  timestamp: string;
  coreWebVitals: CoreWebVitals;
  pageLoadMetrics: PageLoadMetrics;
  resourceMetrics: ResourceMetrics;
}

// Thresholds based on Google's recommendations
export const PERFORMANCE_THRESHOLDS = {
  LCP: { good: 2500, needsImprovement: 4000 },
  FID: { good: 100, needsImprovement: 300 },
  CLS: { good: 0.1, needsImprovement: 0.25 },
  FCP: { good: 1800, needsImprovement: 3000 },
  TTFB: { good: 800, needsImprovement: 1800 },
  totalLoadTime: { good: 3000, needsImprovement: 5000 },
};

export class PerformanceHelper {
  private readonly page: Page;
  private readonly logger = new Logger('PerformanceHelper');

  constructor(page: Page) {
    this.page = page;
  }

  async getCoreWebVitals(): Promise<CoreWebVitals> {
    this.logger.info('Collecting Core Web Vitals...');

    const vitals = await this.page.evaluate(() => {
      return new Promise<CoreWebVitals>((resolve) => {
        const result: CoreWebVitals = {
          LCP: null,
          FID: null,
          CLS: null,
          FCP: null,
          TTFB: null,
          TTI: null,
        };

        // FCP from Performance API
        const paintEntries = performance.getEntriesByType('paint');
        const fcpEntry = paintEntries.find((e) => e.name === 'first-contentful-paint');
        if (fcpEntry) {
          result.FCP = Math.round(fcpEntry.startTime);
        }

        // TTFB from Navigation Timing
        const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
        if (navEntries.length > 0) {
          result.TTFB = Math.round(navEntries[0].responseStart - navEntries[0].requestStart);
        }

        // LCP via PerformanceObserver
        try {
          const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
          if (lcpEntries.length > 0) {
            result.LCP = Math.round(lcpEntries[lcpEntries.length - 1].startTime);
          }
        } catch {
          // LCP not available
        }

        // CLS via layout-shift entries
        try {
          const layoutShiftEntries = performance.getEntriesByType('layout-shift');
          if (layoutShiftEntries.length > 0) {
            let clsValue = 0;
            for (const entry of layoutShiftEntries) {
              if (!(entry as unknown as { hadRecentInput: boolean }).hadRecentInput) {
                clsValue += (entry as unknown as { value: number }).value;
              }
            }
            result.CLS = Math.round(clsValue * 1000) / 1000;
          }
        } catch {
          // CLS not available
        }

        // TTI approximation
        result.TTI = result.FCP
          ? Math.round(performance.now())
          : null;

        resolve(result);
      });
    });

    this.logger.info(`Core Web Vitals: LCP=${vitals.LCP}ms, FCP=${vitals.FCP}ms, CLS=${vitals.CLS}, TTFB=${vitals.TTFB}ms`);
    return vitals;
  }

  async getPageLoadMetrics(): Promise<PageLoadMetrics> {
    this.logger.info('Collecting page load metrics...');

    const metrics = await this.page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (!nav) {
        return {
          navigationStart: 0,
          domContentLoaded: 0,
          loadComplete: 0,
          domInteractive: 0,
          totalLoadTime: 0,
          domContentLoadedTime: 0,
          domInteractiveTime: 0,
        };
      }
      return {
        navigationStart: Math.round(nav.startTime),
        domContentLoaded: Math.round(nav.domContentLoadedEventEnd),
        loadComplete: Math.round(nav.loadEventEnd),
        domInteractive: Math.round(nav.domInteractive),
        totalLoadTime: Math.round(nav.loadEventEnd - nav.startTime),
        domContentLoadedTime: Math.round(nav.domContentLoadedEventEnd - nav.startTime),
        domInteractiveTime: Math.round(nav.domInteractive - nav.startTime),
      };
    });

    this.logger.info(`Page load: total=${metrics.totalLoadTime}ms, DOMContentLoaded=${metrics.domContentLoadedTime}ms`);
    return metrics;
  }

  async getResourceMetrics(): Promise<ResourceMetrics> {
    this.logger.info('Collecting resource metrics...');

    const metrics = await this.page.evaluate(() => {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      const byType: Record<string, { count: number; size: number }> = {};

      for (const r of resources) {
        const type = r.initiatorType || 'other';
        if (!byType[type]) {
          byType[type] = { count: 0, size: 0 };
        }
        byType[type].count++;
        byType[type].size += r.transferSize || 0;
      }

      const slowest = [...resources]
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 5)
        .map((r) => ({
          name: r.name.split('/').pop() || r.name,
          duration: Math.round(r.duration),
          size: r.transferSize || 0,
        }));

      return {
        totalResources: resources.length,
        totalSize: resources.reduce((sum, r) => sum + (r.transferSize || 0), 0),
        resourcesByType: byType,
        slowestResources: slowest,
      };
    });

    this.logger.info(`Resources: ${metrics.totalResources} total, ${(metrics.totalSize / 1024).toFixed(1)}KB`);
    return metrics;
  }

  async getFullReport(): Promise<PerformanceReport> {
    const [coreWebVitals, pageLoadMetrics, resourceMetrics] = await Promise.all([
      this.getCoreWebVitals(),
      this.getPageLoadMetrics(),
      this.getResourceMetrics(),
    ]);

    return {
      url: this.page.url(),
      timestamp: new Date().toISOString(),
      coreWebVitals,
      pageLoadMetrics,
      resourceMetrics,
    };
  }

  evaluateMetric(
    name: keyof typeof PERFORMANCE_THRESHOLDS,
    value: number | null,
  ): 'good' | 'needs-improvement' | 'poor' | 'unknown' {
    if (value === null) return 'unknown';
    const threshold = PERFORMANCE_THRESHOLDS[name];
    if (value <= threshold.good) return 'good';
    if (value <= threshold.needsImprovement) return 'needs-improvement';
    return 'poor';
  }

  formatReport(report: PerformanceReport): string {
    const v = report.coreWebVitals;
    const p = report.pageLoadMetrics;

    const lines: string[] = [
      '═══════════════════════════════════════════════════',
      '  PERFORMANCE REPORT',
      `  URL: ${report.url}`,
      '═══════════════════════════════════════════════════',
      '',
      '  Core Web Vitals:',
      `    LCP:  ${v.LCP !== null ? v.LCP + 'ms' : 'N/A'}  [${this.evaluateMetric('LCP', v.LCP)}]`,
      `    FCP:  ${v.FCP !== null ? v.FCP + 'ms' : 'N/A'}  [${this.evaluateMetric('FCP', v.FCP)}]`,
      `    CLS:  ${v.CLS !== null ? v.CLS : 'N/A'}  [${this.evaluateMetric('CLS', v.CLS)}]`,
      `    TTFB: ${v.TTFB !== null ? v.TTFB + 'ms' : 'N/A'}  [${this.evaluateMetric('TTFB', v.TTFB)}]`,
      '',
      '  Page Load:',
      `    Total Load Time:      ${p.totalLoadTime}ms  [${this.evaluateMetric('totalLoadTime', p.totalLoadTime)}]`,
      `    DOM Content Loaded:   ${p.domContentLoadedTime}ms`,
      `    DOM Interactive:      ${p.domInteractiveTime}ms`,
      '',
      '  Resources:',
      `    Total Resources: ${report.resourceMetrics.totalResources}`,
      `    Total Size:      ${(report.resourceMetrics.totalSize / 1024).toFixed(1)}KB`,
      '',
      '  Slowest Resources:',
    ];

    for (const r of report.resourceMetrics.slowestResources) {
      lines.push(`    ${r.name}: ${r.duration}ms (${(r.size / 1024).toFixed(1)}KB)`);
    }

    lines.push('═══════════════════════════════════════════════════');
    return lines.join('\n');
  }
}
