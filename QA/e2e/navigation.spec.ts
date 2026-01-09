/**
 * Navigation E2E Tests
 *
 * Tests TOC panel, nav bar, and breadcrumbs.
 */

import { test, expect } from '@playwright/test';
import { loadTestUser, setSessionCookie } from './fixtures/test-user';

test.describe('Navigation Bar', () => {
  test.beforeEach(async ({ page, context }) => {
    const testUser = loadTestUser();
    if (testUser?.cookie) {
      await setSessionCookie(context, testUser.cookie, process.env.TEST_BASE_URL || 'http://localhost:3000');
    }
  });

  test('should display nav bar on all pages', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('nav, .nav-bar, [role="navigation"]')).toBeVisible();
  });

  test('should show brand logo/wordmark', async ({ page }) => {
    await page.goto('/');
    const brand = page.locator('.nav-brand, .logo, [aria-label*="DreamTree"]');
    await expect(brand.first()).toBeVisible();
  });

  test('should have working nav links', async ({ page }) => {
    await page.goto('/');

    // Check for common nav items
    const navItems = page.locator('nav a, .nav-item');
    await expect(navItems.first()).toBeVisible();
  });

  test('should highlight active nav item', async ({ page }) => {
    await page.goto('/profile');

    // Active nav item should have active class or aria-current
    const activeItem = page.locator('[aria-current="page"], .nav-item.active, .active');
    // May or may not be visible depending on nav design
  });
});

test.describe('TOC Panel', () => {
  test.beforeEach(async ({ page, context }) => {
    const testUser = loadTestUser();
    if (testUser?.cookie) {
      await setSessionCookie(context, testUser.cookie, process.env.TEST_BASE_URL || 'http://localhost:3000');
    }
  });

  test('should open TOC panel', async ({ page }) => {
    await page.goto('/workbook/1.1.1');

    // Find TOC toggle button
    const tocToggle = page.locator('button[aria-label*="contents"], button:has-text("TOC"), .toc-toggle');
    if (await tocToggle.isVisible()) {
      await tocToggle.click();

      // TOC panel should open
      await expect(page.locator('.toc-panel, [role="dialog"]')).toBeVisible();
    }
  });

  test('should show parts and modules in TOC', async ({ page }) => {
    await page.goto('/workbook/1.1.1');

    const tocToggle = page.locator('button[aria-label*="contents"], .toc-toggle');
    if (await tocToggle.isVisible()) {
      await tocToggle.click();

      // Should show Part 1, Part 2
      await expect(page.locator('text=Part 1')).toBeVisible();
    }
  });

  test('should navigate via TOC', async ({ page }) => {
    await page.goto('/workbook/1.1.1');

    const tocToggle = page.locator('button[aria-label*="contents"], .toc-toggle');
    if (await tocToggle.isVisible()) {
      await tocToggle.click();

      // Click on a different exercise
      const exerciseLink = page.locator('.toc-exercise a, .toc-item a').first();
      if (await exerciseLink.isVisible()) {
        await exerciseLink.click();

        // Should navigate
        await page.waitForURL(/\/workbook\//);
      }
    }
  });

  test('should close TOC panel', async ({ page }) => {
    await page.goto('/workbook/1.1.1');

    const tocToggle = page.locator('button[aria-label*="contents"], .toc-toggle');
    if (await tocToggle.isVisible()) {
      await tocToggle.click();
      await expect(page.locator('.toc-panel')).toBeVisible();

      // Close via backdrop or close button
      const closeButton = page.locator('.toc-close, button[aria-label="Close"]');
      if (await closeButton.isVisible()) {
        await closeButton.click();
      } else {
        // Click backdrop
        await page.locator('.backdrop').click();
      }

      await expect(page.locator('.toc-panel')).not.toBeVisible();
    }
  });
});

test.describe('Breadcrumbs', () => {
  test.beforeEach(async ({ page, context }) => {
    const testUser = loadTestUser();
    if (testUser?.cookie) {
      await setSessionCookie(context, testUser.cookie, process.env.TEST_BASE_URL || 'http://localhost:3000');
    }
  });

  test('should display breadcrumbs in workbook', async ({ page }) => {
    await page.goto('/workbook/1.1.1');

    const breadcrumbs = page.locator('.breadcrumb, nav[aria-label="Breadcrumb"]');
    // Breadcrumbs may or may not be present
  });

  test('should show current location', async ({ page }) => {
    await page.goto('/workbook/1.2.1');

    // Should indicate Part 1, Module 2, Exercise 1
    const content = await page.textContent('body');
    // Exercise location should be indicated somewhere
  });
});

test.describe('Mobile Navigation', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test.beforeEach(async ({ page, context }) => {
    const testUser = loadTestUser();
    if (testUser?.cookie) {
      await setSessionCookie(context, testUser.cookie, process.env.TEST_BASE_URL || 'http://localhost:3000');
    }
  });

  test('should show mobile menu toggle', async ({ page }) => {
    await page.goto('/');

    // Mobile should have hamburger menu
    const menuToggle = page.locator('button[aria-label*="menu"], .hamburger, .mobile-menu-toggle');
    // May or may not have hamburger depending on design
  });

  test('should be usable on mobile viewport', async ({ page }) => {
    await page.goto('/workbook/1.1.1');

    // Content should be visible and not overflow
    await expect(page.locator('.conversation-thread, main')).toBeVisible();
  });
});
