// Session Management Helpers

import { apiRequest, extractSessionCookie, TestSession } from '../config';

interface SignupResponse {
  success: boolean;
  needsOnboarding: boolean;
  userId?: string;
  error?: string;
}

interface LoginResponse {
  success: boolean;
  needsOnboarding: boolean;
  userId?: string;
  error?: string;
}

interface OnboardingData {
  name: string;
  backgroundColor: string;
  textColor: string;
  font: string;
}

/**
 * Create a new test user via signup
 * Includes retry logic for transient 5xx errors
 */
export async function signup(
  email: string,
  password: string,
  name: string,
  retries = 3
): Promise<TestSession | null> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= retries; attempt++) {
    const response = await apiRequest<SignupResponse>('/api/auth/signup', {
      method: 'POST',
      body: { email, password, name },
    });

    // Retry on 5xx errors
    if (response.status >= 500 && attempt < retries) {
      console.warn(`Signup attempt ${attempt} failed with ${response.status}, retrying...`);
      await new Promise(r => setTimeout(r, 500 * attempt)); // Backoff
      continue;
    }

    if (!response.ok) {
      console.error('Signup failed:', response.status, response.data);
      lastError = response.data;
      return null;
    }

    const cookie = extractSessionCookie(response.headers);
    if (!cookie) {
      console.error('No session cookie returned');
      return null;
    }

    return {
      cookie,
      userId: response.data.userId || '',
      email,
    };
  }

  console.error('Signup failed after', retries, 'attempts:', lastError);
  return null;
}

/**
 * Login with existing credentials
 */
export async function login(
  email: string,
  password: string
): Promise<TestSession | null> {
  const response = await apiRequest<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: { email, password },
  });

  if (!response.ok) {
    return null;
  }

  const cookie = extractSessionCookie(response.headers);
  if (!cookie) {
    return null;
  }

  return {
    cookie,
    userId: response.data.userId || '',
    email,
  };
}

/**
 * Complete onboarding for a session
 */
export async function onboard(
  session: TestSession,
  data: OnboardingData
): Promise<boolean> {
  const response = await apiRequest('/api/onboarding', {
    method: 'POST',
    body: data,
    cookie: session.cookie,
  });

  return response.ok;
}

/**
 * Logout and clear session
 */
export async function logout(session: TestSession): Promise<boolean> {
  const response = await apiRequest('/api/auth/logout', {
    method: 'POST',
    cookie: session.cookie,
  });

  return response.ok;
}

/**
 * Default onboarding settings for tests
 */
export const defaultOnboardingSettings: OnboardingData = {
  name: 'Test User',
  backgroundColor: 'ivory',
  textColor: 'brown',
  font: 'inter',
};
