-- Migration 0011: Add life_dashboard_notes column to user_profile
-- Addresses IMP-047 (HIGH)
-- Allows Life Dashboard tool to store user's written reflections

ALTER TABLE user_profile ADD COLUMN life_dashboard_notes TEXT;
