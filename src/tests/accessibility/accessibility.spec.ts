import { test, expect } from '../../fixtures/base.fixture';

test.describe('Accessibility Tests @a11y', () => {
  // ─── Login Page Accessibility ─────────────────────────────────

  test.describe('Login Page', () => {
    test('should pass WCAG 2.0 Level A on login page', async ({
      loginPage,
      accessibilityHelper,
      allureHelper,
    }) => {
      await loginPage.navigate();
      const report = await accessibilityHelper.analyzeWCAG2A();

      await allureHelper.addTextAttachment(
        'A11y Report - Login Page WCAG 2A',
        accessibilityHelper.formatReport(report),
      );

      expect(report.criticalCount, 'No critical accessibility violations').toBe(0);
    });

    test('should pass WCAG 2.0 Level AA on login page', async ({
      loginPage,
      accessibilityHelper,
      allureHelper,
    }) => {
      await loginPage.navigate();
      const report = await accessibilityHelper.analyzeWCAG2AA();

      await allureHelper.addTextAttachment(
        'A11y Report - Login Page WCAG 2AA',
        accessibilityHelper.formatReport(report),
      );

      expect(report.criticalCount, 'No critical violations').toBe(0);
      expect(report.seriousCount, 'No serious violations').toBe(0);
    });

    test('should have accessible form elements on login page', async ({
      loginPage,
      accessibilityHelper,
      allureHelper,
    }) => {
      await loginPage.navigate();

      const report = await accessibilityHelper.analyze({
        include: ['form', '[data-test="username"]', '[data-test="password"]', '[data-test="login-button"]'],
        tags: ['wcag2a', 'wcag2aa'],
      });

      await allureHelper.addTextAttachment(
        'A11y Report - Login Form Elements',
        accessibilityHelper.formatReport(report),
      );

      expect(report.criticalCount).toBe(0);
    });

    test('should have accessible error messages', async ({
      loginPage,
      accessibilityHelper,
      allureHelper,
    }) => {
      await loginPage.navigate();
      await loginPage.login('', '');

      const report = await accessibilityHelper.analyze({
        tags: ['wcag2a', 'wcag2aa'],
      });

      await allureHelper.addTextAttachment(
        'A11y Report - Login Error State',
        accessibilityHelper.formatReport(report),
      );

      expect(report.criticalCount).toBe(0);
    });
  });

  // ─── Products Page Accessibility ──────────────────────────────

  test.describe('Products Page', () => {
    test.beforeEach(async ({ loginPage }) => {
      await loginPage.navigate();
      await loginPage.loginAsStandardUser();
    });

    test('should pass WCAG 2.0 Level A on products page', async ({
      accessibilityHelper,
      allureHelper,
    }) => {
      const report = await accessibilityHelper.analyzeWCAG2A();

      await allureHelper.addTextAttachment(
        'A11y Report - Products Page WCAG 2A',
        accessibilityHelper.formatReport(report),
      );

      expect(report.criticalCount).toBe(0);
    });

    test('should pass WCAG 2.0 Level AA on products page', async ({
      accessibilityHelper,
      allureHelper,
    }) => {
      const report = await accessibilityHelper.analyzeWCAG2AA();

      await allureHelper.addTextAttachment(
        'A11y Report - Products Page WCAG 2AA',
        accessibilityHelper.formatReport(report),
      );

      expect(report.criticalCount).toBe(0);
      expect(report.seriousCount).toBe(0);
    });

    test('should have accessible product cards', async ({
      accessibilityHelper,
      allureHelper,
    }) => {
      const report = await accessibilityHelper.analyze({
        include: ['.inventory_item'],
        tags: ['wcag2a', 'wcag2aa'],
      });

      await allureHelper.addTextAttachment(
        'A11y Report - Product Cards',
        accessibilityHelper.formatReport(report),
      );

      expect(report.criticalCount).toBe(0);
    });

    test('should have accessible navigation elements', async ({
      accessibilityHelper,
      allureHelper,
    }) => {
      const report = await accessibilityHelper.analyze({
        include: ['.primary_header', '.shopping_cart_link', '#react-burger-menu-btn'],
        tags: ['wcag2a', 'wcag2aa'],
      });

      await allureHelper.addTextAttachment(
        'A11y Report - Navigation',
        accessibilityHelper.formatReport(report),
      );

      expect(report.criticalCount).toBe(0);
    });

    test('should have accessible sort dropdown', async ({
      accessibilityHelper,
      allureHelper,
    }) => {
      const report = await accessibilityHelper.analyze({
        include: ['[data-test="product-sort-container"]'],
        tags: ['wcag2a', 'wcag2aa'],
      });

      await allureHelper.addTextAttachment(
        'A11y Report - Sort Dropdown',
        accessibilityHelper.formatReport(report),
      );

      expect(report.criticalCount).toBe(0);
    });
  });

  // ─── Cart Page Accessibility ──────────────────────────────────

  test.describe('Cart Page', () => {
    test('should pass WCAG 2.0 Level AA on cart page', async ({
      loginPage,
      productsPage,
      cartPage,
      accessibilityHelper,
      allureHelper,
    }) => {
      await loginPage.navigate();
      await loginPage.loginAsStandardUser();
      await productsPage.addItemToCartByName('Sauce Labs Backpack');
      await productsPage.goToCart();

      const report = await accessibilityHelper.analyzeWCAG2AA();

      await allureHelper.addTextAttachment(
        'A11y Report - Cart Page WCAG 2AA',
        accessibilityHelper.formatReport(report),
      );

      expect(report.criticalCount).toBe(0);
      expect(report.seriousCount).toBe(0);
    });
  });

  // ─── Checkout Page Accessibility ──────────────────────────────

  test.describe('Checkout Page', () => {
    test('should pass WCAG 2.0 Level AA on checkout form', async ({
      loginPage,
      productsPage,
      cartPage,
      checkoutPage,
      accessibilityHelper,
      allureHelper,
    }) => {
      await loginPage.navigate();
      await loginPage.loginAsStandardUser();
      await productsPage.addItemToCartByName('Sauce Labs Backpack');
      await productsPage.goToCart();
      await cartPage.checkout();

      const report = await accessibilityHelper.analyzeWCAG2AA();

      await allureHelper.addTextAttachment(
        'A11y Report - Checkout Form WCAG 2AA',
        accessibilityHelper.formatReport(report),
      );

      expect(report.criticalCount).toBe(0);
      expect(report.seriousCount).toBe(0);
    });
  });

  // ─── Best Practices ──────────────────────────────────────────

  test.describe('Best Practices', () => {
    test('should follow accessibility best practices on login page', async ({
      loginPage,
      accessibilityHelper,
      allureHelper,
    }) => {
      await loginPage.navigate();
      const report = await accessibilityHelper.analyzeBestPractices();

      await allureHelper.addTextAttachment(
        'A11y Report - Best Practices',
        accessibilityHelper.formatReport(report),
      );

      // Best practices are informational, just report them
      await allureHelper.addJsonAttachment('A11y Violations', report.violations);
    });

    test('should follow accessibility best practices on products page', async ({
      loginPage,
      accessibilityHelper,
      allureHelper,
    }) => {
      await loginPage.navigate();
      await loginPage.loginAsStandardUser();

      const report = await accessibilityHelper.analyzeBestPractices();

      await allureHelper.addTextAttachment(
        'A11y Report - Products Best Practices',
        accessibilityHelper.formatReport(report),
      );

      await allureHelper.addJsonAttachment('A11y Violations', report.violations);
    });
  });
});
