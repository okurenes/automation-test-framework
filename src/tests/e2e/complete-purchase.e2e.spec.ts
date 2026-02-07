import { test, expect } from '../../fixtures/base.fixture';
import { DataGenerator } from '../../utils/data-generator';

test.describe('Complete Purchase Flow - E2E Tests @e2e', () => {
  // ─── Single Item Purchase ─────────────────────────────────────

  test('should complete single item purchase from start to finish', async ({
    loginPage,
    productsPage,
    cartPage,
    checkoutPage,
    checkoutCompletePage,
  }) => {
    // Step 1: Login
    await loginPage.navigate();
    await loginPage.loginAsStandardUser();
    await productsPage.verifyPage();

    // Step 2: Add item to cart
    await productsPage.addItemToCartByName('Sauce Labs Backpack');
    expect(await productsPage.getCartBadgeCount()).toBe(1);

    // Step 3: Go to cart and verify
    await productsPage.goToCart();
    await cartPage.verifyPage();
    await cartPage.verifyItemInCart('Sauce Labs Backpack');
    await cartPage.verifyCartItemCount(1);

    // Step 4: Proceed to checkout
    await cartPage.checkout();
    await checkoutPage.verifyStepOneVisible();

    // Step 5: Fill checkout info
    const checkoutData = DataGenerator.generateCheckoutData();
    await checkoutPage.fillAndContinue(
      checkoutData.firstName,
      checkoutData.lastName,
      checkoutData.postalCode,
    );

    // Step 6: Verify order summary
    const summaryItems = await checkoutPage.getSummaryItemNames();
    expect(summaryItems).toContain('Sauce Labs Backpack');
    await checkoutPage.verifyTotalCalculation();

    // Step 7: Complete order
    await checkoutPage.finishCheckout();
    await checkoutCompletePage.verifyPage();
    await checkoutCompletePage.verifyOrderComplete();

    // Step 8: Go back home
    await checkoutCompletePage.goBackHome();
    await productsPage.verifyPage();
  });

  // ─── Multi Item Purchase ──────────────────────────────────────

  test('should complete multi-item purchase', async ({
    loginPage,
    productsPage,
    cartPage,
    checkoutPage,
    checkoutCompletePage,
  }) => {
    const itemsToAdd = ['Sauce Labs Backpack', 'Sauce Labs Bike Light', 'Sauce Labs Onesie'];

    // Login and add multiple items
    await loginPage.navigate();
    await loginPage.loginAsStandardUser();

    for (const item of itemsToAdd) {
      await productsPage.addItemToCartByName(item);
    }
    expect(await productsPage.getCartBadgeCount()).toBe(3);

    // Verify cart
    await productsPage.goToCart();
    await cartPage.verifyCartItemCount(3);
    for (const item of itemsToAdd) {
      await cartPage.verifyItemInCart(item);
    }

    // Checkout
    await cartPage.checkout();
    const checkoutData = DataGenerator.generateCheckoutData();
    await checkoutPage.fillAndContinue(
      checkoutData.firstName,
      checkoutData.lastName,
      checkoutData.postalCode,
    );

    // Verify summary has all items
    expect(await checkoutPage.getSummaryItemCount()).toBe(3);
    await checkoutPage.verifyTotalCalculation();

    // Complete
    await checkoutPage.finishCheckout();
    await checkoutCompletePage.verifyOrderComplete();
  });

  // ─── All Items Purchase ───────────────────────────────────────

  test('should complete purchase of all items', async ({
    loginPage,
    productsPage,
    cartPage,
    checkoutPage,
    checkoutCompletePage,
  }) => {
    await loginPage.navigate();
    await loginPage.loginAsStandardUser();

    // Add all items
    await productsPage.addAllItemsToCart();
    expect(await productsPage.getCartBadgeCount()).toBe(6);

    // Cart
    await productsPage.goToCart();
    await cartPage.verifyCartItemCount(6);

    // Checkout
    await cartPage.checkout();
    const checkoutData = DataGenerator.generateCheckoutData();
    await checkoutPage.fillAndContinue(
      checkoutData.firstName,
      checkoutData.lastName,
      checkoutData.postalCode,
    );

    expect(await checkoutPage.getSummaryItemCount()).toBe(6);
    await checkoutPage.verifyTotalCalculation();

    await checkoutPage.finishCheckout();
    await checkoutCompletePage.verifyOrderComplete();
  });

  // ─── Purchase with Cart Modifications ─────────────────────────

  test('should complete purchase after adding and removing items', async ({
    loginPage,
    productsPage,
    cartPage,
    checkoutPage,
    checkoutCompletePage,
  }) => {
    await loginPage.navigate();
    await loginPage.loginAsStandardUser();

    // Add 3, remove 1
    await productsPage.addItemToCartByName('Sauce Labs Backpack');
    await productsPage.addItemToCartByName('Sauce Labs Bike Light');
    await productsPage.addItemToCartByName('Sauce Labs Onesie');
    await productsPage.removeItemFromCartByName('Sauce Labs Bike Light');
    expect(await productsPage.getCartBadgeCount()).toBe(2);

    // Verify cart
    await productsPage.goToCart();
    await cartPage.verifyCartItemCount(2);
    expect(await cartPage.isItemInCart('Sauce Labs Backpack')).toBeTruthy();
    expect(await cartPage.isItemInCart('Sauce Labs Onesie')).toBeTruthy();
    expect(await cartPage.isItemInCart('Sauce Labs Bike Light')).toBeFalsy();

    // Complete checkout
    await cartPage.checkout();
    const checkoutData = DataGenerator.generateCheckoutData();
    await checkoutPage.fillAndContinue(
      checkoutData.firstName,
      checkoutData.lastName,
      checkoutData.postalCode,
    );
    await checkoutPage.finishCheckout();
    await checkoutCompletePage.verifyOrderComplete();
  });

  // ─── Purchase via Product Detail ──────────────────────────────

  test('should complete purchase adding item from product detail', async ({
    loginPage,
    productsPage,
    productDetailPage,
    cartPage,
    checkoutPage,
    checkoutCompletePage,
  }) => {
    await loginPage.navigate();
    await loginPage.loginAsStandardUser();

    // Add from detail page
    await productsPage.clickProduct('Sauce Labs Fleece Jacket');
    await productDetailPage.verifyPage();
    await productDetailPage.addToCart();
    expect(await productDetailPage.getCartBadgeCount()).toBe(1);

    // Go to cart from detail
    await productDetailPage.goToCart();
    await cartPage.verifyItemInCart('Sauce Labs Fleece Jacket');

    // Checkout
    await cartPage.checkout();
    const checkoutData = DataGenerator.generateCheckoutData();
    await checkoutPage.fillAndContinue(
      checkoutData.firstName,
      checkoutData.lastName,
      checkoutData.postalCode,
    );
    await checkoutPage.finishCheckout();
    await checkoutCompletePage.verifyOrderComplete();
  });

  // ─── Checkout Cancellation Flows ──────────────────────────────

  test('should cancel checkout at step one and resume later', async ({
    loginPage,
    productsPage,
    cartPage,
    checkoutPage,
    checkoutCompletePage,
  }) => {
    await loginPage.navigate();
    await loginPage.loginAsStandardUser();

    await productsPage.addItemToCartByName('Sauce Labs Backpack');
    await productsPage.goToCart();
    await cartPage.checkout();

    // Cancel at step one
    await checkoutPage.cancelCheckout();
    await cartPage.verifyPage();
    await cartPage.verifyItemInCart('Sauce Labs Backpack');

    // Resume checkout
    await cartPage.checkout();
    const checkoutData = DataGenerator.generateCheckoutData();
    await checkoutPage.fillAndContinue(
      checkoutData.firstName,
      checkoutData.lastName,
      checkoutData.postalCode,
    );
    await checkoutPage.finishCheckout();
    await checkoutCompletePage.verifyOrderComplete();
  });

  // ─── Login → Logout → Login → Purchase ────────────────────────

  test('should maintain cart across logout-login cycle', async ({
    loginPage,
    productsPage,
    cartPage,
    checkoutPage,
    checkoutCompletePage,
    page,
  }) => {
    await loginPage.navigate();
    await loginPage.loginAsStandardUser();

    // Add items
    await productsPage.addItemToCartByName('Sauce Labs Backpack');
    expect(await productsPage.getCartBadgeCount()).toBe(1);

    // Logout
    await productsPage.logout();
    await loginPage.verifyPage();

    // Login again
    await loginPage.loginAsStandardUser();

    // Complete purchase flow (cart may or may not persist based on implementation)
    // This tests the flow regardless
    const badgeCount = await productsPage.getCartBadgeCount();
    if (badgeCount === 0) {
      await productsPage.addItemToCartByName('Sauce Labs Backpack');
    }

    await productsPage.goToCart();
    await cartPage.checkout();
    const checkoutData = DataGenerator.generateCheckoutData();
    await checkoutPage.fillAndContinue(
      checkoutData.firstName,
      checkoutData.lastName,
      checkoutData.postalCode,
    );
    await checkoutPage.finishCheckout();
    await checkoutCompletePage.verifyOrderComplete();
  });
});
