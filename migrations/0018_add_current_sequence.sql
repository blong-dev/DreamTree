-- Migration: Add current_sequence to user_settings (BUG-357)
--
-- Problem: Users aren't returned to exact block they reached.
-- Current system only tracks answered prompts/tools.
--
-- Solution: Add current_sequence column to track exact position.
-- This is a one-way ratchet - position only increases.

ALTER TABLE user_settings ADD COLUMN current_sequence INTEGER DEFAULT 1;
