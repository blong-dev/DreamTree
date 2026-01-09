-- Migration: Encrypt emails for privacy (IMP-048 Phase 3)
-- Adds email_hash column for login lookup, email column becomes encrypted

-- Add email_hash column for lookup
ALTER TABLE emails ADD COLUMN email_hash TEXT;

-- Create index for email_hash lookups
CREATE INDEX idx_emails_hash ON emails(email_hash);

-- Note: Existing data migration happens in application code
-- Signup will store: email_hash = SHA-256(normalize(email)), email = encrypted
-- Login will lookup by: email_hash
-- Profile export will: decrypt email
