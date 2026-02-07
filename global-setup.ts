import { type FullConfig } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

async function globalSetup(config: FullConfig) {
  // Ensure report directories exist
  const dirs = [
    'reports/allure-results',
    'reports/allure-report',
    'reports/playwright-html',
    'reports/screenshots',
  ];

  for (const dir of dirs) {
    const dirPath = path.resolve(process.cwd(), dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  // Copy Allure categories if exists
  const categoriesSrc = path.resolve(process.cwd(), 'config/allure/categories.json');
  const categoriesDest = path.resolve(process.cwd(), 'reports/allure-results/categories.json');
  if (fs.existsSync(categoriesSrc)) {
    fs.copyFileSync(categoriesSrc, categoriesDest);
  }

  // Copy Allure environment properties
  const envSrc = path.resolve(process.cwd(), 'config/allure/environment.properties');
  const envDest = path.resolve(process.cwd(), 'reports/allure-results/environment.properties');
  if (fs.existsSync(envSrc)) {
    fs.copyFileSync(envSrc, envDest);
  }

  // eslint-disable-next-line no-console
  console.log('\n========================================');
  // eslint-disable-next-line no-console
  console.log('  Global Setup Complete');
  // eslint-disable-next-line no-console
  console.log(`  Environment: ${process.env.TEST_ENV || 'staging'}`);
  // eslint-disable-next-line no-console
  console.log(`  Workers: ${config.workers}`);
  // eslint-disable-next-line no-console
  console.log('========================================\n');
}

export default globalSetup;
