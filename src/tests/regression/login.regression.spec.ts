import { test, expect } from '../../fixtures/base.fixture';
import { DataGenerator } from '../../utils/data-generator';

test.describe('Login - Regression Tests @regression', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.navigate();
  });

  // ─── Form Validation ───────────────────────────────────────────

  test.describe('Form Validation', () => {
    test('should show error when both fields are empty', async ({ loginPage }) => {
      await loginPage.login('', '');
      await loginPage.verifyErrorMessage('Username is required');
    });

    test('should show error for empty username with valid password', async ({ loginPage }) => {
      await loginPage.login('', 'secret_sauce');
      await loginPage.verifyErrorMessage('Username is required');
    });

    test('should show error for valid username with empty password', async ({ loginPage }) => {
      await loginPage.login('standard_user', '');
      await loginPage.verifyErrorMessage('Password is required');
    });

    test('should show error for wrong username', async ({ loginPage }) => {
      await loginPage.login('wrong_user', 'secret_sauce');
      await loginPage.verifyErrorMessage('do not match');
    });

    test('should show error for wrong password', async ({ loginPage }) => {
      await loginPage.login('standard_user', 'wrong_password');
      await loginPage.verifyErrorMessage('do not match');
    });

    test('should handle special characters in username', async ({ loginPage }) => {
      await loginPage.login(DataGenerator.generateSpecialCharacters(), 'secret_sauce');
      await loginPage.verifyErrorMessage('do not match');
    });

    test('should handle SQL injection attempt in username', async ({ loginPage }) => {
      await loginPage.login(DataGenerator.generateSQLInjection(), 'secret_sauce');
      await loginPage.verifyErrorMessage('do not match');
    });

    test('should handle very long input in username', async ({ loginPage }) => {
      await loginPage.login(DataGenerator.generateLongString(100), 'secret_sauce');
      await loginPage.verifyErrorMessage('do not match');
    });

    test('should handle whitespace-only username', async ({ loginPage }) => {
      await loginPage.login(DataGenerator.generateWhitespace(), 'secret_sauce');
      const errorVisible = await loginPage.isErrorVisible();
      expect(errorVisible).toBeTruthy();
    });
  });

  // ─── Error Message Handling ────────────────────────────────────

  test.describe('Error Message Handling', () => {
    test('should dismiss error message', async ({ loginPage }) => {
      await loginPage.login('', '');
      await loginPage.verifyErrorMessage('Username is required');
      await loginPage.dismissError();
    });

    test('should clear error on new login attempt', async ({ loginPage }) => {
      await loginPage.login('', '');
      await loginPage.verifyErrorMessage('Username is required');
      await loginPage.clearLoginForm();
      await loginPage.login('standard_user', 'secret_sauce');
      await loginPage.verifySuccessfulLogin();
    });
  });

  // ─── User Types ────────────────────────────────────────────────

  test.describe('User Types', () => {
    test('should login with standard user', async ({ loginPage }) => {
      await loginPage.loginAsStandardUser();
      await loginPage.verifySuccessfulLogin();
    });

    test('should fail login with locked out user', async ({ loginPage }) => {
      await loginPage.loginAsLockedUser();
      await loginPage.verifyErrorMessage('locked out');
    });

    test('should login with problem user', async ({ loginPage }) => {
      await loginPage.loginAsProblemUser();
      await loginPage.verifySuccessfulLogin();
    });

    test('should login with performance glitch user', async ({ loginPage }) => {
      test.slow();
      await loginPage.loginAsPerformanceUser();
      await loginPage.verifySuccessfulLogin();
    });
  });

  // ─── Mobile-specific ──────────────────────────────────────────

  test.describe('Mobile Responsiveness', () => {
    test('should display login form properly on mobile', async ({ loginPage, page }) => {
      await loginPage.verifyPage();
      const viewport = page.viewportSize();
      if (viewport && viewport.width < 768) {
        await expect(await loginPage.isLoginFormVisible()).toBeTruthy();
      }
    });

    test('should handle keyboard submit on mobile', async ({ loginPage, page }) => {
      await loginPage.login('standard_user', 'secret_sauce');
      await loginPage.verifySuccessfulLogin();
    });
  });
});
