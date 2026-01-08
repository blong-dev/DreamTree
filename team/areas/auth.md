# Auth & Security

This area owns user authentication, session management, and data encryption.

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
- Login/signup UI (owned by Features/Onboarding)
- API route handlers (owned by Workbook)

---

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/auth/session.ts` | Session creation, validation, anonymous users |
| `src/lib/auth/password.ts` | bcrypt hashing with 10 salt rounds |
| `src/lib/auth/encryption.ts` | User-derived AES-GCM encryption |
| `src/lib/auth/actions.ts` | Login, signup, claim account actions |
| `src/lib/auth/index.ts` | Public API exports |

---

## Patterns & Conventions

### Auth Model
DreamTree uses an **anonymous-first** auth model:
1. All users start anonymous (session cookie only)
2. Users "claim" accounts by adding email/password
3. Anonymous sessions have full workbook access

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

### Adding Auth to an API Route
```typescript
import { getOrCreateSession } from '@/lib/auth';

export async function POST(request: Request, { env }) {
  const session = await getOrCreateSession(request, env.DB);
  const userId = session.userId;
  // ... use userId
}
```

### Implementing "Claim Account"
1. Verify email not already claimed
2. Hash password
3. Update user: `is_anonymous = 0`
4. Store auth record with email + hash

### Adding Encrypted Field
1. Define field in schema with `_encrypted` suffix
2. Use `encryptPII` before storage
3. Use `decryptPII` after retrieval
4. Store IV with ciphertext

---

## Testing

### Session Testing
- Verify anonymous session creation
- Test session persistence across requests
- Check session expiry (if implemented)

### Password Testing
- Hash same password twice - hashes should differ
- Verify correct password returns true
- Verify wrong password returns false

### Encryption Testing
- Encrypt → Decrypt round-trip
- Different users get different ciphertexts
- Invalid key fails decryption gracefully

---

## Gotchas

### Cookie Handling
- Session ID stored in `session` cookie
- HttpOnly, Secure (in production), SameSite=Lax
- Cookie must be set on response, read from request

### bcrypt in Edge Runtime
- bcryptjs works in Cloudflare Workers
- Native bcrypt does NOT work
- Always use `bcryptjs` import

### Encryption Key Derivation
- Keys derived from userId + secret
- Secret must be in environment variables
- Lost secret = lost encrypted data

### Anonymous User Limits
- Anonymous users can complete full workbook
- Data belongs to session, not email
- Claiming account links existing data

---

## Dependencies

**Depends on:**
- Database (user/session storage)

**Depended by:**
- Workbook (session in API routes)
- Features (onboarding claim flow)

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
