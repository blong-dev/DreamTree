---
description: Stage changes and create a well-crafted commit
allowed-tools: Bash(git:*), Read
---

# Commit Workflow

Create a commit for the current changes following team standards.

## Steps

1. Run `git status` to see all changes
2. Run `git diff` to review what will be committed
3. Run `git log --oneline -5` to see recent commit message style
4. Analyze the changes and draft a commit message that:
   - Summarizes the nature of the change (feature, fix, refactor, etc.)
   - Focuses on the "why" rather than the "what"
   - Is concise (1-2 sentences)
5. Stage relevant files with `git add`
6. Create the commit with message ending in:
   ```
   Co-Authored-By: Claude <noreply@anthropic.com>
   ```
7. Run `git status` to verify success

## Rules

- Do NOT commit files containing secrets (.env, credentials, etc.)
- Do NOT push - only commit locally
- Use conventional commit style when appropriate (feat:, fix:, refactor:, etc.)
