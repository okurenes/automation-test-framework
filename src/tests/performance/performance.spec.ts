import { test, expect } from '../../fixtures/base.fixture';
import { PERFORMANCE_THRESHOLDS } from '../../utils/performance-helper';

test.describe('Performance Tests @performance', () => {
  // ─── Login Page Performance ───────────────────────────────────

  test.describe('Login Page', () => {
    test('should load login page within acceptable time', async ({
      loginPage,
      performanceHelper,
      allureHelper,
    }) => {
      await loginPage.navigate();
      await loginPage.verifyPage();

      const report = await performanceHelper.getFullReport();
      await allureHelper.addTextAttachment('Performance Report - Login', performanceHelper.formatReport(report));
      await allureHelper.addJsonAttachment('Performance Data - Login', report);

      expect(report.pageLoadMetrics.totalLoadTime).toBeLessThan(
        PERFORMANCE_THRESHOLDS.totalLoadTime.needsImprovement,
      );
    });

    test('should have acceptable Core Web Vitals on login page', async ({
      loginPage,
      performanceHelper,
      allureHelper,
    }) => {
      await loginPage.navigate();
      await loginPage.verifyPage();

      const vitals = await performanceHelper.getCoreWebVitals();
      await allureHelper.addJsonAttachment('Core Web Vitals - Login', vitals);

      if (vitals.FCP !== null) {
        expect(vitals.FCP).toBeLessThan(PERFORMANCE_THRESHOLDS.FCP.needsImprovement);
      }

      if (vitals.TTFB !== null) {
        expect(vitals.TTFB).toBeLessThan(PERFORMANCE_THRESHOLDS.TTFB.needsImprovement);
      }
    });

    test('should have reasonable resource count on login page', async ({
      loginPage,
      performanceHelper,
      allureHelper,
    }) => {
      await loginPage.navigate();

      const resources = await performanceHelper.getResourceMetrics();
      await allureHelper.addJsonAttachment('Resource Metrics - Login', resources);

      expect(resources.totalResources).toBeLessThan(50);
      expect(resources.totalSize).toBeLessThan(5 * 1024 * 1024); // 5MB
    });
  });

  // ─── Products Page Performance ────────────────────────────────

  test.describe('Products Page', () => {
    test.beforeEach(async ({ loginPage }) => {
      await loginPage.navigate();
      await loginPage.loginAsStandardUser();
    });

    test('should load products page within acceptable time', async ({
      performanceHelper,
      allureHelper,
    }) => {
      const report = await performanceHelper.getFullReport();
      await allureHelper.addTextAttachment('Performance Report - Products', performanceHelper.formatReport(report));

      expect(report.pageLoadMetrics.totalLoadTime).toBeLessThan(
        PERFORMANCE_THRESHOLDS.totalLoadTime.needsImprovement,
      );
    });

    test('should have acceptable FCP on products page', async ({
      performanceHelper,
      allureHelper,
    }) => {
      const vitals = await performanceHelper.getCoreWebVitals();
      await allureHelper.addJsonAttachment('Core Web Vitals - Products', vitals);

      if (vitals.FCP !== null) {
        expect(vitals.FCP).toBeLessThan(PERFORMANCE_THRESHOLDS.FCP.needsImprovement);
      }
    });

    test('should load product images efficiently', async ({
      performanceHelper,
      allureHelper,
    }) => {
      const resources = await performanceHelper.getResourceMetrics();
      await allureHelper.addJsonAttachment('Resource Metrics - Products', resources);

      const imageResources = resources.resourcesByType['img'];
      if (imageResources) {
        // Each image should be under 500KB
        const avgSize = imageResources.size / imageResources.count;
        expect(avgSize).toBeLessThan(500 * 1024);
      }
    });

    test('should not have slow resources (>3s)', async ({
      performanceHelper,
    }) => {
      const resources = await performanceHelper.getResourceMetrics();
      const slowResources = resources.slowestResources.filter((r) => r.duration > 3000);
      expect(slowResources.length).toBe(0);
    });
  });

  // ─── Navigation Performance ───────────────────────────────────

  test.describe('Navigation Performance', () => {
    test('should navigate from login to products quickly', async ({
      loginPage,
      page,
    }) => {
      await loginPage.navigate();

      const startTime = Date.now();
      await loginPage.loginAsStandardUser();
      await page.waitForURL(/inventory/);
      const navigationTime = Date.now() - startTime;

      expect(navigationTime).toBeLessThan(5000);
    });

    test('should navigate to product detail quickly', async ({
      loginPage,
      productsPage,
      productDetailPage,
      page,
    }) => {
      await loginPage.navigate();
      await loginPage.loginAsStandardUser();

      const startTime = Date.now();
      await productsPage.clickProduct('Sauce Labs Backpack');
      await productDetailPage.verifyPage();
      const navigationTime = Date.now() - startTime;

      expect(navigationTime).toBeLessThan(3000);
    });

    test('should navigate to cart quickly', async ({
      loginPage,
      productsPage,
      cartPage,
      page,
    }) => {
      await loginPage.navigate();
      await loginPage.loginAsStandardUser();
      await productsPage.addItemToCartByName('Sauce Labs Backpack');

      const startTime = Date.now();
      await productsPage.goToCart();
      await cartPage.verifyPage();
      const navigationTime = Date.now() - startTime;

      expect(navigationTime).toBeLessThan(3000);
    });
  });

  // ─── Performance Under Load ───────────────────────────────────

  test.describe('Performance Under Load', () => {
    test('should handle adding all items to cart without degradation', async ({
      loginPage,
      productsPage,
    }) => {
      await loginPage.navigate();
      await loginPage.loginAsStandardUser();

      const startTime = Date.now();
      await productsPage.addAllItemsToCart();
      const totalTime = Date.now() - startTime;

      expect(await productsPage.getCartBadgeCount()).toBe(6);
      expect(totalTime).toBeLessThan(10000); // All 6 items in under 10s
    });

    test('should sort products without noticeable delay', async ({
      loginPage,
      productsPage,
    }) => {
      await loginPage.navigate();
      await loginPage.loginAsStandardUser();

      const sortOptions: Array<'az' | 'za' | 'lohi' | 'hilo'> = ['az', 'za', 'lohi', 'hilo'];

      for (const option of sortOptions) {
        const startTime = Date.now();
        await productsPage.sortBy(option);
        const sortTime = Date.now() - startTime;
        expect(sortTime).toBeLessThan(2000);
      }
    });
  });

  // ─── Performance with Slow Network ────────────────────────────

  test.describe('Slow Network Simulation', () => {
    test('should still load login page on slow network', async ({
      loginPage,
      networkHelper,
      page,
    }) => {
      test.slow(); // Allow extra time

      await networkHelper.simulateSlowNetwork(1000);
      await loginPage.navigate();
      await loginPage.verifyPage();
    });
  });
});
