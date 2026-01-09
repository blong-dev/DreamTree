# Marketing Area

**Owner:** Rizz

---

## Overview

The marketing area covers all user-facing copy and communication strategy. This includes landing pages, in-app microcopy, email templates, and campaign materials.

**Philosophy first:** All marketing work must align with `team/private/PHILOSOPHY.md`.

---

## Voice Guide

This is the foundation for all DreamTree copy. Before writing anything, absorb these principles.

### Positioning Statement

**DreamTree is a trusted companion for career transitions.**

It's the experience of sitting with a thoughtful coach who asks good questions, listens to your answers, and helps you see patterns you couldn't see alone.

**DreamTree IS:**
- A guided workbook you text through
- A space to go deep at your own pace
- A tool that remembers and weaves your story back
- Data you own and control

**DreamTree IS NOT:**
- A career quiz or personality test
- A job board or resume optimizer
- A gamified app with points and streaks
- A system that harvests your data for ads

**Positioning Anchor:** *Depth Over Speed*

Other tools rush you. DreamTree lets you go deep.

---

### Audience Profile: The Career Transitioner

Our primary audience is people actively changing careers or returning to work after a break.

**Who they are:**
- Mid-career professionals pivoting to something new
- Parents returning to work after time away
- People laid off, reevaluating what's next
- Anyone at a crossroads, feeling stuck or unclear

**Their fears:**
- "I don't know what I'm good at anymore"
- "My experience doesn't translate"
- "I'm too old / too late / too behind"
- "Every career quiz gives me generic results"

**Their hopes:**
- Clarity about their skills and strengths
- A story they can tell confidently
- A direction that feels authentically theirs
- Guidance that respects their intelligence

**What they're NOT looking for:**
- Quick fixes ("Find your dream job in 5 minutes!")
- Gamification and badges
- Algorithmic job matching
- Generic advice they've heard a hundred times

**Language they use:**
- "I'm figuring things out"
- "I need to rediscover what I'm good at"
- "I want to be intentional about my next move"
- "I don't want to just settle"

---

### Voice Principles

How DreamTree sounds across all copy.

#### 1. Warm but not saccharine
We're a coach, not a cheerleader. We care deeply but we don't gush. No "You're amazing!" at every turn.

**Yes:** "That's a meaningful insight."
**No:** "OMG you're doing AMAZING! Keep it up superstar!"

#### 2. Unhurried
No urgency tactics. No pressure. The user sets the pace. This is a space to breathe and think.

**Yes:** "Take your time. There's no deadline here."
**No:** "Limited time offer!" or "Don't fall behind!"

#### 3. Clear over clever
Substance beats wordplay. Say what you mean. Clever copy that confuses is worse than plain copy that works.

**Yes:** "We don't sell your data. Ever."
**No:** "Your data stays in your digital fortress of solitude!" (trying too hard)

#### 4. Respectful of intelligence
Our users are thoughtful adults making important decisions. We don't dumb things down or over-explain.

**Yes:** "Your answers become the material for your story."
**No:** "Just answer some simple questions and we'll magically figure out your life for you!"

#### 5. Human, not corporate
First person. Active voice. "We" and "you" — not "users" or "one."

**Yes:** "We'll remember what you said and bring it back when it matters."
**No:** "User inputs are stored and utilized for enhanced personalization."

#### 6. Honest about what we are
We're a workbook, not an oracle. We guide, we don't prescribe. The user does the real work.

**Yes:** "DreamTree helps you see patterns — you decide what they mean."
**No:** "Our AI will tell you exactly what career is perfect for you."

#### 7. Quietly confident
We believe in what we've built, but we don't shout. Let the experience speak.

**Yes:** "A different kind of career tool."
**No:** "THE ULTIMATE CAREER TRANSFORMATION PLATFORM!"

---

### Tone Spectrum

Voice stays consistent; tone shifts by context.

| Context | Tone | Example |
|---------|------|---------|
| **Landing page** | Confident, inviting | "A space to go deep." |
| **Onboarding** | Warm, welcoming | "No rush. We'll figure this out together." |
| **In-app prompts** | Curious, coaching | "What made that moment feel meaningful?" |
| **Empty states** | Encouraging, light | "Nothing here yet. That's about to change." |
| **Error messages** | Calm, helpful | "Something went wrong. Let's try that again." |
| **Success moments** | Understated, warm | "Saved. Your progress is safe." |
| **Data/privacy** | Direct, trustworthy | "Your data is encrypted. Only you can read it." |

---

### Do's and Don'ts

