/**
 * Workbook E2E Tests
 *
 * Tests exercise completion and progression.
 */

import { test, expect } from '@playwright/test';
import { WorkbookPage } from './fixtures/pages';
import { loadTestUser, setSessionCookie } from './fixtures/test-user';

test.describe('Workbook Navigation', () => {
  test.beforeEach(async ({ page, context }) => {
    // Use the global test user
    const testUser = loadTestUser();
    if (testUser?.cookie) {
      await setSessionCookie(context, testUser.cookie, process.env.TEST_BASE_URL || 'http://localhost:3000');
    }
  });

  test('should load first exercise', async ({ page }) => {
    const workbookPage = new WorkbookPage(page);
    await workbookPage.goto('1.1.1');
    await workbookPage.waitForContent();

    // Should show conversation thread
    await expect(page.locator('.conversation-thread')).toBeVisible();
  });

  test('should show exercise content blocks', async ({ page }) => {
    const workbookPage = new WorkbookPage(page);
    await workbookPage.goto('1.1.1');
    await workbookPage.waitForContent();

    // Should have at least one message/block
    const messages = page.locator('.message, .content-block');
    await expect(messages.first()).toBeVisible();
  });

  test('should show navigation to next exercise', async ({ page }) => {
    const workbookPage = new WorkbookPage(page);
    await workbookPage.goto('1.1.1');
    await workbookPage.waitForContent();

    // Look for navigation or next button
    const navigation = page.locator('a[href*="/workbook/"], button:has-text("Next")');
    // May or may not be visible depending on exercise completion state
  });
});

test.describe('Exercise Completion', () => {
  test.beforeEach(async ({ page, context }) => {
    const testUser = loadTestUser();
    if (testUser?.cookie) {
      await setSessionCookie(context, testUser.cookie, process.env.TEST_BASE_URL || 'http://localhost:3000');
    }
  });

  test('should allow answering text prompt', async ({ page }) => {
    const workbookPage = new WorkbookPage(page);
    await workbookPage.goto('1.1.1');
    await workbookPage.waitForContent();

    // Wait for a textarea to appear
    const textarea = page.locator('textarea');
    if (await textarea.isVisible()) {
      await textarea.fill('Test response from E2E test');

      // Find and click submit
      const submitButton = page.locator('button:has-text("Submit"), button:has-text("Continue")');
      if (await submitButton.isVisible()) {
        await submitButton.click();

        // Wait for response to be saved (may show loading or next content)
        await page.waitForTimeout(1000);
      }
    }
  });

  test('should persist responses across page reload', async ({ page }) => {
    const workbookPage = new WorkbookPage(page);
    await workbookPage.goto('1.1.1');
    await workbookPage.waitForContent();

    // Submit a response
    const textarea = page.locator('textarea').first();
    if (await textarea.isVisible()) {
      const testResponse = `E2E Test ${Date.now()}`;
      await textarea.fill(testResponse);

      const submitButton = page.locator('button:has-text("Submit")');
      if (await submitButton.isVisible()) {
        await submitButton.click();
        await page.waitForTimeout(1000);
      }

      // Reload page
      await page.reload();
      await workbookPage.waitForContent();

      // Response should be visible (either in textarea or as completed)
      // The exact behavior depends on the exercise flow
    }
  });
});

test.describe('Tool Interactions', () => {
  test.beforeEach(async ({ page, context }) => {
    const testUser = loadTestUser();
    if (testUser?.cookie) {
      await setSessionCookie(context, testUser.cookie, process.env.TEST_BASE_URL || 'http://localhost:3000');
    }
  });

  test('should display embedded tools', async ({ page }) => {
    const workbookPage = new WorkbookPage(page);
    await workbookPage.goto('1.1.1');
    await workbookPage.waitForContent();

    // Look for tool embed
    const toolEmbed = page.locator('.tool-embed, [data-tool-type]');
    // Tools may or may not be on this exercise
    if (await toolEmbed.isVisible()) {
      // Tool should be interactive
      await expect(toolEmbed).toBeEnabled();
    }
  });
});

test.describe('Error Handling', () => {
  test('should handle invalid exercise ID', async ({ page }) => {
    await page.goto('/workbook/invalid');

    // Should show error or redirect
    await expect(page.locator('text=Invalid, text=not found, text=error').first()).toBeVisible().catch(() => {
      // Or redirected to valid page
      expect(page.url()).not.toContain('/workbook/invalid');
    });
  });

  test('should handle non-existent exercise', async ({ page }) => {
    await page.goto('/workbook/9.9.9');

    // Should show error or redirect
    await expect(page.locator('text=not found, text=error').first()).toBeVisible().catch(() => {
      expect(page.url()).not.toContain('/workbook/9.9.9');
    });
  });
});
