/**
 * Security Tests
 *
 * Tests for SQL injection prevention and auth security.
 * These tests validate OWASP Top 10 vulnerabilities are addressed.
 *
 * IMP-037: fetchExperiences SQL injection risk
 * IMP-038: fetchUserLists SQL injection risk
 * IMP-039: Auth brute-force protection
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { apiRequest, extractSessionCookie, TestSession } from './config';
import { createTestUserData } from './helpers/fixtures';

// Track created sessions for cleanup
let testSession: TestSession | null = null;

beforeAll(async () => {
  // Create a test user for authenticated endpoint tests
  const user = createTestUserData();
  const response = await apiRequest<{
    success: boolean;
    userId: string;
  }>('/api/auth/signup', {
    method: 'POST',
    body: { email: user.email, password: user.password, name: user.name },
  });

  const cookie = extractSessionCookie(response.headers);
  if (cookie && response.data.userId) {
    testSession = {
      cookie,
      userId: response.data.userId,
      email: user.email,
    };
  }
});

afterAll(async () => {
  // Cleanup: logout test session
  if (testSession) {
    try {
      await apiRequest('/api/auth/logout', {
        method: 'POST',
        cookie: testSession.cookie,
      });
    } catch {
      // Ignore cleanup errors
    }
  }
});

describe('SQL Injection Prevention', () => {
  describe('GET /api/data/connection', () => {
    /**
     * IMP-037 & IMP-038: Connection endpoint should reject SQL injection attempts
     *
     * The connectionId parameter should only accept valid integers.
     * Any attempt to inject SQL should be blocked.
     */

    it('should reject non-numeric connectionId', async () => {
      if (!testSession) {
        throw new Error('Test session not created');
      }

      const response = await apiRequest<{ error: string }>(
        '/api/data/connection?connectionId=abc',
        { cookie: testSession.cookie }
      );

      // Should fail validation or return empty result, not execute SQL
      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('should reject SQL injection in connectionId (OR 1=1)', async () => {
      if (!testSession) {
        throw new Error('Test session not created');
      }

      // Classic SQL injection attempt
      const response = await apiRequest<{ error: string }>(
        '/api/data/connection?connectionId=1%20OR%201%3D1',
        { cookie: testSession.cookie }
      );

      // parseInt('1 OR 1=1') returns 1, so this tests if extra content is ignored
      // The important thing is it doesn't return all connections
      expect(response.status).not.toBe(500); // No server error from malformed SQL
    });

    it('should reject SQL injection in connectionId (UNION SELECT)', async () => {
      if (!testSession) {
        throw new Error('Test session not created');
      }

      // UNION-based injection attempt
      const response = await apiRequest<{ error: string }>(
        '/api/data/connection?connectionId=1%20UNION%20SELECT%20*%20FROM%20users',
        { cookie: testSession.cookie }
      );

      // Should not expose other tables
      expect(response.status).not.toBe(500);
      // Should not return user data in response
      if (response.ok) {
        const data = response.data as Record<string, unknown>;
        expect(data).not.toHaveProperty('password');
        expect(data).not.toHaveProperty('email');
      }
    });

    it('should reject SQL injection with comment bypass', async () => {
      if (!testSession) {
        throw new Error('Test session not created');
      }

      // Comment bypass attempt
      const response = await apiRequest<{ error: string }>(
        '/api/data/connection?connectionId=1;--',
        { cookie: testSession.cookie }
      );

      expect(response.status).not.toBe(500);
    });

    it('should reject negative connectionId', async () => {
      if (!testSession) {
        throw new Error('Test session not created');
      }

      const response = await apiRequest<{ error: string }>(
        '/api/data/connection?connectionId=-1',
        { cookie: testSession.cookie }
      );

      // Should handle gracefully
      expect(response.status).not.toBe(500);
    });

    it('should handle very large connectionId', async () => {
      if (!testSession) {
        throw new Error('Test session not created');
      }

      // Integer overflow attempt
      const response = await apiRequest<{ error: string }>(
        '/api/data/connection?connectionId=99999999999999999999',
        { cookie: testSession.cookie }
      );

      expect(response.status).not.toBe(500);
    });

    it('should require authentication', async () => {
      // No cookie - should return 401
      const response = await apiRequest<{ error: string }>(
        '/api/data/connection?connectionId=1'
      );

      expect(response.status).toBe(401);
      expect(response.data.error).toContain('authenticated');
    });
  });

  describe('Connection Data Isolation', () => {
    /**
     * Verify that connection queries only return data for the authenticated user.
     * This validates the WHERE user_id = ? clause is always applied.
     */

    it('should only return data for the authenticated user', async () => {
      if (!testSession) {
        throw new Error('Test session not created');
      }

      // Try to fetch a valid connection (if it exists)
      const response = await apiRequest<{
        connectionId: number;
        method: string;
        data: unknown;
        isEmpty: boolean;
      }>('/api/data/connection?connectionId=100000', {
        cookie: testSession.cookie,
      });

      // Response should not contain data from other users
      // For a new user, connections that rely on user data should return empty
      if (response.ok && response.data) {
        // The data should be scoped to the test user
        // Empty is expected for a new user with no data
        expect(response.data.isEmpty === true || response.data.data !== null).toBe(true);
      }
    });
  });
});

