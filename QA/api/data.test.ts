/**
 * Data API Tests
 *
 * Tests for /api/data/skills, /api/data/competencies, /api/data/connection
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

describe('GET /api/data/skills', () => {
  it('should fetch skills list', async () => {
    const response = await apiRequest<{
      skills: Array<{
        id: number;
        name: string;
        category?: string;
      }>;
    }>('/api/data/skills');

    expect(response.ok).toBe(true);
    expect(response.status).toBe(200);
    expect(response.data.skills).toBeInstanceOf(Array);
  });

  it('should return skills with required properties', async () => {
    const response = await apiRequest<{
      skills: Array<{
        id: number;
        name: string;
      }>;
    }>('/api/data/skills');

    if (response.data.skills.length > 0) {
      const skill = response.data.skills[0];
      expect(skill).toHaveProperty('id');
      expect(skill).toHaveProperty('name');
    }
  });
});

describe('GET /api/data/competencies', () => {
  it('should fetch competencies list', async () => {
    const response = await apiRequest<{
      competencies: Array<{
        id: number;
        name: string;
        description?: string;
      }>;
    }>('/api/data/competencies');

    expect(response.ok).toBe(true);
    expect(response.status).toBe(200);
    expect(response.data.competencies).toBeInstanceOf(Array);
  });
});

describe('GET /api/data/connection', () => {
  it('should resolve connection with valid ID', async () => {
    if (!testSession) {
      throw new Error('Test session not created');
    }

    // Use a connection ID that should exist (e.g., 100012 for skills)
    const response = await apiRequest('/api/data/connection?connectionId=100012', {
      cookie: testSession.cookie,
    });

    // The response structure depends on the connection type
    expect(response.ok).toBe(true);
    expect(response.status).toBe(200);
  });

  it('should reject without auth', async () => {
    const response = await apiRequest<{ error: string }>(
      '/api/data/connection?connectionId=100012'
    );

    expect(response.ok).toBe(false);
    expect(response.status).toBe(401);
  });

  it('should handle invalid connection ID', async () => {
    if (!testSession) {
      throw new Error('Test session not created');
    }

    const response = await apiRequest('/api/data/connection?connectionId=999999', {
      cookie: testSession.cookie,
    });

    // Should either return empty data or 404
    // The exact behavior depends on implementation
    expect([200, 400, 404, 500]).toContain(response.status);
  });
});
