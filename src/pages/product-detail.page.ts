import { type Page, type Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class ProductDetailPage extends BasePage {
  readonly url = '/inventory-item.html';
  readonly pageTitle = 'Swag Labs - Product Detail';

  // ─── Locators ─────────────────────────────────────────────────
  private readonly productName: Locator;
  private readonly productDescription: Locator;
  private readonly productPrice: Locator;
  private readonly productImage: Locator;
  private readonly addToCartButton: Locator;
  private readonly removeButton: Locator;
  private readonly backButton: Locator;
  private readonly shoppingCartBadge: Locator;
  private readonly shoppingCartLink: Locator;

  constructor(page: Page) {
    super(page);
    this.productName = page.locator('.inventory_details_name');
    this.productDescription = page.locator('.inventory_details_desc');
    this.productPrice = page.locator('.inventory_details_price');
    this.productImage = page.locator('.inventory_details_img');
    this.addToCartButton = page.locator('button:has-text("Add to cart")');
    this.removeButton = page.locator('button:has-text("Remove")');
    this.backButton = page.locator('[data-test="back-to-products"]');
    this.shoppingCartBadge = page.locator('.shopping_cart_badge');
    this.shoppingCartLink = page.locator('.shopping_cart_link');
  }

  // ─── Actions ──────────────────────────────────────────────────

  async addToCart(): Promise<void> {
    this.logger.info('Adding product to cart from detail page');
    await this.click(this.addToCartButton, 'Add to cart');
  }

  async removeFromCart(): Promise<void> {
    this.logger.info('Removing product from cart');
    await this.click(this.removeButton, 'Remove from cart');
  }

  async goBackToProducts(): Promise<void> {
    this.logger.info('Going back to products');
    await this.click(this.backButton, 'Back to products');
  }

  async goToCart(): Promise<void> {
    await this.click(this.shoppingCartLink, 'Shopping cart');
  }

  // ─── Getters ──────────────────────────────────────────────────

  async getName(): Promise<string> {
    return this.getText(this.productName);
  }

  async getDescription(): Promise<string> {
    return this.getText(this.productDescription);
  }

  async getPrice(): Promise<string> {
    return this.getText(this.productPrice);
  }

  async getPriceAsNumber(): Promise<number> {
    const price = await this.getPrice();
    return parseFloat(price.replace('$', ''));
  }

  async getImageSrc(): Promise<string | null> {
    return this.getAttribute(this.productImage.locator('img'), 'src');
  }

  async isAddToCartVisible(): Promise<boolean> {
    return this.isVisible(this.addToCartButton);
  }

  async isRemoveVisible(): Promise<boolean> {
    return this.isVisible(this.removeButton);
  }

  async getCartBadgeCount(): Promise<number> {
    if (await this.isVisible(this.shoppingCartBadge, 2000)) {
      const text = await this.getText(this.shoppingCartBadge);
      return parseInt(text, 10);
    }
    return 0;
  }

  // ─── Assertions ───────────────────────────────────────────────

  async verifyPage(): Promise<void> {
    await super.verifyPage();
    await this.expectVisible(this.productName, 'Product name should be visible');
    await this.expectVisible(this.productPrice, 'Product price should be visible');
  }

  async verifyProductDetails(expectedName: string, expectedPrice?: string): Promise<void> {
    await this.expectText(this.productName, expectedName);
    if (expectedPrice) {
      await this.expectText(this.productPrice, expectedPrice);
    }
  }
}
