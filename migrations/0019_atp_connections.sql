-- AT Protocol connections table
-- Stores user connections to their Personal Data Server (PDS)

CREATE TABLE IF NOT EXISTS user_atp_connections (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    did TEXT NOT NULL,                    -- e.g., "did:plc:abc123..."
    handle TEXT,                          -- e.g., "alice.bsky.social"
    pds_url TEXT NOT NULL,               -- e.g., "https://bsky.social"
    session_data TEXT NOT NULL,          -- JSON serialized session
    sync_enabled INTEGER DEFAULT 0,       -- 0 or 1
    last_sync_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_atp_connections_did ON user_atp_connections(did);

-- OAuth state table for PKCE flow
-- States expire after 10 minutes

CREATE TABLE IF NOT EXISTS oauth_state (
    id TEXT PRIMARY KEY,
    state TEXT NOT NULL UNIQUE,
    code_verifier TEXT NOT NULL,
    handle TEXT NOT NULL,
    user_id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_oauth_state_state ON oauth_state(state);
CREATE INDEX IF NOT EXISTS idx_oauth_state_expires ON oauth_state(expires_at);
