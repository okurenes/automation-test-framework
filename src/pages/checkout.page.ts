import { type Page, type Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class CheckoutPage extends BasePage {
  readonly url = '/checkout-step-one.html';
  readonly pageTitle = 'Swag Labs - Checkout';

  // ─── Step One Locators ────────────────────────────────────────
  private readonly stepOneHeader: Locator;
  private readonly firstNameInput: Locator;
  private readonly lastNameInput: Locator;
  private readonly postalCodeInput: Locator;
  private readonly continueButton: Locator;
  private readonly cancelButton: Locator;
  private readonly errorMessage: Locator;

  // ─── Step Two (Overview) Locators ─────────────────────────────
  private readonly stepTwoHeader: Locator;
  private readonly summaryItems: Locator;
  private readonly summaryItemNames: Locator;
  private readonly summaryItemPrices: Locator;
  private readonly summarySubtotal: Locator;
  private readonly summaryTax: Locator;
  private readonly summaryTotal: Locator;
  private readonly finishButton: Locator;
  private readonly cancelButtonOverview: Locator;
  private readonly paymentInfo: Locator;
  private readonly shippingInfo: Locator;

  constructor(page: Page) {
    super(page);
    // Step One
    this.stepOneHeader = page.locator('.title');
    this.firstNameInput = page.locator('[data-test="firstName"]');
    this.lastNameInput = page.locator('[data-test="lastName"]');
    this.postalCodeInput = page.locator('[data-test="postalCode"]');
    this.continueButton = page.locator('[data-test="continue"]');
    this.cancelButton = page.locator('[data-test="cancel"]');
    this.errorMessage = page.locator('[data-test="error"]');

    // Step Two (Overview)
    this.stepTwoHeader = page.locator('.title');
    this.summaryItems = page.locator('.cart_item');
    this.summaryItemNames = page.locator('.inventory_item_name');
    this.summaryItemPrices = page.locator('.inventory_item_price');
    this.summarySubtotal = page.locator('.summary_subtotal_label');
    this.summaryTax = page.locator('.summary_tax_label');
    this.summaryTotal = page.locator('.summary_info_label.summary_total_label');
    this.finishButton = page.locator('[data-test="finish"]');
    this.cancelButtonOverview = page.locator('[data-test="cancel"]');
    this.paymentInfo = page.locator('.summary_value_label').first();
    this.shippingInfo = page.locator('.summary_value_label').nth(1);
  }

  // ─── Step One Actions ─────────────────────────────────────────

  async fillCheckoutInfo(firstName: string, lastName: string, postalCode: string): Promise<void> {
    this.logger.info(`Filling checkout info: ${firstName} ${lastName}, ${postalCode}`);
    await this.fill(this.firstNameInput, firstName, 'First Name');
    await this.fill(this.lastNameInput, lastName, 'Last Name');
    await this.fill(this.postalCodeInput, postalCode, 'Postal Code');
  }

  async continueToOverview(): Promise<void> {
    this.logger.info('Continuing to checkout overview');
    await this.click(this.continueButton, 'Continue');
  }

  async fillAndContinue(firstName: string, lastName: string, postalCode: string): Promise<void> {
    await this.fillCheckoutInfo(firstName, lastName, postalCode);
    await this.continueToOverview();
  }

  async cancelCheckout(): Promise<void> {
    this.logger.info('Cancelling checkout');
    await this.click(this.cancelButton, 'Cancel');
  }

  // ─── Step Two Actions ─────────────────────────────────────────

  async finishCheckout(): Promise<void> {
    this.logger.info('Finishing checkout');
    await this.click(this.finishButton, 'Finish');
  }

  async cancelFromOverview(): Promise<void> {
    this.logger.info('Cancelling from overview');
    await this.click(this.cancelButtonOverview, 'Cancel');
  }

  // ─── Getters ──────────────────────────────────────────────────

  async getErrorMessage(): Promise<string> {
    return this.getText(this.errorMessage);
  }

  async isErrorVisible(): Promise<boolean> {
    return this.isVisible(this.errorMessage);
  }

  async getSubtotal(): Promise<string> {
    return this.getText(this.summarySubtotal);
  }

  async getSubtotalAsNumber(): Promise<number> {
    const text = await this.getSubtotal();
    const match = text.match(/\$(.+)/);
    return match ? parseFloat(match[1]) : 0;
  }

  async getTax(): Promise<string> {
    return this.getText(this.summaryTax);
  }

  async getTaxAsNumber(): Promise<number> {
    const text = await this.getTax();
    const match = text.match(/\$(.+)/);
    return match ? parseFloat(match[1]) : 0;
  }

  async getTotal(): Promise<string> {
    return this.getText(this.summaryTotal);
  }

  async getTotalAsNumber(): Promise<number> {
    const text = await this.getTotal();
    const match = text.match(/\$(.+)/);
    return match ? parseFloat(match[1]) : 0;
  }

  async getSummaryItemNames(): Promise<string[]> {
    return this.getTexts(this.summaryItemNames);
  }

  async getSummaryItemCount(): Promise<number> {
    return this.getCount(this.summaryItems);
  }

  async getPaymentInfo(): Promise<string> {
    return this.getText(this.paymentInfo);
  }

  async getShippingInfo(): Promise<string> {
    return this.getText(this.shippingInfo);
  }

  // ─── Assertions ───────────────────────────────────────────────

  async verifyPage(): Promise<void> {
    await super.verifyPage();
    await this.expectVisible(this.stepOneHeader, 'Checkout header should be visible');
  }

  async verifyStepOneVisible(): Promise<void> {
    await this.expectVisible(this.firstNameInput, 'First name input should be visible');
    await this.expectVisible(this.lastNameInput, 'Last name input should be visible');
    await this.expectVisible(this.postalCodeInput, 'Postal code input should be visible');
  }

  async verifyErrorMessage(expectedMessage: string): Promise<void> {
    await this.expectVisible(this.errorMessage, 'Error message should be visible');
    await this.expectContainText(this.errorMessage, expectedMessage);
  }

  async verifyTotalCalculation(): Promise<void> {
    const subtotal = await this.getSubtotalAsNumber();
    const tax = await this.getTaxAsNumber();
    const total = await this.getTotalAsNumber();
    const calculated = Math.round((subtotal + tax) * 100) / 100;
    if (Math.abs(calculated - total) > 0.01) {
      throw new Error(`Total mismatch: ${subtotal} + ${tax} = ${calculated}, but displayed ${total}`);
    }
  }
}
