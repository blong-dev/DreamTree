-- Migration 0010: Add rate limiting for auth routes
-- Addresses IMP-039 (CRITICAL)
-- Prevents brute force attacks on login/signup

-- ============================================================
-- Rate limiting table for tracking failed auth attempts
-- ============================================================

CREATE TABLE rate_limits (
    id TEXT PRIMARY KEY,
    identifier TEXT NOT NULL,        -- email or IP address
    endpoint TEXT NOT NULL,          -- 'login' or 'signup'
    attempt_count INTEGER NOT NULL DEFAULT 1,
    first_attempt_at TEXT NOT NULL,  -- ISO timestamp
    last_attempt_at TEXT NOT NULL,   -- ISO timestamp
    blocked_until TEXT               -- NULL if not blocked, ISO timestamp if blocked
);

-- Index for fast lookups by identifier + endpoint
CREATE INDEX idx_rate_limits_lookup ON rate_limits(identifier, endpoint);

-- Index for cleanup of old entries
CREATE INDEX idx_rate_limits_first_attempt ON rate_limits(first_attempt_at);
