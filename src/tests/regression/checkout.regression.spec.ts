import { test, expect } from '../../fixtures/base.fixture';
import { DataGenerator } from '../../utils/data-generator';

test.describe('Checkout - Regression Tests @regression', () => {
  test.beforeEach(async ({ loginPage, productsPage, cartPage }) => {
    await loginPage.navigate();
    await loginPage.loginAsStandardUser();
    await productsPage.addItemToCartByName('Sauce Labs Backpack');
    await productsPage.goToCart();
    await cartPage.checkout();
  });

  // ─── Checkout Step One (Information) ──────────────────────────

  test.describe('Step One - Information', () => {
    test('should display checkout form', async ({ checkoutPage }) => {
      await checkoutPage.verifyStepOneVisible();
    });

    test('should show error for empty first name', async ({ checkoutPage }) => {
      await checkoutPage.fillAndContinue('', 'Doe', '12345');
      await checkoutPage.verifyErrorMessage('First Name is required');
    });

    test('should show error for empty last name', async ({ checkoutPage }) => {
      await checkoutPage.fillAndContinue('John', '', '12345');
      await checkoutPage.verifyErrorMessage('Last Name is required');
    });

    test('should show error for empty postal code', async ({ checkoutPage }) => {
      await checkoutPage.fillAndContinue('John', 'Doe', '');
      await checkoutPage.verifyErrorMessage('Postal Code is required');
    });

    test('should show error for all fields empty', async ({ checkoutPage }) => {
      await checkoutPage.continueToOverview();
      expect(await checkoutPage.isErrorVisible()).toBeTruthy();
    });

    test('should accept valid checkout information', async ({ checkoutPage }) => {
      const data = DataGenerator.generateCheckoutData();
      await checkoutPage.fillAndContinue(data.firstName, data.lastName, data.postalCode);
      // Should navigate to step two
    });

    test('should handle special characters in fields', async ({ checkoutPage }) => {
      await checkoutPage.fillAndContinue("O'Brien", "Mc'Donald", '12345-6789');
      // Should proceed without error
    });

    test('should cancel checkout and return to cart', async ({ checkoutPage, cartPage }) => {
      await checkoutPage.cancelCheckout();
      await cartPage.verifyPage();
    });
  });

  // ─── Checkout Step Two (Overview) ─────────────────────────────

  test.describe('Step Two - Overview', () => {
    test.beforeEach(async ({ checkoutPage }) => {
      const data = DataGenerator.generateCheckoutData();
      await checkoutPage.fillAndContinue(data.firstName, data.lastName, data.postalCode);
    });

    test('should display order summary', async ({ checkoutPage }) => {
      const itemCount = await checkoutPage.getSummaryItemCount();
      expect(itemCount).toBe(1);
    });

    test('should display correct item in summary', async ({ checkoutPage }) => {
      const names = await checkoutPage.getSummaryItemNames();
      expect(names).toContain('Sauce Labs Backpack');
    });

    test('should display payment information', async ({ checkoutPage }) => {
      const paymentInfo = await checkoutPage.getPaymentInfo();
      expect(paymentInfo).toBeTruthy();
    });

    test('should display shipping information', async ({ checkoutPage }) => {
      const shippingInfo = await checkoutPage.getShippingInfo();
      expect(shippingInfo).toBeTruthy();
    });

    test('should calculate correct total (subtotal + tax)', async ({ checkoutPage }) => {
      await checkoutPage.verifyTotalCalculation();
    });

    test('should complete checkout successfully', async ({ checkoutPage, checkoutCompletePage }) => {
      await checkoutPage.finishCheckout();
      await checkoutCompletePage.verifyPage();
      await checkoutCompletePage.verifyOrderComplete();
    });

    test('should cancel from overview and return to products', async ({
      checkoutPage,
      productsPage,
    }) => {
      await checkoutPage.cancelFromOverview();
      await productsPage.verifyPage();
    });
  });
});
