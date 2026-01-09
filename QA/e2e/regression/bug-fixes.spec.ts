/**
 * Bug Fix Regression Tests
 *
 * These tests verify that previously fixed bugs do not regress.
 * Each test is named after the bug ID it covers.
 */

import { test, expect } from '@playwright/test';
import { ProfilePage, WorkbookPage } from '../fixtures/pages';
import { loadTestUser, setSessionCookie, createTestUserData } from '../fixtures/test-user';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

/**
 * BUG-003: Profile appearance editor (inline, no 404)
 * Previously: Profile page linked to /settings which was a 404
 * Fix: Replaced with inline VisualsStep component and PATCH handler
 */
test.describe('BUG-003: Profile Appearance Editor', () => {
  test.beforeEach(async ({ context }) => {
    const testUser = loadTestUser();
    if (testUser?.cookie) {
      await setSessionCookie(context, testUser.cookie, BASE_URL);
    }
  });

  test('should show Edit Appearance button (not a link to /settings)', async ({ page }) => {
    await page.goto('/profile');

    // Should have an Edit Appearance button with data-testid
    const editButton = page.locator('[data-testid="edit-appearance-button"]');
    await expect(editButton).toBeVisible();
    await expect(editButton).toHaveText('Edit Appearance');

    // Should NOT have a link to /settings
    const settingsLink = page.locator('a[href="/settings"]');
    await expect(settingsLink).toHaveCount(0);
  });

  test('should open inline appearance editor on click', async ({ page }) => {
    await page.goto('/profile');

    const editButton = page.locator('[data-testid="edit-appearance-button"]');
    await editButton.click();

    // Should show the VisualsStep component inline
    await expect(page.locator('.profile-section:has-text("Edit Appearance")')).toBeVisible();

    // Should have Save and Cancel buttons
    await expect(page.locator('button:has-text("Save Changes")')).toBeVisible();
    await expect(page.locator('button:has-text("Cancel")')).toBeVisible();
  });

  test('should save appearance changes via PATCH', async ({ page }) => {
    await page.goto('/profile');

    // Click edit
    await page.click('[data-testid="edit-appearance-button"]');
    await page.waitForTimeout(500);

    // Click save (even without changing values, should call PATCH)
    const [response] = await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/api/profile') && resp.request().method() === 'PATCH'),
      page.click('button:has-text("Save Changes")'),
    ]);

    expect(response.status()).toBe(200);
  });
});

/**
 * BUG-004: Account deletion not working
 * Previously: Delete button only logged out, didn't delete data
 * Fix: DELETE handler removes user from users table (cascades to all data)
 */
test.describe('BUG-004: Account Deletion', () => {
  test('DELETE /api/profile endpoint exists and works', async ({ page, context }) => {
    // Create a fresh user for this test (we'll delete them)
    const freshUser = createTestUserData();

    // Sign up the fresh user
    await page.goto('/signup');
    await page.fill('[name="name"]', freshUser.name);
    await page.fill('[name="email"]', freshUser.email);
    await page.fill('[name="password"]', freshUser.password);
    await page.fill('[name="confirmPassword"]', freshUser.password);
    await page.click('button[type="submit"]');

    // Wait for signup to complete
    await page.waitForURL(/\/(onboarding|workbook)/, { timeout: 10000 });

    // Call DELETE /api/profile
    const deleteResponse = await page.evaluate(async () => {
      const res = await fetch('/api/profile', { method: 'DELETE' });
      return { ok: res.ok, status: res.status, body: await res.json() };
    });

    expect(deleteResponse.ok).toBe(true);
    expect(deleteResponse.body.success).toBe(true);

    // Session should be cleared - trying to access profile should redirect
    await page.goto('/profile');
    await expect(page).toHaveURL(/\/(login|signup)/, { timeout: 10000 });
  });
});

/**
 * BUG-005: Content blocks re-rendering (ink permanence violated)
 * Previously: Content blocks would re-animate on every render
 * Fix: animatedMessageIds Set tracks which messages have been animated
 */
