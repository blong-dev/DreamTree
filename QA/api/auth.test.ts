/**
 * Auth API Tests
 *
 * Tests for /api/auth/signup, /api/auth/login, /api/auth/logout
 */

import { describe, it, expect, afterEach } from 'vitest';
import { apiRequest, extractSessionCookie, TestSession } from './config';
import { createTestUserData } from './helpers/fixtures';
import { signup } from './helpers/session';

// Track created users for cleanup
const createdSessions: TestSession[] = [];

afterEach(async () => {
  // Cleanup: logout all created sessions
  for (const session of createdSessions) {
    try {
      await apiRequest('/api/auth/logout', {
        method: 'POST',
        cookie: session.cookie,
      });
    } catch {
      // Ignore cleanup errors
    }
  }
  createdSessions.length = 0;
});

describe('POST /api/auth/signup', () => {
  it('should create account with valid data', async () => {
    const user = createTestUserData();

    const response = await apiRequest<{
      success: boolean;
      userId: string;
      needsOnboarding: boolean;
    }>('/api/auth/signup', {
      method: 'POST',
      body: { email: user.email, password: user.password, name: user.name },
    });

    expect(response.ok).toBe(true);
    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.needsOnboarding).toBe(true);
    expect(response.data.userId).toBeDefined();

    // Should set session cookie
    const cookie = extractSessionCookie(response.headers);
    expect(cookie).not.toBeNull();

    // Track for cleanup
    if (cookie) {
      createdSessions.push({
        cookie,
        userId: response.data.userId,
        email: user.email,
      });
    }
  });

  it('should reject invalid email format', async () => {
    const response = await apiRequest<{ error: string }>('/api/auth/signup', {
      method: 'POST',
      body: {
        email: 'invalid-email',
        password: 'TestPassword123!',
        name: 'Test',
      },
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(400);
    expect(response.data.error).toContain('email');
  });

  it('should reject weak password', async () => {
    const response = await apiRequest<{ error: string }>('/api/auth/signup', {
      method: 'POST',
      body: {
        email: `test-${Date.now()}@example.com`,
        password: '123',
        name: 'Test',
      },
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(400);
    expect(response.data.error).toBeDefined();
  });

  it('should reject duplicate email', async () => {
    const user = createTestUserData();

    // First signup
    const first = await apiRequest<{ success: boolean; userId: string }>(
      '/api/auth/signup',
      {
        method: 'POST',
        body: { email: user.email, password: user.password, name: user.name },
      }
    );

    const cookie = extractSessionCookie(first.headers);
    if (cookie && first.data.userId) {
      createdSessions.push({
        cookie,
        userId: first.data.userId,
        email: user.email,
      });
    }

    // Try duplicate
    const duplicate = await apiRequest<{ error: string }>('/api/auth/signup', {
      method: 'POST',
      body: {
        email: user.email,
        password: 'DifferentPass123!',
        name: 'Different',
      },
    });

    expect(duplicate.ok).toBe(false);
    expect(duplicate.status).toBe(409);
    expect(duplicate.data.error).toContain('already exists');
  });

  it('should reject missing email', async () => {
    const response = await apiRequest<{ error: string }>('/api/auth/signup', {
      method: 'POST',
      body: { password: 'TestPassword123!' },
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(400);
    expect(response.data.error).toContain('required');
  });

  it('should reject missing password', async () => {
    const response = await apiRequest<{ error: string }>('/api/auth/signup', {
      method: 'POST',
      body: { email: `test-${Date.now()}@example.com` },
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(400);
    expect(response.data.error).toContain('required');
  });
});

describe('POST /api/auth/login', () => {
  it('should login with valid credentials', async () => {
    // First create a user
    const user = createTestUserData();
    const signup = await apiRequest<{ success: boolean; userId: string }>(
      '/api/auth/signup',
      {
        method: 'POST',
        body: { email: user.email, password: user.password, name: user.name },
      }
    );

    const signupCookie = extractSessionCookie(signup.headers);
    if (signupCookie && signup.data.userId) {
      createdSessions.push({
        cookie: signupCookie,
        userId: signup.data.userId,
        email: user.email,
      });
    }

    // Now login
    const response = await apiRequest<{
      success: boolean;
      userId: string;
      needsOnboarding: boolean;
    }>('/api/auth/login', {
      method: 'POST',
      body: { email: user.email, password: user.password },
    });

    expect(response.ok).toBe(true);
    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.userId).toBeDefined();

    // Should set session cookie
    const cookie = extractSessionCookie(response.headers);
    expect(cookie).not.toBeNull();
  });

  it('should reject wrong password', async () => {
    // First create a user
    const user = createTestUserData();
    const signup = await apiRequest<{ success: boolean; userId: string }>(
      '/api/auth/signup',
      {
        method: 'POST',
        body: { email: user.email, password: user.password, name: user.name },
      }
    );

    const signupCookie = extractSessionCookie(signup.headers);
    if (signupCookie && signup.data.userId) {
      createdSessions.push({
        cookie: signupCookie,
        userId: signup.data.userId,
        email: user.email,
      });
    }

    // Try wrong password
    const response = await apiRequest<{ error: string }>('/api/auth/login', {
      method: 'POST',
      body: { email: user.email, password: 'WrongPassword123!' },
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(401);
    expect(response.data.error).toBeDefined();
  });

  it('should reject non-existent user', async () => {
    const response = await apiRequest<{ error: string }>('/api/auth/login', {
      method: 'POST',
      body: {
        email: `nonexistent-${Date.now()}@example.com`,
        password: 'TestPassword123!',
      },
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(401);
    expect(response.data.error).toBeDefined();
  });

  it('should reject missing credentials', async () => {
    const response = await apiRequest<{ error: string }>('/api/auth/login', {
      method: 'POST',
      body: {},
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(400);
    expect(response.data.error).toContain('required');
  });
});

describe('POST /api/auth/logout', () => {
  it('should clear session on logout', async () => {
    // Create a user using the signup helper
    const user = createTestUserData();
    const session = await signup(user.email, user.password, user.name);

    // Signup should have returned a session
    expect(session).not.toBeNull();
    if (!session) return;

    // Logout
    const response = await apiRequest('/api/auth/logout', {
      method: 'POST',
      cookie: session.cookie,
    });

    expect(response.ok).toBe(true);

    // Session should be invalid now (subsequent requests should fail)
    // Note: depends on how the app handles invalid sessions
  });
});
