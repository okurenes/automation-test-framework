import { test, expect } from '../../fixtures/base.fixture';

test.describe('Cart - Regression Tests @regression', () => {
  test.beforeEach(async ({ loginPage, productsPage }) => {
    await loginPage.navigate();
    await loginPage.loginAsStandardUser();
    await productsPage.verifyPage();
  });

  // ─── Cart Display ─────────────────────────────────────────────

  test.describe('Cart Display', () => {
    test('should display empty cart', async ({ productsPage, cartPage }) => {
      await productsPage.goToCart();
      await cartPage.verifyPage();
      expect(await cartPage.isCartEmpty()).toBeTruthy();
    });

    test('should display cart with single item', async ({ productsPage, cartPage }) => {
      await productsPage.addItemToCartByName('Sauce Labs Backpack');
      await productsPage.goToCart();
      await cartPage.verifyPage();
      await cartPage.verifyCartItemCount(1);
      await cartPage.verifyItemInCart('Sauce Labs Backpack');
    });

    test('should display cart with multiple items', async ({ productsPage, cartPage }) => {
      await productsPage.addItemToCartByName('Sauce Labs Backpack');
      await productsPage.addItemToCartByName('Sauce Labs Bike Light');
      await productsPage.addItemToCartByName('Sauce Labs Onesie');
      await productsPage.goToCart();
      await cartPage.verifyCartItemCount(3);
    });

    test('should display correct item details in cart', async ({ productsPage, cartPage }) => {
      await productsPage.addItemToCartByName('Sauce Labs Backpack');
      await productsPage.goToCart();
      const item = await cartPage.getCartItem(0);
      expect(item.name).toBe('Sauce Labs Backpack');
      expect(item.price).toMatch(/\$\d+\.\d{2}/);
      expect(item.quantity).toBe('1');
      expect(item.description).toBeTruthy();
    });

    test('should display all items with quantity 1', async ({ productsPage, cartPage }) => {
      await productsPage.addAllItemsToCart();
      await productsPage.goToCart();
      const items = await cartPage.getAllCartItems();
      for (const item of items) {
        expect(item.quantity).toBe('1');
      }
    });
  });

  // ─── Cart Item Management ─────────────────────────────────────

  test.describe('Cart Item Management', () => {
    test('should remove single item from cart', async ({ productsPage, cartPage }) => {
      await productsPage.addItemToCartByName('Sauce Labs Backpack');
      await productsPage.goToCart();
      await cartPage.removeItem('Sauce Labs Backpack');
      expect(await cartPage.isCartEmpty()).toBeTruthy();
    });

    test('should remove one of multiple items', async ({ productsPage, cartPage }) => {
      await productsPage.addItemToCartByName('Sauce Labs Backpack');
      await productsPage.addItemToCartByName('Sauce Labs Bike Light');
      await productsPage.goToCart();
      await cartPage.removeItem('Sauce Labs Backpack');
      await cartPage.verifyCartItemCount(1);
      expect(await cartPage.isItemInCart('Sauce Labs Bike Light')).toBeTruthy();
      expect(await cartPage.isItemInCart('Sauce Labs Backpack')).toBeFalsy();
    });

    test('should remove all items from cart', async ({ productsPage, cartPage }) => {
      await productsPage.addAllItemsToCart();
      await productsPage.goToCart();
      await cartPage.removeAllItems();
      expect(await cartPage.isCartEmpty()).toBeTruthy();
    });
  });

  // ─── Cart Navigation ──────────────────────────────────────────

  test.describe('Cart Navigation', () => {
    test('should continue shopping from cart', async ({ productsPage, cartPage }) => {
      await productsPage.goToCart();
      await cartPage.continueShopping();
      await productsPage.verifyPage();
    });

    test('should proceed to checkout from cart', async ({ productsPage, cartPage, checkoutPage }) => {
      await productsPage.addItemToCartByName('Sauce Labs Backpack');
      await productsPage.goToCart();
      await cartPage.checkout();
      await checkoutPage.verifyStepOneVisible();
    });

    test('should navigate to product detail from cart', async ({
      productsPage,
      cartPage,
      productDetailPage,
    }) => {
      await productsPage.addItemToCartByName('Sauce Labs Backpack');
      await productsPage.goToCart();
      await cartPage.clickItemName('Sauce Labs Backpack');
      await productDetailPage.verifyPage();
    });

    test('should preserve cart after navigating back from product detail', async ({
      productsPage,
      cartPage,
      productDetailPage,
    }) => {
      await productsPage.addItemToCartByName('Sauce Labs Backpack');
      await productsPage.addItemToCartByName('Sauce Labs Bike Light');
      await productsPage.goToCart();
      await cartPage.clickItemName('Sauce Labs Backpack');
      await productDetailPage.goBackToProducts();
      await productsPage.goToCart();
      await cartPage.verifyCartItemCount(2);
    });
  });

  // ─── Cart Price Calculation ───────────────────────────────────

  test.describe('Price Calculation', () => {
    test('should calculate correct total for single item', async ({ productsPage, cartPage }) => {
      await productsPage.addItemToCartByName('Sauce Labs Backpack');
      await productsPage.goToCart();
      const total = await cartPage.getTotalPrice();
      expect(total).toBeGreaterThan(0);
    });

    test('should calculate correct total for multiple items', async ({ productsPage, cartPage }) => {
      await productsPage.addItemToCartByName('Sauce Labs Backpack');
      await productsPage.addItemToCartByName('Sauce Labs Bike Light');
      await productsPage.goToCart();
      const prices = await cartPage.getItemPrices();
      const total = await cartPage.getTotalPrice();
      const expectedTotal = prices.reduce((sum, p) => sum + parseFloat(p.replace('$', '')), 0);
      expect(total).toBeCloseTo(expectedTotal, 2);
    });
  });
});
