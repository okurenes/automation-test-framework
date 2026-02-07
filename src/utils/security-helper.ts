import { type Page, type Response } from '@playwright/test';
import { Logger } from './logger';

export interface SecurityHeader {
  name: string;
  value: string | null;
  expected: string;
  status: 'pass' | 'fail' | 'warn';
  description: string;
}

export interface XSSTestResult {
  payload: string;
  vulnerable: boolean;
  context: string;
}

export interface SecurityReport {
  url: string;
  headers: SecurityHeader[];
  passCount: number;
  failCount: number;
  warnCount: number;
}

export class SecurityHelper {
  private readonly page: Page;
  private readonly logger = new Logger('SecurityHelper');

  constructor(page: Page) {
    this.page = page;
  }

  // ─── Security Header Analysis ─────────────────────────────────

  async analyzeSecurityHeaders(response?: Response | null): Promise<SecurityReport> {
    this.logger.info('Analyzing security headers...');

    const resp = response || await this.page.goto(this.page.url());
    const headers = resp ? resp.headers() : {};

    const checks: SecurityHeader[] = [
      {
        name: 'Strict-Transport-Security',
        value: headers['strict-transport-security'] || null,
        expected: 'max-age=31536000; includeSubDomains',
        status: headers['strict-transport-security'] ? 'pass' : 'warn',
        description: 'HSTS: Forces HTTPS connections',
      },
      {
        name: 'X-Content-Type-Options',
        value: headers['x-content-type-options'] || null,
        expected: 'nosniff',
        status: headers['x-content-type-options'] === 'nosniff' ? 'pass' : 'fail',
        description: 'Prevents MIME type sniffing',
      },
      {
        name: 'X-Frame-Options',
        value: headers['x-frame-options'] || null,
        expected: 'DENY or SAMEORIGIN',
        status: headers['x-frame-options'] ? 'pass' : 'warn',
        description: 'Prevents clickjacking attacks',
      },
      {
        name: 'X-XSS-Protection',
        value: headers['x-xss-protection'] || null,
        expected: '1; mode=block',
        status: headers['x-xss-protection'] ? 'pass' : 'warn',
        description: 'XSS filter protection',
      },
      {
        name: 'Content-Security-Policy',
        value: headers['content-security-policy'] || null,
        expected: 'Present',
        status: headers['content-security-policy'] ? 'pass' : 'warn',
        description: 'CSP: Controls resource loading',
      },
      {
        name: 'Referrer-Policy',
        value: headers['referrer-policy'] || null,
        expected: 'strict-origin-when-cross-origin',
        status: headers['referrer-policy'] ? 'pass' : 'warn',
        description: 'Controls referrer information',
      },
      {
        name: 'Permissions-Policy',
        value: headers['permissions-policy'] || null,
        expected: 'Present',
        status: headers['permissions-policy'] ? 'pass' : 'warn',
        description: 'Controls browser feature permissions',
      },
      {
        name: 'Cache-Control',
        value: headers['cache-control'] || null,
        expected: 'no-store for sensitive pages',
        status: headers['cache-control'] ? 'pass' : 'warn',
        description: 'Controls caching behavior',
      },
    ];

    // Check for information disclosure headers
    const dangerousHeaders = ['server', 'x-powered-by', 'x-aspnet-version'];
    for (const h of dangerousHeaders) {
      if (headers[h]) {
        checks.push({
          name: h,
          value: headers[h],
          expected: 'Should not be present',
          status: 'fail',
          description: `Information disclosure: ${h} header exposes server info`,
        });
      }
    }

    const report: SecurityReport = {
      url: this.page.url(),
      headers: checks,
      passCount: checks.filter((c) => c.status === 'pass').length,
      failCount: checks.filter((c) => c.status === 'fail').length,
      warnCount: checks.filter((c) => c.status === 'warn').length,
    };

    this.logger.info(
      `Security headers: ${report.passCount} pass, ${report.failCount} fail, ${report.warnCount} warn`,
    );
    return report;
  }

  // ─── XSS Testing ─────────────────────────────────────────────

  getXSSPayloads(): string[] {
    return [
      '<script>alert("XSS")</script>',
      '"><script>alert("XSS")</script>',
      "'><script>alert('XSS')</script>",
      '<img src=x onerror=alert("XSS")>',
      '<svg onload=alert("XSS")>',
      'javascript:alert("XSS")',
      '<body onload=alert("XSS")>',
      '{{constructor.constructor("return this")().alert("XSS")}}',
      '<iframe src="javascript:alert(\'XSS\')">',
      '<input onfocus=alert("XSS") autofocus>',
    ];
  }

