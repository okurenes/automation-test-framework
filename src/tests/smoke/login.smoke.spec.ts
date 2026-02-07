import { test, expect } from '../../fixtures/base.fixture';

test.describe('Login - Smoke Tests @smoke', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.navigate();
  });

  test('should display login page correctly', async ({ loginPage }) => {
    await loginPage.verifyPage();
    await expect(await loginPage.isLogoVisible()).toBeTruthy();
  });

  test('should login with valid credentials', async ({ loginPage }) => {
    await loginPage.loginAsStandardUser();
    await loginPage.verifySuccessfulLogin();
  });

  test('should show error for locked out user', async ({ loginPage }) => {
    await loginPage.loginAsLockedUser();
    await loginPage.verifyErrorMessage('locked out');
  });

  test('should show error for empty username', async ({ loginPage, page }) => {
    await loginPage.login('', 'secret_sauce');
    await loginPage.verifyErrorMessage('Username is required');
  });

  test('should show error for empty password', async ({ loginPage }) => {
    await loginPage.login('standard_user', '');
    await loginPage.verifyErrorMessage('Password is required');
  });

  test('should show error for invalid credentials', async ({ loginPage }) => {
    await loginPage.login('invalid_user', 'wrong_password');
    await loginPage.verifyErrorMessage('do not match');
  });
});
