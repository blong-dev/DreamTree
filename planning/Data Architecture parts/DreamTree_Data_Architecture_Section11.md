# DreamTree Data Architecture — Section 11: User/Auth Model & Encryption

## Overview

This document captures decisions made for DreamTree's user authentication system and encryption approach. These decisions scope the MVP to email/password authentication, with passkey and wallet auth noted for future consideration.

---

## 1. User States & Transitions

### 1.1 User Lifecycle States

| State | Description |
|-------|-------------|
| **Anonymous** | New visitor with cookie-based ID. Data stored in D1 tied to cookie. |
| **Claimed** | User has created an account (email/password). Anonymous ID migrated to account. |
| **Returning (same device)** | Cookie still valid. Seamless continuation. |
| **Returning (new device)** | Logs in. System loads account data from server. |
| **Returning (no server data)** | Logs in but server has no data. Prompted for JSON restore or fresh start. |

### 1.2 State Transitions

```
[New Visitor]
      │
      ▼
[Anonymous] ──── cookie-based ID, data in D1
      │
      │ claims account (email/password)
      ▼
[Claimed] ──── auth linked, data migrated
      │
      ├── same device return ──► seamless (cookie valid)
      │
      └── new device return ──► login ──► load account data
                                    │
                                    └── no data found ──► JSON restore or fresh start
```

---

## 2. Merge Logic

### 2.1 Core Principle

**Any merge scenario becomes a replace choice at the module level. Newer `last_modified_at` timestamp wins.**

This applies consistently to:
- JSON restore
- Anonymous session claiming an existing account
- Any future multi-device sync scenarios

### 2.2 Merge Rules

**Module-level data (exercise responses, classed tool instances):**
- Compare `last_modified_at` timestamps per module
- Newer version wins, older is discarded
- No per-exercise granularity for merge decisions

**Standalone tool instances (user-created, not tied to modules):**
- Additive merge — both datasets combine
- Hash-based deduplication prevents exact duplicates
- If hashes match, skip the duplicate; otherwise keep both

### 2.3 User Messaging

When merge is triggered:

> "Your work will be combined based on when each section was last updated. Whichever version is newer wins—whether that's from this session or your saved account."

No per-module confirmation UI. Simple rule, clearly communicated.

---

## 3. Timestamps

### 3.1 Collected Timestamps

| Level | Field | Purpose |
|-------|-------|---------|
| **Exercise** | `responded_at` | When user answered/last edited. Analytics, insights. |
| **Module** | `first_completed_at` | When module was first finished. Never changes. Analytics. |
| **Module** | `last_modified_at` | Updates on any exercise edit. **Drives merge logic.** |
| **Standalone Tool Instance** | `created_at` | When user created the instance. |

### 3.2 Completion Definition

A module is "completed" when all required exercises have responses. There is no explicit "done" button — the conversation flow is seamless and continuous with autosave after each exercise.

- `first_completed_at` is set when the final required exercise receives its first response
- `last_modified_at` updates whenever any exercise in that module is edited (including post-completion edits)

---

## 4. Authentication (MVP)

### 4.1 Scope

**MVP: Email/password only.**

Passkey and wallet authentication are deferred to post-MVP. The challenge of deriving encryption keys from non-password auth methods requires further design work.

### 4.2 Email Storage

Per earlier spec decisions:
- Store all emails ever associated with an account
- Only one email is "active" at any time
- Email changes don't affect encryption

### 4.3 Password Storage

- Password hashed using bcrypt (or Argon2)
- Never stored in plaintext
- Password is input to key derivation, not stored for that purpose

---

## 5. Encryption Model

### 5.1 Architecture Overview

```
[Password] 
     │
     ▼ (PBKDF2 or Argon2)
[Wrapping Key] ◄── derived from password, never stored
     │
     ▼ (encrypt/decrypt)
[Wrapped Data Key] ◄── stored in user record
     │
     ▼ (unwrap)
[Data Key] ◄── random, generated at account creation, encrypts PII
     │
     ▼
[Encrypted PII Fields]
```

### 5.2 Key Management

