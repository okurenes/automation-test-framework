import { test as base, type Page } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { ProductsPage } from '../pages/products.page';
import { ProductDetailPage } from '../pages/product-detail.page';
import { CartPage } from '../pages/cart.page';
import { CheckoutPage } from '../pages/checkout.page';
import { CheckoutCompletePage } from '../pages/checkout-complete.page';
import { ApiHelper } from '../utils/api-helper';
import { NetworkHelper } from '../utils/network-helper';
import { AllureHelper } from '../utils/allure-helper';
import { AccessibilityHelper } from '../utils/accessibility-helper';
import { PerformanceHelper } from '../utils/performance-helper';
import { SecurityHelper } from '../utils/security-helper';
import { MobileHelper } from '../utils/mobile-helper';
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
  accessibilityHelper: AccessibilityHelper;
  performanceHelper: PerformanceHelper;
  securityHelper: SecurityHelper;
  mobileHelper: MobileHelper;
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
    await use(new NetworkHelper(page));
  },

  allureHelper: async ({}, use, testInfo) => {
    await use(new AllureHelper(testInfo));
  },

  accessibilityHelper: async ({ page }, use) => {
    await use(new AccessibilityHelper(page));
  },

  performanceHelper: async ({ page }, use) => {
    await use(new PerformanceHelper(page));
  },

  securityHelper: async ({ page }, use) => {
    await use(new SecurityHelper(page));
  },

  mobileHelper: async ({ page }, use) => {
    await use(new MobileHelper(page));
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
