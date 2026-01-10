/**
 * About Page Tests
 *
 * E2E tests for the public /about page.
 * Verifies content renders and navigation works.
 */

import { test, expect } from '@playwright/test';

// Skip global setup for public pages
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('About Page', () => {
  test('should load successfully', async ({ page }) => {
    const response = await page.goto('/about');
    expect(response?.status()).toBe(200);
  });

  test('should display main heading', async ({ page }) => {
    await page.goto('/about');
    await expect(page.locator('h1')).toContainText('Why DreamTree Exists');
  });

  test('should display all section headings', async ({ page }) => {
    await page.goto('/about');

    const sections = [
      'What This Is',
      'Standing on Shoulders',
      'What We Believe',
      'The Bigger Picture',
    ];

    for (const section of sections) {
      await expect(page.locator('h2', { hasText: section })).toBeVisible();
    }
  });

  test('should display key beliefs', async ({ page }) => {
    await page.goto('/about');

    // Verify the "What We Believe" section content
    await expect(page.locator('text=Your data belongs to you')).toBeVisible();
    await expect(page.locator('text=No gamification')).toBeVisible();
    await expect(page.locator('text=Open source')).toBeVisible();
  });

  test('should have footer with privacy message', async ({ page }) => {
    await page.goto('/about');
    await expect(
      page.locator('footer', { hasText: 'encrypted' })
    ).toBeVisible();
  });
});

test.describe('About Page Navigation', () => {
  test('should have header with logo', async ({ page }) => {
    await page.goto('/about');
    await expect(page.locator('.landing-logo')).toBeVisible();
  });

  test('should have Sign In button', async ({ page }) => {
    await page.goto('/about');
    await expect(page.locator('button', { hasText: 'Sign In' })).toBeVisible();
  });

  test('should have Get Started button', async ({ page }) => {
    await page.goto('/about');
    await expect(page.locator('button', { hasText: 'Get Started' })).toBeVisible();
  });

  test('logo should navigate to home', async ({ page }) => {
    await page.goto('/about');
    await page.locator('.landing-logo').click();
    await page.waitForURL('/');
    expect(page.url()).toMatch(/\/$/);
  });

  test('Sign In button should navigate to login', async ({ page }) => {
    await page.goto('/about');
    await page.locator('button', { hasText: 'Sign In' }).click();
    await page.waitForURL('/login');
    expect(page.url()).toContain('/login');
  });

  test('Get Started button should navigate to signup', async ({ page }) => {
    await page.goto('/about');
    await page.locator('button', { hasText: 'Get Started' }).click();
    await page.waitForURL('/signup');
    expect(page.url()).toContain('/signup');
  });
});

test.describe('About Page Footer Links', () => {
  test('should have About link in footer', async ({ page }) => {
    await page.goto('/about');
    await expect(page.locator('footer a[href="/about"]')).toBeVisible();
  });

  test('should have Principles link in footer', async ({ page }) => {
    await page.goto('/about');
    await expect(page.locator('footer a[href="/principles"]')).toBeVisible();
  });

  test('should have GitHub link in footer', async ({ page }) => {
    await page.goto('/about');
    const githubLink = page.locator('footer a[href*="github.com"]');
    await expect(githubLink).toBeVisible();
    await expect(githubLink).toHaveAttribute('target', '_blank');
  });
});

test.describe('About Page Accessibility', () => {
  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/about');

    // Should have exactly one h1
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1);

    // Should have multiple h2s for sections
    const h2Count = await page.locator('h2').count();
    expect(h2Count).toBeGreaterThanOrEqual(4);
  });

  test('should not have JavaScript console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/about');
    await page.waitForTimeout(1000);

    // Filter out expected network errors
    const criticalErrors = errors.filter(
      e => !e.includes('Failed to load resource') && !e.includes('net::ERR')
    );

    expect(criticalErrors.length).toBe(0);
  });
});
