import { test, expect } from '../../fixtures/base.fixture';

test.describe('Products - Smoke Tests @smoke', () => {
  test.beforeEach(async ({ loginPage, productsPage }) => {
    await loginPage.navigate();
    await loginPage.loginAsStandardUser();
    await productsPage.verifyPage();
  });

  test('should display products page after login', async ({ productsPage }) => {
    const headerText = await productsPage.getPageHeaderText();
    expect(headerText).toBe('Products');
  });

  test('should display 6 products', async ({ productsPage }) => {
    const count = await productsPage.getItemCount();
    expect(count).toBe(6);
  });

  test('should add item to cart', async ({ productsPage }) => {
    await productsPage.addItemToCartByName('Sauce Labs Backpack');
    const badgeCount = await productsPage.getCartBadgeCount();
    expect(badgeCount).toBe(1);
  });

  test('should navigate to cart', async ({ productsPage, cartPage }) => {
    await productsPage.addItemToCartByName('Sauce Labs Backpack');
    await productsPage.goToCart();
    await cartPage.verifyPage();
  });

  test('should open product detail', async ({ productsPage, productDetailPage }) => {
    await productsPage.clickProduct('Sauce Labs Backpack');
    await productDetailPage.verifyPage();
  });

  test('should logout successfully', async ({ productsPage, loginPage }) => {
    await productsPage.logout();
    await loginPage.verifyPage();
  });
});
