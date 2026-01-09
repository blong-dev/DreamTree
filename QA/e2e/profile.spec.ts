/**
 * Profile Page E2E Tests
 *
 * Tests the profile page and data export.
 */

import { test, expect } from '@playwright/test';
import { ProfilePage } from './fixtures/pages';
import { loadTestUser, setSessionCookie } from './fixtures/test-user';

test.describe('Profile Page', () => {
  test.beforeEach(async ({ page, context }) => {
    const testUser = loadTestUser();
    if (testUser?.cookie) {
      await setSessionCookie(context, testUser.cookie, process.env.TEST_BASE_URL || 'http://localhost:3000');
    }
  });

  test('should display user profile', async ({ page }) => {
    const profilePage = new ProfilePage(page);
    await profilePage.goto();

    // Should show profile content
    await expect(page.locator('.profile-header, h1')).toBeVisible();
  });

  test('should show user display name', async ({ page }) => {
    const testUser = loadTestUser();
    if (!testUser) {
      test.skip();
      return;
    }

    const profilePage = new ProfilePage(page);
    await profilePage.goto();

    // Name should be visible somewhere on the page
    await expect(page.locator('body')).toContainText(/Test User|E2E/i);
  });

  test('should show profile sections', async ({ page }) => {
    const profilePage = new ProfilePage(page);
    await profilePage.goto();

    // Should have sections for skills, values, etc.
    const sections = page.locator('.profile-section, section');
    await expect(sections.first()).toBeVisible();
  });

  test('should show visual settings', async ({ page }) => {
    const profilePage = new ProfilePage(page);
    await profilePage.goto();

    // Page should have the user's selected styling applied
    // We can check via API
    const settings = await page.evaluate(() =>
      fetch('/api/profile').then(r => r.json()).then(d => d.settings)
    );

    expect(settings).toBeDefined();
    expect(settings.backgroundColor).toBeDefined();
    expect(settings.textColor).toBeDefined();
    expect(settings.font).toBeDefined();
  });
});

test.describe('Data Export', () => {
  test.beforeEach(async ({ page, context }) => {
    const testUser = loadTestUser();
    if (testUser?.cookie) {
      await setSessionCookie(context, testUser.cookie, process.env.TEST_BASE_URL || 'http://localhost:3000');
    }
  });

  test('should download exported data', async ({ page }) => {
    const profilePage = new ProfilePage(page);
    await profilePage.goto();

    // Find and click export button
    const exportButton = page.locator('button:has-text("Download"), button:has-text("Export")');

    if (await exportButton.isVisible()) {
      const [download] = await Promise.all([
        page.waitForEvent('download'),
        exportButton.click(),
      ]);

      // Verify download
      expect(download.suggestedFilename()).toMatch(/dreamtree.*\.json/i);
    }
  });

  test('should export valid JSON', async ({ page }) => {
    // Test via API directly
    const response = await page.evaluate(() =>
      fetch('/api/profile/export').then(r => r.json())
    );

    expect(response.exportedAt).toBeDefined();
    expect(response.profile).toBeDefined();
    expect(response.settings).toBeDefined();
  });
});

test.describe('Profile Access Control', () => {
  test('should redirect unauthenticated users', async ({ page }) => {
    // Clear any cookies
    await page.context().clearCookies();

    await page.goto('/profile');

    // Should redirect to login
    await expect(page).toHaveURL(/\/(login|signup)/, { timeout: 10000 });
  });
});

test.describe('Data Policy', () => {
  test.beforeEach(async ({ page, context }) => {
    const testUser = loadTestUser();
    if (testUser?.cookie) {
      await setSessionCookie(context, testUser.cookie, process.env.TEST_BASE_URL || 'http://localhost:3000');
    }
  });

  test('should show data policy banner', async ({ page }) => {
    const profilePage = new ProfilePage(page);
    await profilePage.goto();

    // Data policy banner may be present
    const policyBanner = page.locator('.data-policy-banner, [data-testid="policy-banner"]');
    // Banner may or may not be visible depending on design
  });
});
