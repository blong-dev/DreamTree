# Auth & Security

This area owns user authentication, session management, and data encryption.

---

## Soul

**Privacy is architectural. Users trust us with their deepest self-discovery; we honor that with encryption they control.**

DreamTree asks users to explore their values, fears, career struggles, and life choices. This is intimate data. Our auth system exists to:

1. **Protect self-discovery** — Users share vulnerabilities. We encrypt their most personal reflections with keys only they control.
2. **Honor trust** — Even Braedon (the creator) cannot read user PII. This isn't a policy; it's architecture.
3. **Enable ownership** — Users can export all their data, delete everything, or restore from backup.

### What a Soul Violation Looks Like
- Storing PII in plaintext "for analytics"
- Creating admin backdoors to read user data
- Logging sensitive fields for debugging
- Making encryption optional or "premium"
- Retaining data after user requests deletion

### The Privacy Tradeoff
If a user loses their password, their encrypted PII is **permanently unrecoverable**. This is intentional. True privacy > convenience.

---

## Ownership

**Scope:**
- `src/lib/auth/` - All auth-related modules
  - `session.ts` - Session creation and retrieval
  - `password.ts` - Password hashing with bcryptjs
  - `encryption.ts` - AES-GCM encryption for PII
  - `actions.ts` - Auth action handlers
  - `index.ts` - Public exports

**Does NOT own:**
- User table schema (owned by Database)
- Login/signup UI (owned by Features)
- API route handlers (owned by Workbook)

---

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/auth/session.ts` | Session creation, validation |
| `src/lib/auth/password.ts` | bcrypt hashing with 10 salt rounds |
| `src/lib/auth/encryption.ts` | User-derived AES-GCM encryption |
| `src/lib/auth/pii.ts` | PII encryption/decryption helpers |
| `src/lib/auth/with-auth.ts` | `withAuth` middleware for API routes |
| `src/lib/auth/actions.ts` | Login, signup action handlers |
| `src/lib/auth/index.ts` | Public API exports |

---

## Principles

### 1. Required Accounts
All users must create an account to access DreamTree. This ensures:
- Data persistence across devices
- Encryption key derivation from credentials
- Clear ownership of personal data

**Roadmap**: Anonymous mode (cookie-based persistence) is planned but not yet implemented.

### 2. User-Derived Encryption
Sensitive PII fields are encrypted with keys derived from user credentials:
```
[Password] → [Wrapping Key] → unwraps → [Data Key] → encrypts → [PII Fields]
```

**What's Encrypted (PII):**
- `user_profile.display_name` — User's chosen display name
- `emails.email` — Login email (with hash for lookup)
- Module 1.4 "Love" content (deeply personal reflections)
- Budget Calculator tool data (financial)
- Company Tracker tool data (employer details)
- Contact Tracker tool data (networking contacts)

**Email Encryption Architecture:**
Emails use hash-based lookup + encryption:
- `email_hash` column stores SHA-256 of normalized email for login lookup
- `email` column stores encrypted email for privacy
- Legacy plaintext emails are auto-migrated on next login

**What's NOT Encrypted:**
- Exercise responses (needed for connections system, except PII tools above)
- Skills and competencies (surfaced across exercises)
- Progress tracking data

### 3. Session Cookies
Sessions are stored in D1 with cookie references:
- Cookie: `dt_session` (HttpOnly, Secure in prod, SameSite=Lax)
- Session ID links to user_id in sessions table
- No sensitive data in cookie itself

---

## Patterns & Conventions

### Auth Model
DreamTree uses a **required-account** auth model:
1. Users must sign up with email/password to access app
2. Signup → Onboarding → Workbook (skips dashboard)
3. Login → Dashboard (for returning users) or Onboarding (if profile incomplete)
4. Protected routes: `/workbook`, `/profile`, `/tools`, `/onboarding`
5. Public routes: `/`, `/login`, `/signup`

### Session Flow
```typescript
import { getOrCreateSession } from '@/lib/auth';

