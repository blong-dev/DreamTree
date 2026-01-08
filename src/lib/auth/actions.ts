/**
 * DreamTree Auth Actions
 *
 * Server actions for authentication operations.
 */

import { nanoid } from 'nanoid';
import type { D1Database } from '@cloudflare/workers-types';
import {
  hashPassword,
  verifyPassword,
  validatePasswordStrength,
  deriveWrappingKey,
  generateDataKey,
  wrapDataKey,
  unwrapDataKey,
  generateSalt,
  encodeSalt,
  decodeSalt,
} from './index';
import type { Auth, Email, User } from '@/types/database';

export interface ClaimAccountResult {
  success: boolean;
  error?: string;
  wrappedDataKey?: string;
}

export interface LoginResult {
  success: boolean;
  error?: string;
  userId?: string;
  sessionId?: string;
  wrappedDataKey?: string;
}

/**
 * Claim an anonymous account with email and password
 */
export async function claimAccount(
  db: D1Database,
  userId: string,
  email: string,
  password: string
): Promise<ClaimAccountResult> {
  // Validate password strength
  const passwordValidation = validatePasswordStrength(password);
  if (!passwordValidation.valid) {
    return {
      success: false,
      error: passwordValidation.errors[0],
    };
  }

  // Check if email is already taken
  const existingEmail = await db
    .prepare('SELECT id FROM emails WHERE email = ?')
    .bind(email.toLowerCase().trim())
    .first();

  if (existingEmail) {
    return {
      success: false,
      error: 'Email is already in use',
    };
  }

  // Check if user is already claimed
  const existingAuth = await db
    .prepare('SELECT id FROM auth WHERE user_id = ?')
    .bind(userId)
    .first();

  if (existingAuth) {
    return {
      success: false,
      error: 'Account is already claimed',
    };
  }

  const now = new Date().toISOString();

  // Hash password
  const passwordHash = await hashPassword(password);

  // Generate encryption keys
  const salt = generateSalt();
  const wrappingKey = await deriveWrappingKey(password, salt);
  const dataKey = await generateDataKey();
  const wrappedDataKey = await wrapDataKey(dataKey, wrappingKey);

  // Store salt with wrapped key (salt:wrappedKey)
  const storedKey = `${encodeSalt(salt)}:${wrappedDataKey}`;

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
    .bind(nanoid(), userId, email.toLowerCase().trim(), now)
    .run();

  // Update user to claimed
  await db
    .prepare('UPDATE users SET is_anonymous = 0, updated_at = ? WHERE id = ?')
    .bind(now, userId)
    .run();

  return {
    success: true,
    wrappedDataKey: storedKey,
  };
}

/**
 * Login with email and password
 */
export async function login(
  db: D1Database,
  email: string,
  password: string
): Promise<LoginResult> {
  // Find email
  const emailRecord = await db
    .prepare('SELECT * FROM emails WHERE email = ? AND is_active = 1')
    .bind(email.toLowerCase().trim())
    .first<Email>();

  if (!emailRecord) {
    return {
      success: false,
      error: 'Invalid email or password',
    };
  }

  // Find auth record
  const auth = await db
    .prepare('SELECT * FROM auth WHERE user_id = ? AND type = ?')
    .bind(emailRecord.user_id, 'password')
    .first<Auth>();

  if (!auth || !auth.password_hash) {
    return {
      success: false,
      error: 'Invalid email or password',
    };
  }

  // Verify password
  const valid = await verifyPassword(password, auth.password_hash);
  if (!valid) {
    return {
      success: false,
      error: 'Invalid email or password',
    };
  }

  // Create new session
  const sessionId = nanoid();
  const now = new Date().toISOString();

  await db
    .prepare(
      `INSERT INTO sessions (id, user_id, created_at, last_seen_at)
       VALUES (?, ?, ?, ?)`
    )
    .bind(sessionId, emailRecord.user_id, now, now)
    .run();

  return {
    success: true,
    userId: emailRecord.user_id,
    sessionId,
    wrappedDataKey: auth.wrapped_data_key || undefined,
  };
}

/**
 * Change password
 */
export async function changePassword(
  db: D1Database,
  userId: string,
  oldPassword: string,
  newPassword: string
): Promise<ClaimAccountResult> {
  // Validate new password strength
  const passwordValidation = validatePasswordStrength(newPassword);
  if (!passwordValidation.valid) {
    return {
      success: false,
      error: passwordValidation.errors[0],
    };
  }

  // Get auth record
  const auth = await db
    .prepare('SELECT * FROM auth WHERE user_id = ? AND type = ?')
    .bind(userId, 'password')
    .first<Auth>();

  if (!auth || !auth.password_hash) {
    return {
      success: false,
      error: 'No password auth found',
    };
  }

  // Verify old password
  const valid = await verifyPassword(oldPassword, auth.password_hash);
  if (!valid) {
    return {
      success: false,
      error: 'Current password is incorrect',
    };
  }

  // Parse stored key
  const [saltBase64, oldWrappedKey] = (auth.wrapped_data_key || '').split(':');
  if (!saltBase64 || !oldWrappedKey) {
    return {
      success: false,
      error: 'Invalid encryption key format',
    };
  }

  // Derive old wrapping key and unwrap data key
  const oldSalt = decodeSalt(saltBase64);
  const oldWrappingKey = await deriveWrappingKey(oldPassword, oldSalt);
  const dataKey = await unwrapDataKey(oldWrappedKey, oldWrappingKey);

  // Generate new salt and wrapping key
  const newSalt = generateSalt();
  const newWrappingKey = await deriveWrappingKey(newPassword, newSalt);

  // Re-wrap data key with new wrapping key
  const newWrappedKey = await wrapDataKey(dataKey, newWrappingKey);
  const storedKey = `${encodeSalt(newSalt)}:${newWrappedKey}`;

  // Hash new password
  const newPasswordHash = await hashPassword(newPassword);

  // Update auth record
  const now = new Date().toISOString();
  await db
    .prepare(
      'UPDATE auth SET password_hash = ?, wrapped_data_key = ?, updated_at = ? WHERE id = ?'
    )
    .bind(newPasswordHash, storedKey, now, auth.id)
    .run();

  return {
    success: true,
    wrappedDataKey: storedKey,
  };
}

/**
 * Get data key for decrypting PII (after login)
 */
export async function getDataKey(
  wrappedDataKey: string,
  password: string
): Promise<CryptoKey | null> {
  try {
    const [saltBase64, wrappedKey] = wrappedDataKey.split(':');
    if (!saltBase64 || !wrappedKey) return null;

    const salt = decodeSalt(saltBase64);
    const wrappingKey = await deriveWrappingKey(password, salt);
    return await unwrapDataKey(wrappedKey, wrappingKey);
  } catch {
    return null;
  }
}