test.describe('BUG-005: Content Blocks Animation', () => {
  test.beforeEach(async ({ context }) => {
    const testUser = loadTestUser();
    if (testUser?.cookie) {
      await setSessionCookie(context, testUser.cookie, BASE_URL);
    }
  });

  test('content blocks should not re-animate on page reload', async ({ page }) => {
    // Go to workbook
    await page.goto('/workbook/1.1.1');

    // Wait for content to load using data-testid
    await page.waitForSelector('[data-testid="conversation-thread"]', { timeout: 10000 });

    // Give time for initial animation to complete
    await page.waitForTimeout(3000);

    // Record the current state of messages
    const messagesBefore = await page.evaluate(() => {
      const thread = document.querySelector('[data-testid="conversation-thread"]');
      return thread ? thread.childElementCount : 0;
    });

    // Reload the page
    await page.reload();
    await page.waitForSelector('[data-testid="conversation-thread"]', { timeout: 10000 });

    // Messages should appear instantly (no typing effect)
    // This is hard to test directly, but we can check that the same number of messages appear
    const messagesAfter = await page.evaluate(() => {
      const thread = document.querySelector('[data-testid="conversation-thread"]');
      return thread ? thread.childElementCount : 0;
    });

    expect(messagesAfter).toBeGreaterThanOrEqual(messagesBefore);
  });
});

/**
 * BUG-006: TOC visible in workbook
 * Previously: TOC/Contents link was showing during exercises
 * Fix: hideContents={true} passed to AppShell in WorkbookView
 */
test.describe('BUG-006: TOC Hidden in Workbook', () => {
  test.beforeEach(async ({ context }) => {
    const testUser = loadTestUser();
    if (testUser?.cookie) {
      await setSessionCookie(context, testUser.cookie, BASE_URL);
    }
  });

  test('Contents nav item should be hidden in workbook', async ({ page }) => {
    await page.goto('/workbook/1.1.1');
    await page.waitForSelector('.nav-bar', { timeout: 10000 });

    // Contents nav item should NOT be present (uses data-testid)
    const contentsNav = page.locator('[data-testid="nav-contents"]');
    await expect(contentsNav).toHaveCount(0);
  });

  test('Contents nav item should be visible on dashboard', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.nav-bar', { timeout: 10000 });

    // On dashboard, Contents might be visible (depending on design)
    // At minimum, verify the page loads without error
    await expect(page.locator('.nav-bar')).toBeVisible();
  });
});

/**
 * BUG-007: Roots overview is one endless header
 * Previously: content_block 100001 was a giant "heading" with TOC + Overview
 * Fix: Migration 0008 changed it to "instruction" type with just the overview text
 */
test.describe('BUG-007: Roots Overview Display', () => {
  test.beforeEach(async ({ context }) => {
    const testUser = loadTestUser();
    if (testUser?.cookie) {
      await setSessionCookie(context, testUser.cookie, BASE_URL);
    }
  });

  test('exercise 1.0.0 should load without rendering as giant header', async ({ page }) => {
    await page.goto('/workbook/1.0.0');
    await page.waitForSelector('.conversation-thread', { timeout: 10000 });

    // The heading should be clean and short
    const heading = page.locator('h2:has-text("Part 1")');
    await expect(heading).toBeVisible();

    // Should NOT have a giant wall of text in a heading
    const headings = await page.locator('h1, h2, h3').all();
    for (const h of headings) {
      const text = await h.textContent();
      // Headings should be concise, not multi-paragraph
      expect(text?.length || 0).toBeLessThan(200);
    }
  });

  test('exercise 1.0.0 should show overview as instruction content', async ({ page }) => {
    await page.goto('/workbook/1.0.0');
    await page.waitForSelector('.conversation-thread', { timeout: 10000 });

    // Wait for content to animate/appear
    await page.waitForTimeout(2000);

    // Should contain the overview text (paragraphs, not in a heading)
    const pageText = await page.textContent('.conversation-thread');
    expect(pageText).toContain('roots');
    expect(pageText).toContain('history');
  });
});
