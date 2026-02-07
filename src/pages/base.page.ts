import { type Page, type Locator, type BrowserContext, expect } from '@playwright/test';
import { Logger } from '../utils/logger';

export abstract class BasePage {
  protected readonly page: Page;
  protected readonly context: BrowserContext;
  protected readonly logger: Logger;

  abstract readonly url: string;
  abstract readonly pageTitle: string;

  constructor(page: Page) {
    this.page = page;
    this.context = page.context();
    this.logger = new Logger(this.constructor.name);
  }

  // ─── Navigation ───────────────────────────────────────────────

  async navigate(): Promise<void> {
    this.logger.info(`Navigating to ${this.url}`);
    await this.page.goto(this.url, { waitUntil: 'domcontentloaded' });
    await this.waitForPageLoad();
  }

  async navigateAndVerify(): Promise<void> {
    await this.navigate();
    await this.verifyPage();
  }

  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }

  async verifyPage(): Promise<void> {
    this.logger.info(`Verifying page: ${this.pageTitle}`);
    await this.waitForPageLoad();
  }

  // ─── Element Interactions ─────────────────────────────────────

  async click(locator: Locator, description?: string): Promise<void> {
    this.logger.info(`Clicking: ${description || locator.toString()}`);
    await locator.waitFor({ state: 'visible', timeout: 10000 });
    await locator.click();
  }

  async fill(locator: Locator, value: string, description?: string): Promise<void> {
    this.logger.info(`Filling "${description || locator.toString()}" with value`);
    await locator.waitFor({ state: 'visible', timeout: 10000 });
    await locator.clear();
    await locator.fill(value);
  }

  async getText(locator: Locator): Promise<string> {
    await locator.waitFor({ state: 'visible', timeout: 10000 });
    return (await locator.textContent()) || '';
  }

  async getTexts(locator: Locator): Promise<string[]> {
    return locator.allTextContents();
  }

  async getAttribute(locator: Locator, attribute: string): Promise<string | null> {
    await locator.waitFor({ state: 'visible', timeout: 10000 });
    return locator.getAttribute(attribute);
  }

  async isVisible(locator: Locator, timeout = 5000): Promise<boolean> {
    try {
      await locator.waitFor({ state: 'visible', timeout });
      return true;
    } catch {
      return false;
    }
  }

  async isEnabled(locator: Locator): Promise<boolean> {
    return locator.isEnabled();
  }

  async getCount(locator: Locator): Promise<number> {
    return locator.count();
  }

  // ─── Dropdown & Select ────────────────────────────────────────

  async selectByValue(locator: Locator, value: string): Promise<void> {
    this.logger.info(`Selecting value: ${value}`);
    await locator.selectOption({ value });
  }

  async selectByLabel(locator: Locator, label: string): Promise<void> {
    this.logger.info(`Selecting label: ${label}`);
    await locator.selectOption({ label });
  }

  // ─── Scrolling ────────────────────────────────────────────────

  async scrollToElement(locator: Locator): Promise<void> {
    await locator.scrollIntoViewIfNeeded();
  }

  async scrollToBottom(): Promise<void> {
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  }

  async scrollToTop(): Promise<void> {
    await this.page.evaluate(() => window.scrollTo(0, 0));
  }

  // ─── Touch Gestures (Mobile) ─────────────────────────────────

  async tap(locator: Locator, description?: string): Promise<void> {
    this.logger.info(`Tapping: ${description || locator.toString()}`);
    await locator.tap();
  }

  async swipeLeft(locator: Locator): Promise<void> {
    const box = await locator.boundingBox();
    if (box) {
      await this.page.mouse.move(box.x + box.width * 0.8, box.y + box.height / 2);
      await this.page.mouse.down();
      await this.page.mouse.move(box.x + box.width * 0.2, box.y + box.height / 2, { steps: 10 });
      await this.page.mouse.up();
    }
  }

  async swipeRight(locator: Locator): Promise<void> {
    const box = await locator.boundingBox();
    if (box) {
      await this.page.mouse.move(box.x + box.width * 0.2, box.y + box.height / 2);
      await this.page.mouse.down();
      await this.page.mouse.move(box.x + box.width * 0.8, box.y + box.height / 2, { steps: 10 });
      await this.page.mouse.up();
    }
  }

  async swipeDown(): Promise<void> {
    const viewportSize = this.page.viewportSize();
    if (viewportSize) {
      await this.page.mouse.move(viewportSize.width / 2, viewportSize.height * 0.3);
      await this.page.mouse.down();
      await this.page.mouse.move(viewportSize.width / 2, viewportSize.height * 0.7, {
        steps: 10,
      });
      await this.page.mouse.up();
    }
  }

  async swipeUp(): Promise<void> {
    const viewportSize = this.page.viewportSize();
    if (viewportSize) {
      await this.page.mouse.move(viewportSize.width / 2, viewportSize.height * 0.7);
      await this.page.mouse.down();
      await this.page.mouse.move(viewportSize.width / 2, viewportSize.height * 0.3, {
        steps: 10,
      });
      await this.page.mouse.up();
    }
  }

  // ─── Assertions ───────────────────────────────────────────────

  async expectVisible(locator: Locator, message?: string): Promise<void> {
    await expect(locator, message).toBeVisible();
  }

  async expectHidden(locator: Locator, message?: string): Promise<void> {
    await expect(locator, message).toBeHidden();
  }

  async expectText(locator: Locator, expectedText: string): Promise<void> {
    await expect(locator).toHaveText(expectedText);
  }

  async expectContainText(locator: Locator, expectedText: string): Promise<void> {
    await expect(locator).toContainText(expectedText);
  }

  async expectUrl(urlPattern: string | RegExp): Promise<void> {
    await expect(this.page).toHaveURL(urlPattern);
  }

  // ─── Screenshots ──────────────────────────────────────────────

  async takeScreenshot(name: string): Promise<Buffer> {
    this.logger.info(`Taking screenshot: ${name}`);
    return this.page.screenshot({
      path: `reports/screenshots/${name}.png`,
      fullPage: true,
    });
  }

  // ─── Network ──────────────────────────────────────────────────

  async waitForResponse(urlPattern: string | RegExp, status = 200): Promise<void> {
    await this.page.waitForResponse(
      (response) => {
        const urlMatch =
          typeof urlPattern === 'string'
            ? response.url().includes(urlPattern)
            : urlPattern.test(response.url());
        return urlMatch && response.status() === status;
      },
      { timeout: 15000 },
    );
  }

  async waitForNetworkIdle(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  // ─── Viewport ─────────────────────────────────────────────────

  getViewportSize(): { width: number; height: number } | null {
    return this.page.viewportSize();
  }

  isMobileViewport(): boolean {
    const viewport = this.getViewportSize();
    return viewport ? viewport.width < 768 : false;
  }

  isTabletViewport(): boolean {
    const viewport = this.getViewportSize();
    return viewport ? viewport.width >= 768 && viewport.width < 1024 : false;
  }
}
