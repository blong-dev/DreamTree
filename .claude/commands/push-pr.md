---
description: Push current branch and create a pull request
allowed-tools: Bash(git:*), Bash(gh:*)
---

# Push and Create PR Workflow

Push the current branch and create a pull request.

## Steps

1. Check current branch with `git branch --show-current`
2. Check if branch has upstream with `git status`
3. Push to remote:
   - If no upstream: `git push -u origin <branch-name>`
   - If has upstream: `git push`
4. Create PR using `gh pr create`:
   ```bash
   gh pr create --title "Title here" --body "$(cat <<'EOF'
   ## Summary
   - Bullet points describing changes

   ## Test plan
   - [ ] Testing steps

   Generated with Claude Code
   EOF
   )"
   ```
5. Return the PR URL

## Rules

- NEVER force push to main/master
- Summarize ALL commits in the PR, not just the latest
- Include test plan in PR body
