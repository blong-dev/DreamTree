-- Migration 001: Initial Schema
-- Creates all core tables for DreamTree MVP
-- Run with: wrangler d1 execute dreamtree-db --file=database/migrations/001_initial_schema.sql

-- This file imports the complete schema
-- For D1, we need to include the full schema here

-- ============================================
-- USER ACCOUNTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_accounts (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_wallet_address TEXT NOT NULL UNIQUE,
  analytics_id TEXT NOT NULL UNIQUE,
  initial_payment_usd REAL DEFAULT 25.00,
  platform_fee_usd REAL DEFAULT 10.00,
  starting_credit_usd REAL DEFAULT 15.00,
  current_credit_usd REAL DEFAULT 15.00,
  lifetime_api_cost_usd REAL DEFAULT 0,
  lifetime_tokens_used INTEGER DEFAULT 0,
  modules_completed TEXT DEFAULT '[]',
  current_module INTEGER DEFAULT 1,
  exercises_completed TEXT DEFAULT '[]',
  account_status TEXT DEFAULT 'active',
  account_type TEXT DEFAULT 'paid',
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  last_active INTEGER DEFAULT (strftime('%s', 'now')),
  last_payment INTEGER,
  referral_source TEXT,
  utm_params TEXT
);

CREATE INDEX IF NOT EXISTS idx_wallet ON user_accounts(user_wallet_address);
CREATE INDEX IF NOT EXISTS idx_analytics ON user_accounts(analytics_id);
CREATE INDEX IF NOT EXISTS idx_status ON user_accounts(account_status);
CREATE INDEX IF NOT EXISTS idx_created ON user_accounts(created_at);

-- ============================================
-- USER CAREER DATA TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_career_data (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_wallet_address TEXT NOT NULL,
  analytics_id TEXT NOT NULL,
  encrypted_career_blob TEXT NOT NULL,
  encryption_iv TEXT NOT NULL,
  dream_job_description TEXT,
  target_role TEXT,
  target_industry TEXT,
  target_companies TEXT,
  salary_expectation INTEGER,
  experience_years INTEGER,
  location_current TEXT,
  location_preferred TEXT,
  remote_preference TEXT,
  top_skills TEXT,
  top_knowledges TEXT,
  personality_type TEXT,
  work_values TEXT,
  life_values TEXT,
  character_notes TEXT,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER DEFAULT (strftime('%s', 'now')),
  last_active INTEGER DEFAULT (strftime('%s', 'now')),
  consent_timestamp INTEGER NOT NULL,
  data_version TEXT DEFAULT '1.0',
  FOREIGN KEY (user_wallet_address) REFERENCES user_accounts(user_wallet_address)
);

CREATE INDEX IF NOT EXISTS idx_user_career ON user_career_data(user_wallet_address);
CREATE INDEX IF NOT EXISTS idx_analytics_career ON user_career_data(analytics_id);
CREATE INDEX IF NOT EXISTS idx_role_salary ON user_career_data(target_role, salary_expectation);
CREATE INDEX IF NOT EXISTS idx_updated ON user_career_data(updated_at);

-- ============================================
-- API USAGE LOG TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS api_usage_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_wallet_address TEXT NOT NULL,
  analytics_id TEXT NOT NULL,
  call_type TEXT NOT NULL,
  model TEXT,
  input_tokens INTEGER,
  output_tokens INTEGER,
  cost_usd REAL,
  module_id INTEGER,
  exercise_id TEXT,
  tool_name TEXT,
  tool_params TEXT,
  timestamp INTEGER DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (user_wallet_address) REFERENCES user_accounts(user_wallet_address)
);

