/**
 * Onboarding E2E Tests
 *
 * Tests the onboarding wizard flow.
 */

import { test, expect } from '@playwright/test';
import { SignupPage, OnboardingPage } from './fixtures/pages';
import { createTestUserData } from './fixtures/test-user';

test.describe('Onboarding Flow', () => {
  test('should complete full onboarding and redirect to workbook', async ({ page }) => {
    // First sign up to get to onboarding
    const signupPage = new SignupPage(page);
    const user = createTestUserData();

    await signupPage.goto();
    await signupPage.signup(user.name, user.email, user.password);

    // Wait for onboarding
    await expect(page).toHaveURL(/\/onboarding/, { timeout: 10000 });

    // Complete onboarding
    const onboardingPage = new OnboardingPage(page);
    await onboardingPage.completeOnboarding({
      name: user.name,
      bgColor: 'ivory',
      textColor: 'brown',
      font: 'inter',
    });

    // Should redirect to workbook
    await expect(page).toHaveURL(/\/workbook/, { timeout: 15000 });
  });

  test('should allow selecting different visual settings', async ({ page }) => {
    const signupPage = new SignupPage(page);
    const user = createTestUserData();

    await signupPage.goto();
    await signupPage.signup(user.name, user.email, user.password);

    await expect(page).toHaveURL(/\/onboarding/, { timeout: 10000 });

    // Complete with different settings
    const onboardingPage = new OnboardingPage(page);
    await onboardingPage.completeOnboarding({
      name: user.name,
      bgColor: 'creamy-tan',
      textColor: 'charcoal',
      font: 'lora',
    });

    // Should complete successfully
    await expect(page).toHaveURL(/\/workbook/, { timeout: 15000 });
  });

  test('should persist visual settings after onboarding', async ({ page }) => {
    const signupPage = new SignupPage(page);
    const user = createTestUserData();

    await signupPage.goto();
    await signupPage.signup(user.name, user.email, user.password);

    await expect(page).toHaveURL(/\/onboarding/, { timeout: 10000 });

    // Complete onboarding with specific settings
    const onboardingPage = new OnboardingPage(page);
    await onboardingPage.completeOnboarding({
      bgColor: 'creamy-tan',
      textColor: 'brown',
      font: 'lora',
    });

    // Navigate to profile to verify settings
    await page.waitForURL(/\/workbook/, { timeout: 15000 });
    await page.goto('/profile');

    // Settings should be applied (verify via CSS or API)
    const profileResponse = await page.evaluate(() =>
      fetch('/api/profile').then(r => r.json())
    );

    expect(profileResponse.settings.backgroundColor).toBe('creamy-tan');
    expect(profileResponse.settings.textColor).toBe('brown');
    expect(profileResponse.settings.font).toBe('lora');
  });
});