// In API route or page:
const session = await getOrCreateSession(request, env.DB);
// session.userId is always available
```

### Password Handling
```typescript
import { hashPassword, verifyPassword } from '@/lib/auth';

const hash = await hashPassword(plaintext);
const isValid = await verifyPassword(plaintext, hash);
```

### PII Encryption
User-derived keys encrypt sensitive profile fields:
```typescript
import { encryptPII, decryptPII, deriveKey } from '@/lib/auth';

const key = await deriveKey(userId, secret);
const encrypted = await encryptPII(plaintext, key);
const decrypted = await decryptPII(encrypted, key);
```

---

## Common Tasks

### Adding Auth to an API Route (Preferred)
Use `withAuth` middleware to eliminate boilerplate:
```typescript
import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';

export const GET = withAuth(async (_request, { userId, db, sessionId }) => {
  const result = await db.prepare('SELECT * FROM table WHERE user_id = ?')
    .bind(userId).all();
  return NextResponse.json(result);
});
```

### Alternative: Manual Auth Check
For routes needing custom error handling:
```typescript
import { getAuthContext } from '@/lib/auth';

export async function POST(request: Request) {
  const auth = await getAuthContext();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }
  const { userId, db, sessionId } = auth;
  // ... custom logic
}
```

### Adding Encrypted Field
1. Define field in schema with `_encrypted` suffix
2. Use `encryptPII` before storage
3. Use `decryptPII` after retrieval
4. Store IV with ciphertext
5. **Document in this file what's being encrypted and why**

---

## Testing

### Session Testing
- Verify session creation for authenticated users
- Test session persistence across requests
- Check session lookup by cookie ID

### Password Testing
- Hash same password twice - hashes should differ
- Verify correct password returns true
- Verify wrong password returns false

### Encryption Testing
- Encrypt → Decrypt round-trip
- Different users get different ciphertexts
- Invalid key fails decryption gracefully
- **Verify sensitive data is never logged**

---

## Gotchas

### Cookie Handling
- Session ID stored in `dt_session` cookie
- HttpOnly, Secure (in production), SameSite=Lax
- Cookie must be set on response, read from request

### bcrypt in Edge Runtime
- bcryptjs works in Cloudflare Workers
- Native bcrypt does NOT work
- Always use `bcryptjs` import

### Encryption Key Derivation
- Keys derived from userId + secret
- Secret must be in environment variables
- Lost secret = lost encrypted data (intentional tradeoff)

### Session Cookie in Server Components
- Use `cookies().set()` from `next/headers`
- Do NOT use `new Headers()` pattern - headers are not returned
- Cookie options: `httpOnly: true, sameSite: 'lax', secure: prod`

### Middleware Protection
- `src/middleware.ts` protects routes
- Check `dt_session` cookie for auth
- Redirect unauthenticated to `/login`

### Never Log Sensitive Data
- Do not console.log passwords, even hashed
- Do not log PII fields during debugging
- Use structured error messages without user data

---

## Dependencies

**Depends on:**
- Database (user/session storage)

**Depended by:**
- Workbook (session in API routes)
- Features (login/signup UI)

---

## Interface Contracts

### Session Functions
```typescript
import { getOrCreateSession, getSession, createSession } from '@/lib/auth';

// Returns session with userId guaranteed
const session = await getOrCreateSession(request, db);
```

### Password Functions
```typescript
import { hashPassword, verifyPassword } from '@/lib/auth';

// hashPassword returns Promise<string>
// verifyPassword returns Promise<boolean>
```

### Encryption Functions
```typescript
import { encryptPII, decryptPII, deriveKey } from '@/lib/auth';

// Returns encrypted string with embedded IV
// Decrypt expects same format
```

---

## Spec Reference
- Auth model: `/planning/DreamTree_Data_Architecture_v4.md` (Auth section)
- User table: Same file, users/auth/sessions tables
