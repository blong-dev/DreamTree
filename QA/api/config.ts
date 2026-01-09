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
 * Includes retry logic for transient 5xx errors
 */
export async function apiRequest<T = unknown>(
  path: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: Record<string, unknown>;
    cookie?: string;
    retries?: number;
  } = {}
): Promise<ApiResponse<T>> {
  const { method = 'GET', body, cookie, retries = 2 } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (cookie) {
    headers['Cookie'] = cookie;
  }

  let lastResponse: Response | null = null;

  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    const response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    lastResponse = response;

    // Retry on 5xx errors (server issues) but not 4xx (client errors)
    if (response.status >= 500 && attempt <= retries) {
      console.warn(`[API] ${method} ${path} returned ${response.status}, retry ${attempt}/${retries}`);
      await new Promise(r => setTimeout(r, 300 * attempt)); // Backoff
      continue;
    }

    break;
  }

  let data: T;
  try {
    data = await lastResponse!.json() as T;
  } catch {
    data = {} as T;
  }

  return {
    ok: lastResponse!.ok,
    status: lastResponse!.status,
    data,
    headers: lastResponse!.headers,
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
