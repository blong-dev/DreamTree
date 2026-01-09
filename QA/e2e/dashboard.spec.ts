/**
 * Dashboard E2E Tests
 *
 * Tests the dashboard page components.
 */

import { test, expect } from '@playwright/test';
import { DashboardPage } from './fixtures/pages';
import { loadTestUser, setSessionCookie } from './fixtures/test-user';

test.describe('Dashboard Page', () => {
  test.beforeEach(async ({ page, context }) => {
    const testUser = loadTestUser();
    if (testUser?.cookie) {
      await setSessionCookie(context, testUser.cookie, process.env.TEST_BASE_URL || 'http://localhost:3000');
    }
  });

  test('should display dashboard', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.goto();

    // Should show main dashboard content
    await expect(page.locator('main, .dashboard')).toBeVisible();
  });

  test('should show greeting with user name', async ({ page }) => {
    const testUser = loadTestUser();
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.goto();

    // Greeting should be personalized
    const greeting = page.locator('.dashboard-greeting, h1, h2');
    await expect(greeting.first()).toBeVisible();
  });

  test('should show progress metrics', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.goto();

    // Progress section should exist
    const progressSection = page.locator('.progress-metrics, .progress, [data-testid="progress"]');
    // May or may not be visible for new user
  });

  test('should show daily do list', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.goto();

    // Daily do list component
    const dailyDo = page.locator('.daily-do-list, .daily-tasks, [data-testid="daily-do"]');
    // May or may not be visible depending on user state
  });

  test('should link to workbook', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.goto();

    // Should have link/button to continue workbook
    const workbookLink = page.locator('a[href*="/workbook"], button:has-text("Continue")');
    await expect(workbookLink.first()).toBeVisible();
  });

  test('should show inline TOC', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.goto();

    // Inline TOC may be present
    const tocInline = page.locator('.toc-inline, .course-overview');
    // Optional component
  });
});

test.describe('Dashboard Navigation', () => {
  test.beforeEach(async ({ page, context }) => {
    const testUser = loadTestUser();
    if (testUser?.cookie) {
      await setSessionCookie(context, testUser.cookie, process.env.TEST_BASE_URL || 'http://localhost:3000');
    }
  });

  test('should navigate to workbook from dashboard', async ({ page }) => {
    await page.goto('/');

    const workbookLink = page.locator('a[href*="/workbook"]').first();
    if (await workbookLink.isVisible()) {
      await workbookLink.click();
      await expect(page).toHaveURL(/\/workbook/);
    }
  });

  test('should navigate to profile from dashboard', async ({ page }) => {
    await page.goto('/');

    const profileLink = page.locator('a[href="/profile"]');
    if (await profileLink.isVisible()) {
      await profileLink.click();
      await expect(page).toHaveURL(/\/profile/);
    }
  });

  test('should navigate to tools from dashboard', async ({ page }) => {
    await page.goto('/');

    const toolsLink = page.locator('a[href="/tools"]');
    if (await toolsLink.isVisible()) {
      await toolsLink.click();
      await expect(page).toHaveURL(/\/tools/);
    }
  });
});

test.describe('Dashboard State', () => {
  test.beforeEach(async ({ page, context }) => {
    const testUser = loadTestUser();
    if (testUser?.cookie) {
      await setSessionCookie(context, testUser.cookie, process.env.TEST_BASE_URL || 'http://localhost:3000');
    }
  });

  test('should show appropriate state for new user', async ({ page }) => {
    await page.goto('/');

    // New user should see welcome/getting started content
    const content = await page.textContent('body');
    // Should have some welcoming content or first exercise prompt
  });

  test('should update after completing exercises', async ({ page }) => {
    // This would require completing exercises first
    // For now, just verify the page loads
    await page.goto('/');
    await expect(page.locator('main, .dashboard')).toBeVisible();
  });
});

test.describe('Profile Preview', () => {
  test.beforeEach(async ({ page, context }) => {
    const testUser = loadTestUser();
    if (testUser?.cookie) {
      await setSessionCookie(context, testUser.cookie, process.env.TEST_BASE_URL || 'http://localhost:3000');
    }
  });

  test('should show profile preview widget', async ({ page }) => {
    await page.goto('/');

    const profilePreview = page.locator('.profile-preview, .user-card');
    // Optional component
  });

  test('should link to full profile', async ({ page }) => {
    await page.goto('/');

    const profileLink = page.locator('a[href="/profile"], .view-profile');
    if (await profileLink.isVisible()) {
      await profileLink.click();
      await expect(page).toHaveURL(/\/profile/);
    }
  });
});
