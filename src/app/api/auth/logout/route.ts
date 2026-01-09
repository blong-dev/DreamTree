/**
 * POST /api/auth/logout
 *
 * Clear session and logout user.
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { deleteSession } from '@/lib/auth';
import '@/types/database'; // CloudflareEnv augmentation


export async function POST() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('dt_session')?.value;

    if (sessionId) {
      // Delete session from database
      const { env } = getCloudflareContext();
      await deleteSession(env.DB, sessionId);
    }

    // Clear session cookie
    cookieStore.delete('dt_session');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    // Still clear cookie even if DB delete fails
    const cookieStore = await cookies();
    cookieStore.delete('dt_session');

    return NextResponse.json({ success: true });
  }
}
