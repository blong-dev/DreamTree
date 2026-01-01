# QA Requirements - DreamTree MVP

Every item must be tested and verified before declaring build complete.

**Source Material:** All module content and exercises are based on "The Dream Tree" by Braedon Long. See `AA source material/` folder for complete course content.

---

## Critical Path Testing

### 1. New User Journey
**Scenario:** First-time user from landing to first module completion

**Steps:**
1. Visit dreamtree.org
2. Click "Start Your Journey - $25"
3. Complete Stripe checkout (test mode: 4242 4242 4242 4242)
4. Redirect to success page
5. Click "Connect Wallet"
6. Approve MetaMask connection
7. Sign message for encryption
8. Redirected to dashboard
9. See Module 1 available
10. Click "Start Module 1"
11. Complete Exercise 1.1 (conversational + form)
12. Save form data
13. Navigate back to dashboard
14. Verify progress shows "1 exercise complete"
15. Return to Module 1
16. Verify Exercise 1.1 marked complete
17. Complete Exercise 1.2
18. Continue through all 6 exercises
19. Module complete celebration appears
20. Credential issued notification
21. See Module 1 marked complete
22. Module 2 unlocked

**Expected Results:**
- ✅ Payment processes successfully
- ✅ Account created with $15 credits
- ✅ Wallet connects without errors
- ✅ AI responds within 5 seconds
- ✅ Forms save data correctly
- ✅ Progress persists across page refreshes
- ✅ Module completion triggers credential
- ✅ Next module unlocks

**Failure Conditions:**
- ❌ Payment fails or charges wrong amount
- ❌ Wallet connection errors
- ❌ AI doesn't respond or gives errors
- ❌ Form data doesn't save
- ❌ Progress lost on refresh
- ❌ Credential not issued
- ❌ Modules don't unlock

---

### 2. Returning User Journey
**Scenario:** User returns days later to continue

**Steps:**
1. Visit dreamtree.org
2. Click "Dashboard" or "Continue"
3. Connect wallet (same one as before)
4. Sign authentication message
5. Dashboard loads with previous progress
6. Credits remaining displayed correctly
7. Completed modules show green checkmarks
8. Current module highlighted
9. Click current module
10. Previous exercise data pre-loaded
11. Continue to next exercise
12. Complete and save
13. Disconnect wallet
14. Refresh page
15. Reconnect wallet
16. Verify state restored

**Expected Results:**
- ✅ Authentication works immediately
- ✅ All progress restored
- ✅ Previous data loaded correctly
- ✅ Credits balance accurate
- ✅ Can continue seamlessly
- ✅ State survives wallet disconnect

**Failure Conditions:**
- ❌ Progress lost
- ❌ Data not loaded
- ❌ Credits incorrect
- ❌ Can't continue from where left off

---

### 3. Data Ownership Journey
**Scenario:** User exercises data rights

**Steps:**
1. Navigate to Profile page
2. View "Your Data" section
3. See credit balance, modules completed, time invested
4. View character notes (transparency)
5. Click "Download Everything"
6. Confirm download
7. Sign wallet message
8. JSON file downloads
9. Open JSON in text editor
10. Verify contains all exercise responses
11. Verify contains credentials
12. Verify contains character notes
13. Go back to profile
14. Click "Delete All Data"
15. Read warning
16. Confirm deletion
17. Backup downloads automatically
18. Account deleted
19. Redirected to landing
20. Try to connect wallet again
21. No account found

**Expected Results:**
- ✅ Download contains complete data
- ✅ JSON is valid and readable
- ✅ All exercise responses present
- ✅ Delete requires confirmation
- ✅ Backup created before delete
- ✅ Account fully removed
- ✅ Cannot access deleted account

**Failure Conditions:**
- ❌ Download incomplete or corrupted
- ❌ Delete doesn't remove all data
- ❌ No backup created
- ❌ Can still access deleted account

---

## Feature-Specific Testing

### Payment System

**Test 1: Initial Purchase**
- [ ] Stripe checkout loads correctly
- [ ] Test card (4242...) processes
- [ ] Webhook receives payment confirmation
- [ ] User account created with correct credit ($15)
- [ ] Transaction logged in database
- [ ] Success page shows confirmation

**Test 2: Add Credits**
- [ ] Low balance warning appears at $3
- [ ] "Add Credits" flow opens Stripe
- [ ] $10 option adds $9 credit ($1 platform fee)
- [ ] Credit balance updates immediately
- [ ] Transaction logged

**Test 3: Refund**
- [ ] Refund processed within 7 days
- [ ] Account suspended
- [ ] User notified
- [ ] Credits revoked

