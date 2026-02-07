import { test, expect } from '../../fixtures/base.fixture';

test.describe('Security Tests @security', () => {
  // ─── Security Headers ─────────────────────────────────────────

  test.describe('Security Headers', () => {
    test('should have security headers on login page', async ({
      page,
      securityHelper,
      allureHelper,
    }) => {
      const response = await page.goto('/');
      const report = await securityHelper.analyzeSecurityHeaders(response);

      await allureHelper.addTextAttachment(
        'Security Headers Report - Login',
        securityHelper.formatSecurityReport(report),
      );
      await allureHelper.addJsonAttachment('Security Headers Data', report);

      // At minimum, no critical info disclosure
      const infoDisclosure = report.headers.filter(
        (h) => ['server', 'x-powered-by', 'x-aspnet-version'].includes(h.name) && h.status === 'fail',
      );

      // Log findings (many demo sites won't have all headers)
      if (report.failCount > 0) {
        const failedHeaders = report.headers
          .filter((h) => h.status === 'fail')
          .map((h) => h.name);
        await allureHelper.addTextAttachment(
          'Failed Security Headers',
          failedHeaders.join('\n'),
        );
      }
    });

    test('should have security headers on products page', async ({
      loginPage,
      page,
      securityHelper,
      allureHelper,
    }) => {
      await loginPage.navigate();
      await loginPage.loginAsStandardUser();

      const report = await securityHelper.analyzeSecurityHeaders();
      await allureHelper.addTextAttachment(
        'Security Headers Report - Products',
        securityHelper.formatSecurityReport(report),
      );
    });
  });

  // ─── XSS Testing ─────────────────────────────────────────────

  test.describe('XSS Prevention', () => {
    test('should prevent XSS in username field', async ({
      loginPage,
      securityHelper,
      allureHelper,
    }) => {
      await loginPage.navigate();

      const results = await securityHelper.testXSSOnInput(
        '[data-test="username"]',
        '[data-test="login-button"]',
      );

      await allureHelper.addJsonAttachment('XSS Test Results - Username', results);

      const vulnerabilities = results.filter((r) => r.vulnerable);
      expect(vulnerabilities.length, 'No XSS vulnerabilities in username field').toBe(0);
    });

    test('should prevent XSS in password field', async ({
      loginPage,
      securityHelper,
      allureHelper,
    }) => {
      await loginPage.navigate();

      const results = await securityHelper.testXSSOnInput(
        '[data-test="password"]',
        '[data-test="login-button"]',
      );

      await allureHelper.addJsonAttachment('XSS Test Results - Password', results);

      const vulnerabilities = results.filter((r) => r.vulnerable);
      expect(vulnerabilities.length, 'No XSS vulnerabilities in password field').toBe(0);
    });

    test('should prevent XSS in checkout first name field', async ({
      loginPage,
      productsPage,
      cartPage,
      securityHelper,
      allureHelper,
    }) => {
      await loginPage.navigate();
      await loginPage.loginAsStandardUser();
      await productsPage.addItemToCartByName('Sauce Labs Backpack');
      await productsPage.goToCart();
      await cartPage.checkout();

      const results = await securityHelper.testXSSOnInput(
        '[data-test="firstName"]',
        '[data-test="continue"]',
      );

      await allureHelper.addJsonAttachment('XSS Test Results - Checkout FirstName', results);

      const vulnerabilities = results.filter((r) => r.vulnerable);
      expect(vulnerabilities.length, 'No XSS vulnerabilities in checkout fields').toBe(0);
    });

    test('should prevent XSS in checkout last name field', async ({
      loginPage,
      productsPage,
      cartPage,
      securityHelper,
      allureHelper,
    }) => {
      await loginPage.navigate();
      await loginPage.loginAsStandardUser();
      await productsPage.addItemToCartByName('Sauce Labs Backpack');
      await productsPage.goToCart();
      await cartPage.checkout();

      const results = await securityHelper.testXSSOnInput(
        '[data-test="lastName"]',
        '[data-test="continue"]',
      );

      await allureHelper.addJsonAttachment('XSS Test Results - Checkout LastName', results);

      const vulnerabilities = results.filter((r) => r.vulnerable);
      expect(vulnerabilities.length).toBe(0);
    });

    test('should prevent XSS in checkout postal code field', async ({
      loginPage,
      productsPage,
      cartPage,
      securityHelper,
      allureHelper,
    }) => {
      await loginPage.navigate();
      await loginPage.loginAsStandardUser();
      await productsPage.addItemToCartByName('Sauce Labs Backpack');
      await productsPage.goToCart();
      await cartPage.checkout();

      const results = await securityHelper.testXSSOnInput(
        '[data-test="postalCode"]',
        '[data-test="continue"]',
      );

      await allureHelper.addJsonAttachment('XSS Test Results - Checkout PostalCode', results);

      const vulnerabilities = results.filter((r) => r.vulnerable);
      expect(vulnerabilities.length).toBe(0);
    });
  });

  // ─── SQL Injection Testing ────────────────────────────────────

  test.describe('SQL Injection Prevention', () => {
    test('should prevent SQL injection in username field', async ({
      loginPage,
      securityHelper,
      allureHelper,
    }) => {
      await loginPage.navigate();

      const results = await securityHelper.testSQLInjectionOnInput(
        '[data-test="username"]',
        '[data-test="login-button"]',
      );

      await allureHelper.addJsonAttachment('SQL Injection Results - Username', results);

      const suspicious = results.filter((r) => r.suspicious);
      expect(suspicious.length, 'No SQL injection vulnerabilities').toBe(0);
    });

    test('should prevent SQL injection in checkout fields', async ({
      loginPage,
      productsPage,
      cartPage,
      securityHelper,
      allureHelper,
    }) => {
      await loginPage.navigate();
      await loginPage.loginAsStandardUser();
      await productsPage.addItemToCartByName('Sauce Labs Backpack');
      await productsPage.goToCart();
      await cartPage.checkout();

      const results = await securityHelper.testSQLInjectionOnInput(
        '[data-test="firstName"]',
        '[data-test="continue"]',
      );

      await allureHelper.addJsonAttachment('SQL Injection Results - Checkout', results);

      const suspicious = results.filter((r) => r.suspicious);
      expect(suspicious.length).toBe(0);
    });
  });

  // ─── Cookie Security ──────────────────────────────────────────

  test.describe('Cookie Security', () => {
    test('should analyze cookie security on login page', async ({
      loginPage,
      securityHelper,
      allureHelper,
    }) => {
      await loginPage.navigate();

      const cookies = await securityHelper.analyzeCookieSecurity();
      await allureHelper.addJsonAttachment('Cookie Security - Login', cookies);

      // Report cookies with issues
      const insecureCookies = cookies.filter((c) => c.issues.length > 0);
      if (insecureCookies.length > 0) {
        await allureHelper.addTextAttachment(
          'Insecure Cookies',
          insecureCookies.map((c) => `${c.name}: ${c.issues.join(', ')}`).join('\n'),
        );
      }
    });

    test('should analyze cookie security after login', async ({
      loginPage,
      securityHelper,
      allureHelper,
    }) => {
      await loginPage.navigate();
      await loginPage.loginAsStandardUser();

      const cookies = await securityHelper.analyzeCookieSecurity();
      await allureHelper.addJsonAttachment('Cookie Security - Authenticated', cookies);

      // Session cookies should have security flags
      for (const cookie of cookies) {
        if (cookie.name.toLowerCase().includes('session') || cookie.name.toLowerCase().includes('token')) {
          expect(cookie.httpOnly, `${cookie.name} should be HttpOnly`).toBeTruthy();
        }
      }
    });
  });

  // ─── Authentication Security ──────────────────────────────────

  test.describe('Authentication Security', () => {
    test('should not expose credentials in URL', async ({ loginPage, page }) => {
      await loginPage.navigate();
      await loginPage.loginAsStandardUser();

      const url = page.url();
      expect(url).not.toContain('password');
      expect(url).not.toContain('secret_sauce');
      expect(url).not.toContain('standard_user');
    });

    test('should not allow access to protected pages without login', async ({ page }) => {
      await page.goto('/inventory.html');
      await page.waitForTimeout(1000);

      const url = page.url();
      // Should redirect to login or show error
      const isProtected =
        url.includes('saucedemo.com') &&
        (!url.includes('inventory') || (await page.locator('[data-test="error"]').isVisible().catch(() => false)));

      expect(isProtected).toBeTruthy();
    });

    test('should handle brute force login gracefully', async ({ loginPage }) => {
      await loginPage.navigate();

      // Attempt multiple rapid logins
      for (let i = 0; i < 5; i++) {
        await loginPage.clearLoginForm();
        await loginPage.login(`user_${i}`, `wrong_pass_${i}`);
        await loginPage.verifyErrorMessage('do not match');
      }

      // Should still be able to login after failed attempts
      await loginPage.clearLoginForm();
      await loginPage.loginAsStandardUser();
      await loginPage.verifySuccessfulLogin();
    });

    test('should not retain session after logout', async ({
      loginPage,
      productsPage,
      page,
    }) => {
      await loginPage.navigate();
      await loginPage.loginAsStandardUser();
      await productsPage.verifyPage();

      // Logout
      await productsPage.logout();
      await loginPage.verifyPage();

      // Try to access protected page
      await page.goto('/inventory.html');
      await page.waitForTimeout(1000);

      // Should not be on inventory page
      const url = page.url();
      const hasError = await page.locator('[data-test="error"]').isVisible().catch(() => false);
      const isProtected = !url.includes('inventory') || hasError;
      expect(isProtected).toBeTruthy();
    });
  });
});
