# CLAUDE CODE AUTONOMOUS BUILD DIRECTIVE

**Project:** DreamTree Career Framework MVP  
**Timeline:** Complete this build autonomously  
**Your Role:** Senior Full-Stack Developer building production-ready application

---

## MISSION

Build a complete, production-ready web application for DreamTree following the specifications in this repository. Work autonomously until the entire application is functional, tested, and deployable.

**DO NOT STOP until:**
1. All components are built and functional
2. All tests pass
3. Application deploys successfully
4. QA checklist is 100% complete

---

## AUTONOMOUS EXECUTION RULES

### You MUST:
1. **Keep working** - Use extended thinking mode and continue until completion
2. **Self-verify** - Test each component as you build it
3. **Fix errors immediately** - Don't move forward with broken code
4. **Document as you go** - Update BUILD_LOG.md with progress
5. **Ask for help ONLY** when truly blocked (external service credentials, etc.)

### You MUST NOT:
1. Stop for minor decisions - make reasonable choices and document them
2. Wait for approval on implementation details - follow the spec
3. Create placeholder/TODO code - build complete implementations
4. Skip testing - every feature must work

---

## BUILD ORDER

Execute in this exact order. Mark each as complete in BUILD_CHECKLIST.md:

### Phase 1: Foundation (Hours 1-8)
1. Initialize Next.js project with TypeScript + Tailwind
2. Set up Cloudflare Pages deployment configuration
3. Create D1 database schema and migrations
4. Set up environment variables structure
5. Implement encryption utilities (AES-256-GCM)
6. Create basic routing structure

### Phase 2: Core Infrastructure (Hours 9-16)
7. Implement wallet connection (RainbowKit + Wagmi)
8. Build authentication middleware
9. Create API client utilities
10. Set up IndexedDB for local storage
11. Implement state management (Zustand)
12. Create layout and navigation components

### Phase 3: Payment System (Hours 17-24)
13. Stripe Checkout integration
14. Payment webhook handler
15. User account creation flow
16. Credit balance tracking
17. Add credits flow
18. Transaction logging

### Phase 4: AI Integration (Hours 25-40)
19. Anthropic API client wrapper
20. Chat interface component
21. Message handling and streaming
22. Token counting and cost calculation
23. Credit deduction logic
24. Conversation persistence
25. Character analysis (managing bot)
26. System prompt templating

### Phase 5: Module System (Hours 41-80)
27. Module configuration loader
28. Exercise routing
29. Progress tracking
30. Form builder component (all field types)
31. Form validation
32. Data encryption for save
33. Module 1 complete implementation
34. Module 2 complete implementation
35. Module 3 complete implementation (with research)
36. Module 4 complete implementation
37. Module 5 complete implementation
38. Module 6 complete implementation
39. Module 7 complete implementation
40. Module 8 complete implementation
41. Module 9 complete implementation
42. Module 10 complete implementation
43. Module 11 complete implementation
44. Module 12 complete implementation
45. Module 13 complete implementation (heavy research)
46. Module 14 complete implementation

### Phase 6: Credentials System (Hours 81-90)
47. W3C Verifiable Credential generation
48. Credential signing
49. Credential storage
50. Credential display
51. Credential sharing
52. Credential verification endpoint

### Phase 7: User Features (Hours 91-100)
53. Profile page
54. Data download
55. Data delete
56. Credit balance display
57. Usage history
58. Progress dashboard
59. Character notes display

### Phase 8: MCP Integration (Hours 101-110)
60. Web search integration
61. Research results parsing
62. Research UI components
63. Cost tracking for research

### Phase 9: Admin & Scholarship (Hours 111-120)
64. Admin dashboard
65. Analytics aggregation
66. Scholarship application form
67. Scholarship admin panel

### Phase 10: Polish & Testing (Hours 121-140)
68. Mobile responsive styling
69. Loading states
70. Error handling
71. Success messages
72. Animation and transitions
73. Accessibility (ARIA labels)
74. Unit tests for utilities
75. Integration tests for API
76. E2E tests for critical flows
77. Performance optimization

