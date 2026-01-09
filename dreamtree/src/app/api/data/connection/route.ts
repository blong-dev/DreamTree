import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { createDb } from '@/lib/db';
import { ConnectionResolver } from '@/lib/connections/resolver';
import type { Env } from '@/types/database';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const connectionId = searchParams.get('connectionId');

    if (!connectionId) {
      return NextResponse.json(
        { error: 'connectionId is required' },
        { status: 400 }
      );
    }

    // Get session to identify user
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('dt_session')?.value;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { env } = getRequestContext() as unknown as { env: Env };
    const db = createDb(env.DB);

    // Get user from session
    const session = await db.getSessionById(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    // Use ConnectionResolver to fetch the data
    const resolver = new ConnectionResolver(env.DB);
    const result = await resolver.resolve({
      userId: session.user_id,
      connectionId: parseInt(connectionId, 10),
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error resolving connection:', error);
    return NextResponse.json(
      { error: 'Failed to resolve connection' },
      { status: 500 }
    );
  }
}
