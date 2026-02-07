import { type Page, type Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  readonly url = '/';
  readonly pageTitle = 'Swag Labs - Login';

  // ─── Locators ─────────────────────────────────────────────────
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly errorMessage: Locator;
  private readonly errorButton: Locator;
  private readonly logo: Locator;
  private readonly loginCredentials: Locator;
  private readonly acceptedUsernames: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.locator('[data-test="username"]');
    this.passwordInput = page.locator('[data-test="password"]');
    this.loginButton = page.locator('[data-test="login-button"]');
    this.errorMessage = page.locator('[data-test="error"]');
    this.errorButton = page.locator('.error-button');
    this.logo = page.locator('.login_logo');
    this.loginCredentials = page.locator('.login_credentials');
    this.acceptedUsernames = page.locator('#login_credentials');
  }

  // ─── Actions ──────────────────────────────────────────────────

  async login(username: string, password: string): Promise<void> {
    this.logger.info(`Logging in with user: ${username}`);
    await this.fill(this.usernameInput, username, 'Username');
    await this.fill(this.passwordInput, password, 'Password');
    await this.click(this.loginButton, 'Login Button');
  }

  async loginAsStandardUser(): Promise<void> {
    await this.login('standard_user', 'secret_sauce');
  }

  async loginAsLockedUser(): Promise<void> {
    await this.login('locked_out_user', 'secret_sauce');
  }

  async loginAsProblemUser(): Promise<void> {
    await this.login('problem_user', 'secret_sauce');
  }

  async loginAsPerformanceUser(): Promise<void> {
    await this.login('performance_glitch_user', 'secret_sauce');
  }

  async clearLoginForm(): Promise<void> {
    await this.usernameInput.clear();
    await this.passwordInput.clear();
  }

  async dismissError(): Promise<void> {
    if (await this.isVisible(this.errorButton)) {
      await this.click(this.errorButton, 'Error dismiss button');
    }
  }

  // ─── Getters ──────────────────────────────────────────────────

  async getErrorMessage(): Promise<string> {
    return this.getText(this.errorMessage);
  }

  async isErrorVisible(): Promise<boolean> {
    return this.isVisible(this.errorMessage);
  }

  async isLoginFormVisible(): Promise<boolean> {
    return (
      (await this.isVisible(this.usernameInput)) &&
      (await this.isVisible(this.passwordInput)) &&
      (await this.isVisible(this.loginButton))
    );
  }

  async isLogoVisible(): Promise<boolean> {
    return this.isVisible(this.logo);
  }

  // ─── Assertions ───────────────────────────────────────────────

  async verifyPage(): Promise<void> {
    await super.verifyPage();
    await this.expectVisible(this.usernameInput, 'Username input should be visible');
    await this.expectVisible(this.passwordInput, 'Password input should be visible');
    await this.expectVisible(this.loginButton, 'Login button should be visible');
  }

  async verifyErrorMessage(expectedMessage: string): Promise<void> {
    await this.expectVisible(this.errorMessage, 'Error message should be visible');
    await this.expectContainText(this.errorMessage, expectedMessage);
  }

  async verifySuccessfulLogin(): Promise<void> {
    await this.expectUrl(/inventory/);
  }
}