CREATE INDEX IF NOT EXISTS idx_user_usage ON api_usage_log(user_wallet_address, timestamp);
CREATE INDEX IF NOT EXISTS idx_analytics_usage ON api_usage_log(analytics_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_type ON api_usage_log(call_type);
CREATE INDEX IF NOT EXISTS idx_cost ON api_usage_log(cost_usd);

-- ============================================
-- ANALYTICS EVENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS analytics_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  analytics_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_data TEXT,
  module_id INTEGER,
  exercise_id TEXT,
  duration_seconds INTEGER,
  timestamp INTEGER DEFAULT (strftime('%s', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_analytics_events ON analytics_events(analytics_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_event_type ON analytics_events(event_type, timestamp);
CREATE INDEX IF NOT EXISTS idx_module ON analytics_events(module_id);

-- ============================================
-- ISSUED CREDENTIALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS issued_credentials (
  id TEXT PRIMARY KEY,
  user_wallet_address TEXT NOT NULL,
  analytics_id TEXT NOT NULL,
  credential_type TEXT NOT NULL,
  issuer_did TEXT NOT NULL,
  vc_json_encrypted TEXT NOT NULL,
  encryption_iv TEXT NOT NULL,
  issued_date INTEGER NOT NULL,
  expiration_date INTEGER,
  revoked INTEGER DEFAULT 0,
  revoked_reason TEXT,
  times_shared INTEGER DEFAULT 0,
  last_shared INTEGER,
  shared_with TEXT,
  module_id INTEGER,
  achievement_data TEXT,
  FOREIGN KEY (user_wallet_address) REFERENCES user_accounts(user_wallet_address)
);

CREATE INDEX IF NOT EXISTS idx_user_creds ON issued_credentials(user_wallet_address);
CREATE INDEX IF NOT EXISTS idx_cred_type ON issued_credentials(credential_type);
CREATE INDEX IF NOT EXISTS idx_analytics_creds ON issued_credentials(analytics_id);
CREATE INDEX IF NOT EXISTS idx_issued ON issued_credentials(issued_date);

-- ============================================
-- CREDENTIAL VERIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS credential_verifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  credential_id TEXT NOT NULL,
  verifier_identifier TEXT,
  verification_result INTEGER,
  verification_timestamp INTEGER DEFAULT (strftime('%s', 'now')),
  verification_method TEXT,
  FOREIGN KEY (credential_id) REFERENCES issued_credentials(id)
);

CREATE INDEX IF NOT EXISTS idx_credential_verify ON credential_verifications(credential_id);
CREATE INDEX IF NOT EXISTS idx_timestamp_verify ON credential_verifications(verification_timestamp);

-- ============================================
-- CREDIT TRANSACTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS credit_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_wallet_address TEXT NOT NULL,
  analytics_id TEXT NOT NULL,
  transaction_type TEXT NOT NULL,
  amount_usd REAL NOT NULL,
  description TEXT,
  module_id INTEGER,
  exercise_id TEXT,
  payment_method TEXT,
  payment_id TEXT,
  stripe_customer_id TEXT,
  timestamp INTEGER DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (user_wallet_address) REFERENCES user_accounts(user_wallet_address)
);

CREATE INDEX IF NOT EXISTS idx_user_transactions ON credit_transactions(user_wallet_address, timestamp);
CREATE INDEX IF NOT EXISTS idx_analytics_transactions ON credit_transactions(analytics_id);
CREATE INDEX IF NOT EXISTS idx_transaction_type ON credit_transactions(transaction_type);

-- ============================================
-- SCHOLARSHIP APPLICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS scholarship_applications (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  email TEXT NOT NULL,
  name TEXT,
  wallet_address TEXT,
  story TEXT NOT NULL,
  reason TEXT NOT NULL,
  goal TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  reviewed_by TEXT,
  review_notes TEXT,
  submitted_at INTEGER DEFAULT (strftime('%s', 'now')),
  reviewed_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_scholarship_status ON scholarship_applications(status);
CREATE INDEX IF NOT EXISTS idx_scholarship_submitted ON scholarship_applications(submitted_at);

-- ============================================
-- MARKET INSIGHTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS market_insights (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  insight_type TEXT NOT NULL,
  segment TEXT,
  data TEXT,
  sample_size INTEGER,
  computed_at INTEGER DEFAULT (strftime('%s', 'now')),
  expires_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_insight_type ON market_insights(insight_type, computed_at);
