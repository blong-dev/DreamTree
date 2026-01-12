"""
Constants for the Team Knowledge Base.

These enums ensure consistent categorization across all toolbox operations.
"""

from typing import Literal

# Valid code areas - maps to team/areas/*.md
VALID_AREAS = [
    "workbook",        # Exercise delivery, WorkbookView
    "conversation",    # Chat interface, messages
    "tools",           # 15 interactive tools
    "shell",           # Layout, navigation, TOC
    "auth",            # Sessions, encryption, login
    "database",        # Schema, queries, connections
    "features",        # Dashboard, onboarding, profile
    "ui-primitives",   # Forms, feedback, icons
    "design-system",   # CSS, theming
    "api",             # API routes
    "lib",             # Shared utilities
    "types",           # TypeScript types
    "config",          # Configuration files
    "test",            # Test files
]

# Type alias for area literals
AreaType = Literal[
    "workbook", "conversation", "tools", "shell", "auth", "database",
    "features", "ui-primitives", "design-system", "api", "lib", "types",
    "config", "test"
]

# Valid symbol types for code_docs
VALID_SYMBOL_TYPES = [
    "file",            # Whole file documentation
    "function",        # Standalone function
    "component",       # React component
    "hook",            # React hook (useXxx)
    "class",           # Class definition
    "interface",       # TypeScript interface
    "type",            # TypeScript type alias
    "constant",        # Exported constant
    "export",          # Named export
    "variable",        # Module-level variable
]

SymbolType = Literal[
    "file", "function", "component", "hook", "class", "interface",
    "type", "constant", "export", "variable"
]

# Valid team member names
VALID_OWNERS = [
    "Queen Bee",       # Manager, coordination
    "Fizz",            # UI/UX
    "Buzz",            # Infrastructure
    "Pazz",            # QA
    "Rizz",            # Marketing
]

OwnerType = Literal["Queen Bee", "Fizz", "Buzz", "Pazz", "Rizz"]

# Bug statuses
VALID_BUG_STATUSES = [
    "open",            # Not started
    "in_progress",     # Worker assigned and actively working
    "review",          # Work complete, awaiting QA verification
    "done",            # Verified and closed
]

BugStatus = Literal["open", "in_progress", "review", "done"]

# Bug priorities
VALID_PRIORITIES = [
    "low",
    "medium",
    "high",
    "critical",
]

PriorityType = Literal["low", "medium", "high", "critical"]

# Task statuses
VALID_TASK_STATUSES = [
    "pending",
    "in_progress",
    "done",
]

TaskStatus = Literal["pending", "in_progress", "done"]

# Bug-code reference relationships
VALID_RELATIONSHIPS = [
    "root_cause",      # This code is where the bug originates
    "fix_location",    # This code was modified to fix the bug
    "affected",        # This code was affected by the bug
    "related",         # This code is related to the bug
]

RelationshipType = Literal["root_cause", "fix_location", "affected", "related"]

# Changelog-code reference change types
VALID_CHANGE_TYPES = [
    "modified",        # Code was changed
    "added",           # New code was added
    "removed",         # Code was deleted
    "refactored",      # Code was restructured without behavior change
]

ChangeType = Literal["modified", "added", "removed", "refactored"]

# Documentation categories
VALID_DOC_CATEGORIES = [
    "coordination",    # team/BOARD.md, team/BUGS.md, etc.
    "area",            # team/areas/*.md
    "spec",            # planning/*.md
    "project",         # CLAUDE.md, PRINCIPLES.md, etc.
]

DocCategory = Literal["coordination", "area", "spec", "project"]

# Learning categories (aligns with areas but also includes general)
VALID_LEARNING_CATEGORIES = [
    "general",         # Cross-cutting learnings
    *VALID_AREAS,      # Area-specific learnings
]

# Board message authors (short names for DB)
VALID_AUTHORS = [
    "Queen",           # Manager, coordination
    "Fizz",            # UI/UX
    "Buzz",            # Infrastructure
    "Pazz",            # QA
    "Rizz",            # Marketing
]

AuthorType = Literal["Queen", "Fizz", "Buzz", "Pazz", "Rizz"]

# Board message types
VALID_MESSAGE_TYPES = [
    "assignment",      # Task delegation: "@Fizz please fix BUG-026"
    "question",        # Asking for input: "Should we use X or Y?"
    "answer",          # Response to question
    "status",          # Progress update: "BUG-026 fix complete"
    "blocker",         # Blocked on something: "Need DB access"
    "announcement",    # General info: "New pattern for..."
    "review_request",  # Asking for review: "Please review PR #123"
    "approval",        # Approving something: "Looks good"
    "correction",      # Fixing a previous message (append-only)
]

MessageType = Literal[
    "assignment", "question", "answer", "status", "blocker",
    "announcement", "review_request", "approval", "correction"
]

# Function call types for code_calls table
VALID_CALL_TYPES = [
    "direct",          # Direct function call: foo()
    "hook",            # React hook call: useEffect(), useState()
    "method",          # Method call: obj.method()
    "callback",        # Callback invocation: callback()
    "import",          # Imported function usage
    "internal",        # Call to function defined in same scope
]

CallType = Literal["direct", "hook", "method", "callback", "import", "internal"]

# Nested symbol types (for sub-functions)
VALID_NESTED_TYPES = [
    "callback",        # useCallback, useMemo wrapped
    "arrow",           # Arrow function: const x = () => {}
    "function",        # Function expression: const x = function() {}
    "handler",         # Event handler: onX = () => {}, handleX = () => {}
]

NestedType = Literal["callback", "arrow", "function", "handler"]

# Database file path (relative to team/)
DB_FILENAME = "team.db"
SCHEMA_FILENAME = "schema.sql"
