-- Team Knowledge Base Schema
-- SQLite database for code documentation, bug tracking, and team coordination

-- =============================================================================
-- FOUNDATION: Code Documentation
-- =============================================================================

-- The foundation: every file and symbol documented
CREATE TABLE IF NOT EXISTS code_docs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_path TEXT NOT NULL,              -- src/components/workbook/WorkbookView.tsx
    symbol_name TEXT,                     -- NULL = whole file, or function/class name
    symbol_type TEXT NOT NULL,            -- file, function, class, hook, component, export
    line_start INTEGER,                   -- NULL for file-level
    line_end INTEGER,
    signature TEXT,                       -- Function signature if applicable
    purpose TEXT NOT NULL,                -- What it does
    why TEXT,                             -- Design rationale
    connections TEXT,                     -- JSON array: what it interacts with
    area TEXT NOT NULL,                   -- workbook, auth, database, etc.
    parent_id INTEGER,                    -- Parent function for nested symbols
    last_verified TEXT,                   -- When accuracy was confirmed
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(file_path, symbol_name, line_start),  -- Prevent duplicates
    FOREIGN KEY (parent_id) REFERENCES code_docs(id)
);

CREATE INDEX IF NOT EXISTS idx_code_docs_file ON code_docs(file_path);
CREATE INDEX IF NOT EXISTS idx_code_docs_area ON code_docs(area);
CREATE INDEX IF NOT EXISTS idx_code_docs_type ON code_docs(symbol_type);
CREATE INDEX IF NOT EXISTS idx_code_docs_parent ON code_docs(parent_id);

-- =============================================================================
-- BUG TRACKING
-- =============================================================================

CREATE TABLE IF NOT EXISTS bugs (
    id TEXT PRIMARY KEY,                    -- BUG-001, IMP-002, etc.
    title TEXT NOT NULL,
    status TEXT DEFAULT 'open',             -- open, in_progress, review, done
    priority TEXT DEFAULT 'medium',         -- low, medium, high, critical
    area TEXT,                              -- workbook, auth, database, etc.
    owner TEXT,                             -- Fizz, Buzz, Pazz, Queen
    trivial INTEGER DEFAULT 0,              -- 1 = skip QA review
    description TEXT,
    expected_behavior TEXT,
    root_cause TEXT,
    fix_applied TEXT,
    files_changed TEXT,                     -- JSON array of file paths
    acceptance_criteria TEXT,               -- JSON array of criteria
    found_by TEXT,
    verified_by TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bugs_status ON bugs(status);
CREATE INDEX IF NOT EXISTS idx_bugs_area ON bugs(area);
CREATE INDEX IF NOT EXISTS idx_bugs_owner ON bugs(owner);

-- =============================================================================
-- CHANGE HISTORY
-- =============================================================================

CREATE TABLE IF NOT EXISTS changelog (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    title TEXT NOT NULL,
    what_changed TEXT NOT NULL,
    what_it_was TEXT,                       -- Previous behavior/value
    why TEXT NOT NULL,                      -- Rationale
    files_affected TEXT,                    -- JSON array
    related_bug_id TEXT,                    -- Reference to bugs.id
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_changelog_date ON changelog(date);
CREATE INDEX IF NOT EXISTS idx_changelog_bug ON changelog(related_bug_id);

-- =============================================================================
-- DOCUMENTATION INDEX
-- =============================================================================

CREATE TABLE IF NOT EXISTS docs_index (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    path TEXT NOT NULL UNIQUE,              -- team/areas/workbook.md
    category TEXT NOT NULL,                 -- coordination, area, spec, project
    title TEXT NOT NULL,
    purpose TEXT,
    when_to_read TEXT,
    keywords TEXT,                          -- JSON array for search
    last_updated TEXT
);

CREATE INDEX IF NOT EXISTS idx_docs_category ON docs_index(category);

-- =============================================================================
-- TASK MANAGEMENT
-- =============================================================================

CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,                    -- TASK-001
    bug_id TEXT,                            -- Reference to bugs.id (optional)
    title TEXT NOT NULL,
    owner TEXT NOT NULL,                    -- Fizz, Buzz, Pazz, Rizz
    status TEXT DEFAULT 'pending',          -- pending, in_progress, done
    priority INTEGER DEFAULT 2,             -- 1=high, 2=medium, 3=low
    notes TEXT,
    files_editing TEXT,                     -- JSON array (for file locking)
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    completed_at TEXT,

    FOREIGN KEY (bug_id) REFERENCES bugs(id)
);

CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_owner ON tasks(owner);

-- =============================================================================
-- LEARNINGS
-- =============================================================================

CREATE TABLE IF NOT EXISTS learnings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL,                 -- general, database, css, auth, etc.
    learning TEXT NOT NULL,
    context TEXT,                           -- Where/when discovered
    related_bug_id TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (related_bug_id) REFERENCES bugs(id)
);

