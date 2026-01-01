-- DreamTree Database Schema for Cloudflare D1
-- Complete schema based on build_spec.md

-- ============================================
-- USER ACCOUNTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_accounts (
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
  modules_completed TEXT DEFAULT '[]', -- JSON: [1, 2, 3]
  current_module INTEGER DEFAULT 1,
  exercises_completed TEXT DEFAULT '[]', -- JSON: ["1.1", "1.2", "2.1"]

  -- Status
  account_status TEXT DEFAULT 'active', -- 'active', 'depleted', 'suspended'
  account_type TEXT DEFAULT 'paid', -- 'paid', 'scholarship', 'test'

  -- Timestamps
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  last_active INTEGER DEFAULT (strftime('%s', 'now')),
  last_payment INTEGER,

  -- Metadata
  referral_source TEXT,
  utm_params TEXT -- JSON
);

CREATE INDEX idx_wallet ON user_accounts(user_wallet_address);
CREATE INDEX idx_analytics ON user_accounts(analytics_id);
CREATE INDEX idx_status ON user_accounts(account_status);
CREATE INDEX idx_created ON user_accounts(created_at);

-- ============================================
-- USER CAREER DATA TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_career_data (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),

  -- User identification
  user_wallet_address TEXT NOT NULL,
  analytics_id TEXT NOT NULL,

  -- Career data (encrypted with platform key)
  encrypted_career_blob TEXT NOT NULL,
  encryption_iv TEXT NOT NULL,

  -- Quick access metadata (duplicated from blob for fast queries)
  dream_job_description TEXT,
  target_role TEXT,
  target_industry TEXT,
  target_companies TEXT, -- JSON: ["Company A", "Company B"]
  salary_expectation INTEGER,
  experience_years INTEGER,
  location_current TEXT,
  location_preferred TEXT,
  remote_preference TEXT, -- 'remote', 'hybrid', 'onsite'

  -- Skills snapshot
  top_skills TEXT, -- JSON: ["skill1", "skill2", "skill3"]
  top_knowledges TEXT, -- JSON
  personality_type TEXT, -- "INTJ"

  -- Values
  work_values TEXT, -- JSON
  life_values TEXT, -- JSON

  -- Character profile
  character_notes TEXT, -- JSON: Updated by managing bot

  -- Tracking
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER DEFAULT (strftime('%s', 'now')),
  last_active INTEGER DEFAULT (strftime('%s', 'now')),

  -- User consent
  consent_timestamp INTEGER NOT NULL,
  data_version TEXT DEFAULT '1.0',

  FOREIGN KEY (user_wallet_address) REFERENCES user_accounts(user_wallet_address)
);

CREATE INDEX idx_user_career ON user_career_data(user_wallet_address);
CREATE INDEX idx_analytics_career ON user_career_data(analytics_id);
CREATE INDEX idx_role_salary ON user_career_data(target_role, salary_expectation);
CREATE INDEX idx_updated ON user_career_data(updated_at);

-- ============================================
-- API USAGE LOG TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS api_usage_log (
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
  tool_params TEXT, -- JSON

  -- Timestamp
  timestamp INTEGER DEFAULT (strftime('%s', 'now')),

  FOREIGN KEY (user_wallet_address) REFERENCES user_accounts(user_wallet_address)
);

CREATE INDEX idx_user_usage ON api_usage_log(user_wallet_address, timestamp);
CREATE INDEX idx_analytics_usage ON api_usage_log(analytics_id, timestamp);
CREATE INDEX idx_type ON api_usage_log(call_type);
CREATE INDEX idx_cost ON api_usage_log(cost_usd);

-- ============================================
-- ANALYTICS EVENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS analytics_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  analytics_id TEXT NOT NULL,

  event_type TEXT NOT NULL,
  -- 'module_start', 'module_complete', 'exercise_start', 'exercise_complete',
  -- 'exercise_abandon', 'form_save', 'credential_issued', 'data_download', 'data_delete'

  event_data TEXT, -- JSON: flexible event metadata

  -- Context
  module_id INTEGER,
  exercise_id TEXT,

  -- Performance
  duration_seconds INTEGER, -- time spent on exercise

  timestamp INTEGER DEFAULT (strftime('%s', 'now'))
);

