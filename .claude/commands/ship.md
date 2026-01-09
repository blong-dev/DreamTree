---
description: Full workflow - verify, commit, push, PR, and deploy to Cloudflare
allowed-tools: Bash(git:*), Bash(gh:*), Bash(npm:*), Bash(npx:*), Read
---

# Ship It — Complete Deployment Workflow

Execute the full workflow from local changes to production deployment.

## Prerequisites

- Changes ready to commit
- On a feature branch (or will create one)
- Cloudflare credentials configured (wrangler)

## Steps

### Phase 1: Verify

Before committing, ensure code quality:

1. **Build check**
   ```bash
   cd dreamtree && npm run build
   ```
   Stop if build fails. Fix errors first.

2. Report verification status.

### Phase 2: Commit

1. Run `git status` and `git diff --stat` to understand changes
2. Run `git log --oneline -5` to match commit style
3. Stage all relevant changes
4. Commit with clear message and Co-Authored-By trailer:
   ```
   Co-Authored-By: Claude <noreply@anthropic.com>
   ```

### Phase 3: Push + PR

1. Check current branch — if on main/master, create feature branch first
2. Push with upstream tracking: `git push -u origin <branch>`
3. Create PR using `gh pr create`:
   - Clear title
   - Summary section with bullet points
   - Test plan section
   - Footer: `Generated with Claude Code`
4. Capture the PR URL

### Phase 4: Deploy

1. Deploy to Cloudflare Workers:
   ```bash
   cd dreamtree && npm run deploy
   ```

2. Verify deployment succeeded

3. Report:
   - PR URL
   - Deployment status
   - Live URL (https://dreamtree.org)

## Rules

- **Stop on any failure** — Do not proceed to next phase
- **Never force push**
- **Never skip verification**
- If on main/master, create a feature branch named `ship/<short-description>`
- If deployment fails, PR is still valid — report both statuses

## Quick Reference

```bash
# Full manual sequence if needed:
cd dreamtree
npm run build                    # Verify
git add -A && git commit         # Commit
git push -u origin <branch>      # Push
gh pr create                     # PR
npm run deploy                   # Deploy
```