**Account creation:**
1. Generate random data key
2. Derive wrapping key from password (PBKDF2/Argon2)
3. Encrypt (wrap) the data key with the wrapping key
4. Store wrapped data key in user record
5. Data key used to encrypt PII fields

**Login:**
1. User enters password
2. Derive wrapping key from password
3. Decrypt (unwrap) the data key
4. Hold data key in session for PII operations

**Password change:**
1. Derive old wrapping key from old password
2. Unwrap data key
3. Derive new wrapping key from new password
4. Re-wrap data key with new wrapping key
5. Store new wrapped data key
6. PII remains encrypted with same data key — no re-encryption needed

**Email change:**
- No encryption implications
- Update email record only

### 5.3 Password Recovery

Password recovery (via email reset link) has **limited scope**:

1. User requests reset, receives email link
2. User sets new password
3. New wrapping key derived from new password
4. **Old wrapped data key cannot be decrypted** (old wrapping key unknown)
5. PII fields become permanently unrecoverable
6. All non-PII data (module progress, tool instances, etc.) remains intact

**User messaging:**

> "Your encrypted personal data (financial info, contact details, and private reflections) cannot be recovered without your original password. All other progress has been preserved."

This is an intentional tradeoff: true privacy means even DreamTree cannot access encrypted data.

---

## 6. What Gets Encrypted

### 6.1 PII Fields (User-Key Encrypted)

These fields are encrypted with the user's data key:

| Location | Content |
|----------|---------|
| **Module 1.4 "Love"** | Deeply personal reflections |
| **Budget Calculator** | Income, expenses, financial numbers |
| **Networking Prep Tool** | Names, contact info, relationship notes about real people |
| **Settings/Profile** | Address, geographic data |

### 6.2 Encryption Approach

**Encrypted fields in place** — PII fields are encrypted within their logical tables, not extracted to a separate blob.

Benefits:
- Table structure remains clean and logical
- Queries stay simple
- Only decrypt fields when needed
- Rarely-accessed PII doesn't add overhead to common operations

### 6.3 Encrypted Field Format

Each encrypted field stores a JSON envelope:

```json
{
  "v": 1,
  "iv": "base64-encoded-initialization-vector",
  "ciphertext": "base64-encoded-encrypted-content"
}
```

| Field | Purpose |
|-------|---------|
| `v` | Version number. Allows encryption algorithm rotation without blind migration. |
| `iv` | Initialization vector for this specific encryption. Required for decryption. |
| `ciphertext` | The actual encrypted content. |

Column type: TEXT (JSON string)

---

## 7. Future Considerations

### 7.1 Passkey & Wallet Auth (Post-MVP)

The core challenge: passkeys and wallets are **authentication** mechanisms but don't naturally provide **encryption** material.

Options explored:
- **Separate encryption password** — all users set one regardless of auth method
- **Signed challenge derivation** — works for wallets (deterministic signatures), not passkeys
- **Device-bound key with escrow** — passkeys can't encrypt, only sign
- **Accept different security guarantees** — transparency about tradeoffs

Decision deferred. May require "encryption password" approach for consistency, or accept that passkey/wallet users get server-managed encryption with clear disclosure.

### 7.2 Roadmap Note

> **Auth Flexibility (Post-MVP):** Revisit passkey and wallet authentication once core product is stable. Requires solving encryption key derivation for non-password auth methods. Consider user research on privacy expectations for different auth types.

---

## 8. Summary

| Aspect | Decision |
|--------|----------|
| **MVP Auth** | Email/password only |
| **Anonymous → Claimed** | Cookie ID links to account, data migrates |
| **Merge Logic** | Module-level, newer `last_modified_at` wins |
| **Standalone Tools** | Additive merge with hash dedup |
| **Encryption Keys** | Random data key, wrapped with password-derived key |
| **Password Change** | Re-wrap data key, no PII re-encryption |
| **Password Recovery** | Account recoverable, PII lost |
| **PII Scope** | Love content, budget, networking PII, geo data |
| **Encrypted Field Format** | JSON envelope with version, IV, ciphertext |
| **Field Location** | Encrypted in place within logical tables |
