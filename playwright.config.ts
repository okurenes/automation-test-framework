import { defineConfig } from '@playwright/test';
import { ENV } from './config/env.config';
import { defaultMobileDevice, defaultAndroidDevice, defaultTabletDevice } from './config/devices.config';

export default defineConfig({
  testDir: './src/tests',
  globalSetup: require.resolve('./global-setup'),
  globalTeardown: require.resolve('./global-teardown'),
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? ENV.retries : 0,
  workers: process.env.CI ? ENV.workers : undefined,
  timeout: ENV.timeout,

  expect: {
    timeout: ENV.expectTimeout,
    toHaveScreenshot: {
      maxDiffPixels: 100,
      threshold: 0.2,
      animations: 'disabled',
    },
  },

  reporter: [
    ['list'],
    [
      'html',
      {
        outputFolder: 'reports/playwright-html',
        open: 'never',
      },
    ],
    [
      'allure-playwright',
      {
        detail: true,
        outputFolder: 'reports/allure-results',
        suiteTitle: true,
        categories: [
          {
            name: 'Outdated tests',
            messageRegex: '.*FileNotFound.*',
          },
          {
            name: 'Product defects',
            messageRegex: '.*AssertionError.*',
          },
          {
            name: 'Test defects',
            messageRegex: '.*TypeError.*',
          },
        ],
        environmentInfo: {
          Framework: 'Playwright',
          Environment: process.env.TEST_ENV || 'staging',
          BaseURL: ENV.baseURL,
          Node: process.version,
          OS: process.platform,
        },
      },
    ],
    ['json', { outputFile: 'reports/test-results.json' }],
  ],

  use: {
    baseURL: ENV.baseURL,
    trace: ENV.traceOnFailure ? 'retain-on-failure' : 'off',
    screenshot: ENV.screenshotOnFailure ? 'only-on-failure' : 'off',
    video: ENV.videoOnFailure ? 'retain-on-failure' : 'off',
    actionTimeout: 15000,
    navigationTimeout: 30000,
    locale: 'tr-TR',
    timezoneId: 'Europe/Istanbul',
    ignoreHTTPSErrors: true,
    bypassCSP: true,
    extraHTTPHeaders: {
      'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
    },
  },

  projects: [
    // Mobile Devices
    {
      name: 'iPhone 14',
      use: {
        ...defaultMobileDevice.use,
      },
      testMatch: /.*\.(spec|test)\.ts/,
    },
    {
      name: 'Pixel 7',
      use: {
        ...defaultAndroidDevice.use,
      },
      testMatch: /.*\.(spec|test)\.ts/,
    },
    {
      name: 'iPad Pro 11',
      use: {
        ...defaultTabletDevice.use,
      },
      testMatch: /.*\.(spec|test)\.ts/,
    },
  ],

  outputDir: 'test-results',
});