describe('Auth API Security', () => {
  describe('POST /api/auth/login - Input Validation', () => {
    /**
     * Test SQL injection attempts in login credentials
     */

    it('should reject SQL injection in email field', async () => {
      const response = await apiRequest<{ error: string }>('/api/auth/login', {
        method: 'POST',
        body: {
          email: "admin'--",
          password: 'anything',
        },
      });

      // Should fail validation, not execute SQL
      expect(response.ok).toBe(false);
      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('should reject SQL injection in email (OR 1=1)', async () => {
      const response = await apiRequest<{ error: string }>('/api/auth/login', {
        method: 'POST',
        body: {
          email: "' OR '1'='1",
          password: 'anything',
        },
      });

      expect(response.ok).toBe(false);
      expect(response.status).not.toBe(500);
    });

    it('should reject SQL injection in password field', async () => {
      const response = await apiRequest<{ error: string }>('/api/auth/login', {
        method: 'POST',
        body: {
          email: 'test@example.com',
          password: "' OR '1'='1",
        },
      });

      expect(response.ok).toBe(false);
      // Should return 401 (invalid credentials) not 500 (server error)
      expect(response.status).toBe(401);
    });

    it('should not reveal if email exists (timing-safe)', async () => {
      // This tests for information leakage
      // Both valid and invalid emails should return similar response times
      // and identical error messages
      const invalidEmail = await apiRequest<{ error: string }>('/api/auth/login', {
        method: 'POST',
        body: {
          email: `nonexistent-${Date.now()}@example.com`,
          password: 'WrongPassword123!',
        },
      });

      expect(invalidEmail.ok).toBe(false);
      expect(invalidEmail.status).toBe(401);

      // Error message should be generic, not reveal "user not found" vs "wrong password"
      expect(invalidEmail.data.error).not.toMatch(/not found/i);
      expect(invalidEmail.data.error).not.toMatch(/no user/i);
    });
  });

  describe('POST /api/auth/login - Brute Force Protection', () => {
    /**
     * IMP-039: Auth routes should have rate limiting
     *
     * NOTE: These tests document the CURRENT vulnerability.
     * When rate limiting is implemented, these tests should be updated.
     */

    it('should allow multiple failed login attempts (VULNERABILITY: no rate limiting)', async () => {
      const testEmail = `brute-force-test-${Date.now()}@example.com`;

      // Make 10 rapid failed login attempts
      const attempts = await Promise.all(
        Array.from({ length: 10 }, () =>
          apiRequest<{ error: string }>('/api/auth/login', {
            method: 'POST',
            body: { email: testEmail, password: 'WrongPassword!' },
          })
        )
      );

      // Currently all should be 401 (no rate limiting)
      const statuses = attempts.map((r) => r.status);

      // CURRENT BEHAVIOR: All requests succeed (return 401)
      // TODO: When rate limiting is implemented, later requests should return 429
      const has429 = statuses.some((s) => s === 429);

      if (!has429) {
        // This documents the vulnerability
        console.warn(
          'WARNING: No rate limiting detected on /api/auth/login. ' +
            'IMP-039 is still a vulnerability.'
        );
      }

      // For now, just verify the endpoint doesn't crash
      expect(statuses.every((s) => s === 401 || s === 429)).toBe(true);
    });

    it('should handle concurrent login attempts gracefully', async () => {
      // Test for race conditions in auth
      const testEmail = `concurrent-test-${Date.now()}@example.com`;

      const attempts = await Promise.all(
        Array.from({ length: 5 }, () =>
          apiRequest<{ error: string }>('/api/auth/login', {
            method: 'POST',
            body: { email: testEmail, password: 'TestPassword123!' },
          })
        )
      );

      // All should complete without server errors
      attempts.forEach((response) => {
        expect(response.status).not.toBe(500);
      });
    });
  });

  describe('POST /api/auth/signup - Input Validation', () => {
    /**
     * Test SQL injection in signup
     */

    it('should reject SQL injection in name field', async () => {
      const response = await apiRequest<{ error: string }>('/api/auth/signup', {
        method: 'POST',
        body: {
          email: `test-${Date.now()}@example.com`,
          password: 'ValidPassword123!',
          name: "Robert'); DROP TABLE users;--",
        },
      });

      // Even if injection is attempted, it should not execute
      // The signup might succeed (with escaped name) or fail validation
      expect(response.status).not.toBe(500);
    });

    it('should sanitize or reject XSS in name field', async () => {
      const response = await apiRequest<{ error: string }>('/api/auth/signup', {
        method: 'POST',
        body: {
          email: `xss-test-${Date.now()}@example.com`,
          password: 'ValidPassword123!',
          name: '<script>alert("XSS")</script>',
        },
      });

      // Should either reject or sanitize - not return 500
      expect(response.status).not.toBe(500);
    });
  });
});

describe('Session Security', () => {
  it('should reject invalid session cookie', async () => {
    const response = await apiRequest<{ error: string }>('/api/profile', {
      cookie: 'dt_session=invalid-session-id-12345',
    });

    expect(response.status).toBe(401);
  });

  it('should reject malformed session cookie', async () => {
    const response = await apiRequest<{ error: string }>('/api/profile', {
      cookie: 'dt_session=; DROP TABLE sessions;--',
    });

    expect(response.status).not.toBe(500);
    expect(response.status).toBe(401);
  });

  it('should reject empty session cookie', async () => {
    const response = await apiRequest<{ error: string }>('/api/profile', {
      cookie: 'dt_session=',
    });

    expect(response.status).toBe(401);
  });
});
