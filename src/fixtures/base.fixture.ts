import { test as base, type Page, type BrowserContext } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { ProductsPage } from '../pages/products.page';
import { ProductDetailPage } from '../pages/product-detail.page';
import { CartPage } from '../pages/cart.page';
import { CheckoutPage } from '../pages/checkout.page';
import { CheckoutCompletePage } from '../pages/checkout-complete.page';
import { ApiHelper } from '../utils/api-helper';
import { NetworkHelper } from '../utils/network-helper';
import { AllureHelper } from '../utils/allure-helper';
import { DEFAULT_USER, type TestUser, TEST_USERS } from '../../config/test-users.config';

export interface PageObjects {
  loginPage: LoginPage;
  productsPage: ProductsPage;
  productDetailPage: ProductDetailPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  checkoutCompletePage: CheckoutCompletePage;
}

export interface TestFixtures extends PageObjects {
  apiHelper: ApiHelper;
  networkHelper: NetworkHelper;
  allureHelper: AllureHelper;
  authenticatedPage: Page;
  testUser: TestUser;
}

export const test = base.extend<TestFixtures>({
  // ─── Page Objects ───────────────────────────────────────────

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  productsPage: async ({ page }, use) => {
    await use(new ProductsPage(page));
  },

  productDetailPage: async ({ page }, use) => {
    await use(new ProductDetailPage(page));
  },

  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },

  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },

  checkoutCompletePage: async ({ page }, use) => {
    await use(new CheckoutCompletePage(page));
  },

  // ─── Helpers ────────────────────────────────────────────────

  apiHelper: async ({}, use) => {
    const helper = new ApiHelper();
    await helper.init();
    await use(helper);
    await helper.dispose();
  },

  networkHelper: async ({ page }, use) => {
    const helper = new NetworkHelper(page);
    await use(helper);
  },

  allureHelper: async ({}, use, testInfo) => {
    const helper = new AllureHelper(testInfo);
    await use(helper);
  },

  // ─── Test User ──────────────────────────────────────────────

  testUser: async ({}, use) => {
    await use(DEFAULT_USER);
  },

  // ─── Authenticated Page ─────────────────────────────────────

  authenticatedPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(DEFAULT_USER.username, DEFAULT_USER.password);
    await use(page);
  },
});

export { expect } from '@playwright/test';
export { TEST_USERS };
