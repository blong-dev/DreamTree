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
 */
export async function signup(
  email: string,
  password: string,
  name: string
): Promise<TestSession | null> {
  const response = await apiRequest<SignupResponse>('/api/auth/signup', {
    method: 'POST',
    body: { email, password, name },
  });

  if (!response.ok) {
    console.error('Signup failed:', response.data);
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
