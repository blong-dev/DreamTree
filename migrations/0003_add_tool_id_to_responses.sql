-- Migration: Add tool_id column to user_responses
-- This fixes the semantic violation where tool.id was stored in prompt_id column
--
-- Changes:
-- 1. prompt_id becomes nullable (response can be for prompt OR tool)
-- 2. tool_id added as nullable (references tools table)
-- 3. CHECK constraint ensures exactly one of prompt_id or tool_id is set

-- Step 1: Create new table with correct schema
CREATE TABLE user_responses_new (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    prompt_id INTEGER,
    tool_id INTEGER,
    exercise_id TEXT,
    activity_id TEXT,
    response_text TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (prompt_id) REFERENCES prompts(id),
    FOREIGN KEY (tool_id) REFERENCES tools(id),
    CHECK (
        (prompt_id IS NOT NULL AND tool_id IS NULL) OR
        (prompt_id IS NULL AND tool_id IS NOT NULL)
    )
);

-- Step 2: Copy existing data (all existing records have prompt_id set)
-- Note: Any records where prompt_id actually referenced a tool will violate
-- the foreign key, but SQLite FK enforcement may be off. We keep them as-is
-- and they'll be overwritten when the tool is used again.
INSERT INTO user_responses_new (id, user_id, prompt_id, tool_id, exercise_id, activity_id, response_text, created_at, updated_at)
SELECT id, user_id, prompt_id, NULL, exercise_id, activity_id, response_text, created_at, updated_at
FROM user_responses;

-- Step 3: Drop old table
DROP TABLE user_responses;

-- Step 4: Rename new table
ALTER TABLE user_responses_new RENAME TO user_responses;

-- Step 5: Recreate indexes
CREATE INDEX idx_user_responses_user ON user_responses(user_id);
CREATE INDEX idx_user_responses_prompt ON user_responses(user_id, prompt_id);
CREATE INDEX idx_user_responses_tool ON user_responses(user_id, tool_id);
CREATE INDEX idx_user_responses_exercise ON user_responses(user_id, exercise_id);
