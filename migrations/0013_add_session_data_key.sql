-- Migration: 0013_add_session_data_key.sql
-- Purpose: Add data_key column to sessions for server-side PII encryption
-- Date: 2026-01-09

-- Store the unwrapped data key in the session for PII encryption/decryption
-- This enables server-side encryption of sensitive fields
ALTER TABLE sessions ADD COLUMN data_key TEXT;
