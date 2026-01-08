---
description: Full workflow - commit, push, and create PR
allowed-tools: Bash(git:*), Bash(gh:*), Read
---

# Complete Commit → Push → PR Workflow

Execute the full workflow from local changes to pull request.

## Steps

### Phase 1: Commit
1. Run `git status` and `git diff` to understand changes
2. Run `git log --oneline -5` to match commit style
3. Draft a clear commit message
4. Stage and commit with Co-Authored-By trailer

### Phase 2: Push
1. Ensure on a feature branch (not main/master)
2. Push with upstream tracking: `git push -u origin <branch>`

### Phase 3: Create PR
1. Use `gh pr create` with:
   - Clear title summarizing the feature/fix
   - Summary section with bullet points
   - Test plan section
2. Return the PR URL

## Rules

- Stop and warn if on main/master branch
- NEVER force push
- Include all commits in PR summary, not just the latest
