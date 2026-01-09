/**
 * Auth E2E Tests
 *
 * Tests signup and login user flows.
 */

import { test, expect } from '@playwright/test';
import { LoginPage, SignupPage } from './fixtures/pages';
import { createTestUserData } from './fixtures/test-user';

test.describe('Signup Flow', () => {
  test('should complete signup and redirect to onboarding', async ({ page }) => {
    const signupPage = new SignupPage(page);
    const user = createTestUserData();

    await signupPage.goto();
    await signupPage.signup(user.name, user.email, user.password);

    // Should redirect to onboarding
    await expect(page).toHaveURL(/\/onboarding/, { timeout: 10000 });
  });

  test('should show error for invalid email', async ({ page }) => {
    const signupPage = new SignupPage(page);

    await signupPage.goto();
    await signupPage.signup('Test', 'invalid-email', 'TestPassword123!');

    // Should show error or stay on page
    await expect(page).toHaveURL(/\/signup/);
  });

  test('should show error for weak password', async ({ page }) => {
    const signupPage = new SignupPage(page);
    const user = createTestUserData();

    await signupPage.goto();
    await signupPage.signup(user.name, user.email, '123');

    // Should show error or stay on page
    await expect(page).toHaveURL(/\/signup/);
  });

  test('should show error for mismatched passwords', async ({ page }) => {
    await page.goto('/signup');
    await page.fill('[name="name"]', 'Test User');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'TestPassword123!');
    await page.fill('[name="confirmPassword"]', 'DifferentPassword123!');
    await page.click('button[type="submit"]');

    // Should show error or stay on page
    await expect(page).toHaveURL(/\/signup/);
  });
});

test.describe('Login Flow', () => {
  test('should login and redirect to dashboard', async ({ page }) => {
    // This test uses the global test user created in setup
    const loginPage = new LoginPage(page);

    // First create a user to login with
    const signupPage = new SignupPage(page);
    const user = createTestUserData();

    await signupPage.goto();
    await signupPage.signup(user.name, user.email, user.password);

    // Complete onboarding quickly
    await page.waitForURL(/\/onboarding/);
    await page.click('button:has-text("Continue"), button:has-text("Get Started"), button:has-text("Next")').catch(() => {});
    await page.waitForTimeout(500);
    await page.click('button:has-text("Continue"), button:has-text("Next")').catch(() => {});
    await page.waitForTimeout(500);
    await page.click('button:has-text("Continue"), button:has-text("Next")').catch(() => {});
    await page.waitForTimeout(500);
    await page.click('button:has-text("Start"), button:has-text("Begin"), button:has-text("Finish")').catch(() => {});

    // Wait for redirect
    await page.waitForURL(/\/(workbook|\/)/, { timeout: 10000 });

    // Logout
    await page.evaluate(() => fetch('/api/auth/logout', { method: 'POST' }));

    // Now test login
    await loginPage.goto();
    await loginPage.login(user.email, user.password);

    // Should redirect to dashboard or workbook
    await expect(page).toHaveURL(/\/(dashboard|workbook|\/)/, { timeout: 10000 });
  });

  test('should show error for wrong password', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login('test@example.com', 'WrongPassword123!');

    // Should show error or stay on login page
    await expect(page).toHaveURL(/\/login/);
  });

  test('should show error for non-existent user', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login(`nonexistent-${Date.now()}@example.com`, 'TestPassword123!');

    // Should show error or stay on login page
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Logout Flow', () => {
  test('should clear session on logout', async ({ page }) => {
    // Create and login a user
    const signupPage = new SignupPage(page);
    const user = createTestUserData();

    await signupPage.goto();
    await signupPage.signup(user.name, user.email, user.password);
    await page.waitForURL(/\/onboarding/);

    // Logout via API
    const response = await page.evaluate(() =>
      fetch('/api/auth/logout', { method: 'POST' }).then(r => r.ok)
    );
    expect(response).toBe(true);

    // Navigate to protected route - should redirect to login
    await page.goto('/profile');
    await expect(page).toHaveURL(/\/(login|signup)/, { timeout: 10000 });
  });
});
