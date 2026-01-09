/**
 * POST /api/auth/signup
 *
 * Create a new user account with email and password.
 * Includes rate limiting to prevent signup spam (IMP-039).
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { nanoid } from 'nanoid';
import {
  hashPassword,
  validatePasswordStrength,
  deriveWrappingKey,
  generateDataKey,
  wrapDataKey,
  generateSalt,
  encodeSalt,
  storeDataKeyInSession,
} from '@/lib/auth';
import { checkRateLimit, recordFailedAttempt, clearRateLimit } from '@/lib/auth/rate-limiter';
import '@/types/database'; // CloudflareEnv augmentation


interface SignupBody {
  email: string;
  password: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: SignupBody = await request.json();
    const { email, password } = body;

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

    const { env } = getCloudflareContext();
    const db = env.DB;

    // Check rate limit before attempting signup
    const rateCheck = await checkRateLimit(db, email, 'signup');
    if (!rateCheck.allowed) {
      const retryAfter = rateCheck.blockedUntil
        ? Math.ceil((rateCheck.blockedUntil.getTime() - Date.now()) / 1000)
        : 1800; // 30 minutes default
      return NextResponse.json(
        { error: 'Too many signup attempts. Please try again later.' },
        {
          status: 429,
          headers: { 'Retry-After': String(retryAfter) },
        }
      );
    }
    const normalizedEmail = email.toLowerCase().trim();

    // Check if email is already taken
    const existingEmail = await db
      .prepare('SELECT id FROM emails WHERE email = ?')
      .bind(normalizedEmail)
      .first();

    if (existingEmail) {
      // Record failed attempt (someone may be probing for existing emails)
      await recordFailedAttempt(db, normalizedEmail, 'signup');
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    const now = new Date().toISOString();
    const userId = nanoid();
    const sessionId = nanoid();
    const authId = nanoid();
    const emailId = nanoid();

    // Hash password
    const passwordHash = await hashPassword(password);

    // Generate encryption keys for PII
    const salt = generateSalt();
    const wrappingKey = await deriveWrappingKey(password, salt);
    const dataKey = await generateDataKey();
    const wrappedDataKey = await wrapDataKey(dataKey, wrappingKey);
    const storedKey = `${encodeSalt(salt)}:${wrappedDataKey}`;

    // Execute all 7 inserts as a batch transaction (IMP-044)
    // If any insert fails, none persist — no orphan records
    await db.batch([
      // 1. Create user (not anonymous)
      db
        .prepare(
          `INSERT INTO users (id, is_anonymous, workbook_complete, created_at, updated_at)
           VALUES (?, 0, 0, ?, ?)`
        )
        .bind(userId, now, now),

      // 2. Create auth record
      db
        .prepare(
          `INSERT INTO auth (id, user_id, type, password_hash, wrapped_data_key, created_at, updated_at)
           VALUES (?, ?, 'password', ?, ?, ?, ?)`
        )
        .bind(authId, userId, passwordHash, storedKey, now, now),

      // 3. Create email record
      db
        .prepare(
          `INSERT INTO emails (id, user_id, email, is_active, added_at)
           VALUES (?, ?, ?, 1, ?)`
        )
        .bind(emailId, userId, normalizedEmail, now),

      // 4. Create session
      db
        .prepare(
          `INSERT INTO sessions (id, user_id, created_at, last_seen_at)
           VALUES (?, ?, ?, ?)`
        )
        .bind(sessionId, userId, now, now),

      // 5. Create default settings
      db
        .prepare(
          `INSERT INTO user_settings (user_id, background_color, text_color, font, created_at, updated_at)
           VALUES (?, 'ivory', 'charcoal', 'inter', ?, ?)`
        )
        .bind(userId, now, now),

      // 6. Create user_profile row (name is collected during onboarding)
      db
        .prepare(
          `INSERT INTO user_profile (user_id, display_name, created_at, updated_at)
           VALUES (?, NULL, ?, ?)`
        )
        .bind(userId, now, now),

      // 7. Create user_values row
      db
        .prepare(
          `INSERT INTO user_values (user_id, created_at, updated_at)
           VALUES (?, ?, ?)`
        )
        .bind(userId, now, now),
    ]);

    // Clear rate limit on successful signup
    await clearRateLimit(db, normalizedEmail, 'signup');

    // Store data key in session for PII encryption (IMP-048)
    await storeDataKeyInSession(db, sessionId, dataKey);

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
