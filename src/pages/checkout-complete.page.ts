import { type Page, type Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class CheckoutCompletePage extends BasePage {
  readonly url = '/checkout-complete.html';
  readonly pageTitle = 'Swag Labs - Checkout Complete';

  // ─── Locators ─────────────────────────────────────────────────
  private readonly pageHeader: Locator;
  private readonly completeHeader: Locator;
  private readonly completeText: Locator;
  private readonly ponyExpressImage: Locator;
  private readonly backHomeButton: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeader = page.locator('.title');
    this.completeHeader = page.locator('.complete-header');
    this.completeText = page.locator('.complete-text');
    this.ponyExpressImage = page.locator('.pony_express');
    this.backHomeButton = page.locator('[data-test="back-to-products"]');
  }

  // ─── Actions ──────────────────────────────────────────────────

  async goBackHome(): Promise<void> {
    this.logger.info('Going back to home');
    await this.click(this.backHomeButton, 'Back Home');
  }

  // ─── Getters ──────────────────────────────────────────────────

  async getCompleteHeaderText(): Promise<string> {
    return this.getText(this.completeHeader);
  }

  async getCompleteText(): Promise<string> {
    return this.getText(this.completeText);
  }

  async isPonyExpressVisible(): Promise<boolean> {
    return this.isVisible(this.ponyExpressImage);
  }

  // ─── Assertions ───────────────────────────────────────────────

  async verifyPage(): Promise<void> {
    await super.verifyPage();
    await this.expectVisible(this.pageHeader, 'Checkout complete header should be visible');
    await this.expectText(this.pageHeader, 'Checkout: Complete!');
  }

  async verifyOrderComplete(): Promise<void> {
    await this.expectVisible(this.completeHeader, 'Thank you header should be visible');
    await this.expectText(this.completeHeader, 'Thank you for your order!');
    await this.expectVisible(this.completeText, 'Complete text should be visible');
    await this.expectVisible(this.ponyExpressImage, 'Pony express image should be visible');
    await this.expectVisible(this.backHomeButton, 'Back home button should be visible');
  }
}
