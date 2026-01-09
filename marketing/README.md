# Marketing Toolkit

Reusable marketing infrastructure. DreamTree is customer #1, but everything here is designed to work for any company.

---

## Vision

A complete marketing toolkit that handles:
- Copy management and versioning
- A/B testing framework
- Email template system
- Campaign tracking and analytics
- Brand voice enforcement

**This will eventually spin off as its own company.**

---

## Current State

The toolkit is in early stages. Currently:
- Copy lives directly in component files
- No A/B testing infrastructure
- No email sending system
- Analytics via Buzz's infrastructure

---

## Roadmap

### Phase 1: Foundation
- [ ] Copy inventory (document all current copy)
- [ ] Voice guide (from PHILOSOPHY.md)
- [ ] Copy audit checklist

### Phase 2: Infrastructure
- [ ] Copy management system (centralized strings)
- [ ] A/B testing framework
- [ ] Email template system

### Phase 3: Automation
- [ ] Brand voice linter
- [ ] Copy performance tracking
- [ ] Campaign analytics dashboard

---

## Design Principles

1. **Company-agnostic** — No DreamTree-specific assumptions
2. **Modular** — Use only what you need
3. **Simple** — Complexity kills adoption
4. **Measurable** — Everything should be trackable

---

## Structure (Planned)

```
marketing/
├── README.md           ← This file
├── copy/               ← Copy management system
│   ├── strings.ts      ← Centralized copy strings
│   └── variants.ts     ← A/B test variants
├── email/              ← Email templates
│   ├── templates/
│   └── sender.ts
├── campaigns/          ← Campaign tracking
│   └── tracker.ts
└── voice/              ← Brand voice tools
    └── linter.ts
```

---

## Usage (Future)

```typescript
// Instead of hardcoded strings:
<button>Sign Up</button>

// Use the copy system:
import { copy } from '@/marketing/copy';
<button>{copy('cta.signup')}</button>

// With A/B testing:
import { variant } from '@/marketing/copy';
<button>{variant('cta.signup', ['Sign Up', 'Get Started', 'Join Free'])}</button>
```

---

## Contributing

This toolkit serves DreamTree first, but contributions should:
1. Be company-agnostic
2. Follow the design principles
3. Include documentation
4. Be approved by Rizz (Marketing) and Queen Bee
