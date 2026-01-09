/**
 * Global Setup for Playwright Tests
 *
 * Creates a test user before all tests run.
 * Stores the session info for use in tests.
 */

import { chromium, FullConfig } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

interface TestUserData {
  email: string;
  password: string;
  name: string;
  cookie: string;
}

export default async function globalSetup(config: FullConfig) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  const testUser = {
    email: `e2e-${timestamp}-${random}@dreamtree-qa.test`,
    password: 'TestPassword123!',
    name: `E2E Test User ${timestamp}`,
    cookie: '',
  };

  // Launch browser to sign up user
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to signup
    await page.goto(`${BASE_URL}/signup`);

    // Fill signup form - using label text and IDs
    // Name field: first text input (TextInput with label "Your name")
    await page.locator('input.text-input').first().fill(testUser.name);
    // Email field: second text input (TextInput with label "Email")
    await page.locator('input.text-input').nth(1).fill(testUser.email);
    // Password field: input with id="password"
    await page.fill('#password', testUser.password);
    // Confirm password: input with id="confirm-password"
    await page.fill('#confirm-password', testUser.password);

    // Submit and wait for redirect
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(onboarding|workbook)/, { timeout: 15000 });

    // If redirected to onboarding, complete it
    if (page.url().includes('/onboarding')) {
      // Complete onboarding steps
      // Step 1: Welcome - click continue
      await page.click('button:has-text("Continue"), button:has-text("Get Started"), button:has-text("Next")').catch(() => {});
      await page.waitForTimeout(500);

      // Step 2: Name (may already be filled)
      const nameInput = page.locator('input.text-input').first();
      if (await nameInput.isVisible()) {
        await nameInput.fill(testUser.name);
        await page.click('button:has-text("Continue"), button:has-text("Next")').catch(() => {});
        await page.waitForTimeout(500);
      }

      // Step 3: Visual settings
      await page.click('[data-bg="ivory"], .bg-option:first-child').catch(() => {});
      await page.click('[data-text="brown"], .text-option:first-child').catch(() => {});
      await page.click('[data-font="inter"], .font-option:first-child').catch(() => {});
      await page.click('button:has-text("Continue"), button:has-text("Next")').catch(() => {});
      await page.waitForTimeout(500);

      // Step 4: Complete
      await page.click('button:has-text("Start"), button:has-text("Begin"), button:has-text("Finish")').catch(() => {});

      // Wait for redirect to workbook
      await page.waitForURL(/\/workbook/, { timeout: 15000 }).catch(() => {});
    }

    // Get cookies
    const cookies = await context.cookies();
    const sessionCookie = cookies.find(c => c.name === 'dt_session');
    if (sessionCookie) {
      testUser.cookie = `dt_session=${sessionCookie.value}`;
    }

    // Save test user data for tests
    const testDataPath = path.join(__dirname, '.test-user.json');
    fs.writeFileSync(testDataPath, JSON.stringify(testUser, null, 2));

    console.log(`Created test user: ${testUser.email}`);
  } catch (error) {
    console.error('Global setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}
