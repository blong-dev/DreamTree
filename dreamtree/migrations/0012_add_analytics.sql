-- Migration: 0012_add_analytics.sql
-- Purpose: Add analytics tables for event tracking and aggregates
-- Date: 2026-01-09

-- Analytics events table
-- Stores individual tracking events (page views, exercise starts, tool usage, etc.)
CREATE TABLE IF NOT EXISTS analytics_events (
    id TEXT PRIMARY KEY,
    user_id TEXT,                    -- FK to users, nullable for anonymous events
    session_id TEXT,                 -- Session identifier
    event_type TEXT NOT NULL,        -- Controlled vocabulary: session_start, page_view, exercise_start, etc.
    target_type TEXT,                -- 'exercise', 'prompt', 'tool', 'page', 'api'
    target_id TEXT,                  -- Exercise ID, tool ID, page path, etc.
    event_data TEXT,                 -- JSON: metadata only (duration_ms, items_count), NO content
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes for analytics_events
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_target ON analytics_events(target_type, target_id);

-- Analytics aggregates table
-- Stores pre-computed metrics for dashboard performance
CREATE TABLE IF NOT EXISTS analytics_aggregates (
    id TEXT PRIMARY KEY,
    metric_name TEXT NOT NULL,       -- 'dau', 'exercise_completion_rate', 'tool_usage_count', etc.
    dimension TEXT,                  -- 'exercise_id', 'tool_type', 'date', etc.
    dimension_value TEXT,            -- '1.2.3', 'list_builder', '2026-01-09', etc.
    metric_value REAL NOT NULL,      -- The computed value
    period_start TEXT NOT NULL,      -- Start of measurement period
    period_end TEXT NOT NULL,        -- End of measurement period
    computed_at TEXT NOT NULL        -- When this aggregate was computed
);

-- Indexes for analytics_aggregates
CREATE INDEX IF NOT EXISTS idx_analytics_aggregates_metric ON analytics_aggregates(metric_name);
CREATE INDEX IF NOT EXISTS idx_analytics_aggregates_dimension ON analytics_aggregates(dimension, dimension_value);
CREATE INDEX IF NOT EXISTS idx_analytics_aggregates_period ON analytics_aggregates(period_start, period_end);
