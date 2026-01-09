/**
 * POST /api/auth/signup
 *
 * Create a new user account with email and password.
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { nanoid } from 'nanoid';
import {
  hashPassword,
  validatePasswordStrength,
  deriveWrappingKey,
  generateDataKey,
  wrapDataKey,
  generateSalt,
  encodeSalt,
} from '@/lib/auth';
import type { Env } from '@/types/database';

export const runtime = 'edge';

interface SignupBody {
  email: string;
  password: string;
  name?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: SignupBody = await request.json();
    const { email, password, name } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.errors[0] },
        { status: 400 }
      );
    }

    const { env } = getRequestContext() as unknown as { env: Env };
    const db = env.DB;
    const normalizedEmail = email.toLowerCase().trim();

    // Check if email is already taken
    const existingEmail = await db
      .prepare('SELECT id FROM emails WHERE email = ?')
      .bind(normalizedEmail)
      .first();

    if (existingEmail) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    const now = new Date().toISOString();
    const userId = nanoid();
    const sessionId = nanoid();

    // Hash password
    const passwordHash = await hashPassword(password);

    // Generate encryption keys for PII
    const salt = generateSalt();
    const wrappingKey = await deriveWrappingKey(password, salt);
    const dataKey = await generateDataKey();
    const wrappedDataKey = await wrapDataKey(dataKey, wrappingKey);
    const storedKey = `${encodeSalt(salt)}:${wrappedDataKey}`;

    // Create user (not anonymous)
    await db
      .prepare(
        `INSERT INTO users (id, is_anonymous, workbook_complete, created_at, updated_at)
         VALUES (?, 0, 0, ?, ?)`
      )
      .bind(userId, now, now)
      .run();

    // Create auth record
    await db
      .prepare(
        `INSERT INTO auth (id, user_id, type, password_hash, wrapped_data_key, created_at, updated_at)
         VALUES (?, ?, 'password', ?, ?, ?, ?)`
      )
      .bind(nanoid(), userId, passwordHash, storedKey, now, now)
      .run();

    // Create email record
    await db
      .prepare(
        `INSERT INTO emails (id, user_id, email, is_active, added_at)
         VALUES (?, ?, ?, 1, ?)`
      )
      .bind(nanoid(), userId, normalizedEmail, now)
      .run();

    // Create session
    await db
      .prepare(
        `INSERT INTO sessions (id, user_id, created_at, last_seen_at)
         VALUES (?, ?, ?, ?)`
      )
      .bind(sessionId, userId, now, now)
      .run();

    // Create default settings
    await db
      .prepare(
        `INSERT INTO user_settings (user_id, background_color, text_color, font, created_at, updated_at)
         VALUES (?, 'ivory', 'charcoal', 'inter', ?, ?)`
      )
      .bind(userId, now, now)
      .run();

    // Create user_profile row with name if provided
    await db
      .prepare(
        `INSERT INTO user_profile (user_id, display_name, created_at, updated_at)
         VALUES (?, ?, ?, ?)`
      )
      .bind(userId, name || null, now, now)
      .run();

    // Create user_values row
    await db
      .prepare(
        `INSERT INTO user_values (user_id, created_at, updated_at)
         VALUES (?, ?, ?)`
      )
      .bind(userId, now, now)
      .run();

    // Set session cookie using next/headers
    const cookieStore = await cookies();
    cookieStore.set('dt_session', sessionId, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      secure: process.env.NODE_ENV === 'production',
    });

    return NextResponse.json({
      success: true,
      userId,
      needsOnboarding: true,
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'An error occurred during signup' },
      { status: 500 }
    );
  }
}
