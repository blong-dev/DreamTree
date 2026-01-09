/**
 * Page Object Models
 *
 * Reusable page interaction patterns for E2E tests.
 */

import { Page, Locator, expect } from '@playwright/test';

/**
 * Login Page
 */
export class LoginPage {
  private page: Page;
  private emailInput: Locator;
  private passwordInput: Locator;
  private submitButton: Locator;
  private errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('[name="email"]');
    this.passwordInput = page.locator('[name="password"]');
    this.submitButton = page.locator('button[type="submit"]');
    this.errorMessage = page.locator('.error, [role="alert"]');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async expectError(text: string) {
    await expect(this.errorMessage).toContainText(text);
  }
}

/**
 * Signup Page
 */
export class SignupPage {
  private page: Page;
  private nameInput: Locator;
  private emailInput: Locator;
  private passwordInput: Locator;
  private confirmPasswordInput: Locator;
  private submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nameInput = page.locator('[name="name"]');
    this.emailInput = page.locator('[name="email"]');
    this.passwordInput = page.locator('[name="password"]');
    this.confirmPasswordInput = page.locator('[name="confirmPassword"]');
    this.submitButton = page.locator('button[type="submit"]');
  }

  async goto() {
    await this.page.goto('/signup');
  }

  async signup(name: string, email: string, password: string) {
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.confirmPasswordInput.fill(password);
    await this.submitButton.click();
  }
}

/**
 * Onboarding Page
 */
export class OnboardingPage {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async completeOnboarding(options?: {
    name?: string;
    bgColor?: string;
    textColor?: string;
    font?: string;
  }) {
    const { name = 'Test User', bgColor = 'ivory', textColor = 'brown', font = 'inter' } = options || {};

    // Try to click through onboarding steps
    // Step 1: Welcome
    await this.clickContinue();

    // Step 2: Name
    const nameInput = this.page.locator('[name="name"]');
    if (await nameInput.isVisible()) {
      await nameInput.fill(name);
      await this.clickContinue();
    }

    // Step 3: Visual settings
    await this.page.click(`[data-bg="${bgColor}"]`).catch(() => {});
    await this.page.click(`[data-text="${textColor}"]`).catch(() => {});
    await this.page.click(`[data-font="${font}"]`).catch(() => {});
    await this.clickContinue();

    // Step 4: Complete
    await this.page.click('button:has-text("Start"), button:has-text("Begin"), button:has-text("Finish")').catch(() => {});
  }

  private async clickContinue() {
    await this.page.click('button:has-text("Continue"), button:has-text("Next"), button:has-text("Get Started")').catch(() => {});
    await this.page.waitForTimeout(500);
  }
}

/**
 * Workbook Page
 */
export class WorkbookPage {
  private page: Page;
  private conversationThread: Locator;
  private inputArea: Locator;

  constructor(page: Page) {
    this.page = page;
    this.conversationThread = page.locator('.conversation-thread');
    this.inputArea = page.locator('.input-area');
  }

  async goto(exerciseId: string) {
    await this.page.goto(`/workbook/${exerciseId}`);
  }

  async waitForContent() {
    await expect(this.conversationThread).toBeVisible({ timeout: 10000 });
  }

  async answerTextPrompt(response: string) {
    const textarea = this.page.locator('textarea').last();
    await textarea.fill(response);
    await this.page.click('button:has-text("Submit"), button:has-text("Continue")');
  }

  async selectRadioOption(optionText: string) {
    await this.page.click(`label:has-text("${optionText}")`);
    await this.page.click('button:has-text("Submit"), button:has-text("Continue")');
  }

  async checkCheckbox(labelText: string) {
    await this.page.click(`label:has-text("${labelText}")`);
  }

  async adjustSlider(value: number) {
    const slider = this.page.locator('input[type="range"]');
    await slider.fill(String(value));
  }

  async clickContinue() {
    await this.page.click('button:has-text("Continue"), button:has-text("Next")');
  }
}

/**
 * Dashboard Page
 */
export class DashboardPage {
  private page: Page;
  private greeting: Locator;
  private progressMetrics: Locator;
  private dailyDoList: Locator;

  constructor(page: Page) {
    this.page = page;
    this.greeting = page.locator('.dashboard-greeting, h1');
    this.progressMetrics = page.locator('.progress-metrics');
    this.dailyDoList = page.locator('.daily-do-list');
  }

  async goto() {
    await this.page.goto('/');
  }

  async expectGreeting(name: string) {
    await expect(this.greeting).toContainText(name);
  }

  async clickWorkbookLink() {
    await this.page.click('a[href*="/workbook"]');
  }
}

/**
 * Profile Page
 */
export class ProfilePage {
  private page: Page;
  private profileHeader: Locator;
  private skillsSection: Locator;
  private valuesSection: Locator;
  private exportButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.profileHeader = page.locator('.profile-header, h1');
    this.skillsSection = page.locator('.profile-section:has-text("Skills")');
    this.valuesSection = page.locator('.profile-section:has-text("Values")');
    this.exportButton = page.locator('button:has-text("Download"), button:has-text("Export")');
  }

  async goto() {
    await this.page.goto('/profile');
  }

  async expectProfileName(name: string) {
    await expect(this.profileHeader).toContainText(name);
  }

  async exportData(): Promise<void> {
    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      this.exportButton.click(),
    ]);
    // Download will be handled by the test
  }
}

/**
 * Tools Index Page
 */
export class ToolsPage {
  private page: Page;
  private toolCategories: Locator;

  constructor(page: Page) {
    this.page = page;
    this.toolCategories = page.locator('.tool-category, section');
  }

  async goto() {
    await this.page.goto('/tools');
  }

  async clickTool(toolName: string) {
    await this.page.click(`text=${toolName}`);
  }

  async expectCategories() {
    await expect(this.toolCategories.first()).toBeVisible();
  }
}
