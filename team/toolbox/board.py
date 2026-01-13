"""
Board Class - Agent interface for team coordination.

Usage:
    from toolbox.board import Board

    board = Board("Fizz")
    board.post_status("Working on BUG-026")
    bug_id = board.file_bug("Toast broken", area="ui-primitives", priority="high")
"""

from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
import json

from .storage import get_connection
from .session import WorkSession, create_work_session
from .constants import VALID_AUTHORS, VALID_AREAS, VALID_PRIORITIES, VALID_LEARNING_CATEGORIES


@dataclass
class Message:
    """A board message."""
    id: int
    author: str
    message_type: str
    content: str
    created_at: str
    resolved: bool
    mentions: Optional[List[str]] = None
    routed_to: Optional[str] = None
    routed_id: Optional[str] = None


class BoardError(Exception):
    """Board operation failed."""
    pass


class Board:
    """
    Agent interface for team coordination board.

    Each agent instantiates with their identity:
        board = Board("Fizz")

    All writes are transactional. All reads limited to 50 rows by default.
    """

    DEFAULT_LIMIT = 50
    DELETE_WINDOW_HOURS = 1

    def __init__(self, author: str):
        """
        Initialize board interface for an agent.

        Args:
            author: Agent name (Queen, Fizz, Buzz, Pazz, Rizz)
        """
        if author not in VALID_AUTHORS:
            raise BoardError(f"Invalid author '{author}'. Must be one of: {', '.join(VALID_AUTHORS)}")
        self.author = author

    # =========================================================================
    # COMMUNICATION METHODS (stay in messages table only)
    # =========================================================================

    def post_status(self, content: str) -> int:
        """
        Post a status update.

        Args:
            content: Status message

        Returns:
            Message ID
        """
        return self._post("status", content)

    def post_assignment(self, content: str, mentions: List[str]) -> int:
        """
        Assign work to another agent.

        Args:
            content: Assignment description
            mentions: List of agents to notify (e.g., ["@Fizz", "@Buzz"])

        Returns:
            Message ID
        """
        if not mentions:
            raise BoardError("Assignments require at least one mention")
        return self._post("assignment", content, mentions=mentions)

    def post_question(self, content: str, mentions: Optional[List[str]] = None) -> int:
        """
        Ask a question.

        Args:
            content: Question text
            mentions: Optional list of agents to notify

        Returns:
            Message ID
        """
        return self._post("question", content, mentions=mentions)

    def post_answer(self, content: str, reply_to: Optional[int] = None) -> int:
        """
        Answer a question.

        Args:
            content: Answer text
            reply_to: Optional message ID being answered

        Returns:
            Message ID
        """
        refs = {"reply_to": reply_to} if reply_to else None
        return self._post("answer", content, refs=refs)

    def post_blocker(self, content: str) -> int:
        """
        Report being blocked on something.

        Args:
            content: What's blocking you

        Returns:
            Message ID
        """
        return self._post("blocker", content)

    def post_announcement(self, content: str) -> int:
        """
        Post a general announcement.

        Args:
            content: Announcement text

        Returns:
            Message ID
        """
        return self._post("announcement", content)

    def post_approval(self, content: str, reply_to: Optional[int] = None) -> int:
        """
        Approve something (bug fix, PR, etc).

        Args:
            content: Approval message
            reply_to: Optional message ID being approved

        Returns:
            Message ID
        """
        refs = {"reply_to": reply_to} if reply_to else None
        return self._post("approval", content, refs=refs)

    def post_review_request(self, content: str, mentions: Optional[List[str]] = None) -> int:
        """
        Request a review.

        Args:
            content: What needs review
            mentions: Optional list of reviewers

        Returns:
            Message ID
        """
        return self._post("review_request", content, mentions=mentions)

    # =========================================================================
    # WORK SESSION (enforced workflow)
    # =========================================================================

    def start_work(self, bug_id: str) -> WorkSession:
        """
        Start a work session on a bug. Enforces the full workflow.

        This method:
        1. Claims the bug (marks as in_progress)
        2. Loads all relevant context (code docs, learnings, similar bugs)
        3. Returns a WorkSession for tracking work

        The WorkSession enforces:
        - Must track files touched
        - Must provide summary and root_cause on completion
        - Prompts for learning capture
        - Auto-creates changelog entry

        Args:
            bug_id: Bug ID to work on (e.g., "BUG-026")

        Returns:
            WorkSession with context loaded

        Example:
            session = board.start_work("BUG-026")

            # Context is automatically surfaced
            print(session.context.summary())

            # Track files during work
            session.touch_file("src/components/Toast.tsx")
            session.add_note("Found the issue - missing handler")

            # Complete with enforcement
            session.complete(
                summary="Added onClick handler",
                root_cause="Handler was never attached"
            )

            # Log learning (linked to bug)
            session.log_learning("Always attach handlers in useEffect")

            # Request QA review
            session.request_review()
        """
        return create_work_session(self.author, bug_id)

    # =========================================================================
    # ROUTABLE METHODS (auto-forward to target tables)
    # =========================================================================

    def file_bug(
        self,
        title: str,
        area: str,
        priority: str,
        description: Optional[str] = None,
        expected_behavior: Optional[str] = None,
        acceptance_criteria: Optional[List[str]] = None,
    ) -> str:
        """
        File a bug. Auto-routes to bugs table.

        Args:
            title: Short bug title
            area: Code area (workbook, conversation, tools, etc.)
            priority: low, medium, high, critical
            description: Detailed description
            expected_behavior: What should happen
            acceptance_criteria: List of testable criteria

        Returns:
            Bug ID (e.g., "BUG-171")
        """
        # Validate required fields
        if area not in VALID_AREAS:
            raise BoardError(f"Invalid area '{area}'. Must be one of: {', '.join(VALID_AREAS)}")
        if priority not in VALID_PRIORITIES:
            raise BoardError(f"Invalid priority '{priority}'. Must be one of: {', '.join(VALID_PRIORITIES)}")

        conn = get_connection()
        conn.execute("PRAGMA journal_mode=WAL")

        try:
            conn.execute("BEGIN")

            # Insert message
            cursor = conn.execute(
                """
                INSERT INTO messages (author, message_type, content, data, created_at)
                VALUES (?, 'bug', ?, ?, datetime('now'))
                """,
                (
                    self.author,
                    title,
                    json.dumps({"area": area, "priority": priority}),
                )
            )
            msg_id = cursor.lastrowid
            bug_id = f"BUG-{msg_id}"

            # Insert into bugs table
            conn.execute(
                """
                INSERT INTO bugs (id, title, area, priority, status, description,
                                  expected_behavior, acceptance_criteria, found_by, created_at)
                VALUES (?, ?, ?, ?, 'open', ?, ?, ?, ?, datetime('now'))
                """,
                (
                    bug_id,
                    title,
                    area,
                    priority,
                    description,
                    expected_behavior,
                    json.dumps(acceptance_criteria) if acceptance_criteria else None,
                    self.author,
                )
            )

            # Update message with routing info
            conn.execute(
                "UPDATE messages SET routed_to = 'bugs', routed_id = ? WHERE id = ?",
                (bug_id, msg_id)
            )

            conn.execute("COMMIT")
            return bug_id

        except Exception as e:
            conn.execute("ROLLBACK")
            raise BoardError(f"Failed to file bug: {e}")
        finally:
            conn.close()

    def log_learning(
        self,
        learning: str,
        category: str,
        context: Optional[str] = None,
        related_bug_id: Optional[str] = None,
    ) -> int:
        """
        Log a learning. Auto-routes to learnings table.

        Args:
            learning: What was learned
            category: Category (general, workbook, database, etc.)
            context: Where/when discovered
            related_bug_id: Optional related bug ID

        Returns:
            Learning ID
        """
        if category not in VALID_LEARNING_CATEGORIES:
            raise BoardError(f"Invalid category '{category}'. Must be one of: {', '.join(VALID_LEARNING_CATEGORIES)}")

        conn = get_connection()
        conn.execute("PRAGMA journal_mode=WAL")

        try:
            conn.execute("BEGIN")

            # Insert message
            cursor = conn.execute(
                """
                INSERT INTO messages (author, message_type, content, data, created_at)
                VALUES (?, 'learning', ?, ?, datetime('now'))
                """,
                (
                    self.author,
                    learning,
                    json.dumps({"category": category}),
                )
            )
            msg_id = cursor.lastrowid

            # Insert into learnings table
            cursor = conn.execute(
                """
                INSERT INTO learnings (category, learning, context, related_bug_id, created_at)
                VALUES (?, ?, ?, ?, datetime('now'))
                """,
                (category, learning, context, related_bug_id)
            )
            learning_id = cursor.lastrowid

            # Update message with routing info
            conn.execute(
                "UPDATE messages SET routed_to = 'learnings', routed_id = ? WHERE id = ?",
                (str(learning_id), msg_id)
            )

            conn.execute("COMMIT")
            return learning_id

        except Exception as e:
            conn.execute("ROLLBACK")
            raise BoardError(f"Failed to log learning: {e}")
        finally:
            conn.close()

    def log_decision(
        self,
        decision: str,
        rationale: str,
        area: Optional[str] = None,
        alternatives: Optional[List[str]] = None,
    ) -> int:
        """
        Log a decision. Auto-routes to decisions table.

        Args:
            decision: What was decided
            rationale: Why this decision was made
            area: Optional related area
            alternatives: Optional list of alternatives considered

        Returns:
            Decision ID
        """
        if area and area not in VALID_AREAS:
            raise BoardError(f"Invalid area '{area}'. Must be one of: {', '.join(VALID_AREAS)}")

        conn = get_connection()
        conn.execute("PRAGMA journal_mode=WAL")

        try:
            conn.execute("BEGIN")

            # Insert message
            cursor = conn.execute(
                """
                INSERT INTO messages (author, message_type, content, data, created_at)
                VALUES (?, 'decision', ?, ?, datetime('now'))
                """,
                (
                    self.author,
                    decision,
                    json.dumps({"rationale": rationale}),
                )
            )
            msg_id = cursor.lastrowid

            # Insert into decisions table
            cursor = conn.execute(
                """
                INSERT INTO decisions (date, decision, rationale, alternatives_considered,
                                       related_area, created_at)
                VALUES (date('now'), ?, ?, ?, ?, datetime('now'))
                """,
                (
                    decision,
                    rationale,
                    json.dumps(alternatives) if alternatives else None,
                    area,
                )
            )
            decision_id = cursor.lastrowid

            # Update message with routing info
            conn.execute(
                "UPDATE messages SET routed_to = 'decisions', routed_id = ? WHERE id = ?",
                (str(decision_id), msg_id)
            )

            conn.execute("COMMIT")
            return decision_id

        except Exception as e:
            conn.execute("ROLLBACK")
            raise BoardError(f"Failed to log decision: {e}")
        finally:
            conn.close()

    # =========================================================================
    # READ METHODS (limited to 50 rows by default)
    # =========================================================================

    def get_recent(self, limit: int = DEFAULT_LIMIT) -> List[Message]:
        """
        Get recent messages.

        Args:
            limit: Max messages to return (default 50)

        Returns:
            List of Message objects, newest first
        """
        limit = min(limit, self.DEFAULT_LIMIT)  # Cap at 50
        conn = get_connection()
        try:
            rows = conn.execute(
                """
                SELECT id, author, message_type, content, created_at, resolved,
                       mentions, routed_to, routed_id
                FROM messages
                ORDER BY created_at DESC
                LIMIT ?
                """,
                (limit,)
            ).fetchall()
            return [self._row_to_message(row) for row in rows]
        finally:
            conn.close()

    def get_my_assignments(self) -> List[Message]:
        """
        Get unresolved assignments mentioning this agent.

        Returns:
            List of Message objects
        """
        mention = f"@{self.author}"
        conn = get_connection()
        try:
            rows = conn.execute(
                """
                SELECT id, author, message_type, content, created_at, resolved,
                       mentions, routed_to, routed_id
                FROM messages
                WHERE message_type = 'assignment'
                  AND resolved = 0
                  AND mentions LIKE ?
                ORDER BY created_at DESC
                LIMIT ?
                """,
                (f'%{mention}%', self.DEFAULT_LIMIT)
            ).fetchall()
            return [self._row_to_message(row) for row in rows]
        finally:
            conn.close()

    def get_open_questions(self) -> List[Message]:
        """
        Get unresolved questions.

        Returns:
            List of Message objects
        """
        conn = get_connection()
        try:
            rows = conn.execute(
                """
                SELECT id, author, message_type, content, created_at, resolved,
                       mentions, routed_to, routed_id
                FROM messages
                WHERE message_type = 'question'
                  AND resolved = 0
                ORDER BY created_at DESC
                LIMIT ?
                """,
                (self.DEFAULT_LIMIT,)
            ).fetchall()
            return [self._row_to_message(row) for row in rows]
        finally:
            conn.close()

    def get_by_type(self, message_type: str, resolved: Optional[bool] = None) -> List[Message]:
        """
        Get messages by type.

        Args:
            message_type: Type to filter by
            resolved: Optional filter for resolved status

        Returns:
            List of Message objects
        """
        conn = get_connection()
        try:
            if resolved is None:
                rows = conn.execute(
                    """
                    SELECT id, author, message_type, content, created_at, resolved,
                           mentions, routed_to, routed_id
                    FROM messages
                    WHERE message_type = ?
                    ORDER BY created_at DESC
                    LIMIT ?
                    """,
                    (message_type, self.DEFAULT_LIMIT)
                ).fetchall()
            else:
                rows = conn.execute(
                    """
                    SELECT id, author, message_type, content, created_at, resolved,
                           mentions, routed_to, routed_id
                    FROM messages
                    WHERE message_type = ?
                      AND resolved = ?
                    ORDER BY created_at DESC
                    LIMIT ?
                    """,
                    (message_type, 1 if resolved else 0, self.DEFAULT_LIMIT)
                ).fetchall()
            return [self._row_to_message(row) for row in rows]
        finally:
            conn.close()

    # =========================================================================
    # MANAGEMENT METHODS
    # =========================================================================

    def resolve(self, msg_id: int) -> bool:
        """
        Mark a message as resolved.

        Args:
            msg_id: Message ID to resolve

        Returns:
            True if resolved, False if not found
        """
        conn = get_connection()
        try:
            result = conn.execute(
                "UPDATE messages SET resolved = 1 WHERE id = ?",
                (msg_id,)
            )
            conn.commit()
            return result.rowcount > 0
        finally:
            conn.close()

    def delete(self, msg_id: int) -> bool:
        """
        Delete own message if less than 1 hour old.

        Args:
            msg_id: Message ID to delete

        Returns:
            True if deleted

        Raises:
            BoardError: If not authorized or too old
        """
        conn = get_connection()
        try:
            # Check ownership and age
            row = conn.execute(
                "SELECT author, created_at FROM messages WHERE id = ?",
                (msg_id,)
            ).fetchone()

            if not row:
                raise BoardError(f"Message {msg_id} not found")

            if row[0] != self.author:
                raise BoardError(f"Can only delete your own messages (this is {row[0]}'s)")

            created = datetime.fromisoformat(row[1])
            if datetime.now() - created > timedelta(hours=self.DELETE_WINDOW_HOURS):
                raise BoardError(f"Can only delete messages less than {self.DELETE_WINDOW_HOURS} hour old")

            conn.execute("DELETE FROM messages WHERE id = ?", (msg_id,))
            conn.commit()
            return True
        finally:
            conn.close()

    # =========================================================================
    # PRIVATE HELPERS
    # =========================================================================

    def _post(
        self,
        message_type: str,
        content: str,
        mentions: Optional[List[str]] = None,
        refs: Optional[Dict[str, Any]] = None,
    ) -> int:
        """Internal method to post a non-routable message."""
        # ENFORCEMENT: Detect completion claims without proper workflow
        self._check_completion_claim(content)

        conn = get_connection()
        conn.execute("PRAGMA journal_mode=WAL")

        try:
            cursor = conn.execute(
                """
                INSERT INTO messages (author, message_type, content, mentions, refs, created_at)
                VALUES (?, ?, ?, ?, ?, datetime('now'))
                """,
                (
                    self.author,
                    message_type,
                    content,
                    json.dumps(mentions) if mentions else None,
                    json.dumps(refs) if refs else None,
                )
            )
            conn.commit()
            return cursor.lastrowid
        finally:
            conn.close()

    def _check_completion_claim(self, content: str) -> None:
        """
        ENFORCEMENT: Detect when someone claims to complete a bug without
        actually updating the bug status via WorkSession.

        Only triggers on explicit completion claims like:
        - "BUG-XXX is done"
        - "fixed BUG-XXX"
        - "completed BUG-XXX"

        Does NOT trigger on:
        - Technical discussion mentioning completion callbacks
        - Investigation/debugging notes

        Raises:
            BoardError: If completion claimed but bug not updated
        """
        import re

        # Only check for explicit completion claims near bug IDs
        # Pattern: completion word within 30 chars of BUG-XXX
        completion_claim_patterns = [
            r'BUG-\d+.{0,30}\b(done|fixed|resolved|completed|finished)\b',
            r'\b(done|fixed|resolved|completed|finished)\b.{0,30}BUG-\d+',
            r'BUG-\d+\s+(is\s+)?(done|fixed|resolved|completed|finished)',
        ]

        has_completion_claim = any(
            re.search(pattern, content, re.IGNORECASE)
            for pattern in completion_claim_patterns
        )

        if not has_completion_claim:
            return

        # Find bug IDs mentioned
        bug_ids = re.findall(r'BUG-\d+', content, re.IGNORECASE)
        if not bug_ids:
            return

        # Check if mentioned bugs are actually marked done/review
        conn = get_connection()
        try:
            for bug_id in bug_ids:
                row = conn.execute(
                    "SELECT status FROM bugs WHERE id = ? COLLATE NOCASE",
                    (bug_id.upper(),)
                ).fetchone()

                if row and row[0] not in ('done', 'review'):
                    raise BoardError(
                        f"WORKFLOW VIOLATION: You claim {bug_id} is complete, but its status is '{row[0]}'. "
                        f"Use board.start_work('{bug_id}') and session.complete() to properly update status, "
                        f"or use board.complete_bug('{bug_id}') if you already fixed it."
                    )
        finally:
            conn.close()

    def complete_bug(self, bug_id: str, summary: str, root_cause: str) -> None:
        """
        Mark a bug as complete (done) without full WorkSession.

        Use this when you've already fixed a bug but didn't use WorkSession.
        This is the ESCAPE HATCH - prefer using board.start_work() for new work.

        Args:
            bug_id: Bug ID (e.g., "BUG-020")
            summary: What was done to fix it
            root_cause: What caused the bug

        Raises:
            BoardError: If bug not found
        """
        conn = get_connection()
        conn.execute("PRAGMA journal_mode=WAL")

        try:
            conn.execute("BEGIN")

            # Verify bug exists
            row = conn.execute(
                "SELECT id, status FROM bugs WHERE id = ? COLLATE NOCASE",
                (bug_id.upper(),)
            ).fetchone()

            if not row:
                raise BoardError(f"Bug '{bug_id}' not found")

            # Update bug status
            conn.execute(
                """
                UPDATE bugs
                SET status = 'done',
                    owner = ?,
                    fix_applied = ?,
                    root_cause = ?,
                    updated_at = datetime('now')
                WHERE id = ? COLLATE NOCASE
                """,
                (self.author, summary, root_cause, bug_id.upper())
            )

            # Post completion message
            conn.execute(
                """
                INSERT INTO messages (author, message_type, content, created_at)
                VALUES (?, 'status', ?, datetime('now'))
                """,
                (self.author, f"{bug_id.upper()} marked DONE. Summary: {summary}")
            )

            conn.execute("COMMIT")

        except BoardError:
            conn.execute("ROLLBACK")
            raise
        except Exception as e:
            conn.execute("ROLLBACK")
            raise BoardError(f"Failed to complete bug: {e}")
        finally:
            conn.close()

    def _row_to_message(self, row: tuple) -> Message:
        """Convert a database row to a Message object."""
        return Message(
            id=row[0],
            author=row[1],
            message_type=row[2],
            content=row[3],
            created_at=row[4],
            resolved=bool(row[5]),
            mentions=json.loads(row[6]) if row[6] else None,
            routed_to=row[7],
            routed_id=row[8],
        )
