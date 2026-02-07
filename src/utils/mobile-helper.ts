import { type Page, type Locator } from '@playwright/test';
import { Logger } from './logger';

export interface ResponsiveCheckResult {
  element: string;
  visible: boolean;
  withinViewport: boolean;
  overflowing: boolean;
  boundingBox: { x: number; y: number; width: number; height: number } | null;
}

export interface OrientationMetrics {
  orientation: 'portrait' | 'landscape';
  viewportWidth: number;
  viewportHeight: number;
}

export class MobileHelper {
  private readonly page: Page;
  private readonly logger = new Logger('MobileHelper');

  constructor(page: Page) {
    this.page = page;
  }

  // ─── Touch Gestures ───────────────────────────────────────────

  async tap(locator: Locator): Promise<void> {
    this.logger.info('Performing tap gesture');
    await locator.tap();
  }

  async doubleTap(locator: Locator): Promise<void> {
    this.logger.info('Performing double tap gesture');
    await locator.dblclick();
  }

  async longPress(locator: Locator, duration = 1000): Promise<void> {
    this.logger.info(`Performing long press (${duration}ms)`);
    const box = await locator.boundingBox();
    if (!box) throw new Error('Element not found for long press');

    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;

    await this.page.mouse.move(x, y);
    await this.page.mouse.down();
    await this.page.waitForTimeout(duration);
    await this.page.mouse.up();
  }

  async swipeLeft(startX?: number, startY?: number, distance = 200): Promise<void> {
    const viewport = this.page.viewportSize();
    if (!viewport) return;

    const x = startX ?? viewport.width * 0.8;
    const y = startY ?? viewport.height / 2;

    this.logger.info(`Swiping left from (${x}, ${y})`);
    await this.page.mouse.move(x, y);
    await this.page.mouse.down();
    await this.page.mouse.move(x - distance, y, { steps: 15 });
    await this.page.mouse.up();
  }

  async swipeRight(startX?: number, startY?: number, distance = 200): Promise<void> {
    const viewport = this.page.viewportSize();
    if (!viewport) return;

    const x = startX ?? viewport.width * 0.2;
    const y = startY ?? viewport.height / 2;

    this.logger.info(`Swiping right from (${x}, ${y})`);
    await this.page.mouse.move(x, y);
    await this.page.mouse.down();
    await this.page.mouse.move(x + distance, y, { steps: 15 });
    await this.page.mouse.up();
  }

  async swipeUp(startX?: number, startY?: number, distance = 300): Promise<void> {
    const viewport = this.page.viewportSize();
    if (!viewport) return;

    const x = startX ?? viewport.width / 2;
    const y = startY ?? viewport.height * 0.7;

    this.logger.info(`Swiping up from (${x}, ${y})`);
    await this.page.mouse.move(x, y);
    await this.page.mouse.down();
    await this.page.mouse.move(x, y - distance, { steps: 15 });
    await this.page.mouse.up();
  }

  async swipeDown(startX?: number, startY?: number, distance = 300): Promise<void> {
    const viewport = this.page.viewportSize();
    if (!viewport) return;

    const x = startX ?? viewport.width / 2;
    const y = startY ?? viewport.height * 0.3;

    this.logger.info(`Swiping down from (${x}, ${y})`);
    await this.page.mouse.move(x, y);
    await this.page.mouse.down();
    await this.page.mouse.move(x, y + distance, { steps: 15 });
    await this.page.mouse.up();
  }

  async swipeOnElement(
    locator: Locator,
    direction: 'left' | 'right' | 'up' | 'down',
  ): Promise<void> {
    const box = await locator.boundingBox();
    if (!box) throw new Error('Element not found for swipe');

    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;

    switch (direction) {
      case 'left':
        await this.swipeLeft(centerX, centerY, box.width * 0.6);
        break;
      case 'right':
        await this.swipeRight(centerX - box.width * 0.3, centerY, box.width * 0.6);
        break;
      case 'up':
        await this.swipeUp(centerX, centerY, box.height * 0.6);
        break;
      case 'down':
        await this.swipeDown(centerX, centerY - box.height * 0.3, box.height * 0.6);
        break;
    }
  }

  async pinchZoom(
    locator: Locator,
    scale: 'in' | 'out',
  ): Promise<void> {
    this.logger.info(`Performing pinch-${scale}`);
    const box = await locator.boundingBox();
    if (!box) throw new Error('Element not found for pinch zoom');

    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;
    const distance = scale === 'out' ? 100 : -50;

    // Simulate pinch with mouse wheel (zoom)
    await this.page.mouse.move(centerX, centerY);
    await this.page.mouse.wheel(0, distance);
  }

  // ─── Orientation ──────────────────────────────────────────────

