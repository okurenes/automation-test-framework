import { type FullConfig } from '@playwright/test';

async function globalTeardown(_config: FullConfig) {
  // eslint-disable-next-line no-console
  console.log('\n========================================');
  // eslint-disable-next-line no-console
  console.log('  Global Teardown Complete');
  // eslint-disable-next-line no-console
  console.log('  Test execution finished.');
  // eslint-disable-next-line no-console
  console.log('========================================\n');
}

export default globalTeardown;
