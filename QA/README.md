# DreamTree QA

Automated testing for the DreamTree application.

## Setup

```bash
cd C:\dreamtree\QA
npm install
npx playwright install  # For E2E tests
```

## Running Tests

### API Tests (Vitest)

```bash
# Run all API tests
npm run test:api

# Watch mode
npm run test:api:watch
```

### E2E Tests (Playwright)

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui

# Run headed (see browser)
npm run test:e2e:headed
```

### Run All Tests

```bash
npm run test:all
```

## Configuration

Copy `.env.example` to `.env.local` and configure:

```bash
# Test against local dev server (default)
TEST_BASE_URL=http://localhost:3000

# Test against staging
TEST_BASE_URL=https://dreamtree.pages.dev
```

## Test Structure

### API Tests (`api/`)

Direct endpoint testing using Vitest:

- `auth.test.ts` - Signup, login, logout
- `workbook.test.ts` - Exercise content, responses, progress
- `data.test.ts` - Skills, competencies, connections
- `profile.test.ts` - User profile, export
- `tools.test.ts` - Tool counts, instances

### E2E Tests (`e2e/`)

Browser automation using Playwright:

- `auth.spec.ts` - Signup and login flows
- `onboarding.spec.ts` - Onboarding wizard
- `workbook.spec.ts` - Exercise completion
- `tools.spec.ts` - Tools pages
- `profile.spec.ts` - Profile page
- `navigation.spec.ts` - TOC panel, nav bar, breadcrumbs
- `dashboard.spec.ts` - Dashboard page components

### Helpers

- `api/config.ts` - Base URL, API request helper
- `api/helpers/session.ts` - Session management
- `api/helpers/fixtures.ts` - Test data factories
- `e2e/fixtures/pages.ts` - Page Object Models
- `e2e/fixtures/test-user.ts` - Test user management

## Test Users

Tests create fresh users per run and clean up after:

- API tests create/delete users in `afterEach`
- E2E tests use `global-setup.ts`/`global-teardown.ts`

No persistent test accounts are used.

## CI Integration

Tests can run in CI via GitHub Actions (see plan file for workflow).

## Writing New Tests

### API Test Example

```typescript
import { describe, it, expect } from 'vitest';
import { apiRequest, TestSession } from './config';

describe('GET /api/example', () => {
  it('should return data', async () => {
    const response = await apiRequest<{ data: string }>('/api/example');
    expect(response.ok).toBe(true);
    expect(response.data.data).toBeDefined();
  });
});
```

### E2E Test Example

```typescript
import { test, expect } from '@playwright/test';

test('should complete flow', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
});
```
