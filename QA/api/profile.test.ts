/**
 * Profile API Tests
 *
 * Tests for /api/profile, /api/profile/export
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { apiRequest, TestSession } from './config';
import { signup, onboard, logout, defaultOnboardingSettings } from './helpers/session';
import { createTestUserData } from './helpers/fixtures';

let testSession: TestSession | null = null;

beforeAll(async () => {
  const user = createTestUserData();
  testSession = await signup(user.email, user.password, user.name);
  if (testSession) {
    await onboard(testSession, defaultOnboardingSettings);
  }
});

afterAll(async () => {
  if (testSession) {
    await logout(testSession);
    testSession = null;
  }
});

describe('GET /api/profile', () => {
  it('should fetch user profile', async () => {
    if (!testSession) {
      throw new Error('Test session not created');
    }

    const response = await apiRequest<{
      profile: {
        displayName: string | null;
        bio?: string | null;
      };
      settings: {
        backgroundColor: string;
        textColor: string;
        font: string;
      };
      skills?: Array<{
        id: number;
        name: string;
        mastery?: number;
      }>;
      values?: {
        workValues?: string | null;
        lifeValues?: string | null;
      };
    }>('/api/profile', {
      cookie: testSession.cookie,
    });

    expect(response.ok).toBe(true);
    expect(response.status).toBe(200);
    expect(response.data.profile).toBeDefined();
    expect(response.data.settings).toBeDefined();
  });

  it('should return settings with onboarding values', async () => {
    if (!testSession) {
      throw new Error('Test session not created');
    }

    const response = await apiRequest<{
      settings: {
        backgroundColor: string;
        textColor: string;
        font: string;
      };
    }>('/api/profile', {
      cookie: testSession.cookie,
    });

    expect(response.ok).toBe(true);
    // These should match our onboarding settings
    expect(response.data.settings.backgroundColor).toBe(defaultOnboardingSettings.backgroundColor);
    expect(response.data.settings.textColor).toBe(defaultOnboardingSettings.textColor);
    expect(response.data.settings.font).toBe(defaultOnboardingSettings.font);
  });

  it('should reject without auth', async () => {
    const response = await apiRequest<{ error: string }>('/api/profile');

    expect(response.ok).toBe(false);
    expect(response.status).toBe(401);
  });
});

describe('GET /api/profile/export', () => {
  it('should export all user data', async () => {
    if (!testSession) {
      throw new Error('Test session not created');
    }

    const response = await apiRequest<{
      exportedAt: string;
      profile: object;
      settings: object;
      responses?: object[];
      skills?: object[];
    }>('/api/profile/export', {
      cookie: testSession.cookie,
    });

    expect(response.ok).toBe(true);
    expect(response.status).toBe(200);
    expect(response.data.exportedAt).toBeDefined();
    expect(response.data.profile).toBeDefined();
    expect(response.data.settings).toBeDefined();
  });

  it('should reject without auth', async () => {
    const response = await apiRequest<{ error: string }>('/api/profile/export');

    expect(response.ok).toBe(false);
    expect(response.status).toBe(401);
  });
});
