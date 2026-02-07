import { test, expect } from '../../fixtures/base.fixture';

test.describe('User Journey - E2E Tests @e2e', () => {
  // ─── Browse and Compare Products ──────────────────────────────

  test('should browse products, compare details, and make selection', async ({
    loginPage,
    productsPage,
    productDetailPage,
  }) => {
    await loginPage.navigate();
    await loginPage.loginAsStandardUser();

    // Browse first product
    await productsPage.clickProduct('Sauce Labs Backpack');
    const backpackPrice = await productDetailPage.getPriceAsNumber();
    const backpackName = await productDetailPage.getName();
    await productDetailPage.goBackToProducts();

    // Browse second product
    await productsPage.clickProduct('Sauce Labs Fleece Jacket');
    const jacketPrice = await productDetailPage.getPriceAsNumber();
    const jacketName = await productDetailPage.getName();
    await productDetailPage.goBackToProducts();

    // Verify products are different
    expect(backpackName).not.toBe(jacketName);
    expect(backpackPrice).not.toBe(jacketPrice);
  });

  // ─── Sort and Purchase Cheapest Item ──────────────────────────

  test('should sort by price and purchase cheapest item', async ({
    loginPage,
    productsPage,
    cartPage,
    checkoutPage,
    checkoutCompletePage,
  }) => {
    await loginPage.navigate();
    await loginPage.loginAsStandardUser();

    // Sort by price low to high
    await productsPage.sortBy('lohi');
    await productsPage.verifySortedPriceLowToHigh();

    // Add cheapest item (first one after sort)
    const products = await productsPage.getAllProductInfo();
    const cheapestProduct = products[0];
    await productsPage.addItemToCartByIndex(0);

    // Verify and checkout
    await productsPage.goToCart();
    await cartPage.verifyItemInCart(cheapestProduct.name);

    await cartPage.checkout();
    await checkoutPage.fillAndContinue('Jane', 'Smith', '90210');
    await checkoutPage.finishCheckout();
    await checkoutCompletePage.verifyOrderComplete();
  });

  // ─── Sort and Purchase Most Expensive ─────────────────────────

  test('should sort by price and purchase most expensive item', async ({
    loginPage,
    productsPage,
    cartPage,
    checkoutPage,
    checkoutCompletePage,
  }) => {
    await loginPage.navigate();
    await loginPage.loginAsStandardUser();

    // Sort by price high to low
    await productsPage.sortBy('hilo');
    await productsPage.verifySortedPriceHighToLow();

    // Add most expensive item
    const products = await productsPage.getAllProductInfo();
    const expensiveProduct = products[0];
    await productsPage.addItemToCartByIndex(0);

    await productsPage.goToCart();
    await cartPage.verifyItemInCart(expensiveProduct.name);

    await cartPage.checkout();
    await checkoutPage.fillAndContinue('Premium', 'Buyer', '10001');
    await checkoutPage.finishCheckout();
    await checkoutCompletePage.verifyOrderComplete();
  });

  // ─── Continue Shopping Flow ───────────────────────────────────

  test('should add item, continue shopping, add another, then purchase', async ({
    loginPage,
    productsPage,
    cartPage,
    checkoutPage,
    checkoutCompletePage,
  }) => {
    await loginPage.navigate();
    await loginPage.loginAsStandardUser();

    // Add first item
    await productsPage.addItemToCartByName('Sauce Labs Backpack');
    await productsPage.goToCart();
    await cartPage.verifyCartItemCount(1);

    // Continue shopping
    await cartPage.continueShopping();
    await productsPage.verifyPage();

    // Add second item
    await productsPage.addItemToCartByName('Sauce Labs Onesie');
    expect(await productsPage.getCartBadgeCount()).toBe(2);

    // Complete purchase
    await productsPage.goToCart();
    await cartPage.verifyCartItemCount(2);
    await cartPage.checkout();
    await checkoutPage.fillAndContinue('Test', 'User', '54321');
    await checkoutPage.finishCheckout();
    await checkoutCompletePage.verifyOrderComplete();
  });

  // ─── Remove and Replace Item ──────────────────────────────────

  test('should remove item from cart and replace with another', async ({
    loginPage,
    productsPage,
    cartPage,
    checkoutPage,
    checkoutCompletePage,
  }) => {
    await loginPage.navigate();
    await loginPage.loginAsStandardUser();

    // Add item
    await productsPage.addItemToCartByName('Sauce Labs Backpack');
    await productsPage.goToCart();
    await cartPage.verifyItemInCart('Sauce Labs Backpack');

    // Remove it
    await cartPage.removeItem('Sauce Labs Backpack');
    expect(await cartPage.isCartEmpty()).toBeTruthy();

    // Go back and add different item
    await cartPage.continueShopping();
    await productsPage.addItemToCartByName('Sauce Labs Fleece Jacket');
    await productsPage.goToCart();
    await cartPage.verifyItemInCart('Sauce Labs Fleece Jacket');
    expect(await cartPage.isItemInCart('Sauce Labs Backpack')).toBeFalsy();

    // Complete purchase
    await cartPage.checkout();
    await checkoutPage.fillAndContinue('Replace', 'Test', '11111');
    await checkoutPage.finishCheckout();
    await checkoutCompletePage.verifyOrderComplete();
  });
});
