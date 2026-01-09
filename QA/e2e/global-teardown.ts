/**
 * Global Teardown for Playwright Tests
 *
 * Cleans up test user after all tests complete.
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

export default async function globalTeardown(config: FullConfig) {
  const testDataPath = path.join(__dirname, '.test-user.json');

  if (!fs.existsSync(testDataPath)) {
    console.log('No test user data found, skipping cleanup');
    return;
  }

  try {
    const testUser: TestUserData = JSON.parse(fs.readFileSync(testDataPath, 'utf-8'));

    // Launch browser to logout
    const browser = await chromium.launch();
    const context = await browser.newContext();

    // Set the session cookie
    if (testUser.cookie) {
      const [name, value] = testUser.cookie.split('=');
      await context.addCookies([{
        name,
        value,
        domain: new URL(BASE_URL).hostname,
        path: '/',
      }]);
    }

    const page = await context.newPage();

    // Logout via API
    await page.evaluate(async () => {
      await fetch('/api/auth/logout', { method: 'POST' });
    }).catch(() => {});

    await browser.close();

    // Remove test user data file
    fs.unlinkSync(testDataPath);

    console.log(`Cleaned up test user: ${testUser.email}`);
  } catch (error) {
    console.error('Global teardown error:', error);
    // Don't throw - we want tests to still report results
  }
}
