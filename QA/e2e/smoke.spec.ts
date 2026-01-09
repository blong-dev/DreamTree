/**
 * Smoke Tests
 *
 * Basic tests that verify the app loads without authentication.
 * Use these to verify deployment is working.
 */

import { test, expect } from '@playwright/test';

// Skip global setup for smoke tests
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Landing Page', () => {
  test('should load the root page', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBeLessThan(500);
  });

  test('should have a title', async ({ page }) => {
    await page.goto('/');
    const title = await page.title();
    expect(title).toBeTruthy();
  });

  test('should redirect unauthenticated users to login', async ({ page }) => {
    await page.goto('/');
    // Should redirect to login or show login page
    await page.waitForTimeout(1000);
    const url = page.url();
    expect(url).toMatch(/\/(login|signup|$)/);
  });
});

test.describe('Auth Pages Load', () => {
  test('login page should load', async ({ page }) => {
    const response = await page.goto('/login');
    expect(response?.status()).toBe(200);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('signup page should load', async ({ page }) => {
    const response = await page.goto('/signup');
    expect(response?.status()).toBe(200);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('login page should have form', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('signup page should have form', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('#confirm-password')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });
});

test.describe('Static Assets', () => {
  test('CSS should load', async ({ page }) => {
    await page.goto('/login');
    // Check that CSS is applied by verifying some styling exists
    const body = page.locator('body');
    const bgColor = await body.evaluate(el => getComputedStyle(el).backgroundColor);
    expect(bgColor).not.toBe('');
  });

  test('should not have JavaScript errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/login');
    await page.waitForTimeout(2000);

    // Filter out expected errors (like network errors for missing API)
    const criticalErrors = errors.filter(e =>
      !e.includes('Failed to load resource') &&
      !e.includes('net::ERR')
    );

    expect(criticalErrors.length).toBe(0);
  });
});

test.describe('Protected Routes Redirect', () => {
  test('profile should redirect to login', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForTimeout(1000);
    expect(page.url()).toMatch(/\/(login|signup)/);
  });

  test('workbook should redirect to login', async ({ page }) => {
    await page.goto('/workbook/1.1.1');
    await page.waitForTimeout(1000);
    expect(page.url()).toMatch(/\/(login|signup)/);
  });

  test('tools should redirect to login', async ({ page }) => {
    await page.goto('/tools');
    await page.waitForTimeout(1000);
    expect(page.url()).toMatch(/\/(login|signup)/);
  });
});
