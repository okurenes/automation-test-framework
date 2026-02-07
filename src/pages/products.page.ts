import { type Page, type Locator } from '@playwright/test';
import { BasePage } from './base.page';

export interface ProductInfo {
  name: string;
  description: string;
  price: string;
  imageUrl: string | null;
}

export class ProductsPage extends BasePage {
  readonly url = '/inventory.html';
  readonly pageTitle = 'Swag Labs - Products';

  // ─── Locators ─────────────────────────────────────────────────
  private readonly pageHeader: Locator;
  private readonly sortDropdown: Locator;
  private readonly inventoryItems: Locator;
  private readonly inventoryItemNames: Locator;
  private readonly inventoryItemPrices: Locator;
  private readonly inventoryItemDescriptions: Locator;
  private readonly inventoryItemImages: Locator;
  private readonly shoppingCartBadge: Locator;
  private readonly shoppingCartLink: Locator;
  private readonly burgerMenuButton: Locator;
  private readonly logoutLink: Locator;
  private readonly closeBurgerMenu: Locator;
  private readonly allItemsLink: Locator;
  private readonly aboutLink: Locator;
  private readonly resetAppState: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeader = page.locator('.title');
    this.sortDropdown = page.locator('[data-test="product-sort-container"]');
    this.inventoryItems = page.locator('.inventory_item');
    this.inventoryItemNames = page.locator('.inventory_item_name');
    this.inventoryItemPrices = page.locator('.inventory_item_price');
    this.inventoryItemDescriptions = page.locator('.inventory_item_desc');
    this.inventoryItemImages = page.locator('.inventory_item_img img');
    this.shoppingCartBadge = page.locator('.shopping_cart_badge');
    this.shoppingCartLink = page.locator('.shopping_cart_link');
    this.burgerMenuButton = page.locator('#react-burger-menu-btn');
    this.logoutLink = page.locator('#logout_sidebar_link');
    this.closeBurgerMenu = page.locator('#react-burger-cross-btn');
    this.allItemsLink = page.locator('#inventory_sidebar_link');
    this.aboutLink = page.locator('#about_sidebar_link');
    this.resetAppState = page.locator('#reset_sidebar_link');
  }

  // ─── Actions ──────────────────────────────────────────────────

  async sortBy(option: 'az' | 'za' | 'lohi' | 'hilo'): Promise<void> {
    this.logger.info(`Sorting products by: ${option}`);
    await this.selectByValue(this.sortDropdown, option);
  }

  async addItemToCartByName(itemName: string): Promise<void> {
    this.logger.info(`Adding to cart: ${itemName}`);
    const item = this.inventoryItems.filter({ hasText: itemName });
    await item.locator('button').click();
  }

  async removeItemFromCartByName(itemName: string): Promise<void> {
    this.logger.info(`Removing from cart: ${itemName}`);
    const item = this.inventoryItems.filter({ hasText: itemName });
    await item.locator('button:has-text("Remove")').click();
  }

  async addItemToCartByIndex(index: number): Promise<void> {
    this.logger.info(`Adding item at index ${index} to cart`);
    await this.inventoryItems.nth(index).locator('button').click();
  }

  async addAllItemsToCart(): Promise<void> {
    const count = await this.getItemCount();
    for (let i = 0; i < count; i++) {
      await this.addItemToCartByIndex(i);
    }
    this.logger.info(`Added all ${count} items to cart`);
  }

  async clickProduct(productName: string): Promise<void> {
    this.logger.info(`Clicking product: ${productName}`);
    await this.page.locator('.inventory_item_name', { hasText: productName }).click();
  }

  async goToCart(): Promise<void> {
    this.logger.info('Navigating to cart');
    await this.click(this.shoppingCartLink, 'Shopping cart');
  }

  async openBurgerMenu(): Promise<void> {
    await this.click(this.burgerMenuButton, 'Burger menu');
    await this.page.waitForTimeout(500);
  }

  async closeBurgerMenuPanel(): Promise<void> {
    await this.click(this.closeBurgerMenu, 'Close burger menu');
  }

  async logout(): Promise<void> {
    this.logger.info('Logging out');
    await this.openBurgerMenu();
    await this.click(this.logoutLink, 'Logout');
  }

  async resetState(): Promise<void> {
    this.logger.info('Resetting app state');
    await this.openBurgerMenu();
    await this.click(this.resetAppState, 'Reset App State');
    await this.closeBurgerMenuPanel();
  }

  // ─── Getters ──────────────────────────────────────────────────

  async getItemCount(): Promise<number> {
    return this.getCount(this.inventoryItems);
  }

  async getItemNames(): Promise<string[]> {
    return this.getTexts(this.inventoryItemNames);
  }

  async getItemPrices(): Promise<string[]> {
    return this.getTexts(this.inventoryItemPrices);
  }

  async getItemPricesAsNumbers(): Promise<number[]> {
    const prices = await this.getItemPrices();
    return prices.map((p) => parseFloat(p.replace('$', '')));
  }

  async getCartBadgeCount(): Promise<number> {
    if (await this.isVisible(this.shoppingCartBadge, 2000)) {
      const text = await this.getText(this.shoppingCartBadge);
      return parseInt(text, 10);
    }
    return 0;
  }

  async isCartBadgeVisible(): Promise<boolean> {
    return this.isVisible(this.shoppingCartBadge, 2000);
  }

  async getProductInfo(index: number): Promise<ProductInfo> {
    const item = this.inventoryItems.nth(index);
    return {
      name: (await item.locator('.inventory_item_name').textContent()) || '',
      description: (await item.locator('.inventory_item_desc').textContent()) || '',
      price: (await item.locator('.inventory_item_price').textContent()) || '',
      imageUrl: await item.locator('img').getAttribute('src'),
    };
  }

  async getAllProductInfo(): Promise<ProductInfo[]> {
    const count = await this.getItemCount();
    const products: ProductInfo[] = [];
    for (let i = 0; i < count; i++) {
      products.push(await this.getProductInfo(i));
    }
    return products;
  }

  async getPageHeaderText(): Promise<string> {
    return this.getText(this.pageHeader);
  }

  // ─── Assertions ───────────────────────────────────────────────

  async verifyPage(): Promise<void> {
    await super.verifyPage();
    await this.expectVisible(this.pageHeader, 'Products header should be visible');
    await this.expectText(this.pageHeader, 'Products');
    await this.expectUrl(/inventory/);
  }

  async verifyItemCount(expectedCount: number): Promise<void> {
    const count = await this.getItemCount();
    if (count !== expectedCount) {
      throw new Error(`Expected ${expectedCount} items but found ${count}`);
    }
  }

  async verifySortedAZ(): Promise<void> {
    const names = await this.getItemNames();
    const sorted = [...names].sort((a, b) => a.localeCompare(b));
    if (JSON.stringify(names) !== JSON.stringify(sorted)) {
      throw new Error('Products are not sorted A-Z');
    }
  }

  async verifySortedZA(): Promise<void> {
    const names = await this.getItemNames();
    const sorted = [...names].sort((a, b) => b.localeCompare(a));
    if (JSON.stringify(names) !== JSON.stringify(sorted)) {
      throw new Error('Products are not sorted Z-A');
    }
  }

  async verifySortedPriceLowToHigh(): Promise<void> {
    const prices = await this.getItemPricesAsNumbers();
    const sorted = [...prices].sort((a, b) => a - b);
    if (JSON.stringify(prices) !== JSON.stringify(sorted)) {
      throw new Error('Products are not sorted by price low to high');
    }
  }

  async verifySortedPriceHighToLow(): Promise<void> {
    const prices = await this.getItemPricesAsNumbers();
    const sorted = [...prices].sort((a, b) => b - a);
    if (JSON.stringify(prices) !== JSON.stringify(sorted)) {
      throw new Error('Products are not sorted by price high to low');
    }
  }
}
