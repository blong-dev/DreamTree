/**
 * POST /api/auth/login
 *
 * Authenticate user with email and password.
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { login } from '@/lib/auth';
import type { Env } from '@/types/database';

export const runtime = 'edge';

interface LoginBody {
  email: string;
  password: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: LoginBody = await request.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const { env } = getRequestContext() as unknown as { env: Env };
    const db = env.DB;

    // Attempt login
    const result = await login(db, email, password);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Set session cookie using next/headers
    const cookieStore = await cookies();
    cookieStore.set('dt_session', result.sessionId!, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      secure: process.env.NODE_ENV === 'production',
    });

    // Check if user has completed onboarding (has settings with name)
    const profile = await db
      .prepare('SELECT display_name FROM user_profile WHERE user_id = ?')
      .bind(result.userId)
      .first<{ display_name: string | null }>();

    return NextResponse.json({
      success: true,
      userId: result.userId,
      needsOnboarding: !profile?.display_name,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
