-- Migration 0009: Add missing user data tables
-- Addresses IMP-045 and IMP-046 (CRITICAL)
-- Tables required for Failure Reframer (tool 100009) and Career Timeline (tool 100012)

-- ============================================================
-- 3.5 user_failure_reframes (from spec section 3.5)
-- Structured failure reframes — distinct from SOARED stories
-- ============================================================

CREATE TABLE user_failure_reframes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    situation TEXT,
    initial_feelings TEXT,
    what_learned TEXT,
    what_would_change TEXT,
    silver_lining TEXT,
    next_step TEXT,
    reframed_statement TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_failure_reframes_user ON user_failure_reframes(user_id);

-- ============================================================
-- 3.9 user_milestones (from spec section 3.9)
-- Career timeline milestones for 5-year planning
-- ============================================================

CREATE TABLE user_milestones (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    year INTEGER NOT NULL,
    quarter INTEGER CHECK (quarter BETWEEN 1 AND 4),
    title TEXT NOT NULL,
    category TEXT CHECK (category IN ('work', 'education', 'personal', 'skill')),
    description TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_milestones_user ON user_milestones(user_id);
CREATE INDEX idx_user_milestones_year ON user_milestones(user_id, year);
