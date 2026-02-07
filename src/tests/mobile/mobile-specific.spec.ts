import { test, expect } from '../../fixtures/base.fixture';

test.describe('Mobile-Specific Tests @mobile', () => {
  // ─── Touch Gestures ───────────────────────────────────────────

  test.describe('Touch Gestures', () => {
    test.beforeEach(async ({ loginPage }) => {
      await loginPage.navigate();
      await loginPage.loginAsStandardUser();
    });

    test('should scroll down products list with swipe up', async ({
      mobileHelper,
      page,
    }) => {
      const initialScrollTop = await page.evaluate(() => window.scrollY);
      await mobileHelper.swipeUp();
      await page.waitForTimeout(500);
      const afterScrollTop = await page.evaluate(() => window.scrollY);

      expect(afterScrollTop).toBeGreaterThan(initialScrollTop);
    });

    test('should scroll up products list with swipe down', async ({
      mobileHelper,
      page,
    }) => {
      // First scroll down
      await mobileHelper.swipeUp();
      await page.waitForTimeout(500);

      const beforeScrollTop = await page.evaluate(() => window.scrollY);
      await mobileHelper.swipeDown();
      await page.waitForTimeout(500);
      const afterScrollTop = await page.evaluate(() => window.scrollY);

      expect(afterScrollTop).toBeLessThanOrEqual(beforeScrollTop);
    });

    test('should tap on product to navigate to detail', async ({
      mobileHelper,
      page,
      productDetailPage,
    }) => {
      const productLink = page.locator('.inventory_item_name').first();
      await mobileHelper.tap(productLink);
      await productDetailPage.verifyPage();
    });

    test('should tap add to cart button', async ({
      mobileHelper,
      productsPage,
      page,
    }) => {
      const addButton = page.locator('.inventory_item').first().locator('button');
      await mobileHelper.tap(addButton);
      expect(await productsPage.getCartBadgeCount()).toBe(1);
    });
  });

  // ─── Orientation Changes ──────────────────────────────────────

  test.describe('Orientation', () => {
    test.beforeEach(async ({ loginPage }) => {
      await loginPage.navigate();
    });

    test('should display login form correctly in portrait', async ({
      loginPage,
      mobileHelper,
    }) => {
      await mobileHelper.setPortrait();
      await loginPage.verifyPage();
      expect(await loginPage.isLoginFormVisible()).toBeTruthy();
    });

    test('should display login form correctly in landscape', async ({
      loginPage,
      mobileHelper,
    }) => {
      await mobileHelper.setLandscape();
      await loginPage.verifyPage();
      expect(await loginPage.isLoginFormVisible()).toBeTruthy();
    });

    test('should maintain state during orientation change', async ({
      loginPage,
      productsPage,
      mobileHelper,
      page,
    }) => {
      await loginPage.loginAsStandardUser();
      await productsPage.addItemToCartByName('Sauce Labs Backpack');

      // Switch orientation
      await mobileHelper.toggleOrientation();
      await page.waitForTimeout(500);

      // Cart badge should persist
      expect(await productsPage.getCartBadgeCount()).toBe(1);
    });

    test('should handle rapid orientation changes', async ({
      loginPage,
      productsPage,
      mobileHelper,
      page,
    }) => {
      await loginPage.loginAsStandardUser();

      for (let i = 0; i < 3; i++) {
        await mobileHelper.toggleOrientation();
        await page.waitForTimeout(300);
      }

      // Page should still be functional
      await productsPage.verifyPage();
    });

    test('should not have horizontal scroll in portrait', async ({
      loginPage,
      mobileHelper,
    }) => {
      await mobileHelper.setPortrait();
      await loginPage.loginAsStandardUser();
      const noHorizontalScroll = await mobileHelper.checkNoHorizontalScroll();
      expect(noHorizontalScroll).toBeTruthy();
    });

    test('should not have horizontal scroll in landscape', async ({
      loginPage,
      mobileHelper,
    }) => {
      await mobileHelper.setLandscape();
      await loginPage.loginAsStandardUser();
      const noHorizontalScroll = await mobileHelper.checkNoHorizontalScroll();
      expect(noHorizontalScroll).toBeTruthy();
    });
  });

  // ─── Responsive Design ────────────────────────────────────────

  test.describe('Responsive Design', () => {
    test.beforeEach(async ({ loginPage }) => {
      await loginPage.navigate();
      await loginPage.loginAsStandardUser();
    });

    test('should display all product elements within viewport', async ({
      mobileHelper,
    }) => {
      const results = await mobileHelper.checkElementResponsiveness([
        '.inventory_item',
        '.inventory_item_name',
        '.inventory_item_price',
        '.shopping_cart_link',
        '#react-burger-menu-btn',
      ]);

      for (const result of results) {
        if (result.visible) {
          expect(result.overflowing, `${result.element} should not overflow viewport`).toBeFalsy();
        }
      }
    });

    test('should have adequate touch target sizes', async ({
      mobileHelper,
      allureHelper,
    }) => {
      const results = await mobileHelper.checkTouchTargetSizes([
        '.shopping_cart_link',
        '#react-burger-menu-btn',
        '.inventory_item button',
      ]);

      await allureHelper.addJsonAttachment('Touch Target Sizes', results);

      // At least cart and menu should meet minimum size
      const criticalButtons = results.filter(
        (r) => r.selector.includes('cart') || r.selector.includes('burger'),
      );

      for (const btn of criticalButtons) {
        expect(
          btn.meetsMinimum,
          `${btn.selector} (${btn.width}x${btn.height}) should meet 44px minimum`,
        ).toBeTruthy();
      }
    });

    test('should have readable font sizes on mobile', async ({
      mobileHelper,
      allureHelper,
    }) => {
      const results = await mobileHelper.checkFontReadability(12);
      await allureHelper.addJsonAttachment('Font Readability', results.slice(0, 20));

      const unreadable = results.filter((r) => !r.readable);
      if (unreadable.length > 0) {
        await allureHelper.addTextAttachment(
          'Unreadable Fonts',
          unreadable.map((r) => `${r.selector}: ${r.fontSize}`).join('\n'),
        );
      }

      // Critical text elements should be readable
      const criticalElements = results.filter(
        (r) =>
          r.selector.includes('inventory_item_name') ||
          r.selector.includes('inventory_item_price') ||
          r.selector.includes('btn'),
      );

      for (const el of criticalElements) {
        expect(el.readable, `${el.selector} font (${el.fontSize}) should be readable`).toBeTruthy();
      }
    });

    test('should not overflow on small screens', async ({
      mobileHelper,
    }) => {
      const noOverflow = await mobileHelper.checkNoHorizontalScroll();
      expect(noOverflow, 'Page should not have horizontal scroll').toBeTruthy();
    });
  });

  // ─── Burger Menu (Mobile Navigation) ──────────────────────────

  test.describe('Mobile Navigation', () => {
    test.beforeEach(async ({ loginPage }) => {
      await loginPage.navigate();
      await loginPage.loginAsStandardUser();
    });

    test('should open burger menu with tap', async ({
      mobileHelper,
      page,
    }) => {
      const burgerBtn = page.locator('#react-burger-menu-btn');
      await mobileHelper.tap(burgerBtn);
      await page.waitForTimeout(500);

      await expect(page.locator('.bm-menu-wrap')).toBeVisible();
    });

    test('should close burger menu with tap on X', async ({
      mobileHelper,
      page,
    }) => {
      await page.locator('#react-burger-menu-btn').click();
      await page.waitForTimeout(500);

      const closeBtn = page.locator('#react-burger-cross-btn');
      await mobileHelper.tap(closeBtn);
      await page.waitForTimeout(500);
    });

    test('should navigate all menu items', async ({
      productsPage,
      page,
    }) => {
      // Open menu
      await productsPage.openBurgerMenu();

      // Verify menu items exist
      await expect(page.locator('#inventory_sidebar_link')).toBeVisible();
      await expect(page.locator('#about_sidebar_link')).toBeVisible();
      await expect(page.locator('#logout_sidebar_link')).toBeVisible();
      await expect(page.locator('#reset_sidebar_link')).toBeVisible();

      await productsPage.closeBurgerMenuPanel();
    });
  });

  // ─── Cart Interaction on Mobile ───────────────────────────────

  test.describe('Mobile Cart Interaction', () => {
    test('should swipe to scroll cart items', async ({
      loginPage,
      productsPage,
      cartPage,
      mobileHelper,
      page,
    }) => {
      await loginPage.navigate();
      await loginPage.loginAsStandardUser();

      // Add all items
      await productsPage.addAllItemsToCart();
      await productsPage.goToCart();
      await cartPage.verifyPage();

      // Swipe to scroll through items
      await mobileHelper.swipeUp();
      await page.waitForTimeout(300);

      const scrolled = await page.evaluate(() => window.scrollY > 0);
      expect(scrolled).toBeTruthy();
    });
  });
});