  async setPortrait(): Promise<void> {
    const viewport = this.page.viewportSize();
    if (!viewport) return;

    if (viewport.width > viewport.height) {
      this.logger.info('Switching to portrait orientation');
      await this.page.setViewportSize({
        width: viewport.height,
        height: viewport.width,
      });
    }
  }

  async setLandscape(): Promise<void> {
    const viewport = this.page.viewportSize();
    if (!viewport) return;

    if (viewport.height > viewport.width) {
      this.logger.info('Switching to landscape orientation');
      await this.page.setViewportSize({
        width: viewport.height,
        height: viewport.width,
      });
    }
  }

  async toggleOrientation(): Promise<OrientationMetrics> {
    const viewport = this.page.viewportSize();
    if (!viewport) throw new Error('No viewport size');

    await this.page.setViewportSize({
      width: viewport.height,
      height: viewport.width,
    });

    const newViewport = this.page.viewportSize()!;
    return {
      orientation: newViewport.width < newViewport.height ? 'portrait' : 'landscape',
      viewportWidth: newViewport.width,
      viewportHeight: newViewport.height,
    };
  }

  getOrientation(): 'portrait' | 'landscape' {
    const viewport = this.page.viewportSize();
    if (!viewport) return 'portrait';
    return viewport.width < viewport.height ? 'portrait' : 'landscape';
  }

  // ─── Responsive Checks ────────────────────────────────────────

  async checkElementResponsiveness(selectors: string[]): Promise<ResponsiveCheckResult[]> {
    this.logger.info('Checking element responsiveness...');
    const viewport = this.page.viewportSize();
    if (!viewport) return [];

    const results: ResponsiveCheckResult[] = [];

    for (const selector of selectors) {
      const locator = this.page.locator(selector).first();
      const visible = await locator.isVisible().catch(() => false);
      let withinViewport = false;
      let overflowing = false;
      let boundingBox = null;

      if (visible) {
        const box = await locator.boundingBox();
        if (box) {
          boundingBox = box;
          withinViewport =
            box.x >= 0 &&
            box.y >= 0 &&
            box.x + box.width <= viewport.width &&
            box.y + box.height <= viewport.height;
          overflowing = box.x + box.width > viewport.width || box.y + box.height > viewport.height;
        }
      }

      results.push({
        element: selector,
        visible,
        withinViewport,
        overflowing,
        boundingBox,
      });
    }

    return results;
  }

  async checkNoHorizontalScroll(): Promise<boolean> {
    return this.page.evaluate(() => {
      return document.documentElement.scrollWidth <= document.documentElement.clientWidth;
    });
  }

  async checkTouchTargetSizes(
    selectors: string[],
    minSize = 44,
  ): Promise<Array<{ selector: string; width: number; height: number; meetsMinimum: boolean }>> {
    this.logger.info(`Checking touch target sizes (min: ${minSize}px)...`);
    const results: Array<{ selector: string; width: number; height: number; meetsMinimum: boolean }> = [];

    for (const selector of selectors) {
      const locator = this.page.locator(selector).first();
      const box = await locator.boundingBox().catch(() => null);

      if (box) {
        results.push({
          selector,
          width: Math.round(box.width),
          height: Math.round(box.height),
          meetsMinimum: box.width >= minSize && box.height >= minSize,
        });
      }
    }

    return results;
  }

  async checkFontReadability(
    minFontSize = 12,
  ): Promise<Array<{ selector: string; fontSize: string; readable: boolean }>> {
    return this.page.evaluate((minSize) => {
      const results: Array<{ selector: string; fontSize: string; readable: boolean }> = [];
      const textElements = document.querySelectorAll('p, span, a, li, td, th, h1, h2, h3, h4, h5, h6, label, button, input');

      textElements.forEach((el) => {
        const style = window.getComputedStyle(el);
        const fontSize = parseFloat(style.fontSize);
        if (el.textContent && el.textContent.trim()) {
          results.push({
            selector: `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${el.className ? '.' + el.className.split(' ')[0] : ''}`,
            fontSize: style.fontSize,
            readable: fontSize >= minSize,
          });
        }
      });

      return results.slice(0, 50); // Limit to first 50
    }, minFontSize);
  }

  // ─── Viewport Info ────────────────────────────────────────────

  isMobile(): boolean {
    const viewport = this.page.viewportSize();
    return viewport ? viewport.width < 768 : false;
  }

  isTablet(): boolean {
    const viewport = this.page.viewportSize();
    return viewport ? viewport.width >= 768 && viewport.width < 1024 : false;
  }

  isDesktop(): boolean {
    const viewport = this.page.viewportSize();
    return viewport ? viewport.width >= 1024 : false;
  }
}