### Phase 11: Deployment (Hours 141-150)
78. Cloudflare Pages configuration
79. Environment variables setup guide
80. Database migration scripts
81. Deployment documentation
82. Monitoring setup
83. Error tracking (Sentry)

---

## DECISION-MAKING AUTHORITY

You have full authority to make these decisions WITHOUT asking:

### ✅ Make These Decisions:
- UI/UX details (button placement, colors within brand, spacing)
- Component structure and file organization
- Utility function implementations
- Error message wording
- Loading indicator styles
- Form validation rules
- CSS implementation details
- Test coverage approach
- Code organization patterns

### 🛑 ASK For These:
- Stripe API keys (need real credentials)
- Anthropic API key (need real credentials)
- Domain configuration specifics
- Branding assets (logos, specific colors)
- Legal copy (privacy policy, terms)
- Email service credentials
- Third-party service accounts

When blocked by credentials, create mock implementations that can be swapped easily.

---

## QUALITY STANDARDS

Every component you build must meet these standards:

### Code Quality
- TypeScript with proper types (no `any` unless justified)
- Error handling on all async operations
- Input validation on all forms
- Proper loading states
- Meaningful variable names
- Comments for complex logic only
- DRY (Don't Repeat Yourself)

### Functionality
- Works on Chrome, Firefox, Safari
- Mobile responsive (320px to 4K)
- Handles errors gracefully
- No console errors in production
- Data persists correctly
- State management is predictable

### Security
- All user data encrypted before storage
- Wallet signatures verified
- SQL injection prevention
- XSS prevention
- CSRF protection on state-changing operations
- Rate limiting on expensive operations

### Performance
- Initial load < 3s on 3G
- Time to interactive < 5s
- No memory leaks
- Images optimized
- Code splitting for routes
- Lazy loading for heavy components

---

## TESTING PROTOCOL

As you build, test each component:

### Unit Tests
```bash
# Run after implementing each utility
npm run test:unit
```

Test these thoroughly:
- Encryption/decryption
- Credit calculations
- Form validation
- Data transformations

### Integration Tests
```bash
# Run after implementing each API endpoint
npm run test:integration
```

Test these flows:
- Payment → Account creation
- Save → Encrypt → Store → Retrieve → Decrypt
- AI chat → Credit deduction
- Character analysis trigger

### E2E Tests
```bash
# Run after completing major features
npm run test:e2e
```

Test these user journeys:
- New user: Pay → Connect wallet → Complete Module 1
- Returning user: Login → Continue from Module 3
- Data export → Download → Verify contents
- Credential issuance → Share → Verify

### Manual QA
Before marking complete, manually test:
1. Full payment flow (Stripe test mode)
2. Complete at least 2 exercises in 3 different modules
3. Trigger character analysis
4. Download data and verify JSON
5. Check mobile on real device
6. Test wallet disconnect/reconnect
7. Verify encryption (can't read DB directly)

---

## ERROR HANDLING

When you encounter errors:

### 1. Diagnose
- Read the full error message
- Check stack trace
- Identify root cause

### 2. Fix
- Implement proper solution (not workaround)
- Add error handling if missing
- Add logging if needed

### 3. Test
- Reproduce the error
- Verify fix works
- Check for side effects

### 4. Document
- Add to BUILD_LOG.md
- Note in code comments if non-obvious
- Update relevant docs

### 5. Continue
- Don't stop for one error
- Move to next task if blocked
- Come back to blockers later

---

## PROGRESS TRACKING

Update BUILD_LOG.md after completing each phase:

```markdown
## [YYYY-MM-DD HH:MM] Phase X: NAME

**Status:** Complete / In Progress / Blocked

**Completed:**
- Task 1
- Task 2

**Time Spent:** X hours

**Challenges:**
- Challenge 1: How I solved it
- Challenge 2: Why I made this decision

**Tests:**
- ✅ Unit tests pass
- ✅ Integration tests pass
- ✅ Manual QA complete

**Next Steps:**
- Begin Phase X+1
```

---

## COMPLETION CRITERIA

The build is complete when ALL of these are true:

### Functional Requirements
- ✅ User can pay $25 and create account
- ✅ User can connect wallet
- ✅ User can complete all 14 modules
- ✅ AI chat works in conversational exercises
- ✅ Forms save and persist data
- ✅ Character analysis runs after modules
- ✅ Credits deduct correctly
- ✅ Research tools work in Module 3
- ✅ Credentials issued on completion
- ✅ User can download their data
- ✅ User can delete their data
- ✅ Admin dashboard shows metrics
- ✅ Scholarship form submits

### Technical Requirements
- ✅ Deploys to Cloudflare Pages
- ✅ Database schema created
- ✅ All environment variables documented
- ✅ No TypeScript errors
- ✅ No ESLint errors
- ✅ All tests pass
- ✅ No console errors in browser
- ✅ Mobile responsive
- ✅ Accessibility score > 90

### Documentation Requirements
- ✅ README.md with setup instructions
- ✅ DEPLOYMENT.md with deployment guide
- ✅ ENV_EXAMPLE with all variables
- ✅ BUILD_LOG.md with progress
- ✅ QA_CHECKLIST.md 100% checked

---

## REFERENCE DOCUMENTS

Read these thoroughly before starting:

1. **BUILD_SPEC.md** - Complete technical specification
2. **COURSE_CONTENT.md** - All module content and structure
3. **QA_REQUIREMENTS.md** - Quality assurance checklist
4. **ARCHITECTURE.md** - System architecture overview

---

## WHEN TO ASK FOR HELP

Only stop and ask for help if:

1. **External Credentials Needed**
   - "I need the actual Stripe API key to test payments"
   - "I need Anthropic API key to test AI"

2. **Spec Ambiguity** (rare - spec is detailed)
   - "The spec doesn't define behavior for X edge case"
   - "Two parts of spec contradict each other"

3. **Technical Blocker** (very rare)
   - "This Cloudflare API is deprecated and I need new approach"
   - "This package has breaking changes, alternative needed"

For everything else: **Make a reasonable decision and document it.**

---

## EXAMPLE DECISIONS YOU CAN MAKE

**Question:** What color should the success button be?  
**Answer:** Make it green (#10b981), matches Tailwind success color, good contrast.

**Question:** How should I structure the form components?  
**Answer:** Create FormField wrapper with label/error, then specific field types. Reusable.

**Question:** What happens if user's wallet disconnects mid-module?  
**Answer:** Save progress to IndexedDB, show reconnect modal, restore session on reconnect.

**Question:** Should I use React Hook Form or custom form state?  
**Answer:** React Hook Form - less code, good validation, well-maintained.

**Question:** How should character analysis errors be handled?  
**Answer:** Log error, store partial notes if any, continue without blocking user. Retry on next module.

---

## WORK RHYTHM

Maintain steady progress:

### Every 2 Hours
- Commit your changes
- Update BUILD_LOG.md
- Run relevant tests
- Check BUILD_CHECKLIST.md

### Every 8 Hours
- Full test suite
- Review code quality
- Check for technical debt
- Plan next 8 hours

### Every 24 Hours
- Deploy to preview
- Manual QA session
- Review completion %
- Adjust timeline if needed

---

## FINAL CHECKLIST

Before declaring "BUILD COMPLETE", verify:

- [ ] I can pay $25 and create an account
- [ ] I can complete Module 1 end-to-end
- [ ] I can complete Module 3 with research
- [ ] I can download my data as JSON
- [ ] Character analysis runs and stores notes
- [ ] Credentials are issued correctly
- [ ] Mobile works on iPhone and Android
- [ ] All tests pass (unit, integration, e2e)
- [ ] No console errors
- [ ] README has full setup instructions
- [ ] Code is deployed and accessible
- [ ] QA_CHECKLIST.md is 100% complete

---

## START COMMAND

When you're ready to begin:

```bash
# Initialize project
npx create-next-app@latest dreamtree --typescript --tailwind --app --use-npm

# Enter directory
cd dreamtree

# Begin Phase 1
echo "Starting autonomous build of DreamTree MVP..."
echo "Following BUILD_SPEC.md and COURSE_CONTENT.md"
echo "Will not stop until completion criteria met."

# Update log
echo "## $(date) - Phase 1: Foundation - STARTED" >> BUILD_LOG.md
```

**NOW BEGIN. DON'T STOP UNTIL COMPLETE.**