**Test 4: Scholarship**
- [ ] Application form submits
- [ ] Admin can approve
- [ ] Account created with $15 credits
- [ ] Marked as scholarship in database

---

### AI Chat System

**Test 1: Basic Conversation**
- [ ] AI responds within 5 seconds
- [ ] Messages display correctly
- [ ] Conversation history maintained
- [ ] Credits deduct after each response
- [ ] Cost displayed to user
- [ ] No duplicate messages

**Test 2: Character Analysis**
- [ ] Triggers after module completion
- [ ] Takes ~$0.15 from credits
- [ ] Character notes stored
- [ ] Notes appear in next module's AI context
- [ ] AI tone adapts based on notes

**Test 3: Research Integration (Module 3)**
- [ ] AI can trigger web_search
- [ ] Research results parse correctly
- [ ] Results display in chat
- [ ] Cost tracked separately
- [ ] Multiple searches in one conversation work

**Test 4: Error Handling**
- [ ] Handles API timeout gracefully
- [ ] Handles rate limiting
- [ ] Handles invalid responses
- [ ] User can retry
- [ ] Errors don't lose conversation history

---

### Form System

**Test 1: All Field Types**
- [ ] Text input works
- [ ] Textarea expands
- [ ] Multi-select allows multiple choices
- [ ] Ranking grid drag-and-drop works
- [ ] Number input validates
- [ ] Scale slider displays value
- [ ] Date picker works

**Test 2: Validation**
- [ ] Required fields enforce completion
- [ ] Min/max length validated
- [ ] Email format validated
- [ ] Number ranges validated
- [ ] Error messages display clearly
- [ ] Can't submit invalid form

