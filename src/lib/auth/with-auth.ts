/**
 * Auth Middleware Helper (IMP-009/IMP-040)
 *
 * Eliminates ~25 lines of duplicated session validation in each API route.
 *
 * Usage:
 * ```typescript
 * import { withAuth } from '@/lib/auth';
 *
 * export const GET = withAuth(async (request, { userId, db }) => {
 *   const data = await db.prepare('SELECT * FROM table WHERE user_id = ?')
 *     .bind(userId).all();
 *   return NextResponse.json(data);
 * });
 * ```
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import type { D1Database } from '@cloudflare/workers-types';
import { getSessionData, type SessionData } from './session';
import '@/types/database';

export interface AuthContext {
  /** Current user's ID */
  userId: string;
  /** Raw D1 database binding */
  db: D1Database;
  /** Session ID (for PII encryption/decryption) */
  sessionId: string;
  /** Full session data including user and settings */
  session: SessionData;
}

export type AuthenticatedHandler = (
  request: NextRequest,
  context: AuthContext
) => Promise<NextResponse>;

/**
 * Wraps an API route handler with session authentication.
 * Extracts and validates session, passing userId and db to the handler.
 * Returns 401 if not authenticated or session invalid.
 */
export function withAuth(handler: AuthenticatedHandler) { // code_id:440
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      // Get session from cookies
      const cookieStore = await cookies();
      const sessionId = cookieStore.get('dt_session')?.value;

      if (!sessionId) {
        return NextResponse.json(
          { error: 'Not authenticated' },
          { status: 401 }
        );
      }

      // Get Cloudflare context and database
      const { env } = getCloudflareContext();
      const db = env.DB;

      // Validate session
      const sessionData = await getSessionData(db, sessionId);
      if (!sessionData) {
        return NextResponse.json(
          { error: 'Invalid session' },
          { status: 401 }
        );
      }

      // Call the authenticated handler with context
      return await handler(request, {
        userId: sessionData.user.id,
        db,
        sessionId,
        session: sessionData,
      });
    } catch (error) {
      console.error('Auth middleware error:', error);
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 500 }
      );
    }
  };
}

/**
 * Get auth context without wrapping the handler.
 * Use when you need more control over error handling.
 *
 * @example
 * ```ts
 * export async function GET(request: NextRequest) { // code_id:441
 *   const auth = await getAuthContext();
 *   if (!auth.ok) {
 *     return NextResponse.json({ error: auth.error }, { status: 401 });
 *   }
 *   const { userId, db } = auth;
 *   // ... rest of handler
 * }
 * ```
 */
export async function getAuthContext(): Promise<
  | ({ ok: true } & AuthContext)
  | { ok: false; error: string }
> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('dt_session')?.value;

  if (!sessionId) { // code_id:442
    return { ok: false, error: 'Not authenticated' };
  }

  const { env } = getCloudflareContext();
  const sessionData = await getSessionData(env.DB, sessionId);

  if (!sessionData) {
    return { ok: false, error: 'Invalid session' };
  }

  return {
    ok: true,
    userId: sessionData.user.id,
    sessionId,
    session: sessionData,
    db: env.DB,
  };
}