CREATE INDEX idx_analytics_events ON analytics_events(analytics_id, timestamp);
CREATE INDEX idx_event_type ON analytics_events(event_type, timestamp);
CREATE INDEX idx_module ON analytics_events(module_id);

-- ============================================
-- ISSUED CREDENTIALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS issued_credentials (
  id TEXT PRIMARY KEY, -- vc-{uuid}
  user_wallet_address TEXT NOT NULL,
  analytics_id TEXT NOT NULL,

  credential_type TEXT NOT NULL, -- 'module_completion', 'course_completion', 'skill_assessment'
  issuer_did TEXT NOT NULL, -- 'did:ethr:dreamtree'

  -- The actual VC (encrypted)
  vc_json_encrypted TEXT NOT NULL,
  encryption_iv TEXT NOT NULL,

  -- Quick access fields
  issued_date INTEGER NOT NULL,
  expiration_date INTEGER,
  revoked INTEGER DEFAULT 0, -- SQLite uses 0/1 for boolean
  revoked_reason TEXT,

  -- Sharing tracking
  times_shared INTEGER DEFAULT 0,
  last_shared INTEGER,
  shared_with TEXT, -- JSON: [{"entity": "Company X", "timestamp": 123}]

  -- Credential details
  module_id INTEGER,
  achievement_data TEXT, -- JSON: {timeSpent: 3600, qualityScore: 0.87}

  FOREIGN KEY (user_wallet_address) REFERENCES user_accounts(user_wallet_address)
);

CREATE INDEX idx_user_creds ON issued_credentials(user_wallet_address);
CREATE INDEX idx_cred_type ON issued_credentials(credential_type);
CREATE INDEX idx_analytics_creds ON issued_credentials(analytics_id);
CREATE INDEX idx_issued ON issued_credentials(issued_date);

-- ============================================
-- CREDENTIAL VERIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS credential_verifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  credential_id TEXT NOT NULL,
  verifier_identifier TEXT, -- Who verified (company email, etc)

  verification_result INTEGER, -- 0 or 1 for boolean
  verification_timestamp INTEGER DEFAULT (strftime('%s', 'now')),

  -- Analytics
  verification_method TEXT, -- 'qr_scan', 'link', 'api'

  FOREIGN KEY (credential_id) REFERENCES issued_credentials(id)
);

CREATE INDEX idx_credential_verify ON credential_verifications(credential_id);
CREATE INDEX idx_timestamp_verify ON credential_verifications(verification_timestamp);

-- ============================================
-- CREDIT TRANSACTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS credit_transactions (
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

  FOREIGN KEY (user_wallet_address) REFERENCES user_accounts(user_wallet_address)
);

CREATE INDEX idx_user_transactions ON credit_transactions(user_wallet_address, timestamp);
CREATE INDEX idx_analytics_transactions ON credit_transactions(analytics_id);
CREATE INDEX idx_transaction_type ON credit_transactions(transaction_type);

-- ============================================
-- SCHOLARSHIP APPLICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS scholarship_applications (
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
  reviewed_at INTEGER
);

CREATE INDEX idx_scholarship_status ON scholarship_applications(status);
CREATE INDEX idx_scholarship_submitted ON scholarship_applications(submitted_at);

-- ============================================
-- MARKET INSIGHTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS market_insights (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  insight_type TEXT NOT NULL,
  -- 'salary_by_role', 'completion_rates', 'drop_off_points',
  -- 'skills_gaps', 'transition_paths', 'values_correlation'

  segment TEXT, -- JSON: filters applied {"role": "Product Designer", "location": "SF"}
  data TEXT, -- JSON: the actual insight
  sample_size INTEGER,

  computed_at INTEGER DEFAULT (strftime('%s', 'now')),
  expires_at INTEGER -- when to recompute
);

CREATE INDEX idx_insight_type ON market_insights(insight_type, computed_at);