CREATE INDEX IF NOT EXISTS idx_learnings_category ON learnings(category);

-- =============================================================================
-- DECISIONS
-- =============================================================================

CREATE TABLE IF NOT EXISTS decisions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    decision TEXT NOT NULL,
    rationale TEXT NOT NULL,
    alternatives_considered TEXT,           -- JSON array
    related_area TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_decisions_date ON decisions(date);
CREATE INDEX IF NOT EXISTS idx_decisions_area ON decisions(related_area);

-- =============================================================================
-- MESSAGES (DB is Source of Truth - Append Only)
-- =============================================================================

-- Board messages - agents write here via store_message()
-- APPEND-ONLY: No edits, post corrections as new messages with type='correction'
CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    author TEXT NOT NULL,                   -- Queen, Fizz, Buzz, Pazz, Rizz
    message_type TEXT NOT NULL,             -- assignment, question, answer, status, etc.
    content TEXT NOT NULL,
    refs TEXT,                              -- JSON: {bug_id, task_id, code_doc_id, reply_to}
    mentions TEXT,                          -- JSON array: ["@Fizz", "@Buzz"]
    resolved INTEGER DEFAULT 0,             -- 1 = addressed/no longer active
    created_at TEXT DEFAULT (datetime('now'))  -- Auto-timestamp on insert
);

CREATE INDEX IF NOT EXISTS idx_messages_author ON messages(author);
CREATE INDEX IF NOT EXISTS idx_messages_type ON messages(message_type);
CREATE INDEX IF NOT EXISTS idx_messages_resolved ON messages(resolved);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);

-- =============================================================================
-- REFERENCE TABLES (Connecting Code to Everything)
-- =============================================================================

-- Link bugs to code locations
CREATE TABLE IF NOT EXISTS bug_code_refs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bug_id TEXT NOT NULL,
    code_doc_id INTEGER NOT NULL,
    relationship TEXT NOT NULL,             -- root_cause, fix_location, affected, related
    notes TEXT,

    FOREIGN KEY (bug_id) REFERENCES bugs(id),
    FOREIGN KEY (code_doc_id) REFERENCES code_docs(id)
);

CREATE INDEX IF NOT EXISTS idx_bug_code_refs_bug ON bug_code_refs(bug_id);
CREATE INDEX IF NOT EXISTS idx_bug_code_refs_code ON bug_code_refs(code_doc_id);

-- Link changelog entries to code locations
CREATE TABLE IF NOT EXISTS changelog_code_refs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    changelog_id INTEGER NOT NULL,
    code_doc_id INTEGER NOT NULL,
    change_type TEXT NOT NULL,              -- modified, added, removed, refactored

    FOREIGN KEY (changelog_id) REFERENCES changelog(id),
    FOREIGN KEY (code_doc_id) REFERENCES code_docs(id)
);

CREATE INDEX IF NOT EXISTS idx_changelog_code_refs_log ON changelog_code_refs(changelog_id);
CREATE INDEX IF NOT EXISTS idx_changelog_code_refs_code ON changelog_code_refs(code_doc_id);

-- Link learnings to code locations
CREATE TABLE IF NOT EXISTS learning_code_refs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    learning_id INTEGER NOT NULL,
    code_doc_id INTEGER NOT NULL,

    FOREIGN KEY (learning_id) REFERENCES learnings(id),
    FOREIGN KEY (code_doc_id) REFERENCES code_docs(id)
);

CREATE INDEX IF NOT EXISTS idx_learning_code_refs_learning ON learning_code_refs(learning_id);
CREATE INDEX IF NOT EXISTS idx_learning_code_refs_code ON learning_code_refs(code_doc_id);

-- Track function call relationships (dependency tree)
CREATE TABLE IF NOT EXISTS code_calls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    caller_id INTEGER NOT NULL,             -- code_doc that makes the call
    callee_id INTEGER,                      -- code_doc being called (NULL if external)
    callee_name TEXT NOT NULL,              -- function name being called
    call_type TEXT DEFAULT 'direct',        -- direct, hook, callback, import
    line_number INTEGER,                    -- where the call happens
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (caller_id) REFERENCES code_docs(id),
    FOREIGN KEY (callee_id) REFERENCES code_docs(id)
);

CREATE INDEX IF NOT EXISTS idx_code_calls_caller ON code_calls(caller_id);
CREATE INDEX IF NOT EXISTS idx_code_calls_callee ON code_calls(callee_id);
CREATE INDEX IF NOT EXISTS idx_code_calls_name ON code_calls(callee_name);
