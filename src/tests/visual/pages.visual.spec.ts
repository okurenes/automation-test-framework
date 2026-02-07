import { test, expect } from '../../fixtures/base.fixture';

test.describe('Visual Regression Tests @visual', () => {
  // ─── Login Page ───────────────────────────────────────────────

  test.describe('Login Page Visual', () => {
    test('should match login page screenshot', async ({ loginPage, page }) => {
      await loginPage.navigate();
      await loginPage.verifyPage();
      await expect(page).toHaveScreenshot('login-page.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });

    test('should match login error state screenshot', async ({ loginPage, page }) => {
      await loginPage.navigate();
      await loginPage.login('', '');
      await expect(page).toHaveScreenshot('login-error-state.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });
  });

  // ─── Products Page ────────────────────────────────────────────

  test.describe('Products Page Visual', () => {
    test.beforeEach(async ({ loginPage }) => {
      await loginPage.navigate();
      await loginPage.loginAsStandardUser();
    });

    test('should match products page screenshot', async ({ productsPage, page }) => {
      await productsPage.verifyPage();
      await expect(page).toHaveScreenshot('products-page.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });

    test('should match products page sorted by price', async ({ productsPage, page }) => {
      await productsPage.sortBy('lohi');
      await expect(page).toHaveScreenshot('products-sorted-lohi.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });

    test('should match products page with items in cart', async ({ productsPage, page }) => {
      await productsPage.addItemToCartByName('Sauce Labs Backpack');
      await productsPage.addItemToCartByName('Sauce Labs Bike Light');
      await expect(page).toHaveScreenshot('products-with-cart-items.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });
  });

  // ─── Cart Page ────────────────────────────────────────────────

  test.describe('Cart Page Visual', () => {
    test('should match empty cart screenshot', async ({ loginPage, productsPage, cartPage, page }) => {
      await loginPage.navigate();
      await loginPage.loginAsStandardUser();
      await productsPage.goToCart();
      await cartPage.verifyPage();
      await expect(page).toHaveScreenshot('cart-empty.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });

    test('should match cart with items screenshot', async ({
      loginPage,
      productsPage,
      cartPage,
      page,
    }) => {
      await loginPage.navigate();
      await loginPage.loginAsStandardUser();
      await productsPage.addItemToCartByName('Sauce Labs Backpack');
      await productsPage.addItemToCartByName('Sauce Labs Onesie');
      await productsPage.goToCart();
      await expect(page).toHaveScreenshot('cart-with-items.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });
  });

  // ─── Checkout Page ────────────────────────────────────────────

  test.describe('Checkout Page Visual', () => {
    test('should match checkout form screenshot', async ({
      loginPage,
      productsPage,
      cartPage,
      checkoutPage,
      page,
    }) => {
      await loginPage.navigate();
      await loginPage.loginAsStandardUser();
      await productsPage.addItemToCartByName('Sauce Labs Backpack');
      await productsPage.goToCart();
      await cartPage.checkout();
      await checkoutPage.verifyStepOneVisible();
      await expect(page).toHaveScreenshot('checkout-step-one.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });

    test('should match checkout overview screenshot', async ({
      loginPage,
      productsPage,
      cartPage,
      checkoutPage,
      page,
    }) => {
      await loginPage.navigate();
      await loginPage.loginAsStandardUser();
      await productsPage.addItemToCartByName('Sauce Labs Backpack');
      await productsPage.goToCart();
      await cartPage.checkout();
      await checkoutPage.fillAndContinue('John', 'Doe', '12345');
      await expect(page).toHaveScreenshot('checkout-overview.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });

    test('should match order complete screenshot', async ({
      loginPage,
      productsPage,
      cartPage,
      checkoutPage,
      checkoutCompletePage,
      page,
    }) => {
      await loginPage.navigate();
      await loginPage.loginAsStandardUser();
      await productsPage.addItemToCartByName('Sauce Labs Backpack');
      await productsPage.goToCart();
      await cartPage.checkout();
      await checkoutPage.fillAndContinue('John', 'Doe', '12345');
      await checkoutPage.finishCheckout();
      await checkoutCompletePage.verifyPage();
      await expect(page).toHaveScreenshot('order-complete.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });
  });

  // ─── Product Detail Page ──────────────────────────────────────

  test.describe('Product Detail Page Visual', () => {
    test('should match product detail screenshot', async ({
      loginPage,
      productsPage,
      productDetailPage,
      page,
    }) => {
      await loginPage.navigate();
      await loginPage.loginAsStandardUser();
      await productsPage.clickProduct('Sauce Labs Backpack');
      await productDetailPage.verifyPage();
      await expect(page).toHaveScreenshot('product-detail-backpack.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });
  });
});
