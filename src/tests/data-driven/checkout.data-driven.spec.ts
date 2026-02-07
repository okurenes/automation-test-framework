import { test, expect } from '../../fixtures/base.fixture';
import testData from '../../data/test-data.json';

test.describe('Checkout - Data-Driven Tests @regression', () => {
  test.beforeEach(async ({ loginPage, productsPage, cartPage }) => {
    await loginPage.navigate();
    await loginPage.loginAsStandardUser();
    await productsPage.addItemToCartByName('Sauce Labs Backpack');
    await productsPage.goToCart();
    await cartPage.checkout();
  });

  // ─── Valid Checkout Scenarios ─────────────────────────────────

  for (const data of testData.checkoutData.validCheckouts) {
    test(`should accept valid checkout info: ${data.description}`, async ({
      checkoutPage,
    }) => {
      await checkoutPage.fillAndContinue(data.firstName, data.lastName, data.postalCode);
      // Should navigate to step two without error
      const summaryCount = await checkoutPage.getSummaryItemCount();
      expect(summaryCount).toBe(1);
    });
  }

  // ─── Invalid Checkout Scenarios ───────────────────────────────

  for (const data of testData.checkoutData.invalidCheckouts) {
    test(`should show error: ${data.description}`, async ({ checkoutPage }) => {
      await checkoutPage.fillAndContinue(data.firstName, data.lastName, data.postalCode);
      await checkoutPage.verifyErrorMessage(data.expectedError);
    });
  }
});