  async testXSSOnInput(
    inputSelector: string,
    submitSelector?: string,
  ): Promise<XSSTestResult[]> {
    this.logger.info(`Testing XSS on input: ${inputSelector}`);
    const results: XSSTestResult[] = [];
    const payloads = this.getXSSPayloads();

    for (const payload of payloads) {
      let dialogDetected = false;

      const dialogHandler = () => {
        dialogDetected = true;
      };

      this.page.on('dialog', dialogHandler);

      try {
        const input = this.page.locator(inputSelector);
        await input.waitFor({ state: 'visible', timeout: 5000 });
        await input.clear();
        await input.fill(payload);

        if (submitSelector) {
          await this.page.locator(submitSelector).click();
          await this.page.waitForTimeout(500);
        }

        // Check if payload is reflected unescaped in DOM
        const pageContent = await this.page.content();
        const isReflected = pageContent.includes(payload);

        results.push({
          payload,
          vulnerable: dialogDetected || isReflected,
          context: dialogDetected ? 'Script executed' : isReflected ? 'Reflected in DOM' : 'Safe',
        });

        if (dialogDetected) {
          this.logger.warn(`XSS VULNERABLE: Payload executed - ${payload.substring(0, 30)}...`);
        }
      } catch {
        results.push({
          payload,
          vulnerable: false,
          context: 'Input rejected',
        });
      } finally {
        this.page.removeListener('dialog', dialogHandler);
      }
    }

    return results;
  }

  // ─── SQL Injection Testing ────────────────────────────────────

  getSQLInjectionPayloads(): string[] {
    return [
      "' OR '1'='1",
      "' OR '1'='1' --",
      "' OR '1'='1' /*",
      "'; DROP TABLE users; --",
      "' UNION SELECT * FROM users --",
      "1' ORDER BY 1--+",
      "1 AND 1=1",
      "1' AND '1'='1",
      "admin'--",
      "1; WAITFOR DELAY '0:0:5'--",
    ];
  }

  async testSQLInjectionOnInput(
    inputSelector: string,
    submitSelector: string,
  ): Promise<Array<{ payload: string; suspicious: boolean; responseInfo: string }>> {
    this.logger.info(`Testing SQL injection on: ${inputSelector}`);
    const results: Array<{ payload: string; suspicious: boolean; responseInfo: string }> = [];
    const payloads = this.getSQLInjectionPayloads();

    for (const payload of payloads) {
      try {
        const input = this.page.locator(inputSelector);
        await input.waitFor({ state: 'visible', timeout: 5000 });
        await input.clear();
        await input.fill(payload);
        await this.page.locator(submitSelector).click();
        await this.page.waitForTimeout(500);

        const pageContent = await this.page.content();
        const suspiciousPatterns = [
          /sql/i,
          /syntax error/i,
          /mysql/i,
          /postgresql/i,
          /oracle/i,
          /sqlite/i,
          /database error/i,
          /unclosed quotation/i,
          /unexpected end/i,
        ];

        const isSuspicious = suspiciousPatterns.some((pattern) => pattern.test(pageContent));

        results.push({
          payload,
          suspicious: isSuspicious,
          responseInfo: isSuspicious ? 'Database error message detected' : 'No suspicious response',
        });

        if (isSuspicious) {
          this.logger.warn(`SQL INJECTION RISK: ${payload.substring(0, 30)}...`);
        }
      } catch {
        results.push({
          payload,
          suspicious: false,
          responseInfo: 'Input rejected or page error',
        });
      }
    }

    return results;
  }

  // ─── Cookie Security ──────────────────────────────────────────

  async analyzeCookieSecurity(): Promise<
    Array<{
      name: string;
      secure: boolean;
      httpOnly: boolean;
      sameSite: string;
      issues: string[];
    }>
  > {
    this.logger.info('Analyzing cookie security...');
    const cookies = await this.page.context().cookies();

    return cookies.map((cookie) => {
      const issues: string[] = [];
      if (!cookie.secure) issues.push('Missing Secure flag');
      if (!cookie.httpOnly) issues.push('Missing HttpOnly flag');
      if (!cookie.sameSite || cookie.sameSite === 'None') {
        issues.push('SameSite is None or missing');
      }
      return {
        name: cookie.name,
        secure: cookie.secure,
        httpOnly: cookie.httpOnly,
        sameSite: cookie.sameSite || 'Not set',
        issues,
      };
    });
  }

  // ─── Report Formatting ────────────────────────────────────────

  formatSecurityReport(report: SecurityReport): string {
    const lines: string[] = [
      '═══════════════════════════════════════════════════',
      '  SECURITY HEADERS REPORT',
      `  URL: ${report.url}`,
      '═══════════════════════════════════════════════════',
      `  Pass: ${report.passCount}  |  Fail: ${report.failCount}  |  Warn: ${report.warnCount}`,
      '───────────────────────────────────────────────────',
    ];

    for (const h of report.headers) {
      const icon = h.status === 'pass' ? 'PASS' : h.status === 'fail' ? 'FAIL' : 'WARN';
      lines.push(
        `  [${icon}] ${h.name}`,
        `    Value: ${h.value || '(not set)'}`,
        `    ${h.description}`,
        '',
      );
    }

    lines.push('═══════════════════════════════════════════════════');
    return lines.join('\n');
  }
}
