import { test, expect } from '../../fixtures/base.fixture';
import testData from '../../data/test-data.json';

test.describe('Login - Data-Driven Tests @regression', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.navigate();
  });

  // ─── Valid Login Scenarios ────────────────────────────────────

  for (const userData of testData.loginData.validUsers) {
    test(`should login successfully: ${userData.description}`, async ({ loginPage }) => {
      if (userData.username === 'performance_glitch_user') {
        test.slow();
      }
      await loginPage.login(userData.username, userData.password);
      await loginPage.verifySuccessfulLogin();
    });
  }

  // ─── Invalid Login Scenarios ──────────────────────────────────

  for (const userData of testData.loginData.invalidUsers) {
    test(`should show error: ${userData.description}`, async ({ loginPage }) => {
      await loginPage.login(userData.username, userData.password);
      await loginPage.verifyErrorMessage(userData.expectedError);
    });
  }
});
