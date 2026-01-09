-- Migration: Add display_name to user_profile
-- The onboarding API expects this column but it was missing from the schema

ALTER TABLE user_profile ADD COLUMN display_name TEXT;

-- Create index for potential lookups
CREATE INDEX IF NOT EXISTS idx_user_profile_display_name ON user_profile(display_name);
