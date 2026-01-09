# Sprint 1 Verification Plans

**QA Owner**: Pazz
**Created**: 2026-01-09

---

## Queue Overview

| Issue | Owner | Status | Priority |
|-------|-------|--------|----------|
| BUG-009 | Fizz | **`done`** | VERIFIED 2026-01-09 |
| BUG-008 | Fizz | **`done`** | VERIFIED 2026-01-09 |
| BUG-011 | Fizz | **`done`** | VERIFIED 2026-01-09 |
| BUG-010 | Buzz | `invalid` | Content in DB, may need frontend check |
| IMP-045/046 | Buzz | RESOLVED | Tables created |
| IMP-037/038 | Buzz | **RESOLVED** | VERIFIED 2026-01-09 |
| IMP-039 | Buzz | **RESOLVED** | VERIFIED 2026-01-09 |

---

## BUG-009: Ink Permanence (Multiple blocks typing)

**Status**: `done` - VERIFIED by Pazz (2026-01-09)

### Acceptance Criteria
- [ ] Only new blocks animate on submission
- [ ] Previous blocks remain static
- [ ] Animation tracking persists correctly
- [ ] Build passes

### Verification Steps

1. **Fresh user test**:
   ```
   1. Create new account
   2. Complete onboarding
   3. Navigate to workbook (1.1.1)
   4. Submit first response
   5. VERIFY: Only next block animates, previous stays static
   6. Submit second response
   7. VERIFY: Only newest block animates
   ```

2. **Returning user test**:
   ```
   1. Login with existing account (has progress)
   2. Navigate to workbook
   3. VERIFY: All previous content static (no animation)
   4. Continue where left off
   5. VERIFY: Only new block animates
   ```

3. **Rapid submission test**:
   ```
   1. Type response quickly
   2. Hit Enter before animation completes
   3. VERIFY: No re-animation of previous blocks
   ```

### Code Review Points
- `WorkbookView.tsx:173-194` - Check useEffect marks previous blocks
- `animatedMessageIds` Set properly tracks animated blocks
- `onMessageAnimated` callback updates set

---

## BUG-010: Roots Overview Content Missing

**Status**: `invalid` per BUGS.md - Content IS in DB

### Investigation Required

1. **Database verification** (already done by Buzz):
   ```sql
   SELECT content FROM content_blocks WHERE id = 100001;
   -- Should return 4 overview paragraphs
   ```

2. **Frontend rendering check**:
   ```
   1. Navigate to /workbook/1.0.0 (Roots overview)
   2. VERIFY: See "The first part of the tree is the roots..."
   3. VERIFY: See all 4 overview paragraphs
   4. VERIFY: NO Table of Contents text
   ```

3. **Cache check**:
   ```
   1. Hard refresh (Ctrl+Shift+R)
   2. Clear browser cache
   3. Check different browser
   4. Check incognito mode
   ```

### If Content Missing in Browser
- Check if workbook page is fetching correct exercise
- Check if content_blocks query includes id 100001
- Check if rendering logic handles 'instruction' type

---

## IMP-045/046: Missing Tables (RESOLVED)

**Status**: Migration applied, tables created

### Verification Steps

1. **Database verification**:
   ```sql
   -- Verify tables exist
   SELECT name FROM sqlite_master
   WHERE type='table' AND name IN ('user_failure_reframes', 'user_milestones');

   -- Verify columns
   PRAGMA table_info(user_failure_reframes);
   PRAGMA table_info(user_milestones);
   ```

2. **Tool functionality test**:
   ```
   Failure Reframer (tool 100009):
   1. Navigate to exercise containing Failure Reframer
   2. Fill out form fields
   3. Save
   4. VERIFY: Data persists on page reload

   Career Timeline (tool 100012):
   1. Navigate to exercise containing Career Timeline
   2. Add milestones
   3. Save
   4. VERIFY: Data persists on page reload
   ```

3. **Cascade delete test**:
   ```
   1. Create user and add data to both tools
   2. Delete account
   3. VERIFY: user_failure_reframes rows deleted
   4. VERIFY: user_milestones rows deleted
   ```

---

## IMP-037/038: SQL Injection Fix

**Status**: Pending (after BUG-010)

### Pre-fix Baseline (Current State)
```
Security tests show:
- SQL injection attempts return 500 (reaching DB)
- IMP-037: fetchExperiences uses string interpolation
- IMP-038: fetchUserLists uses string interpolation
```

