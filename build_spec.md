# DreamTree Build Specification
## Complete Technical Implementation Guide

**Version:** 1.0 MVP  
**Timeline:** 4 weeks (28 days)  
**Tech Stack:** Next.js, Cloudflare (Pages/Workers/D1), Anthropic Claude API, Stripe, Web3 (MetaMask)

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Database Schema](#database-schema)
3. [API Endpoints](#api-endpoints)
4. [Frontend Components](#frontend-components)
5. [AI Integration](#ai-integration)
6. [Encryption System](#encryption-system)
7. [Payment Flow](#payment-flow)
8. [Credentials System](#credentials-system)
9. [User Flows](#user-flows)
10. [Module Configurations](#module-configurations)

---

## Architecture Overview

```
┌─────────────────────────────────────────────┐
│     Frontend (Next.js + React)              │
│     Hosted on Cloudflare Pages              │
│     dreamtree.org                            │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│     API Layer (Cloudflare Workers)          │
│     - /api/ai/chat                          │
│     - /api/character-analysis               │
│     - /api/user/*                           │
│     - /api/payment/*                        │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│     Database (Cloudflare D1 - SQLite)       │
│     - user_accounts                          │
│     - user_career_data                       │
│     - api_usage_log                          │
│     - issued_credentials                     │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│     External Services                        │
│     - Anthropic Claude API (AI)              │
│     - Stripe (Payments)                      │
│     - MetaMask (Wallet/Identity)             │
└─────────────────────────────────────────────┘
```

---

## Database Schema

### Table: `user_accounts`

```sql
CREATE TABLE user_accounts (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  
  -- Identity
  user_wallet_address TEXT NOT NULL UNIQUE,
  analytics_id TEXT NOT NULL UNIQUE, -- one-way hash for anonymous tracking
  
  -- Payment
  initial_payment_usd REAL DEFAULT 25.00,
  platform_fee_usd REAL DEFAULT 10.00,
  starting_credit_usd REAL DEFAULT 15.00,
  current_credit_usd REAL DEFAULT 15.00,
  
  -- Usage
  lifetime_api_cost_usd REAL DEFAULT 0,
  lifetime_tokens_used INTEGER DEFAULT 0,
  
  -- Progress
  modules_completed JSON DEFAULT '[]', -- [1, 2, 3]
  current_module INTEGER DEFAULT 1,
  exercises_completed JSON DEFAULT '[]', -- ["1.1", "1.2", "2.1"]
  
  -- Status
  account_status TEXT DEFAULT 'active', -- 'active', 'depleted', 'suspended'
  account_type TEXT DEFAULT 'paid', -- 'paid', 'scholarship', 'test'
  
  -- Timestamps
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  last_active INTEGER DEFAULT (strftime('%s', 'now')),
  last_payment INTEGER,
  
  -- Metadata
  referral_source TEXT,
  utm_params JSON,
  
  INDEX idx_wallet (user_wallet_address),
  INDEX idx_analytics (analytics_id),
  INDEX idx_status (account_status),
  INDEX idx_created (created_at)
);
```

### Table: `user_career_data`

```sql
CREATE TABLE user_career_data (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  
  -- User identification
  user_wallet_address TEXT NOT NULL,
  analytics_id TEXT NOT NULL,
  
  -- Career data (encrypted with platform key)
  encrypted_career_blob TEXT NOT NULL,
  
  -- Quick access metadata (duplicated from blob for fast queries)
  dream_job_description TEXT,
  target_role TEXT,
  target_industry TEXT,
  target_companies JSON, -- ["Company A", "Company B"]
  salary_expectation INTEGER,
  experience_years INTEGER,
  location_current TEXT,
  location_preferred TEXT,
  remote_preference TEXT, -- 'remote', 'hybrid', 'onsite'
  
  -- Skills snapshot
  top_skills JSON, -- ["skill1", "skill2", "skill3"]
  top_knowledges JSON,
  personality_type TEXT, -- "INTJ"
  
  -- Values
  work_values JSON,
  life_values JSON,
  
  -- Character profile
  character_notes JSON, -- Updated by managing bot
  
  -- Tracking
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER DEFAULT (strftime('%s', 'now')),
  last_active INTEGER DEFAULT (strftime('%s', 'now')),
  
  -- User consent
  consent_timestamp INTEGER NOT NULL,
  data_version TEXT DEFAULT '1.0',
  
  FOREIGN KEY (user_wallet_address) REFERENCES user_accounts(user_wallet_address),
  INDEX idx_user (user_wallet_address),
  INDEX idx_analytics (analytics_id),
  INDEX idx_role_salary (target_role, salary_expectation),
  INDEX idx_updated (updated_at)
);
```

### Table: `api_usage_log`

```sql
CREATE TABLE api_usage_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_wallet_address TEXT NOT NULL,
  analytics_id TEXT NOT NULL,
  
  call_type TEXT NOT NULL, -- 'ai_coach', 'managing_bot', 'research_tool'
  
  -- API details
  model TEXT, -- 'claude-sonnet-4-20250514'
  input_tokens INTEGER,
  output_tokens INTEGER,
  cost_usd REAL,
  
  -- Context
  module_id INTEGER,
  exercise_id TEXT, -- "1.1", "2.3"
  
  -- For research tools
  tool_name TEXT, -- 'web_search', 'crunchbase', etc
  tool_params JSON,
  
  -- Timestamp
  timestamp INTEGER DEFAULT (strftime('%s', 'now')),
  
  FOREIGN KEY (user_wallet_address) REFERENCES user_accounts(user_wallet_address),
  INDEX idx_user (user_wallet_address, timestamp),
  INDEX idx_analytics (analytics_id, timestamp),
  INDEX idx_type (call_type),
  INDEX idx_cost (cost_usd)
);
```

### Table: `analytics_events`

```sql
CREATE TABLE analytics_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  analytics_id TEXT NOT NULL,
  
  event_type TEXT NOT NULL, 
  -- 'module_start', 'module_complete', 'exercise_start', 'exercise_complete', 
  -- 'exercise_abandon', 'form_save', 'credential_issued', 'data_download', 'data_delete'
  
  event_data JSON, -- flexible event metadata
  
  -- Context
  module_id INTEGER,
  exercise_id TEXT,
  
  -- Performance
  duration_seconds INTEGER, -- time spent on exercise
  
  timestamp INTEGER DEFAULT (strftime('%s', 'now')),
  
  INDEX idx_analytics (analytics_id, timestamp),
  INDEX idx_type (event_type, timestamp),
  INDEX idx_module (module_id)
);
```

### Table: `issued_credentials`

```sql
CREATE TABLE issued_credentials (
  id TEXT PRIMARY KEY, -- vc-{uuid}
  user_wallet_address TEXT NOT NULL,
  analytics_id TEXT NOT NULL,
  
  credential_type TEXT NOT NULL, -- 'module_completion', 'course_completion', 'skill_assessment'
  issuer_did TEXT NOT NULL, -- 'did:ethr:dreamtree'
  
  -- The actual VC (encrypted)
  vc_json_encrypted TEXT NOT NULL,
  
  -- Quick access fields
  issued_date INTEGER NOT NULL,
  expiration_date INTEGER,
  revoked BOOLEAN DEFAULT FALSE,
  revoked_reason TEXT,
  
  -- Sharing tracking
  times_shared INTEGER DEFAULT 0,
  last_shared INTEGER,
  shared_with JSON, -- [{"entity": "Company X", "timestamp": 123}]
  
  -- Credential details
  module_id INTEGER,
  achievement_data JSON, -- {timeSpent: 3600, qualityScore: 0.87}
  
  FOREIGN KEY (user_wallet_address) REFERENCES user_accounts(user_wallet_address),
  INDEX idx_user (user_wallet_address),
  INDEX idx_type (credential_type),
  INDEX idx_analytics (analytics_id),
  INDEX idx_issued (issued_date)
);
```

### Table: `credential_verifications`

```sql
CREATE TABLE credential_verifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  credential_id TEXT NOT NULL,
  verifier_identifier TEXT, -- Who verified (company email, etc)
  
  verification_result BOOLEAN,
  verification_timestamp INTEGER DEFAULT (strftime('%s', 'now')),
  
  -- Analytics
  verification_method TEXT, -- 'qr_scan', 'link', 'api'
  
  FOREIGN KEY (credential_id) REFERENCES issued_credentials(id),
  INDEX idx_credential (credential_id),
  INDEX idx_timestamp (verification_timestamp)
);
```

### Table: `credit_transactions`

```sql
CREATE TABLE credit_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_wallet_address TEXT NOT NULL,
  analytics_id TEXT NOT NULL,
  
  transaction_type TEXT NOT NULL, -- 'purchase', 'spend', 'refund', 'bonus', 'scholarship'
  amount_usd REAL NOT NULL,
  
  -- Context
  description TEXT,
  module_id INTEGER,
  exercise_id TEXT,
  
  -- Payment details
  payment_method TEXT, -- 'stripe', 'crypto'
  payment_id TEXT, -- Stripe charge ID or tx hash
  stripe_customer_id TEXT,
  
  timestamp INTEGER DEFAULT (strftime('%s', 'now')),
  
  FOREIGN KEY (user_wallet_address) REFERENCES user_accounts(user_wallet_address),
  INDEX idx_user (user_wallet_address, timestamp),
  INDEX idx_analytics (analytics_id),
  INDEX idx_type (transaction_type)
);
```

### Table: `scholarship_applications`

```sql
CREATE TABLE scholarship_applications (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  
  -- Applicant info
  email TEXT NOT NULL,
  name TEXT,
  wallet_address TEXT,
  
  -- Application
  story TEXT NOT NULL, -- Their story (200+ words)
  reason TEXT NOT NULL, -- Why they need it
  goal TEXT NOT NULL, -- What they'll do with dream job
  
  -- Status
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'denied'
  reviewed_by TEXT,
  review_notes TEXT,
  
  -- Timestamps
  submitted_at INTEGER DEFAULT (strftime('%s', 'now')),
  reviewed_at INTEGER,
  
  INDEX idx_status (status),
  INDEX idx_submitted (submitted_at)
);
```

### Table: `market_insights`

```sql
CREATE TABLE market_insights (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  insight_type TEXT NOT NULL, 
  -- 'salary_by_role', 'completion_rates', 'drop_off_points', 
  -- 'skills_gaps', 'transition_paths', 'values_correlation'
  
  segment JSON, -- filters applied {"role": "Product Designer", "location": "SF"}
  data JSON, -- the actual insight
  sample_size INTEGER,
  
  computed_at INTEGER DEFAULT (strftime('%s', 'now')),
  expires_at INTEGER, -- when to recompute
  
  INDEX idx_type (insight_type, computed_at)
);
```

---

## API Endpoints

### Authentication Middleware

All user-facing endpoints require wallet signature verification:

```javascript
async function verifyWalletSignature(request) {
  const authHeader = request.headers.get('Authorization');
  // Format: "Bearer {walletAddress}:{signature}:{timestamp}"
  
  const [bearer, walletAddress, signature, timestamp] = authHeader.split(':');
  
  // Verify signature is valid
  // Verify timestamp is recent (< 5 minutes old)
  // Return wallet address if valid
  
  return walletAddress;
}
```

---

### `/api/payment/checkout`

**POST** - Create Stripe Checkout session

**Request:**
```json
{
  "walletAddress": "0x742d35...",
  "amount": 25,
  "type": "initial" // or "add_credits"
}
```

**Response:**
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/..."
}
```

**Process:**
1. Create Stripe Checkout session
2. Set success_url with wallet address
3. Set metadata with wallet address and type
4. Return session URL

---

### `/api/payment/webhook`

**POST** - Stripe webhook handler

**Process:**
1. Verify Stripe signature
2. Handle event types:
   - `checkout.session.completed`:
     - Create user account
     - Allocate credits
     - Send confirmation email
   - `charge.refunded`:
     - Mark account status
     - Log transaction
3. Return 200 OK

---

### `/api/user/create`

**POST** - Create user account after payment

**Request:**
```json
{
  "walletAddress": "0x742d35...",
  "paymentId": "pi_...",
  "amount": 25
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "...",
    "walletAddress": "0x742d35...",
    "analyticsId": "anon_abc123...",
    "credits": 15.00
  }
}
```

**Process:**
1. Verify payment in Stripe
2. Generate analytics_id (hash of wallet + salt)
3. Insert into user_accounts
4. Insert initial credit transaction
5. Return user data

---

### `/api/user/data`

**GET** - Retrieve user's data

**Headers:**
```
Authorization: Bearer {walletAddress}:{signature}:{timestamp}
```

**Response:**
```json
{
  "account": {
    "walletAddress": "0x742d35...",
    "credits": 12.34,
    "modulesCompleted": [1, 2, 3],
    "currentModule": 4,
    "exercisesCompleted": ["1.1", "1.2", "2.1"]
  },
  "careerData": {
    "encryptedBlob": "...",
    "iv": "...",
    "metadata": {
      "dreamJob": "...",
      "targetRole": "...",
      "salary": 130000
    }
  },
  "credentials": [...]
}
```

**Process:**
1. Verify wallet signature
2. Fetch from user_accounts
3. Fetch from user_career_data
4. Fetch from issued_credentials
5. Return combined data

---

### `/api/user/save`

**POST** - Save exercise response

**Headers:**
```
Authorization: Bearer {walletAddress}:{signature}:{timestamp}
```

**Request:**
```json
{
  "moduleId": 1,
  "exerciseId": "1.1",
  "data": {
    "transferableSkills": [...],
    "masteryRatings": {...}
  },
  "metadata": {
    "timeSpent": 847,
    "completedAt": 1704067200
  }
}
```

**Response:**
```json
{
  "success": true,
  "exerciseId": "1.1",
  "creditsRemaining": 14.87
}
```

**Process:**
1. Verify wallet signature
2. Fetch existing career data
3. Merge new exercise data
4. Encrypt updated blob
5. Update user_career_data
6. Update exercises_completed
7. Log analytics event
8. Return confirmation

---

### `/api/user/delete`

**DELETE** - Delete all user data

**Headers:**
```
Authorization: Bearer {walletAddress}:{signature}:{timestamp}
```

**Request:**
```json
{
  "confirmation": "DELETE_MY_DATA"
}
```

**Response:**
```json
{
  "success": true,
  "backupUrl": "https://..." // temporary download link
}
```

**Process:**
1. Verify wallet signature
2. Generate backup JSON
3. Upload to temporary storage (24hr expiry)
4. Delete from all tables:
   - user_accounts
   - user_career_data
   - issued_credentials
   - (keep analytics_events for aggregate data)
5. Return backup URL

---

### `/api/ai/chat`

**POST** - Chat with AI tutor

**Headers:**
```
Authorization: Bearer {walletAddress}:{signature}:{timestamp}
```

**Request:**
```json
{
  "message": "I'm struggling to identify my transferable skills",
  "conversationHistory": [
    {"role": "user", "content": "..."},
    {"role": "assistant", "content": "..."}
  ],
  "context": {
    "moduleId": 1,
    "exerciseId": "1.1"
  }
}
```

**Response:**
```json
{
  "response": "Let's break this down together...",
  "tokensUsed": {
    "input": 1250,
    "output": 450
  },
  "cost": 0.0105,
  "creditsRemaining": 14.8595
}
```

**Process:**
1. Verify wallet signature
2. Check credit balance (> 0)
3. Fetch user context:
   - Previous exercise responses
   - Character notes
   - Current module config
4. Build system prompt:
   - Module-specific instructions
   - Exercise goals
   - User context
   - Character notes for tone
5. Call Anthropic API (with YOUR key)
6. Calculate cost
7. Deduct from credit balance
8. Log API usage
9. Return response

---

### `/api/character-analysis`

**POST** - Analyze user for character notes (triggered automatically)

**Headers:**
```
Authorization: Internal (not user-facing)
```

**Request:**
```json
{
  "walletAddress": "0x742d35...",
  "moduleId": 1,
  "exerciseResponses": [...],
  "conversationHistory": [...],
  "behavioralMetadata": {
    "timeSpent": 2847,
    "editCount": 3,
    "messageLength": "verbose"
  }
}
```

**Response:**
```json
{
  "characterNotes": [
    {
      "category": "communication_style",
      "observation": "Writes in long, reflective paragraphs...",
      "confidence": 0.9
    },
    {
      "category": "motivation_pattern",
      "observation": "Lights up discussing human impact...",
      "confidence": 0.85
    }
  ],
  "moduleCompleted": 1,
  "recommendedFocus": "Module 2 should emphasize...",
  "timestamp": 1704067200
}
```

**Process:**
1. Verify internal auth
2. Fetch existing character notes
3. Build managing bot prompt:
   - "Observe user's module completion"
   - "Analyze communication style, energy patterns, coaching needs"
   - "Write 3-5 character notes"
4. Call Claude API (managing bot instance)
5. Parse response
6. Merge with existing character notes
7. Update user_career_data
8. Cost paid from user's credits (~$0.15)
9. Log event

---

### `/api/research/search`

**POST** - Execute research using MCP tools

**Headers:**
```
Authorization: Bearer {walletAddress}:{signature}:{timestamp}
```

**Request:**
```json
{
  "query": "Product Designer roles at Watershed",
  "tools": ["web_search", "linkedin_jobs"],
  "moduleId": 3,
  "exerciseId": "3.1"
}
```

**Response:**
```json
{
  "results": [
    {
      "source": "web_search",
      "data": [...]
    },
    {
      "source": "linkedin_jobs",
      "data": [...]
    }
  ],
  "cost": 0.05,
  "creditsRemaining": 14.80
}
```

**Process:**
1. Verify wallet signature
2. Check credits
3. Execute MCP tool calls:
   - web_search (free)
   - linkedin_jobs (if available)
4. Calculate costs
5. Deduct from credits
6. Log usage
7. Return aggregated results

---

### `/api/credentials/issue`

**POST** - Issue credential (triggered automatically)

**Headers:**
```
Authorization: Internal
```

**Request:**
```json
{
  "walletAddress": "0x742d35...",
  "credentialType": "module_completion",
  "moduleId": 1,
  "achievementData": {
    "timeSpent": 3600,
    "qualityScore": 0.87
  }
}
```

**Response:**
```json
{
  "credential": {
    "id": "vc-123-abc",
    "type": "ModuleCompletion",
    "issuedDate": "2025-01-15T00:00:00Z",
    "vc": {...} // Full W3C VC JSON
  }
}
```

**Process:**
1. Verify internal auth
2. Generate W3C Verifiable Credential:
   - Issuer: DreamTree DID
   - Subject: User's DID (from wallet)
   - Type: ModuleCompletion
   - Achievement data
3. Sign with DreamTree's organizational key
4. Encrypt VC
5. Insert into issued_credentials
6. Log event
7. Return credential

---

### `/api/credentials/verify`

**GET** - Verify a shared credential

**Query:** `?credentialId=vc-123-abc`

**Response:**
```json
{
  "valid": true,
  "trusted": true,
  "credential": {
    "type": "ModuleCompletion",
    "issuer": "DreamTree",
    "issuedDate": "2025-01-15",
    "subject": "did:ethr:0x742d35...",
    "achievement": {
      "module": 1,
      "name": "Work Factors 1",
      "completedDate": "2025-01-15"
    }
  }
}
```

**Process:**
1. Fetch credential
2. Decrypt
3. Verify signature against DreamTree public key
4. Check not revoked
5. Check not expired
6. Log verification event
7. Return validation result

---

### `/api/admin/insights`

**GET** - Admin dashboard data

**Headers:**
```
Authorization: Bearer {adminToken}
```

**Response:**
```json
{
  "revenue": {
    "total": 25000,
    "thisMonth": 5000,
    "avgPerUser": 25
  },
  "users": {
    "total": 1000,
    "active": 450,
    "completed": 123
  },
  "completion": {
    "avgTimeHours": 8.2,
    "completionRate": 0.67,
    "dropOffPoints": [
      {"exercise": "3.1", "rate": 0.23},
      {"exercise": "5.2", "rate": 0.18}
    ]
  },
  "costs": {
    "totalApiCost": 8000,
    "avgPerUser": 8,
    "profitMargin": 0.68
  }
}
```

**Process:**
1. Verify admin auth
2. Query aggregated data from:
   - user_accounts
   - credit_transactions
   - analytics_events
   - api_usage_log
3. Calculate metrics
4. Return dashboard data

---

## Frontend Components

### Component Tree

```
App
├── LandingPage
│   ├── Hero
│   ├── Features
│   ├── Pricing
│   ├── FAQ
│   └── CTAButton → Stripe Checkout
│
├── Dashboard
│   ├── WalletConnect
│   ├── CreditBalance
│   ├── ProgressTracker
│   └── ModuleList
│       └── ModuleCard (x14)
│
├── ModuleView
│   ├── ModuleHeader
│   ├── ModuleOverview
│   └── ExerciseList
│       └── ExerciseCard (x varies)
│
├── ExerciseView
│   ├── ExerciseHeader
│   ├── Instructions
│   ├── ChatInterface (if conversational)
│   │   ├── MessageList
│   │   │   └── Message
│   │   ├── MessageInput
│   │   └── CreditDisplay
│   ├── FormBuilder (if form-based)
│   │   ├── TextField
│   │   ├── TextArea
│   │   ├── MultiSelect
│   │   ├── RankingGrid
│   │   └── SaveButton
│   └── ProgressIndicator
│
├── ProfilePage
│   ├── AccountInfo
│   ├── CreditBalance
│   ├── ProgressSummary
│   ├── CharacterNotes (transparency)
│   ├── DownloadData
│   ├── DeleteData
│   └── CredentialsList
│
└── CredentialView
    ├── CredentialCard
    ├── ShareButton
    └── VerificationStatus
```

### Key Components Spec

#### `<WalletConnect />`

**Props:** None  
**State:**
- `isConnected: boolean`
- `walletAddress: string | null`
- `signature: string | null`

**Behavior:**
- Uses RainbowKit for wallet connection
- On connect: Request signature for "dreamtree-master-key-v1"
- Store signature in React state + IndexedDB
- Auto-reconnect on page load if signature exists

**Render:**
- Not connected: "Connect Wallet" button
- Connected: "0x742d...35Cc" with disconnect option

---

#### `<ChatInterface />`

**Props:**
```typescript
{
  moduleId: number;
  exerciseId: string;
  systemPrompt: string;
  onComplete: () => void;
}
```

**State:**
- `messages: Message[]`
- `input: string`
- `isLoading: boolean`
- `creditsUsed: number`

**Behavior:**
- Display conversation history
- User types message
- Send to `/api/ai/chat` with context
- Stream response (if supported) or show loading
- Display cost after each message
- Detect when AI signals "ready for form"
- Trigger `onComplete` with extracted data

---

#### `<FormBuilder />`

**Props:**
```typescript
{
  schema: FormSchema;
  initialData?: any;
  onSave: (data: any) => void;
}
```

**State:**
- `formData: Record<string, any>`
- `errors: Record<string, string>`
- `isSaving: boolean`

**Behavior:**
- Render fields based on schema
- Field types:
  - text: `<TextField />`
  - textarea: `<TextArea />`
  - multiselect: `<MultiSelect />`
  - ranking: `<RankingGrid />`
  - number: `<NumberInput />`
  - scale: `<ScaleSlider />`
- Validate on blur
- Save button triggers onSave with data
- POST to `/api/user/save`

---

#### `<ProgressTracker />`

**Props:**
```typescript
{
  totalModules: number;
  completedModules: number[];
  currentModule: number;
}
```

**Render:**
- Visual progress bar
- Module checkmarks
- "X% Complete"
- Time invested

---

#### `<CredentialCard />`

**Props:**
```typescript
{
  credential: Credential;
  onShare: (credentialId: string) => void;
}
```

**Render:**
- Badge icon
- Credential name
- Issued date
- "Share" button
- Verification status indicator

---

## AI Integration

### System Prompt Structure

Every AI interaction includes:

```
You are a career coach helping {userName} through {moduleName}: {moduleTitle}.

Your goals:
{exerciseGoals}

User's context:
{userContext}

Character notes:
{characterNotes}

Instructions:
{conversationalGuidelines}

When ready to capture data:
{transitionInstructions}
```

### Module-Specific Prompts

#### Module 1, Exercise 1.1: Transferable Skills

```
You are helping the user identify their transferable skills.

Goals:
- Have them list all jobs, projects, courses
- For each, identify tasks performed
- Extract skills from tasks
- Help them grade mastery (a-e scale)

Conversational approach:
- Ask open-ended questions about their work history
- Follow up on interesting details
- Help them see skills they might overlook
- Encourage specific examples

After 4-6 exchanges covering their work history:
"Great! I'm seeing a strong pattern here. Let me help you organize these skills..."

Then present pre-filled form with skills extracted.
```

#### Module 1, Exercise 1.2: SOARED Stories

```
You are helping the user craft 3 impactful stories using the SOARED framework.

Goals:
- Guide them through 9 challenge prompts
- Help them choose 3 most impactful
- Walk through SOARED for each:
  - Situation: Set the scene
  - Obstacle: What challenge did they face?
  - Action: Step-by-step what they did
  - Result: What happened?
  - Evaluation: How was it received?
  - Discovery: What did they learn?

Conversational approach:
- One story at a time
- Ask probing questions for each SOARED element
- Help them add specific details
- Encourage vulnerability and honesty

After completing 3 stories:
"These stories showcase your skills beautifully. Let's identify the key skills from each..."
```

### Character Analysis (Managing Bot)

**Trigger:** After module completion

**Prompt Template:**
```
You are an observant career coach supervisor analyzing a user who just completed {moduleName}.

Review their responses and conversation style.

Write 3-5 character notes that will help future AI interactions be more personal and effective.

Focus on:
1. Communication style (verbose vs concise, emotional vs analytical)
2. Energy patterns (what topics made them expansive vs brief?)
3. Decision-making approach (deliberate vs intuitive)
4. Self-awareness level (do they see their own patterns?)
5. Coaching needs (encouragement, challenge, structure?)
6. Unique quirks (metaphors, topics they reference)

Format as JSON:
{
  "characterNotes": [
    {
      "category": "communication_style",
      "observation": "...",
      "confidence": 0.9
    }
  ],
  "recommendedFocus": "...",
  "timestamp": ...
}

User's data:
{exerciseResponses}
{conversationExcerpts}
{behavioralMetadata}
```

---

## Encryption System

### Two<invoke name="artifacts">
<parameter name="command">update</parameter>
<parameter name="id">build_spec_md</parameter>
<parameter name="old_str">---
Encryption System
Two</parameter>
<parameter name="new_str">---
Encryption System
Encryption Keys
User Master Key:
javascript// Generated from wallet signature
const masterKey = await wallet.signMessage("dreamtree-master-key-v1");
// Deterministic - same wallet always generates same key
Platform Analytics Key:
javascript// Stored in Cloudflare environment variables
const platformKey = process.env.DREAMTREE_PLATFORM_KEY;
// Never exposed to frontend
Encryption Flow
On Save (User Exercise Data):
javascript// Frontend
const userData = {
  exerciseId: "1.1",
  data: {...},
  timestamp: Date.now()
};

// Encrypt with user's master key
const userEncrypted = await encryptAES256(
  JSON.stringify(userData),
  userMasterKey
);

// Send to backend
POST /api/user/save {
  encryptedData: userEncrypted.ciphertext,
  iv: userEncrypted.iv
}

// Backend - re-encrypt for analytics
const decrypted = await decryptAES256(
  request.encryptedData,
  request.iv,
  userMasterKey // derived from wallet signature
);

const platformEncrypted = await encryptAES256(
  decrypted,
  platformKey
);

// Store platform-encrypted version
db.insert('user_career_data', {
  encrypted_career_blob: platformEncrypted.ciphertext,
  encryption_iv: platformEncrypted.iv,
  // ... metadata
});
On Retrieve (User Wants Their Data):
javascript// Backend
const row = db.query(
  'SELECT * FROM user_career_data WHERE user_wallet_address = ?',
  [walletAddress]
);

// Decrypt with platform key
const decrypted = await decryptAES256(
  row.encrypted_career_blob,
  row.encryption_iv,
  platformKey
);

// Re-encrypt with user's key for transport
const userEncrypted = await encryptAES256(
  decrypted,
  userMasterKey // from signature verification
);

// Send to frontend
response.json({
  encryptedData: userEncrypted.ciphertext,
  iv: userEncrypted.iv
});

// Frontend decrypts
const userData = await decryptAES256(
  response.encryptedData,
  response.iv,
  userMasterKey
);
AES-256-GCM Implementation
javascriptasync function encryptAES256(plaintext, key) {
  const encoder = new TextEncoder();
  
  // Import key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(key),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );
  
  // Derive encryption key
  const encryptionKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('dreamtree-salt-v1'),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );
  
  // Random IV
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  // Encrypt
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    encryptionKey,
    encoder.encode(plaintext)
  );
  
  return {
    ciphertext: arrayBufferToBase64(encrypted),
    iv: arrayBufferToBase64(iv),
    algorithm: 'AES-256-GCM'
  };
}

async function decryptAES256(ciphertext, iv, key) {
  const encoder = new TextEncoder();
  
  // Import key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(key),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );
  
  // Derive encryption key
  const encryptionKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('dreamtree-salt-v1'),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );
  
  // Decrypt
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: base64ToArrayBuffer(iv) },
    encryptionKey,
    base64ToArrayBuffer(ciphertext)
  );
  
  return new TextDecoder().decode(decrypted);
}

Payment Flow
Initial Purchase ($25)
User Journey:

Click "Start Your Journey - $25"
Redirected to Stripe Checkout
Enter payment info
Stripe processes payment
Redirected to success page
Connect wallet
Account created with $15 credits

Technical Flow:
javascript// Frontend - Initiate
const response = await fetch('/api/payment/checkout', {
  method: 'POST',
  body: JSON.stringify({
    amount: 25,
    type: 'initial'
  })
});

const { url } = await response.json();
window.location.href = url;

// Stripe Checkout Session
stripe.checkout.sessions.create({
  line_items: [{
    price_data: {
      currency: 'usd',
      product_data: {
        name: 'DreamTree Career Framework',
        description: 'AI-powered career development + $15 in credits'
      },
      unit_amount: 2500 // $25 in cents
    },
    quantity: 1
  }],
  mode: 'payment',
  success_url: 'https://dreamtree.org/success?session_id={CHECKOUT_SESSION_ID}',
  cancel_url: 'https://dreamtree.org/pricing',
  metadata: {
    type: 'initial',
    timestamp: Date.now()
  }
});

// Webhook Handler
stripe.webhooks.constructEvent(
  request.body,
  request.headers['stripe-signature'],
  process.env.STRIPE_WEBHOOK_SECRET
);

if (event.type === 'checkout.session.completed') {
  const session = event.data.object;
  
  // Don't create account yet - wait for wallet connection
  // Store payment info temporarily
  await kv.put(`payment:${session.id}`, JSON.stringify({
    amount: 25,
    paymentIntent: session.payment_intent,
    timestamp: Date.now()
  }), { expirationTtl: 3600 }); // 1 hour
}

// Success Page - Connect Wallet
const sessionId = urlParams.get('session_id');
const payment = await kv.get(`payment:${sessionId}`);

// User connects wallet
const walletAddress = await connectWallet();

// Create account
await fetch('/api/user/create', {
  method: 'POST',
  body: JSON.stringify({
    walletAddress,
    sessionId
  })
});

// Backend creates account
const payment = await kv.get(`payment:${sessionId}`);
const analyticsId = hash(walletAddress + salt);

db.insert('user_accounts', {
  user_wallet_address: walletAddress,
  analytics_id: analyticsId,
  initial_payment_usd: 25,
  platform_fee_usd: 10,
  starting_credit_usd: 15,
  current_credit_usd: 15
});

db.insert('credit_transactions', {
  user_wallet_address: walletAddress,
  transaction_type: 'purchase',
  amount_usd: 15,
  description: 'Initial credit allocation',
  payment_method: 'stripe',
  payment_id: payment.paymentIntent
});
Add Credits Flow
User Journey:

Credit balance low warning
Click "Add Credits"
Choose amount ($10, $20, $50)
Stripe Checkout
Credits added to account

Technical Flow:
Similar to initial purchase, but:

type: 'add_credits'
Credits added to existing account
Platform fee: $1 per transaction


Credentials System
W3C Verifiable Credential Format
json{
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://dreamtree.org/credentials/v1"
  ],
  "type": ["VerifiableCredential", "ModuleCompletionCredential"],
  
  "issuer": {
    "id": "did:ethr:dreamtree",
    "name": "DreamTree"
  },
  
  "issuanceDate": "2025-01-15T00:00:00Z",
  "expirationDate": null,
  
  "credentialSubject": {
    "id": "did:ethr:0x742d35Cc6634C0532925a3b844D65407fBb8938F",
    "achievement": {
      "type": "ModuleCompletion",
      "module": 1,
      "name": "Work Factors 1 - Skills and Talents",
      "completedDate": "2025-01-15",
      "timeInvested": 3600,
      "exercisesCompleted": 6,
      "qualityScore": 0.87
    }
  },
  
  "proof": {
    "type": "EcdsaSecp256k1Signature2019",
    "created": "2025-01-15T00:00:00Z",
    "verificationMethod": "did:ethr:dreamtree#keys-1",
    "proofPurpose": "assertionMethod",
    "jws": "eyJhbGc...signature_here"
  }
}
Credential Issuance
Trigger: Module completion
javascript// After user completes final exercise of module
const moduleComplete = checkModuleCompletion(userId, moduleId);

if (moduleComplete) {
  // Issue credential
  await fetch('/api/credentials/issue', {
    method: 'POST',
    headers: { 'Authorization': 'Internal' },
    body: JSON.stringify({
      walletAddress: user.walletAddress,
      credentialType: 'module_completion',
      moduleId: moduleId,
      achievementData: {
        timeSpent: calculateTimeSpent(),
        exercisesCompleted: exercises.length,
        qualityScore: assessQuality()
      }
    })
  });
  
  // Show celebration
  showModal('Module Complete! 🎉 Credential Issued');
}
Quality Score Calculation
javascriptfunction assessQuality(exerciseResponses) {
  let score = 0;
  let total = 0;
  
  exerciseResponses.forEach(response => {
    // Length/completeness (0-0.3)
    const lengthScore = Math.min(
      response.wordCount / 500,
      0.3
    );
    
    // Depth (0-0.3)
    const depthScore = response.hasExamples ? 0.3 : 0.15;
    
    // Thoughtfulness (0-0.4)
    const thoughtScore = response.timeSpent > 600 ? 0.4 : 0.2;
    
    score += lengthScore + depthScore + thoughtScore;
    total += 1.0;
  });
  
  return (score / total).toFixed(2);
}
```

---

## User Flows

### Flow 1: New User Onboarding
```
1. Land on dreamtree.org
2. Read about program
3. Click "Start Your Journey - $25"
4. Stripe Checkout
   ├─ Enter payment info
   ├─ Process payment
   └─ Redirect to /success
5. Success page
   ├─ "Payment successful!"
   ├─ "Connect your wallet to save progress"
   └─ <WalletConnect />
6. Connect MetaMask
   ├─ Approve connection
   ├─ Sign message for encryption
   └─ Account created
7. Redirect to /dashboard
8. See Module 1 card
9. Click "Start Module 1"
10. Begin Exercise 1.1
```

### Flow 2: Completing an Exercise (Conversational)
```
1. User on Exercise 1.1 page
2. See instructions + AI chat interface
3. AI greets: "Let's identify your transferable skills..."
4. User types response
5. Send to /api/ai/chat
   ├─ Loading indicator
   ├─ Deduct credits
   └─ Show response
6. Conversation continues (4-6 exchanges)
7. AI signals ready: "Let me organize these skills..."
8. Form appears (pre-filled from conversation)
9. User reviews/edits
10. Click "Save to My Profile"
11. POST to /api/user/save
    ├─ Encrypt data
    ├─ Store in D1
    ├─ Mark exercise complete
    └─ Update progress
12. Show "Saved! ✓"
13. Navigate to next exercise or module list
```

### Flow 3: Completing a Module
```
1. User completes final exercise of module
2. Check if all exercises complete
3. If yes:
   ├─ Trigger character analysis
   │  ├─ Fetch exercise responses
   │  ├─ Fetch conversation history
   │  ├─ Call managing bot
   │  ├─ Store character notes
   │  └─ Deduct ~$0.15 from credits
   ├─ Issue module completion credential
   │  ├─ Generate W3C VC
   │  ├─ Sign with DreamTree key
   │  ├─ Store in issued_credentials
   │  └─ Encrypt
   └─ Show celebration modal
      ├─ "Module X Complete! 🎉"
      ├─ "New Credential Earned"
      ├─ Time spent: X hours
      ├─ Credits remaining: $X.XX
      └─ "Continue to Module X+1"
4. Update progress bar
5. Unlock next module
```

### Flow 4: Researching Companies (Module 3)
```
1. User in Exercise 3.1 (Market Research)
2. Listed target companies: ["Watershed", "Charm Industrial"]
3. AI prompts: "Let me research Watershed for you..."
4. User approves
5. Frontend calls /api/research/search
   body: {
     query: "Product Designer at Watershed",
     tools: ["web_search"],
     moduleId: 3,
     exerciseId: "3.1"
   }
6. Backend executes web_search MCP
7. AI synthesizes results:
   ├─ Current openings
   ├─ Company info
   ├─ Culture signals
   ├─ Salary range
   └─ Design team details
8. Display in chat
9. Deduct cost (~$0.05 for web_search)
10. User: "Now research Charm Industrial"
11. Repeat 5-9
12. After research, transition to form:
    "Based on your research, rank your top 3 companies"
13. User completes ranking form
14. Save to profile
```

### Flow 5: Downloading Data
```
1. User clicks profile icon
2. Navigate to /profile
3. See "Your Data" section
4. Click "Download Everything"
5. Modal: "This will download all your data as JSON"
6. User confirms
7. Sign message with wallet (proof of ownership)
8. Call /api/user/data
   ├─ Verify signature
   ├─ Fetch all data
   ├─ Decrypt with platform key
   ├─ Re-encrypt with user's key (for verification)
   └─ Return JSON
9. Frontend decrypts
10. Generate downloadable file:
    dreamtree-data-2025-01-15.json
11. Trigger browser download
12. User has complete backup

Module Configurations
Each module needs a configuration file defining:

Exercises
AI prompts
Form schemas
Transition logic

Example: Module 1 Configuration
javascript// config/modules/module-1.js

export const module1Config = {
  id: 1,
  title: "Work Factors 1 - Skills and Talents",
  part: 1,
  partTitle: "Roots",
  overview: "Complete inventory of all skills with mastery assessment",
  estimatedTime: 120, // minutes
  
  exercises: [
    {
      id: "1.1",
      title: "Transferable Skills Inventory",
      type: "conversational",
      estimatedTime: 25,
      
      systemPrompt: `
        You are helping the user identify their transferable skills.
        
        Goals:
        - Have them list all jobs, projects, courses
        - For each, identify tasks performed
        - Extract skills from tasks
        - Help them grade mastery (a-e scale)
        
        Conversational approach:
        - Ask open-ended questions about their work history
        - Follow up on interesting details
        - Help them see skills they might overlook
        - Encourage specific examples
        
        After 4-6 exchanges covering their work history:
        "Great! I'm seeing a strong pattern here. Let me help you organize these skills..."
        
        Then present pre-filled form with skills extracted.
      `,
      
      formSchema: {
        type: "object",
        properties: {
          jobs: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                company: { type: "string" },
                duration: { type: "string" },
                tasks: { type: "array", items: { type: "string" } }
              }
            }
          },
          skills: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                mastery: { type: "string", enum: ["a", "b", "c", "d", "e"] }
              }
            }
          }
        }
      },
      
      transitionLogic: {
        minExchanges: 4,
        triggerPhrase: "organize these skills",
        extractionPrompt: "Extract all mentioned skills and suggest mastery levels based on user's descriptions"
      }
    },
    
    {
      id: "1.2",
      title: "SOARED Stories",
      type: "conversational",
      estimatedTime: 45,
      
      systemPrompt: `
        You are helping the user craft 3 impactful stories using the SOARED framework.
        
        First, present 9 challenge prompts:
        a) A time when you had an impact
        b) A time you did something no one else around could have done
        c) A time when you were genuinely excited
        [etc... all 9]
        
        Ask user to briefly describe each.
        
        Then: "Which 3 of these feel most powerful to you?"
        
        For each chosen story, walk through SOARED:
        - Situation: Set the scene
        - Obstacle: What challenge did they face?
        - Action: Step-by-step what they did
        - Result: What happened?
        - Evaluation: How was it received?
        - Discovery: What did they learn?
        
        Ask probing questions for each element.
        Help them add specific details.
        
        After completing 3 stories:
        "These stories showcase your skills beautifully. Let me identify the key skills from each..."
      `,
      
      formSchema: {
        type: "object",
        properties: {
          stories: {
            type: "array",
            minItems: 3,
            maxItems: 3,
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                situation: { type: "string" },
                obstacle: { type: "string" },
                action: { type: "string" },
                result: { type: "string" },
                evaluation: { type: "string" },
                discovery: { type: "string" },
                skillsUsed: { type: "array", items: { type: "string" } }
              }
            }
          }
        }
      }
    },
    
    // ... remaining exercises (1.3-1.6)
  ],
  
  completionCriteria: {
    allExercisesComplete: true,
    minimumQualityScore: 0.5
  },
  
  characterAnalysisTrigger: true
};
```

### All Module Configs Needed
```
config/modules/
├── module-1.js (Work Factors 1)
├── module-2.js (Work Factors 2)
├── module-3.js (Priorities, Ecstasy & Flow)
├── module-4.js (Love)
├── module-5.js (Health)
├── module-6.js (Finding The Light)
├── module-7.js (Reality)
├── module-8.js (Landmarking)
├── module-9.js (Launching Pad)
├── module-10.js (Intentional Impressions)
├── module-11.js (Constructing Projection)
├── module-12.js (Networking)
├── module-13.js (Research)
└── module-14.js (Action)

Environment Variables
bash# Cloudflare
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_API_TOKEN=

# Database
DATABASE_ID= # D1 database ID

# Anthropic
ANTHROPIC_API_KEY= # Your master key for platform

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PUBLISHABLE_KEY= # For frontend

# Encryption
PLATFORM_ENCRYPTION_KEY= # Generate with: openssl rand -hex 32

# DreamTree Credentials
DREAMTREE_DID=did:ethr:dreamtree
DREAMTREE_PRIVATE_KEY= # For signing credentials

# Admin
ADMIN_PASSWORD= # For /admin dashboard

# URLs
NEXT_PUBLIC_API_URL=https://dreamtree.org/api
NEXT_PUBLIC_APP_URL=https://dreamtree.org
```

---

## Deployment Checklist

### Week 1
- [ ] Initialize Next.js project
- [ ] Deploy to Cloudflare Pages
- [ ] Set up D1 database
- [ ] Run schema migrations
- [ ] Configure environment variables
- [ ] Connect custom domain (dreamtree.org)

### Week 2
- [ ] Stripe integration (test mode)
- [ ] Anthropic API integration
- [ ] Wallet connection (MetaMask)
- [ ] Module 1 functional end-to-end

### Week 3
- [ ] All 14 modules content loaded
- [ ] Character analysis working
- [ ] Research tools integrated
- [ ] Data export/delete functional

### Week 4
- [ ] Credentials system
- [ ] Admin dashboard
- [ ] Scholarship application
- [ ] Privacy policy/Terms
- [ ] Stripe production mode
- [ ] Beta testing (10 users)
- [ ] Public launch

---

## File Structure
```
dreamtree/
├── public/
│   ├── images/
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── page.tsx (Landing)
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── modules/
│   │   │   └── [id]/
│   │   │       ├── page.tsx (Module view)
│   │   │       └── [exerciseId]/
│   │   │           └── page.tsx (Exercise view)
│   │   ├── profile/
│   │   │   └── page.tsx
│   │   ├── success/
│   │   │   └── page.tsx (Payment success)
│   │   └── admin/
│   │       └── page.tsx
│   ├── components/
│   │   ├── WalletConnect.tsx
│   │   ├── ChatInterface.tsx
│   │   ├── FormBuilder.tsx
│   │   ├── ProgressTracker.tsx
│   │   ├── CredentialCard.tsx
│   │   └── ...
│   ├── lib/
│   │   ├── encryption.ts
│   │   ├── wallet.ts
│   │   ├── storage.ts (IndexedDB)
│   │   ├── api.ts
│   │   └── utils.ts
│   ├── config/
│   │   ├── modules/
│   │   │   ├── module-1.ts
│   │   │   ├── module-2.ts
│   │   │   └── ... (all 14)
│   │   └── pricing.ts
│   └── styles/
│       └── globals.css
├── functions/ (Cloudflare Workers)
│   ├── api/
│   │   ├── payment/
│   │   │   ├── checkout.ts
│   │   │   └── webhook.ts
│   │   ├── user/
│   │   │   ├── create.ts
│   │   │   ├── data.ts
│   │   │   ├── save.ts
│   │   │   └── delete.ts
│   │   ├── ai/
│   │   │   └── chat.ts
│   │   ├── character-analysis.ts
│   │   ├── research/
│   │   │   └── search.ts
│   │   └── credentials/
│   │       ├── issue.ts
│   │       └── verify.ts
│   └── cron/
│       └── analytics-aggregate.ts
├── database/
│   ├── schema.sql
│   └── migrations/
│       ├── 001_initial.sql
│       ├── 002_add_credentials.sql
│       └── ...
├── docs/
│   ├── PRIVACY_POLICY.md
│   ├── TERMS_OF_SERVICE.md
│   ├── FAQ.md
│   └── CONTRIBUTING.md
├── .env.local
├── .env.production
├── wrangler.toml
├── package.json
├── tsconfig.json
└── README.md

Testing Strategy
Unit Tests

Encryption/decryption functions
Form validation
Credit calculation
Quality score assessment

Integration Tests

Payment flow (Stripe test mode)
Wallet connection
API endpoints
Database queries

End-to-End Tests

Full user journey (payment → module → completion)
Data export/delete
Credential issuance
Character analysis

Load Tests

100 concurrent users
1000 API requests/minute
Database query performance


Monitoring & Analytics
Error Tracking

Sentry (free tier)
Track:

API errors
Payment failures
Encryption errors
Frontend crashes



User Analytics

Custom events in analytics_events table
Track:

Module completion rates
Exercise drop-off points
Average time per module
Credit usage patterns
Feature adoption



Business Metrics

Daily active users
Revenue (daily/weekly/monthly)
Conversion rate (visitor → paying user)
Completion rate
Average revenue per user
Refund rate
Scholarship request rate


Launch Plan
Pre-Launch (Days 26-28)

Beta test with 10 users
Fix critical bugs
Gather feedback
Write launch posts

Launch Day (Day 29)

9:00 AM: Tweet announcement
10:00 AM: Hacker News "Show HN"
11:00 AM: Reddit posts
12:00 PM: Product Hunt
All day: Monitor, respond, fix issues

Week 1 Post-Launch

Daily bug fixes
User support
Content marketing (blog posts)
Track metrics
Iterate based on feedback

Month 1 Goals

100 paying users
<5% refund rate


60% reach Module 3




20% complete full course


4.5+ star reviews


END OF BUILD SPEC
This is your complete blueprint. Every API, every database table, every component, every flow. Code from this document.</parameter>