**Test 3: Data Persistence**
- [ ] Form auto-saves to IndexedDB
- [ ] Survives page refresh
- [ ] Pre-fills on return
- [ ] Encryption works (can't read raw IndexedDB)

**Test 4: AI Pre-fill**
- [ ] AI extracts data from conversation
- [ ] Form pre-fills accurately
- [ ] User can edit pre-filled data
- [ ] Final save includes edits

---

### Wallet Integration

**Test 1: Connection**
- [ ] MetaMask detected
- [ ] WalletConnect works
- [ ] Coinbase Wallet works
- [ ] Connection request appears
- [ ] User can approve/reject
- [ ] Rejection handled gracefully

**Test 2: Signatures**
- [ ] Master key signature requested
- [ ] User can approve/reject
- [ ] Signature deterministic (same each time)
- [ ] Encryption key derived correctly
- [ ] Signature cached in IndexedDB

**Test 3: Disconnection**
- [ ] User can disconnect
- [ ] State saved before disconnect
- [ ] Reconnect restores state
- [ ] Different wallet = different account
- [ ] Warning if switching wallets mid-session

---

### Credentials System

**Test 1: Issuance**
- [ ] Module completion triggers issuance
- [ ] W3C VC format correct
- [ ] Signed with DreamTree key
- [ ] Stored encrypted
- [ ] Displays in profile

**Test 2: Sharing**
- [ ] "Share" button generates link
- [ ] Link includes credential data
- [ ] Recipient can view without account
- [ ] Verification works
- [ ] Sharing logged

**Test 3: Verification**
- [ ] Verification page loads
- [ ] Signature validates
- [ ] Issuer verified
- [ ] Expiration checked
- [ ] Revocation checked
- [ ] Invalid credentials rejected

---

## Browser Compatibility

Test on:

### Desktop
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Mobile
- [ ] iOS Safari (iPhone 12+)
- [ ] Chrome Mobile (Android 10+)
- [ ] Samsung Internet

### Specific Checks Per Browser
- [ ] Wallet connection works
- [ ] Forms functional
- [ ] Chat interface works
- [ ] Layout not broken
- [ ] No console errors
- [ ] Performance acceptable

---

## Mobile Responsiveness

### Breakpoints to Test
- [ ] 320px (iPhone SE)
- [ ] 375px (iPhone 12/13)
- [ ] 390px (iPhone 14)
- [ ] 428px (iPhone 14 Pro Max)
- [ ] 768px (iPad portrait)
- [ ] 1024px (iPad landscape)
- [ ] 1440px (Desktop)
- [ ] 1920px (Large desktop)

### Elements to Verify
- [ ] Navigation collapses to hamburger
- [ ] Forms stack vertically on mobile
- [ ] Chat interface fits screen
- [ ] Buttons touch-friendly (44px minimum)
- [ ] Text readable (16px minimum)
- [ ] No horizontal scroll
- [ ] Ranking grid works on touch

---

## Performance

### Lighthouse Scores (Target: >90)
- [ ] Performance: ___ / 100
- [ ] Accessibility: ___ / 100
- [ ] Best Practices: ___ / 100
- [ ] SEO: ___ / 100

### Load Times
- [ ] Initial load < 3s on 3G
- [ ] Time to interactive < 5s
- [ ] First contentful paint < 1.5s
- [ ] Largest contentful paint < 2.5s

### Runtime Performance
- [ ] Chat messages appear instantly
- [ ] Forms submit < 1s
- [ ] Navigation transitions smooth (60fps)
- [ ] No memory leaks (check DevTools)
- [ ] No layout shifts

---

## Security

### Encryption
- [ ] User data encrypted in IndexedDB
- [ ] User data encrypted in D1
- [ ] Can't read raw database data
- [ ] Wallet signature required for decryption
- [ ] Different wallets can't decrypt each other's data

### Authentication
- [ ] All API calls require wallet signature
- [ ] Signatures expire after 5 minutes
- [ ] Can't replay signatures
- [ ] Different wallet = different account
- [ ] Admin endpoints require admin token

### Input Validation
- [ ] SQL injection prevented (parameterized queries)
- [ ] XSS prevented (React escapes by default)
- [ ] CSRF token on state changes
- [ ] File upload restrictions (if any)
- [ ] Rate limiting on expensive operations

---

## Accessibility

### Keyboard Navigation
- [ ] Can tab through all interactive elements
- [ ] Focus visible
- [ ] Enter/Space activate buttons
- [ ] Escape closes modals
- [ ] Arrow keys work in form fields

### Screen Readers
- [ ] All images have alt text
- [ ] Form labels present
- [ ] Buttons have descriptive text
- [ ] Error messages announced
- [ ] Loading states announced

### ARIA
- [ ] Proper heading hierarchy
- [ ] Landmark roles correct
- [ ] Live regions for dynamic content
- [ ] Hidden content not announced

### Color Contrast
- [ ] Text meets WCAG AA (4.5:1)
- [ ] Large text meets WCAG AA (3:1)
- [ ] Interactive elements distinguishable
- [ ] Not relying on color alone

---

## Error Scenarios

### Network Errors
- [ ] API timeout handled
- [ ] No internet connection detected
- [ ] Retry mechanism works
- [ ] User notified clearly
- [ ] Partial data saved

### User Errors
- [ ] Invalid wallet signature rejected
- [ ] Insufficient credits handled
- [ ] Invalid form data rejected with clear message
- [ ] Wrong wallet connected = warning
- [ ] Expired session detected

### System Errors
- [ ] Database unavailable handled
- [ ] Stripe API down handled
- [ ] Anthropic API down handled
- [ ] Encryption failure handled
- [ ] All errors logged

---

## Edge Cases

### Data Edge Cases
- [ ] Empty exercise responses handled
- [ ] Very long responses (>10,000 words) handled
- [ ] Special characters in responses
- [ ] Emoji in responses
- [ ] Multiple simultaneous saves
- [ ] Wallet connects mid-exercise

### Credit Edge Cases
- [ ] Balance exactly $0
- [ ] Balance goes negative (shouldn't happen)
- [ ] API call costs more than balance
- [ ] Refund while mid-module
- [ ] Multiple users on same wallet (shouldn't happen)

### Module Edge Cases
- [ ] Complete modules out of order (shouldn't be allowed)
- [ ] Return to completed module
- [ ] Edit completed exercise
- [ ] Skip required fields (shouldn't be allowed)
- [ ] Character analysis fails
- [ ] Credential issuance fails

---

## Final Checklist

Before marking QA complete:

### Functional
- [ ] New user can complete full journey
- [ ] Returning user can continue
- [ ] Data download works
- [ ] Data delete works
- [ ] All 14 modules functional
- [ ] AI chat works in every conversational exercise
- [ ] Research tools work in Module 3 & 13
- [ ] Character analysis runs and stores
- [ ] Credentials issued correctly

### Technical
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] No console errors
- [ ] All tests pass
- [ ] Lighthouse score >90
- [ ] Works on all browsers
- [ ] Mobile responsive
- [ ] Accessible

### Documentation
- [ ] README complete
- [ ] DEPLOYMENT.md complete
- [ ] ENV_EXAMPLE has all variables
- [ ] Code comments where needed
- [ ] API documented

### Deployment
- [ ] Deploys to Cloudflare Pages
- [ ] Environment variables set
- [ ] Database migrated
- [ ] Monitoring active
- [ ] Error tracking works

---

**QA COMPLETE:** ___% (Date: _____)