### Post-fix Verification

1. **Code review**:
   ```typescript
   // BEFORE (vulnerable):
   query += ` AND experience_type = '${type}'`

   // AFTER (secure):
   query += ` AND experience_type = ?`
   // With: .bind(userId, type)
   ```

2. **Security test suite**:
   ```bash
   cd QA && npm run test:api
   ```
   Expected: All SQL injection tests PASS (no 500 errors)

3. **Manual injection test**:
   ```
   1. Use browser dev tools
   2. Try to inject via API (if possible)
   3. VERIFY: Returns 400, not 500
   ```

4. **Functional test**:
   ```
   1. Verify fetchExperiences still works
   2. Verify fetchUserLists still works
   3. Data flows correctly through ConnectionResolver
   ```

---

## IMP-039: Rate Limiting

**Status**: Pending (after SQL fixes)

### Pre-fix Baseline (Current State)
```
Security tests confirm:
- 10 rapid login attempts all return 401
- No 429 rate limit responses
- Unlimited password guesses possible
```

### Post-fix Verification

1. **Rate limit test**:
   ```
   1. Attempt 6 logins with wrong password (same email)
   2. VERIFY: First 5 return 401
   3. VERIFY: 6th returns 429 Too Many Requests
   4. VERIFY: Response includes retry-after header
   ```

2. **Timeout test**:
   ```
   1. Get rate limited (429)
   2. Wait 15 minutes
   3. VERIFY: Can attempt again
   ```

3. **Different email test**:
   ```
   1. Get rate limited on email A
   2. Try email B
   3. VERIFY: Email B not affected by A's limit
   ```

4. **Security test suite**:
   ```bash
   cd QA && npm run test:api
   ```
   Expected: Brute force test expects 429 after threshold

### Implementation Check
- [ ] Rate limit on /api/auth/login
- [ ] Rate limit on /api/auth/signup
- [ ] Appropriate thresholds (5 attempts/15 min recommended)
- [ ] Clear error message to user

---

## Test Commands Reference

```bash
# Unit tests (main app)
cd dreamtree && npm run test:run

# API tests (requires running server)
cd QA && npm run test:api

# E2E tests
cd QA && npm run test:e2e

# Security tests specifically
cd QA && npm run test:api -- api/security.test.ts

# Full suite
cd QA && npm run test:all
```

---

## BUG-011: Click-to-skip advances instead of completing

**Status**: `in-progress` - Awaiting review

### Problem
When user clicks to skip typing animation:
- Current: Advances to next block, two blocks type simultaneously
- Expected: First click completes current block, THEN next block starts

### Acceptance Criteria
- [ ] Click during typing completes current block instantly
- [ ] Next block only starts after current is fully displayed
- [ ] No simultaneous typing of multiple blocks
- [ ] Works for both content blocks and prompts
- [ ] Build passes

### Verification Steps

1. **Basic click-to-skip test**:
   ```
   1. Navigate to workbook exercise with content block
   2. While text is typing, click on the content area
   3. VERIFY: Current block text appears instantly (animation completes)
   4. VERIFY: No second block starts typing yet
   5. Click again or wait
   6. VERIFY: THEN next block starts typing
   ```

2. **Rapid click test**:
   ```
   1. Start on a content block that's typing
   2. Click rapidly 3 times
   3. VERIFY: Each click completes one block
   4. VERIFY: Never two blocks typing at once
   ```

3. **Prompt block test**:
   ```
   1. Navigate to exercise with prompt blocks
   2. Click to skip while prompt is typing
   3. VERIFY: Prompt text completes
   4. VERIFY: Input field appears after animation
   ```

### Code Review Points
- Check click handler in WorkbookView or ConversationThread
- Animation state should be checked before advancing
- TypingEffect should expose completion callback/method
- MessageContent may need to handle skip state

### Files Likely Involved
- `src/components/workbook/WorkbookView.tsx`
- `src/components/conversation/MessageContent.tsx`
- `src/components/conversation/TypingEffect.tsx`

---

## Sign-off Template

```markdown
### [ISSUE-ID] Verification Complete

**Tested by**: Pazz
**Date**: YYYY-MM-DD
**Result**: PASS / FAIL

**Tests Performed**:
- [ ] Acceptance criteria 1
- [ ] Acceptance criteria 2
- [ ] Build passes
- [ ] No regressions

**Notes**:
[Any observations or concerns]

**Verdict**: Move to `done` / Return to `in-progress`
```
