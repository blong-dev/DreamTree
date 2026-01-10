# Contributing to DreamTree

Thanks for your interest in contributing. DreamTree is a career guidance tool built on principles of user autonomy, data sovereignty, and conversational intimacy. Contributions that serve these principles are welcome.

---

## Before You Start

**Read these first:**
- `PRINCIPLES.md` — What we believe and why
- `CLAUDE.md` — Technical guidance, architecture, specs

**Understand the soul:**
DreamTree is not a quiz or a job board. It's a guided workbook experience that feels like texting with a thoughtful coach. Every contribution should serve that metaphor.

---

## Development Setup

```bash
# Clone the repo
git clone https://github.com/dreamtree-org/dreamtree.git
cd dreamtree

# Install dependencies (legacy-peer-deps required)
npm install --legacy-peer-deps

# Start development server
npm run dev
```

**Note:** The dev server starts, but most routes require a D1 database. For full local development with database access, see the Database Setup section in `CLAUDE.md`.

**Verify your setup:**
```bash
npm run build    # TypeScript must pass
npm run lint     # ESLint must pass
```

---

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Hosting:** Cloudflare Workers
- **Database:** Cloudflare D1 (SQLite)
- **Styling:** CSS custom properties (no Tailwind)

---

## What We're Looking For

**Yes:**
- Bug fixes with clear reproduction steps
- Accessibility improvements
- Performance optimizations
- Documentation improvements
- Test coverage additions

**Maybe (open an issue first):**
- New features
- UI/UX changes
- Architectural changes

**No:**
- Gamification (points, badges, streaks)
- Time pressure features (countdowns, deadlines)
- Anything that harvests user data
- Shadows in CSS (we use borders only)

---

## Pull Request Process

1. **Fork and branch** from `master`
2. **Make your changes** following the patterns in `CLAUDE.md`
3. **Test locally:**
   ```bash
   npm run build
   npm run lint
   npm test
   ```
4. **Write a clear PR description:**
   - What does this change?
   - Why is it needed?
   - How did you test it?

5. **Keep it focused** — One concern per PR

---

## Code Style

- **TypeScript** — All code is typed
- **CSS custom properties** — No hardcoded colors, spacing, or fonts
- **No shadows** — Use borders for visual separation
- **Reduced motion** — All animations must respect `prefers-reduced-motion`

**File patterns:**
- Components: `src/components/[area]/ComponentName.tsx`
- Pages: `src/app/[route]/page.tsx`
- API routes: `src/app/api/[endpoint]/route.ts`

---

## Design System

Critical values (never guess these):

| Token | Value |
|-------|-------|
| Primary accent | `#7D9471` (Sage) |
| Secondary accent | `#A0522D` (Rust) |
| Light background | `#FAF8F5` (Ivory) |
| Dark text | `#5C4033` (Brown) |

Full design system documentation is in `planning/DreamTree_Design_System.md`.

---

## Questions?

Open an issue. We'll respond.

---

*DreamTree is AGPL-3.0 licensed. By contributing, you agree that your contributions will be licensed under the same terms.*
