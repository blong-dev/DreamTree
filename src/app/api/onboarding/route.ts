/**
 * POST /api/onboarding
 *
 * Save user onboarding preferences (name, colors, font).
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { getSessionData } from '@/lib/auth';
import type { Env } from '@/types/database';

export const runtime = 'edge';

interface OnboardingBody {
  name: string;
  backgroundColor: string;
  textColor: string;
  font: string;
}

export async function POST(request: NextRequest) {
  try {
    // Get session
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

    const body: OnboardingBody = await request.json();
    const { name, backgroundColor, textColor, font } = body;

    // Validate required fields
    if (!name || !backgroundColor || !textColor || !font) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const userId = sessionData.user.id;

    // Update user_profile with name
    await env.DB
      .prepare(
        'UPDATE user_profile SET display_name = ?, updated_at = ? WHERE user_id = ?'
      )
      .bind(name.trim(), now, userId)
      .run();

    // Update user_settings with visual preferences
    await env.DB
      .prepare(
        `UPDATE user_settings
         SET background_color = ?, text_color = ?, font = ?, updated_at = ?
         WHERE user_id = ?`
      )
      .bind(backgroundColor, textColor, font, now, userId)
      .run();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Onboarding error:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}
