"""
WorkSession - Enforced workflow for bug fixing and feature work.

This module ensures agents follow the process by:
1. Surfacing all relevant context before work starts
2. Tracking what files are touched during work
3. Gating completion on required fields
4. Prompting for learnings capture

Usage:
    from toolbox.board import Board

    board = Board("Fizz")
    session = board.start_work("BUG-026")

    # Context is automatically surfaced
    print(session.context.code_docs)
    print(session.context.learnings)
    print(session.context.similar_bugs)

    # Track work
    session.touch_file("src/components/Toast.tsx")
    session.add_note("Root cause found: missing handler")

    # Complete with enforcement
    session.complete(
        summary="Fixed toast dismiss",
        root_cause="Event handler not attached"
    )

    # Capture learning (can't skip)
    session.log_learning("Always attach handlers in useEffect")
"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Optional, Dict, Any
from fnmatch import fnmatch
import json

from .storage import get_connection
from .constants import VALID_AREAS, VALID_LEARNING_CATEGORIES


# =============================================================================
# PROTECTED PATHS (Test Immutability)
# =============================================================================

# Files matching these patterns CANNOT be modified during bug fixes.
# Test changes require separate approval from user.
PROTECTED_PATHS = [
    "QA/*",
    "QA/**/*",
    "**/*.spec.ts",
    "**/*.test.ts",
    "**/*.spec.tsx",
    "**/*.test.tsx",
    "**/test/**",
    "**/tests/**",
    "**/__tests__/**",
]


def is_protected_path(file_path: str) -> bool:
    """
    Check if a file path is protected (test file).

    Protected files cannot be modified during bug fixes.
    Test changes require separate approval workflow.

    Args:
        file_path: Path to check

    Returns:
        True if file is protected
    """
    # Normalize path separators
    normalized = file_path.replace("\\", "/").lower()

    # Direct pattern checks
    for pattern in PROTECTED_PATHS:
        if fnmatch(normalized, pattern.lower()):
            return True

    # Check for QA/ prefix
    if normalized.startswith("qa/"):
        return True

    # Check for test directories anywhere in path
    path_parts = normalized.split("/")
    test_dirs = {"test", "tests", "__tests__", "e2e", "spec"}
    if any(part in test_dirs for part in path_parts):
        return True

    # Check for test file extensions
    if any(normalized.endswith(ext) for ext in [".spec.ts", ".test.ts", ".spec.tsx", ".test.tsx"]):
        return True

    return False


# =============================================================================
# DATA STRUCTURES
# =============================================================================

@dataclass
class CodeDoc:
    """A code documentation entry."""
    id: int
    file_path: str
    symbol_name: Optional[str]
    symbol_type: str
    purpose: str
    area: str
    line_start: Optional[int] = None
    line_end: Optional[int] = None


@dataclass
class Bug:
    """A bug entry."""
    id: str
    title: str
    status: str
    priority: str
    area: Optional[str]
    description: Optional[str]
    expected_behavior: Optional[str]
    root_cause: Optional[str]
    fix_applied: Optional[str]
    files_changed: Optional[List[str]]
    acceptance_criteria: Optional[List[str]]


@dataclass
class Learning:
    """A learning entry."""
    id: int
    category: str
    learning: str
    context: Optional[str]
    related_bug_id: Optional[str]


@dataclass
class Decision:
    """A decision entry."""
    id: int
    date: str
    decision: str
    rationale: str
    related_area: Optional[str]


@dataclass
class WorkContext:
    """
    All relevant context for working on a bug.
    Automatically surfaced when starting work.
    """
    bug: Bug
    code_docs: List[CodeDoc] = field(default_factory=list)
    learnings: List[Learning] = field(default_factory=list)
    similar_bugs: List[Bug] = field(default_factory=list)
    decisions: List[Decision] = field(default_factory=list)

    def summary(self) -> str:
        """Human-readable summary of context."""
        lines = [
            f"=== WORK CONTEXT FOR {self.bug.id} ===",
            f"",
            f"BUG: {self.bug.title}",
            f"Area: {self.bug.area}",
            f"Priority: {self.bug.priority}",
            f"",
        ]

        if self.bug.description:
            lines.append(f"Description: {self.bug.description}")
            lines.append("")

        if self.bug.acceptance_criteria:
            lines.append("Acceptance Criteria:")
            for criterion in self.bug.acceptance_criteria:
                lines.append(f"  - {criterion}")
            lines.append("")

        if self.code_docs:
            lines.append(f"RELATED CODE ({len(self.code_docs)} items):")
            for doc in self.code_docs[:10]:  # Limit display
                symbol = f"::{doc.symbol_name}" if doc.symbol_name else ""
                lines.append(f"  - {doc.file_path}{symbol} ({doc.symbol_type})")
                lines.append(f"    {doc.purpose[:80]}...")
            lines.append("")

        if self.learnings:
            lines.append(f"RELEVANT LEARNINGS ({len(self.learnings)} items):")
            for learn in self.learnings[:5]:
                lines.append(f"  - [{learn.category}] {learn.learning}")
            lines.append("")

        if self.similar_bugs:
            lines.append(f"REFERENCE ONLY - COMPLETED BUGS FOR CONTEXT ({len(self.similar_bugs)} items):")
            lines.append("  (Do NOT work on these - they are already done. Use for patterns/learnings.)")
            for bug in self.similar_bugs[:5]:
                lines.append(f"  - {bug.id} (DONE): {bug.title}")
                if bug.root_cause:
                    lines.append(f"    Root cause: {bug.root_cause[:60]}...")
                if bug.fix_applied:
                    lines.append(f"    Fix: {bug.fix_applied[:60]}...")
            lines.append("")

        if self.decisions:
            lines.append(f"RELATED DECISIONS ({len(self.decisions)} items):")
            for dec in self.decisions[:5]:
                lines.append(f"  - {dec.decision}")
                lines.append(f"    Rationale: {dec.rationale[:60]}...")
            lines.append("")

        return "\n".join(lines)


# =============================================================================
# EXCEPTIONS
# =============================================================================

class SessionError(Exception):
    """Work session operation failed."""
    pass


class SessionNotStartedError(SessionError):
    """Attempted operation on unstarted session."""
    pass


class SessionAlreadyCompleteError(SessionError):
    """Attempted operation on completed session."""
    pass


class CompletionGateError(SessionError):
    """Completion requirements not met."""
    pass


# =============================================================================
# WORK SESSION
# =============================================================================

class WorkSession:
    """
    Enforced workflow for working on a bug.

    Lifecycle:
        1. Created via Board.start_work(bug_id)
        2. Context automatically surfaced
        3. Track files touched and notes during work
        4. Complete with required fields
        5. Log learnings (enforced)

    Enforcement:
        - Can't complete without summary and root_cause
        - Can't complete without touching at least one file
        - Learning prompt after completion
        - All actions logged to messages table
    """

    def __init__(self, author: str, bug_id: str):
        """
        Initialize a work session. Use Board.start_work() instead.
        """
        self.author = author
        self.bug_id = bug_id
        self.started_at = datetime.now()
        self.completed_at: Optional[datetime] = None
        self.context: Optional[WorkContext] = None

        # Track work in progress
        self._files_touched: List[str] = []
        self._notes: List[str] = []
        self._learning_logged: bool = False
        self._review_requested: bool = False

    @property
    def is_complete(self) -> bool:
        return self.completed_at is not None

    @property
    def files_touched(self) -> List[str]:
        return self._files_touched.copy()

    @property
    def notes(self) -> List[str]:
        return self._notes.copy()

    # =========================================================================
    # CONTEXT SURFACING
    # =========================================================================

    def _load_context(self) -> WorkContext:
        """Load all relevant context for this bug."""
        conn = get_connection()
        try:
            # 1. Get bug details
            bug = self._load_bug(conn)

            # 2. Get code docs for this area
            code_docs = self._load_code_docs(conn, bug.area) if bug.area else []

            # 3. Get learnings for this area
            learnings = self._load_learnings(conn, bug.area) if bug.area else []

            # 4. Get similar bugs (same area, completed)
            similar_bugs = self._load_similar_bugs(conn, bug.area) if bug.area else []

            # 5. Get decisions for this area
            decisions = self._load_decisions(conn, bug.area) if bug.area else []

            return WorkContext(
                bug=bug,
                code_docs=code_docs,
                learnings=learnings,
                similar_bugs=similar_bugs,
                decisions=decisions,
            )
        finally:
            conn.close()

    def _load_bug(self, conn) -> Bug:
        """Load bug details."""
        row = conn.execute(
            """
            SELECT id, title, status, priority, area, description,
                   expected_behavior, root_cause, fix_applied,
                   files_changed, acceptance_criteria
            FROM bugs WHERE id = ?
            """,
            (self.bug_id,)
        ).fetchone()

        if not row:
            raise SessionError(f"Bug {self.bug_id} not found")

        return Bug(
            id=row[0],
            title=row[1],
            status=row[2],
            priority=row[3],
            area=row[4],
            description=row[5],
            expected_behavior=row[6],
            root_cause=row[7],
            fix_applied=row[8],
            files_changed=json.loads(row[9]) if row[9] else None,
            acceptance_criteria=json.loads(row[10]) if row[10] else None,
        )

    def _load_code_docs(self, conn, area: str) -> List[CodeDoc]:
        """Load code docs for this area."""
        rows = conn.execute(
            """
            SELECT id, file_path, symbol_name, symbol_type, purpose, area,
                   line_start, line_end
            FROM code_docs
            WHERE area = ?
            ORDER BY file_path, line_start
            LIMIT 50
            """,
            (area,)
        ).fetchall()

        return [
            CodeDoc(
                id=r[0], file_path=r[1], symbol_name=r[2], symbol_type=r[3],
                purpose=r[4], area=r[5], line_start=r[6], line_end=r[7]
            )
            for r in rows
        ]

    def _load_learnings(self, conn, area: str) -> List[Learning]:
        """Load learnings for this area."""
        rows = conn.execute(
            """
            SELECT id, category, learning, context, related_bug_id
            FROM learnings
            WHERE category = ? OR category = 'general'
            ORDER BY created_at DESC
            LIMIT 20
            """,
            (area,)
        ).fetchall()

        return [
            Learning(
                id=r[0], category=r[1], learning=r[2],
                context=r[3], related_bug_id=r[4]
            )
            for r in rows
        ]

    def _load_similar_bugs(self, conn, area: str) -> List[Bug]:
        """Load similar completed bugs."""
        rows = conn.execute(
            """
            SELECT id, title, status, priority, area, description,
                   expected_behavior, root_cause, fix_applied,
                   files_changed, acceptance_criteria
            FROM bugs
            WHERE area = ? AND status = 'done'
            ORDER BY updated_at DESC
            LIMIT 10
            """,
            (area,)
        ).fetchall()

        return [
            Bug(
                id=r[0], title=r[1], status=r[2], priority=r[3], area=r[4],
                description=r[5], expected_behavior=r[6], root_cause=r[7],
                fix_applied=r[8],
                files_changed=json.loads(r[9]) if r[9] else None,
                acceptance_criteria=json.loads(r[10]) if r[10] else None,
            )
            for r in rows
        ]

    def _load_decisions(self, conn, area: str) -> List[Decision]:
        """Load decisions for this area."""
        rows = conn.execute(
            """
            SELECT id, date, decision, rationale, related_area
            FROM decisions
            WHERE related_area = ? OR related_area IS NULL
            ORDER BY created_at DESC
            LIMIT 10
            """,
            (area,)
        ).fetchall()

        return [
            Decision(
                id=r[0], date=r[1], decision=r[2],
                rationale=r[3], related_area=r[4]
            )
            for r in rows
        ]

    # =========================================================================
    # WORK TRACKING
    # =========================================================================

    def touch_file(self, file_path: str) -> None:
        """
        Record that a file was touched during this work session.

        Args:
            file_path: Path to the file being modified

        Raises:
            SessionError: If file is a protected test file
            SessionAlreadyCompleteError: If session is already complete
        """
        if self.is_complete:
            raise SessionAlreadyCompleteError("Cannot touch files after completion")

        # Check for protected test files
        if is_protected_path(file_path):
            raise SessionError(
                f"Cannot modify test file '{file_path}' during bug fix. "
                f"Test changes require separate approval from user. "
                f"Fix the code, not the tests."
            )

        if file_path not in self._files_touched:
            self._files_touched.append(file_path)

    def add_note(self, note: str) -> None:
        """
        Add a note during work (for context/debugging).

        Args:
            note: Note to record
        """
        if self.is_complete:
            raise SessionAlreadyCompleteError("Cannot add notes after completion")

        self._notes.append(note)

    # =========================================================================
    # COMPLETION GATES
    # =========================================================================

    def complete(
        self,
        summary: str,
        root_cause: str,
        files_changed: Optional[List[str]] = None,
    ) -> None:
        """
        Complete the work session. Enforces requirements.

        Args:
            summary: What was done to fix the bug
            root_cause: What caused the bug
            files_changed: Files that were modified (defaults to touched files)

        Raises:
            CompletionGateError: If requirements not met
        """
        if self.is_complete:
            raise SessionAlreadyCompleteError("Session already completed")

        # Gate 1: Summary required
        if not summary or not summary.strip():
            raise CompletionGateError("Summary is required")

        # Gate 2: Root cause required
        if not root_cause or not root_cause.strip():
            raise CompletionGateError("Root cause is required")

        # Gate 3: Files must be tracked
        final_files = files_changed or self._files_touched
        if not final_files:
            raise CompletionGateError(
                "No files changed. Use touch_file() during work or pass files_changed"
            )

        # Gate 4: No test files allowed (test immutability)
        for f in final_files:
            if is_protected_path(f):
                raise CompletionGateError(
                    f"Cannot complete with test file '{f}' in changes. "
                    f"Fix the code, not the tests. "
                    f"Test changes require separate approval from user."
                )

        # All gates passed - update the bug
        conn = get_connection()
        conn.execute("PRAGMA journal_mode=WAL")

        try:
            conn.execute("BEGIN")

            # Update bug record
            conn.execute(
                """
                UPDATE bugs
                SET status = 'review',
                    root_cause = ?,
                    fix_applied = ?,
                    files_changed = ?,
                    updated_at = datetime('now')
                WHERE id = ?
                """,
                (
                    root_cause,
                    summary,
                    json.dumps(final_files),
                    self.bug_id,
                )
            )

            # Log completion message
            conn.execute(
                """
                INSERT INTO messages (author, message_type, content, refs, created_at)
                VALUES (?, 'status', ?, ?, datetime('now'))
                """,
                (
                    self.author,
                    f"Completed {self.bug_id}: {summary}",
                    json.dumps({"bug_id": self.bug_id}),
                )
            )

            # Create changelog entry
            conn.execute(
                """
                INSERT INTO changelog (date, title, what_changed, what_it_was, why,
                                       files_affected, related_bug_id, created_at)
                VALUES (date('now'), ?, ?, ?, ?, ?, ?, datetime('now'))
                """,
                (
                    f"Fix {self.bug_id}: {self.context.bug.title if self.context else self.bug_id}",
                    summary,
                    root_cause,
                    f"Bug fix: {root_cause}",
                    json.dumps(final_files),
                    self.bug_id,
                )
            )

            conn.execute("COMMIT")
            self.completed_at = datetime.now()

        except Exception as e:
            conn.execute("ROLLBACK")
            raise SessionError(f"Failed to complete session: {e}")
        finally:
            conn.close()

    # =========================================================================
    # LEARNING CAPTURE
    # =========================================================================

    def log_learning(
        self,
        learning: str,
        category: Optional[str] = None,
        context: Optional[str] = None,
    ) -> int:
        """
        Log a learning discovered during this work session.
        Links the learning to the bug automatically.

        Args:
            learning: What was learned
            category: Category (defaults to bug's area)
            context: Additional context

        Returns:
            Learning ID
        """
        # Use bug's area as default category
        final_category = category or (self.context.bug.area if self.context else "general")
        if final_category not in VALID_LEARNING_CATEGORIES:
            final_category = "general"

        conn = get_connection()
        conn.execute("PRAGMA journal_mode=WAL")

        try:
            conn.execute("BEGIN")

            # Insert learning
            cursor = conn.execute(
                """
                INSERT INTO learnings (category, learning, context, related_bug_id, created_at)
                VALUES (?, ?, ?, ?, datetime('now'))
                """,
                (final_category, learning, context, self.bug_id)
            )
            learning_id = cursor.lastrowid

            # Log message
            conn.execute(
                """
                INSERT INTO messages (author, message_type, content, data,
                                      routed_to, routed_id, created_at)
                VALUES (?, 'learning', ?, ?, 'learnings', ?, datetime('now'))
                """,
                (
                    self.author,
                    learning,
                    json.dumps({"category": final_category, "bug_id": self.bug_id}),
                    str(learning_id),
                )
            )

            conn.execute("COMMIT")
            self._learning_logged = True
            return learning_id

        except Exception as e:
            conn.execute("ROLLBACK")
            raise SessionError(f"Failed to log learning: {e}")
        finally:
            conn.close()

    # =========================================================================
    # REVIEW REQUEST
    # =========================================================================

    def request_review(self, notes: Optional[str] = None) -> int:
        """
        Request QA review for this bug.

        Args:
            notes: Optional notes for reviewer

        Returns:
            Message ID
        """
        if not self.is_complete:
            raise SessionError("Cannot request review before completing work")

        content = f"Review requested for {self.bug_id}"
        if notes:
            content += f": {notes}"

        conn = get_connection()
        try:
            cursor = conn.execute(
                """
                INSERT INTO messages (author, message_type, content, mentions, refs, created_at)
                VALUES (?, 'review_request', ?, ?, ?, datetime('now'))
                """,
                (
                    self.author,
                    content,
                    json.dumps(["@Pazz"]),
                    json.dumps({"bug_id": self.bug_id}),
                )
            )
            conn.commit()
            self._review_requested = True
            return cursor.lastrowid
        finally:
            conn.close()

    # =========================================================================
    # STATUS
    # =========================================================================

    def status(self) -> Dict[str, Any]:
        """Get current session status."""
        return {
            "bug_id": self.bug_id,
            "author": self.author,
            "started_at": self.started_at.isoformat(),
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "is_complete": self.is_complete,
            "files_touched": self._files_touched,
            "notes": self._notes,
            "learning_logged": self._learning_logged,
            "review_requested": self._review_requested,
        }


# =============================================================================
# FACTORY FUNCTION (called by Board)
# =============================================================================

def create_work_session(author: str, bug_id: str) -> WorkSession:
    """
    Create and initialize a work session.
    Called by Board.start_work().

    Args:
        author: Agent name
        bug_id: Bug ID to work on

    Returns:
        Initialized WorkSession with context loaded
    """
    session = WorkSession(author, bug_id)

    # Load context
    session.context = session._load_context()

    # Mark bug as in_progress
    conn = get_connection()
    conn.execute("PRAGMA journal_mode=WAL")

    try:
        conn.execute("BEGIN")

        # Update bug status
        conn.execute(
            """
            UPDATE bugs
            SET status = 'in_progress', owner = ?, updated_at = datetime('now')
            WHERE id = ?
            """,
            (author, bug_id)
        )

        # Log start message
        conn.execute(
            """
            INSERT INTO messages (author, message_type, content, refs, created_at)
            VALUES (?, 'status', ?, ?, datetime('now'))
            """,
            (
                author,
                f"Started work on {bug_id}: {session.context.bug.title}",
                json.dumps({"bug_id": bug_id}),
            )
        )

        conn.execute("COMMIT")

    except Exception as e:
        conn.execute("ROLLBACK")
        raise SessionError(f"Failed to start session: {e}")
    finally:
        conn.close()

    return session
