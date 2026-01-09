/**
 * Auth Middleware Helper (IMP-009/IMP-040)
 *
 * Eliminates ~25 lines of duplicated session validation in each API route.
 *
 * Usage:
 * ```typescript
 * import { withAuth, AuthenticatedHandler } from '@/lib/auth/with-auth';
 *
 * const handler: AuthenticatedHandler = async (request, { userId, db }) => {
 *   // userId and db are already validated and available
 *   return NextResponse.json({ success: true });
 * };
 *
 * export const GET = withAuth(handler);
 * export const POST = withAuth(handler);
 * ```
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import type { D1Database } from '@cloudflare/workers-types';
import { getSessionIdFromCookie, getSessionData } from './session';
import '@/types/database';

export interface AuthContext {
  userId: string;
  db: D1Database;
  sessionId: string;
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
export function withAuth(handler: AuthenticatedHandler) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      // Extract session from cookie
      const cookieHeader = request.headers.get('cookie');
      const sessionId = getSessionIdFromCookie(cookieHeader);

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
