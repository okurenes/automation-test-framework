import { type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { Logger } from './logger';

export interface AccessibilityViolation {
  id: string;
  impact: string;
  description: string;
  helpUrl: string;
  nodes: number;
  tags: string[];
}

export interface AccessibilityReport {
  violations: AccessibilityViolation[];
  passes: number;
  incomplete: number;
  inapplicable: number;
  totalViolations: number;
  criticalCount: number;
  seriousCount: number;
  moderateCount: number;
  minorCount: number;
}

export class AccessibilityHelper {
  private readonly page: Page;
  private readonly logger = new Logger('AccessibilityHelper');

  constructor(page: Page) {
    this.page = page;
  }

  async analyze(options?: {
    include?: string[];
    exclude?: string[];
    tags?: string[];
    disableRules?: string[];
  }): Promise<AccessibilityReport> {
    this.logger.info('Running accessibility analysis...');

    let builder = new AxeBuilder({ page: this.page });

    if (options?.include) {
      for (const selector of options.include) {
        builder = builder.include(selector);
      }
    }

    if (options?.exclude) {
      for (const selector of options.exclude) {
        builder = builder.exclude(selector);
      }
    }

    if (options?.tags) {
      builder = builder.withTags(options.tags);
    }

    if (options?.disableRules) {
      builder = builder.disableRules(options.disableRules);
    }

    const results = await builder.analyze();

    const violations: AccessibilityViolation[] = results.violations.map((v) => ({
      id: v.id,
      impact: v.impact || 'unknown',
      description: v.description,
      helpUrl: v.helpUrl,
      nodes: v.nodes.length,
      tags: v.tags,
    }));

    const report: AccessibilityReport = {
      violations,
      passes: results.passes.length,
      incomplete: results.incomplete.length,
      inapplicable: results.inapplicable.length,
      totalViolations: violations.length,
      criticalCount: violations.filter((v) => v.impact === 'critical').length,
      seriousCount: violations.filter((v) => v.impact === 'serious').length,
      moderateCount: violations.filter((v) => v.impact === 'moderate').length,
      minorCount: violations.filter((v) => v.impact === 'minor').length,
    };

    this.logger.info(
      `A11y analysis complete: ${report.totalViolations} violations, ${report.passes} passes`,
    );

    if (report.criticalCount > 0) {
      this.logger.error(`Found ${report.criticalCount} CRITICAL accessibility violations!`);
    }

    return report;
  }

  async analyzeWCAG2A(): Promise<AccessibilityReport> {
    return this.analyze({ tags: ['wcag2a'] });
  }

  async analyzeWCAG2AA(): Promise<AccessibilityReport> {
    return this.analyze({ tags: ['wcag2a', 'wcag2aa'] });
  }

  async analyzeWCAG2AAA(): Promise<AccessibilityReport> {
    return this.analyze({ tags: ['wcag2a', 'wcag2aa', 'wcag2aaa'] });
  }

  async analyzeBestPractices(): Promise<AccessibilityReport> {
    return this.analyze({ tags: ['best-practice'] });
  }

  async analyzeSection(selector: string): Promise<AccessibilityReport> {
    return this.analyze({ include: [selector] });
  }

  formatReport(report: AccessibilityReport): string {
    const lines: string[] = [
      '═══════════════════════════════════════════════════',
      '  ACCESSIBILITY REPORT',
      '═══════════════════════════════════════════════════',
      `  Passes:      ${report.passes}`,
      `  Violations:  ${report.totalViolations}`,
      `  Incomplete:  ${report.incomplete}`,
      `  Inapplicable: ${report.inapplicable}`,
      '───────────────────────────────────────────────────',
      `  Critical:  ${report.criticalCount}`,
      `  Serious:   ${report.seriousCount}`,
      `  Moderate:  ${report.moderateCount}`,
      `  Minor:     ${report.minorCount}`,
      '═══════════════════════════════════════════════════',
    ];

    if (report.violations.length > 0) {
      lines.push('', '  VIOLATION DETAILS:');
      for (const v of report.violations) {
        lines.push(
          `  [${v.impact.toUpperCase()}] ${v.id}`,
          `    ${v.description}`,
          `    Affected elements: ${v.nodes}`,
          `    Help: ${v.helpUrl}`,
          '',
        );
      }
    }

    return lines.join('\n');
  }
}
