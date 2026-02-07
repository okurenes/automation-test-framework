import { type Page, type Locator } from '@playwright/test';
import { BasePage } from './base.page';

export interface CartItem {
  name: string;
  description: string;
  price: string;
  quantity: string;
}

export class CartPage extends BasePage {
  readonly url = '/cart.html';
  readonly pageTitle = 'Swag Labs - Cart';

  // ─── Locators ─────────────────────────────────────────────────
  private readonly pageHeader: Locator;
  private readonly cartItems: Locator;
  private readonly cartItemNames: Locator;
  private readonly cartItemPrices: Locator;
  private readonly cartItemDescriptions: Locator;
  private readonly cartItemQuantities: Locator;
  private readonly continueShoppingButton: Locator;
  private readonly checkoutButton: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeader = page.locator('.title');
    this.cartItems = page.locator('.cart_item');
    this.cartItemNames = page.locator('.inventory_item_name');
    this.cartItemPrices = page.locator('.inventory_item_price');
    this.cartItemDescriptions = page.locator('.cart_item .inventory_item_desc');
    this.cartItemQuantities = page.locator('.cart_quantity');
    this.continueShoppingButton = page.locator('[data-test="continue-shopping"]');
    this.checkoutButton = page.locator('[data-test="checkout"]');
  }

  // ─── Actions ──────────────────────────────────────────────────

  async removeItem(itemName: string): Promise<void> {
    this.logger.info(`Removing item from cart: ${itemName}`);
    const item = this.cartItems.filter({ hasText: itemName });
    await item.locator('button:has-text("Remove")').click();
  }

  async removeAllItems(): Promise<void> {
    this.logger.info('Removing all items from cart');
    const count = await this.getItemCount();
    for (let i = count - 1; i >= 0; i--) {
      await this.cartItems.nth(i).locator('button:has-text("Remove")').click();
    }
  }

  async continueShopping(): Promise<void> {
    this.logger.info('Continuing shopping');
    await this.click(this.continueShoppingButton, 'Continue Shopping');
  }

  async checkout(): Promise<void> {
    this.logger.info('Proceeding to checkout');
    await this.click(this.checkoutButton, 'Checkout');
  }

  async clickItemName(itemName: string): Promise<void> {
    await this.page.locator('.inventory_item_name', { hasText: itemName }).click();
  }

  // ─── Getters ──────────────────────────────────────────────────

  async getItemCount(): Promise<number> {
    return this.getCount(this.cartItems);
  }

  async getItemNames(): Promise<string[]> {
    return this.getTexts(this.cartItemNames);
  }

  async getItemPrices(): Promise<string[]> {
    return this.getTexts(this.cartItemPrices);
  }

  async getTotalPrice(): Promise<number> {
    const prices = await this.getItemPrices();
    return prices.reduce((sum, p) => sum + parseFloat(p.replace('$', '')), 0);
  }

  async getCartItem(index: number): Promise<CartItem> {
    const item = this.cartItems.nth(index);
    return {
      name: (await item.locator('.inventory_item_name').textContent()) || '',
      description: (await item.locator('.inventory_item_desc').textContent()) || '',
      price: (await item.locator('.inventory_item_price').textContent()) || '',
      quantity: (await item.locator('.cart_quantity').textContent()) || '',
    };
  }

  async getAllCartItems(): Promise<CartItem[]> {
    const count = await this.getItemCount();
    const items: CartItem[] = [];
    for (let i = 0; i < count; i++) {
      items.push(await this.getCartItem(i));
    }
    return items;
  }

  async isItemInCart(itemName: string): Promise<boolean> {
    const names = await this.getItemNames();
    return names.includes(itemName);
  }

  async isCartEmpty(): Promise<boolean> {
    return (await this.getItemCount()) === 0;
  }

  // ─── Assertions ───────────────────────────────────────────────

  async verifyPage(): Promise<void> {
    await super.verifyPage();
    await this.expectVisible(this.pageHeader, 'Cart header should be visible');
    await this.expectText(this.pageHeader, 'Your Cart');
  }

  async verifyItemInCart(itemName: string): Promise<void> {
    const isInCart = await this.isItemInCart(itemName);
    if (!isInCart) {
      throw new Error(`Item "${itemName}" not found in cart`);
    }
  }

  async verifyCartItemCount(expectedCount: number): Promise<void> {
    const count = await this.getItemCount();
    if (count !== expectedCount) {
      throw new Error(`Expected ${expectedCount} items in cart but found ${count}`);
    }
  }

  async verifyEmptyCart(): Promise<void> {
    const count = await this.getItemCount();
    if (count !== 0) {
      throw new Error(`Expected empty cart but found ${count} items`);
    }
  }
}
