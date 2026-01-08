---
description: Run full verification - build, lint, type-check
allowed-tools: Bash(npm:*), Bash(npx:*)
---

# Verification Workflow

Run comprehensive verification to ensure code quality.

## Steps

1. **Type Check**
   ```bash
   cd dreamtree && npx tsc --noEmit
   ```
   Report any type errors found.

2. **Lint**
   ```bash
   cd dreamtree && npm run lint
   ```
   Report any lint warnings/errors.

3. **Build**
   ```bash
   cd dreamtree && npm run build
   ```
   Ensure production build succeeds.

## On Failure

If any step fails:
1. Report the specific errors clearly
2. Suggest fixes based on the error messages
3. Do NOT proceed to next step until current step passes

## Success Criteria

All three checks must pass:
- [ ] TypeScript compilation: No errors
- [ ] ESLint: No errors (warnings acceptable)
- [ ] Build: Completes successfully
