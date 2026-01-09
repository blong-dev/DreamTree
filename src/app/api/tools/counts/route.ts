/**
 * GET /api/tools/counts
 * Fetch counts of tool responses per tool type for the current user.
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { getSessionData } from '@/lib/auth';
import type { Env } from '@/types/database';

export const runtime = 'edge';

export async function GET(_request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('dt_session')?.value;

    if (!sessionId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { env } = getRequestContext() as unknown as { env: Env };
    const sessionData = await getSessionData(env.DB, sessionId);

    if (!sessionData) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const userId = sessionData.user.id;

    // Get counts of tool responses grouped by tool name
    // We need to join user_responses with tools table to get tool names
    const result = await env.DB
      .prepare(`
        SELECT t.name as tool_name, COUNT(ur.id) as count
        FROM user_responses ur
        JOIN tools t ON ur.tool_id = t.id
        WHERE ur.user_id = ? AND ur.tool_id IS NOT NULL
        GROUP BY t.name
      `)
      .bind(userId)
      .all<{ tool_name: string; count: number }>();

    // Convert to a map of tool_name -> count
    const counts: Record<string, number> = {};
    for (const row of result.results || []) {
      // Normalize tool name to match the format used in the UI
      const normalizedName = row.tool_name.toLowerCase().replace(/-/g, '_');
      counts[normalizedName] = row.count;
    }

    return NextResponse.json({ counts });
  } catch (error) {
    console.error('Error fetching tool counts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tool counts' },
      { status: 500 }
    );
  }
}
