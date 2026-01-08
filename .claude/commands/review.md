---
description: Review recent changes against specs and best practices
allowed-tools: Bash(git:*), Read, Glob, Grep
---

# Code Review Workflow

Review recent changes for quality, spec adherence, and potential issues.

## Steps

1. **Get Recent Changes**
   ```bash
   git diff HEAD~1
   ```
   Or if argument provided, diff against that: `git diff $ARGUMENTS`

2. **Check Spec Adherence**
   For each changed file, verify against relevant specs in `/planning/`:
   - Component changes → `DreamTree_Component_Spec.md`
   - Styling changes → `DreamTree_Design_System.md`
   - Data/schema changes → `DreamTree_Data_Architecture_v4.md`

3. **Review Checklist**
   - [ ] Follows existing patterns in the codebase
   - [ ] No hardcoded values that should be CSS variables
   - [ ] Proper TypeScript types (no `any`)
   - [ ] Error handling present where needed
   - [ ] No console.log statements left in
   - [ ] Accessibility considered (aria labels, keyboard nav)

4. **Security Check**
   - No secrets/credentials in code
   - No SQL injection vulnerabilities
   - No XSS vulnerabilities
   - Proper input validation

## Output

Provide a structured review with:
- **Issues**: Problems that should be fixed
- **Suggestions**: Improvements that could be made
- **Compliments**: Things done well
