-- Migration 0016: Add user_role column for RBAC
-- BUG-206: Admin pages accessible to all authenticated users
--
-- Role values:
--   'user'  - Default, regular workbook users
--   'admin' - Full access to analytics dashboard (/ops)
--   'coach' - Future: Individual student data access
--   'org'   - Future: Aggregate data only

-- Add user_role column with default 'user'
ALTER TABLE users ADD COLUMN user_role TEXT NOT NULL DEFAULT 'user';

-- Create index for role lookups (middleware checks this on every /ops request)
CREATE INDEX idx_users_role ON users(user_role);
