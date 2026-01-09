/**
 * Test User Fixture
 *
 * Provides access to the test user created during global setup.
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { Page, BrowserContext } from '@playwright/test';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface TestUserData {
  email: string;
  password: string;
  name: string;
  cookie: string;
}

/**
 * Load test user data from global setup
 */
export function loadTestUser(): TestUserData | null {
  const testDataPath = path.join(__dirname, '..', '.test-user.json');

  if (!fs.existsSync(testDataPath)) {
    return null;
  }

  return JSON.parse(fs.readFileSync(testDataPath, 'utf-8'));
}

/**
 * Create a unique test user data object (for isolated tests)
 */
export function createTestUserData(): TestUserData {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);

  return {
    email: `test-${timestamp}-${random}@dreamtree-qa.test`,
    password: 'TestPassword123!',
    name: `Test User ${timestamp}`,
    cookie: '',
  };
}

/**
 * Login as a specific user
 */
export async function loginAs(page: Page, user: TestUserData): Promise<void> {
  await page.goto('/login');
  // Email field is the first text input
  await page.locator('input.text-input').first().fill(user.email);
  // Password field has id="password"
  await page.fill('#password', user.password);
  await page.click('button[type="submit"]');

  // Wait for redirect to dashboard or workbook
  await page.waitForURL(/\/(dashboard|workbook|\/)/, { timeout: 10000 });
}

/**
 * Set session cookie directly (faster than logging in)
 */
export async function setSessionCookie(
  context: BrowserContext,
  cookie: string,
  baseURL: string
): Promise<void> {
  const [name, value] = cookie.split('=');
  await context.addCookies([{
    name,
    value,
    domain: new URL(baseURL).hostname,
    path: '/',
  }]);
}