| DO | DON'T |
|----|-------|
| "Take your time" | "Act now!" |
| "Your data stays yours" | "We value your privacy" (empty phrase) |
| "Let's figure this out together" | "Our AI will find your dream job" |
| "A space to reflect" | "Unlock your potential!" |
| "No pressure, no deadlines" | "Complete by Friday to stay on track!" |
| "You're in control" | "Let us handle everything" |
| "What matters to you?" | "What matters most to top performers?" |

---

### Word Bank

#### Words We Use
- Guide, companion, journey
- Discover, uncover, reflect
- At your pace, unhurried, when you're ready
- Yours, your data, your story
- Clarity, insight, patterns
- Conversation, dialogue, thoughtful
- Space, room, breathing room

#### Words We Avoid
- Quiz, test, assessment, score
- Optimize, hack, crush it, level up
- Limited time, don't miss out, exclusive
- Our platform, our technology, our AI
- Unlock potential, maximize value
- Hustle, grind, crush your goals
- Users (say "you" or "people")

---

### Example Copy

#### Good Examples

**Landing page hero:**
> "Career transitions are hard. DreamTree gives you space to think — a guided workbook experience that helps you discover your skills, tell your story, and design what's next."

**Onboarding welcome:**
> "Welcome. This is a space for reflection, not a race. We'll ask questions, you'll answer them, and together we'll uncover patterns you might not have seen. Take your time."

**Empty state (no saved stories):**
> "No stories yet. When you're ready, we'll help you find them."

**Error message:**
> "Something didn't work. Don't worry — your progress is saved. Try again?"

**Data sovereignty:**
> "Your answers are encrypted with a key only you control. We can't read them. That's the point."

#### Bad Examples (What to Avoid)

**Too corporate:**
> "DreamTree is a next-generation career optimization platform leveraging AI-powered insights to maximize your professional potential."

**Too urgent:**
> "Start NOW before it's too late! Your dream career won't wait!"

**Too casual/saccharine:**
> "OMG you're gonna LOVE this journey! Let's gooooo!"

**Overpromising:**
> "Find your perfect career in just 10 minutes with our revolutionary AI!"

**Generic:**
> "Welcome to DreamTree. Please complete your profile to continue."

---

## Files

```
marketing/                     ← Reusable toolkit (future spin-off)
├── README.md

src/components/               ← Copy lives in components
├── landing/                  ← Landing page components
└── (various)                 ← Buttons, empty states, errors

team/
├── RIZZ.md                   ← Role definition
├── private/PHILOSOPHY.md     ← Source of truth for voice
└── areas/marketing.md        ← This file
```

---

## Copy Locations

| Copy Type | Location |
|-----------|----------|
| Landing page | `src/components/landing/LandingPage.tsx` |
| Button labels | Individual component files |
| Empty states | `EmptyState.tsx` and component-level |
| Error messages | API routes, ErrorBoundary |
| Onboarding | `OnboardingFlow.tsx` |
| Dashboard greetings | `DashboardGreeting.tsx` |

---

## Workflow

### Copy Change Process

1. **Identify** — Find copy that needs improvement
2. **Draft** — Write new copy aligned with Voice Guide
3. **Propose** — Post to BOARD.md with before/after
4. **Approval** — Queen Bee reviews
5. **Implement** — Update the relevant files
6. **Verify** — Check in browser, verify build passes

### Campaign Process

1. **Strategy** — Define goals, audience, message
2. **Draft** — Create all campaign materials
3. **Review** — Queen Bee approval
4. **Launch** — Execute campaign
5. **Analyze** — Measure results via analytics

---

## Patterns

### Copy as Code

Copy lives in component files, not a CMS. This means:
- Changes are version-controlled
- Copy is type-safe (TypeScript)
- No external dependencies

**Future:** The marketing toolkit may introduce a copy management system.

### Voice Consistency

All copy should:
- Sound conversational, not corporate
- Respect user autonomy (no pressure tactics)
- Be concise and clear
- Align with the four pillars (see `CLAUDE.md`)

---

## Testing

### Before Merging Copy Changes

1. **Build passes:** `npm run build`
2. **Visual check:** View in browser at all breakpoints
3. **Voice check:** Does it sound like us?
4. **Soul check:** Does it serve the pillars?

---

## Dependencies

| Area | Dependency |
|------|------------|
| Fizz | Builds components that contain copy |
| Buzz | Builds analytics to measure copy effectiveness |
| Buzz | Builds email infrastructure |
| Queen Bee | Approves all copy changes |

---

## Learnings

*Add insights about what works as you discover them.*

### Voice
- "Depth Over Speed" is our positioning anchor
- Career Transitioners respond to unhurried, respectful copy
- Data sovereignty messaging builds trust when stated simply

### What Doesn't Work
- Urgency tactics feel out of place
- Generic "unlock your potential" language
- Overpromising what the tool does

### A/B Test Results
- [Results from copy experiments — add as data comes in]
