import { test, expect } from '../../fixtures/base.fixture';

test.describe('Products - Regression Tests @regression', () => {
  test.beforeEach(async ({ loginPage, productsPage }) => {
    await loginPage.navigate();
    await loginPage.loginAsStandardUser();
    await productsPage.verifyPage();
  });

  // ─── Product Display ──────────────────────────────────────────

  test.describe('Product Display', () => {
    test('should display all 6 products with correct info', async ({ productsPage }) => {
      const count = await productsPage.getItemCount();
      expect(count).toBe(6);

      const products = await productsPage.getAllProductInfo();
      for (const product of products) {
        expect(product.name).toBeTruthy();
        expect(product.description).toBeTruthy();
        expect(product.price).toMatch(/^\$\d+\.\d{2}$/);
        expect(product.imageUrl).toBeTruthy();
      }
    });

    test('should display product names correctly', async ({ productsPage }) => {
      const names = await productsPage.getItemNames();
      expect(names).toContain('Sauce Labs Backpack');
      expect(names).toContain('Sauce Labs Bike Light');
      expect(names).toContain('Sauce Labs Bolt T-Shirt');
      expect(names).toContain('Sauce Labs Fleece Jacket');
      expect(names).toContain('Sauce Labs Onesie');
      expect(names).toContain('Test.allTheThings() T-Shirt (Red)');
    });

    test('should display valid prices for all products', async ({ productsPage }) => {
      const prices = await productsPage.getItemPricesAsNumbers();
      for (const price of prices) {
        expect(price).toBeGreaterThan(0);
        expect(price).toBeLessThan(100);
      }
    });
  });

  // ─── Sorting ──────────────────────────────────────────────────

  test.describe('Sorting', () => {
    test('should sort products A-Z', async ({ productsPage }) => {
      await productsPage.sortBy('az');
      await productsPage.verifySortedAZ();
    });

    test('should sort products Z-A', async ({ productsPage }) => {
      await productsPage.sortBy('za');
      await productsPage.verifySortedZA();
    });

    test('should sort products price low to high', async ({ productsPage }) => {
      await productsPage.sortBy('lohi');
      await productsPage.verifySortedPriceLowToHigh();
    });

    test('should sort products price high to low', async ({ productsPage }) => {
      await productsPage.sortBy('hilo');
      await productsPage.verifySortedPriceHighToLow();
    });

    test('should maintain sort after navigating back from product detail', async ({
      productsPage,
      productDetailPage,
    }) => {
      await productsPage.sortBy('za');
      const namesBefore = await productsPage.getItemNames();
      await productsPage.clickProduct(namesBefore[0]);
      await productDetailPage.goBackToProducts();
      const namesAfter = await productsPage.getItemNames();
      expect(namesAfter).toEqual(namesBefore);
    });
  });

  // ─── Cart Operations ──────────────────────────────────────────

  test.describe('Cart Operations', () => {
    test('should add single item to cart', async ({ productsPage }) => {
      await productsPage.addItemToCartByName('Sauce Labs Backpack');
      expect(await productsPage.getCartBadgeCount()).toBe(1);
    });

    test('should add multiple items to cart', async ({ productsPage }) => {
      await productsPage.addItemToCartByName('Sauce Labs Backpack');
      await productsPage.addItemToCartByName('Sauce Labs Bike Light');
      await productsPage.addItemToCartByName('Sauce Labs Bolt T-Shirt');
      expect(await productsPage.getCartBadgeCount()).toBe(3);
    });

    test('should add all items to cart', async ({ productsPage }) => {
      await productsPage.addAllItemsToCart();
      expect(await productsPage.getCartBadgeCount()).toBe(6);
    });

    test('should remove item from cart on products page', async ({ productsPage }) => {
      await productsPage.addItemToCartByName('Sauce Labs Backpack');
      expect(await productsPage.getCartBadgeCount()).toBe(1);
      await productsPage.removeItemFromCartByName('Sauce Labs Backpack');
      expect(await productsPage.isCartBadgeVisible()).toBeFalsy();
    });

    test('should update badge count when removing items', async ({ productsPage }) => {
      await productsPage.addItemToCartByName('Sauce Labs Backpack');
      await productsPage.addItemToCartByName('Sauce Labs Bike Light');
      expect(await productsPage.getCartBadgeCount()).toBe(2);
      await productsPage.removeItemFromCartByName('Sauce Labs Backpack');
      expect(await productsPage.getCartBadgeCount()).toBe(1);
    });

    test('should persist cart items after sorting', async ({ productsPage }) => {
      await productsPage.addItemToCartByName('Sauce Labs Backpack');
      await productsPage.sortBy('za');
      expect(await productsPage.getCartBadgeCount()).toBe(1);
    });
  });

  // ─── Product Detail Navigation ────────────────────────────────

  test.describe('Product Detail Navigation', () => {
    test('should navigate to product detail and back', async ({
      productsPage,
      productDetailPage,
    }) => {
      await productsPage.clickProduct('Sauce Labs Backpack');
      await productDetailPage.verifyPage();
      const name = await productDetailPage.getName();
      expect(name).toBe('Sauce Labs Backpack');
      await productDetailPage.goBackToProducts();
      await productsPage.verifyPage();
    });

    test('should add to cart from product detail', async ({
      productsPage,
      productDetailPage,
    }) => {
      await productsPage.clickProduct('Sauce Labs Backpack');
      await productDetailPage.addToCart();
      expect(await productDetailPage.getCartBadgeCount()).toBe(1);
      expect(await productDetailPage.isRemoveVisible()).toBeTruthy();
    });

    test('should remove from cart on product detail', async ({
      productsPage,
      productDetailPage,
    }) => {
      await productsPage.clickProduct('Sauce Labs Backpack');
      await productDetailPage.addToCart();
      await productDetailPage.removeFromCart();
      expect(await productDetailPage.isAddToCartVisible()).toBeTruthy();
    });
  });

  // ─── Burger Menu ──────────────────────────────────────────────

  test.describe('Burger Menu', () => {
    test('should open and close burger menu', async ({ productsPage }) => {
      await productsPage.openBurgerMenu();
      await productsPage.closeBurgerMenuPanel();
    });

    test('should logout via burger menu', async ({ productsPage, loginPage }) => {
      await productsPage.logout();
      await loginPage.verifyPage();
    });

    test('should reset app state', async ({ productsPage }) => {
      await productsPage.addAllItemsToCart();
      expect(await productsPage.getCartBadgeCount()).toBe(6);
      await productsPage.resetState();
      expect(await productsPage.isCartBadgeVisible()).toBeFalsy();
    });
  });
});
