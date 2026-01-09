// API Test Configuration

export const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

export interface TestSession {
  cookie: string;
  userId: string;
  email: string;
}

export interface ApiResponse<T = unknown> {
  ok: boolean;
  status: number;
  data: T;
  headers: Headers;
}

/**
 * Make an API request with optional session cookie
 */
export async function apiRequest<T = unknown>(
  path: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: Record<string, unknown>;
    cookie?: string;
  } = {}
): Promise<ApiResponse<T>> {
  const { method = 'GET', body, cookie } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (cookie) {
    headers['Cookie'] = cookie;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data: T;
  try {
    data = await response.json() as T;
  } catch {
    data = {} as T;
  }

  return {
    ok: response.ok,
    status: response.status,
    data,
    headers: response.headers,
  };
}

/**
 * Extract session cookie from response headers
 */
export function extractSessionCookie(headers: Headers): string | null {
  const setCookie = headers.get('set-cookie');
  if (!setCookie) return null;

  // Parse the dt_session cookie
  const match = setCookie.match(/dt_session=([^;]+)/);
  return match ? `dt_session=${match[1]}` : null;
}
