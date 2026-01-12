"""
Storage functions for the Team Knowledge Base.

Provides functions to insert and query data from team.db.
All inputs are validated via Pydantic models before insertion.
"""

import sqlite3
import json
from pathlib import Path
from datetime import datetime
from typing import Optional, List, Dict, Any, Union

from .constants import DB_FILENAME, SCHEMA_FILENAME
from .schemas import (
    CodeDocInput,
    BugInput,
    ChangelogInput,
    LearningInput,
    TaskInput,
    MessageInput,
    DocsIndexInput,
    BugCodeRefInput,
    ChangelogCodeRefInput,
    CodeCallInput,
    NestedCodeDocInput,
)


def get_db_path() -> Path:
    """Get the path to team.db."""
    return Path(__file__).parent.parent / DB_FILENAME


def get_schema_path() -> Path:
    """Get the path to schema.sql."""
    return Path(__file__).parent.parent / SCHEMA_FILENAME


def get_connection() -> sqlite3.Connection:
    """Get a connection to the database."""
    db_path = get_db_path()
    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row  # Enable dict-like access
    return conn


def init_db() -> bool:
    """
    Initialize the database by running schema.sql.

    SAFE: Uses CREATE TABLE IF NOT EXISTS - will NOT destroy existing data.
    Only creates tables that don't already exist.

    Returns:
        True if initialization succeeded.
    """
    db_path = get_db_path()
    schema_path = get_schema_path()

    if not schema_path.exists():
        raise FileNotFoundError(f"Schema file not found: {schema_path}")

    # Check if database has existing data
    existing_data = False
    if db_path.exists():
        conn = get_connection()
        try:
            cursor = conn.execute("SELECT COUNT(*) FROM sqlite_master WHERE type='table'")
            table_count = cursor.fetchone()[0]
            if table_count > 0:
                cursor = conn.execute("SELECT COUNT(*) FROM code_docs")
                doc_count = cursor.fetchone()[0]
                existing_data = doc_count > 0
        except:
            pass
        finally:
            conn.close()

    schema_sql = schema_path.read_text()

    conn = get_connection()
    try:
        conn.executescript(schema_sql)
        conn.commit()
        if existing_data:
            print(f"Schema updated (existing data preserved) at {db_path}")
        else:
            print(f"Database initialized at {db_path}")
        return True
    finally:
        conn.close()


# =============================================================================
# CODE DOCS
# =============================================================================

def store_code_doc(
    file_path: str,
    symbol_name: Optional[str],
    symbol_type: str,
    line_start: Optional[int],
    line_end: Optional[int],
    purpose: str,
    why: Optional[str],
    connections: List[str],
    area: str,
    signature: Optional[str] = None,
) -> int:
    """
    Store a code documentation entry.

    Args:
        file_path: Path to the source file
        symbol_name: Function/class name, None for file-level
        symbol_type: Type of symbol (file, function, class, etc.)
        line_start: Starting line number
        line_end: Ending line number
        purpose: What the code does
        why: Design rationale (optional)
        connections: List of related code references
        area: Area that owns this code
        signature: Function signature (optional)

    Returns:
        The ID of the inserted row.
    """
    # Validate input
    doc = CodeDocInput(
        file_path=file_path,
        symbol_name=symbol_name,
        symbol_type=symbol_type,
        line_start=line_start,
        line_end=line_end,
        signature=signature,
        purpose=purpose,
        why=why,
        connections=connections,
        area=area,
    )

    conn = get_connection()
    try:
        cursor = conn.execute(
            """
            INSERT INTO code_docs (
                file_path, symbol_name, symbol_type, line_start, line_end,
                signature, purpose, why, connections, area, last_verified
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(file_path, symbol_name, line_start) DO UPDATE SET
                symbol_type = excluded.symbol_type,
                line_end = excluded.line_end,
                signature = excluded.signature,
                purpose = excluded.purpose,
                why = excluded.why,
                connections = excluded.connections,
                area = excluded.area,
                last_verified = excluded.last_verified,
                updated_at = CURRENT_TIMESTAMP
            """,
            (
                doc.file_path,
                doc.symbol_name,
                doc.symbol_type,
                doc.line_start,
                doc.line_end,
                doc.signature,
                doc.purpose,
                doc.why,
                doc.connections_json(),
                doc.area,
                datetime.now().isoformat(),
            ),
        )
        conn.commit()
        return cursor.lastrowid
    finally:
        conn.close()


def query_code_docs(
    file_path: Optional[str] = None,
    symbol_name: Optional[str] = None,
    symbol_type: Optional[str] = None,
    area: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 100,
) -> List[Dict[str, Any]]:
    """
    Query code documentation entries.

    Args:
        file_path: Filter by file path (partial match)
        symbol_name: Filter by symbol name (partial match)
        symbol_type: Filter by symbol type (exact match)
        area: Filter by area (exact match)
        search: Search in purpose and why fields
        limit: Maximum number of results

    Returns:
        List of matching code doc entries.
    """
    conditions = []
    params = []

    if file_path:
        conditions.append("file_path LIKE ?")
        params.append(f"%{file_path}%")

    if symbol_name:
        conditions.append("symbol_name LIKE ?")
        params.append(f"%{symbol_name}%")

    if symbol_type:
        conditions.append("symbol_type = ?")
        params.append(symbol_type)

    if area:
        conditions.append("area = ?")
        params.append(area)

    if search:
        conditions.append("(purpose LIKE ? OR why LIKE ?)")
        params.extend([f"%{search}%", f"%{search}%"])

    where_clause = " AND ".join(conditions) if conditions else "1=1"

    conn = get_connection()
    try:
        cursor = conn.execute(
            f"""
            SELECT * FROM code_docs
            WHERE {where_clause}
            ORDER BY file_path, line_start
            LIMIT ?
            """,
            params + [limit],
        )
        return [dict(row) for row in cursor.fetchall()]
    finally:
        conn.close()


# =============================================================================
# BUGS
# =============================================================================

def store_bug(bug: Union[BugInput, Dict[str, Any]]) -> str:
    """
    Store a bug report.

    Args:
        bug: BugInput model or dict with bug data

    Returns:
        The bug ID.
    """
    if isinstance(bug, dict):
        bug = BugInput(**bug)

    conn = get_connection()
    try:
        conn.execute(
            """
            INSERT INTO bugs (
                id, title, status, priority, area, owner, trivial,
                description, expected_behavior, root_cause, fix_applied,
                files_changed, acceptance_criteria, found_by, verified_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                title = excluded.title,
                status = excluded.status,
                priority = excluded.priority,
                area = excluded.area,
                owner = excluded.owner,
                trivial = excluded.trivial,
                description = excluded.description,
                expected_behavior = excluded.expected_behavior,
                root_cause = excluded.root_cause,
                fix_applied = excluded.fix_applied,
                files_changed = excluded.files_changed,
                acceptance_criteria = excluded.acceptance_criteria,
                found_by = excluded.found_by,
                verified_by = excluded.verified_by,
                updated_at = CURRENT_TIMESTAMP
            """,
            (
                bug.id,
                bug.title,
                bug.status,
                bug.priority,
                bug.area,
                bug.owner,
                1 if bug.trivial else 0,
                bug.description,
                bug.expected_behavior,
                bug.root_cause,
                bug.fix_applied,
                bug.files_changed_json(),
                bug.acceptance_criteria_json(),
                bug.found_by,
                bug.verified_by,
            ),
        )
        conn.commit()
        return bug.id
    finally:
        conn.close()


def query_bugs(
    bug_id: Optional[str] = None,
    status: Optional[str] = None,
    area: Optional[str] = None,
    owner: Optional[str] = None,
    priority: Optional[str] = None,
    limit: int = 100,
) -> List[Dict[str, Any]]:
    """
    Query bug reports.

    Args:
        bug_id: Filter by exact bug ID
        status: Filter by status
        area: Filter by area
        owner: Filter by owner
        priority: Filter by priority
        limit: Maximum number of results

    Returns:
        List of matching bugs.
    """
    conditions = []
    params = []

    if bug_id:
        conditions.append("id = ?")
        params.append(bug_id)

    if status:
        conditions.append("status = ?")
        params.append(status)

    if area:
        conditions.append("area = ?")
        params.append(area)

    if owner:
        conditions.append("owner = ?")
        params.append(owner)

    if priority:
        conditions.append("priority = ?")
        params.append(priority)

    where_clause = " AND ".join(conditions) if conditions else "1=1"

    conn = get_connection()
    try:
        cursor = conn.execute(
            f"""
            SELECT * FROM bugs
            WHERE {where_clause}
            ORDER BY
                CASE priority
                    WHEN 'critical' THEN 1
                    WHEN 'high' THEN 2
                    WHEN 'medium' THEN 3
                    WHEN 'low' THEN 4
                END,
                created_at DESC
            LIMIT ?
            """,
            params + [limit],
        )
        return [dict(row) for row in cursor.fetchall()]
    finally:
        conn.close()


def update_bug(
    bug_id: str,
    **updates: Any,
) -> bool:
    """
    Update a bug report.

    Args:
        bug_id: The bug ID to update
        **updates: Fields to update

    Returns:
        True if the bug was updated.
    """
    if not updates:
        return False

    # Build SET clause
    set_parts = []
    params = []
    for key, value in updates.items():
        if key in ("files_changed", "acceptance_criteria"):
            value = json.dumps(value) if isinstance(value, list) else value
        set_parts.append(f"{key} = ?")
        params.append(value)

    set_parts.append("updated_at = CURRENT_TIMESTAMP")
    set_clause = ", ".join(set_parts)

    conn = get_connection()
    try:
        cursor = conn.execute(
            f"UPDATE bugs SET {set_clause} WHERE id = ?",
            params + [bug_id],
        )
        conn.commit()
        return cursor.rowcount > 0
    finally:
        conn.close()


# =============================================================================
# CHANGELOG
# =============================================================================

def store_changelog(changelog: Union[ChangelogInput, Dict[str, Any]]) -> int:
    """
    Store a changelog entry.

    Args:
        changelog: ChangelogInput model or dict

    Returns:
        The changelog entry ID.
    """
    if isinstance(changelog, dict):
        changelog = ChangelogInput(**changelog)

    conn = get_connection()
    try:
        cursor = conn.execute(
            """
            INSERT INTO changelog (
                date, title, what_changed, what_it_was, why,
                files_affected, related_bug_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                changelog.date,
                changelog.title,
                changelog.what_changed,
                changelog.what_it_was,
                changelog.why,
                changelog.files_affected_json(),
                changelog.related_bug_id,
            ),
        )
        conn.commit()
        return cursor.lastrowid
    finally:
        conn.close()


def query_changelog(
    days: Optional[int] = None,
    file_path: Optional[str] = None,
    bug_id: Optional[str] = None,
    limit: int = 100,
) -> List[Dict[str, Any]]:
    """
    Query changelog entries.

    Args:
        days: Filter to last N days
        file_path: Filter by affected file (partial match in JSON)
        bug_id: Filter by related bug ID
        limit: Maximum number of results

    Returns:
        List of matching changelog entries.
    """
    conditions = []
    params = []

    if days:
        conditions.append("date >= date('now', ?)")
        params.append(f"-{days} days")

    if file_path:
        conditions.append("files_affected LIKE ?")
        params.append(f"%{file_path}%")

    if bug_id:
        conditions.append("related_bug_id = ?")
        params.append(bug_id)

    where_clause = " AND ".join(conditions) if conditions else "1=1"

    conn = get_connection()
    try:
        cursor = conn.execute(
            f"""
            SELECT * FROM changelog
            WHERE {where_clause}
            ORDER BY date DESC, id DESC
            LIMIT ?
            """,
            params + [limit],
        )
        return [dict(row) for row in cursor.fetchall()]
    finally:
        conn.close()


# =============================================================================
# LEARNINGS
# =============================================================================

def store_learning(learning: Union[LearningInput, Dict[str, Any]]) -> int:
    """
    Store a learning.

    Args:
        learning: LearningInput model or dict

    Returns:
        The learning ID.
    """
    if isinstance(learning, dict):
        learning = LearningInput(**learning)

    conn = get_connection()
    try:
        cursor = conn.execute(
            """
            INSERT INTO learnings (category, learning, context, related_bug_id)
            VALUES (?, ?, ?, ?)
            """,
            (
                learning.category,
                learning.learning,
                learning.context,
                learning.related_bug_id,
            ),
        )
        conn.commit()
        return cursor.lastrowid
    finally:
        conn.close()


def query_learnings(
    category: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 100,
) -> List[Dict[str, Any]]:
    """
    Query learnings.

    Args:
        category: Filter by category
        search: Search in learning text
        limit: Maximum number of results

    Returns:
        List of matching learnings.
    """
    conditions = []
    params = []

    if category:
        conditions.append("category = ?")
        params.append(category)

    if search:
        conditions.append("learning LIKE ?")
        params.append(f"%{search}%")

    where_clause = " AND ".join(conditions) if conditions else "1=1"

    conn = get_connection()
    try:
        cursor = conn.execute(
            f"""
            SELECT * FROM learnings
            WHERE {where_clause}
            ORDER BY created_at DESC
            LIMIT ?
            """,
            params + [limit],
        )
        return [dict(row) for row in cursor.fetchall()]
    finally:
        conn.close()


# =============================================================================
# REFERENCE TABLES
# =============================================================================

def link_bug_to_code(
    bug_id: str,
    code_doc_id: int,
    relationship: str,
    notes: Optional[str] = None,
) -> int:
    """Link a bug to a code documentation entry."""
    ref = BugCodeRefInput(
        bug_id=bug_id,
        code_doc_id=code_doc_id,
        relationship=relationship,
        notes=notes,
    )

    conn = get_connection()
    try:
        cursor = conn.execute(
            """
            INSERT INTO bug_code_refs (bug_id, code_doc_id, relationship, notes)
            VALUES (?, ?, ?, ?)
            """,
            (ref.bug_id, ref.code_doc_id, ref.relationship, ref.notes),
        )
        conn.commit()
        return cursor.lastrowid
    finally:
        conn.close()


def link_changelog_to_code(
    changelog_id: int,
    code_doc_id: int,
    change_type: str,
) -> int:
    """Link a changelog entry to a code documentation entry."""
    ref = ChangelogCodeRefInput(
        changelog_id=changelog_id,
        code_doc_id=code_doc_id,
        change_type=change_type,
    )

    conn = get_connection()
    try:
        cursor = conn.execute(
            """
            INSERT INTO changelog_code_refs (changelog_id, code_doc_id, change_type)
            VALUES (?, ?, ?)
            """,
            (ref.changelog_id, ref.code_doc_id, ref.change_type),
        )
        conn.commit()
        return cursor.lastrowid
    finally:
        conn.close()


def get_bugs_for_code(code_doc_id: int) -> List[Dict[str, Any]]:
    """Get all bugs linked to a code documentation entry."""
    conn = get_connection()
    try:
        cursor = conn.execute(
            """
            SELECT b.*, r.relationship, r.notes as ref_notes
            FROM bugs b
            JOIN bug_code_refs r ON b.id = r.bug_id
            WHERE r.code_doc_id = ?
            ORDER BY b.created_at DESC
            """,
            (code_doc_id,),
        )
        return [dict(row) for row in cursor.fetchall()]
    finally:
        conn.close()


def get_code_for_bug(bug_id: str) -> List[Dict[str, Any]]:
    """Get all code documentation entries linked to a bug."""
    conn = get_connection()
    try:
        cursor = conn.execute(
            """
            SELECT c.*, r.relationship, r.notes as ref_notes
            FROM code_docs c
            JOIN bug_code_refs r ON c.id = r.code_doc_id
            WHERE r.bug_id = ?
            ORDER BY c.file_path, c.line_start
            """,
            (bug_id,),
        )
        return [dict(row) for row in cursor.fetchall()]
    finally:
        conn.close()


# =============================================================================
# MESSAGES (Board System)
# =============================================================================

def store_message(
    author: str,
    message_type: str,
    content: str,
    refs: Optional[Dict[str, Any]] = None,
    mentions: Optional[List[str]] = None,
) -> int:
    """
    Store a board message (append-only).

    Args:
        author: Message author (Queen, Fizz, Buzz, Pazz, Rizz)
        message_type: Type of message (assignment, question, status, etc.)
        content: Message content
        refs: References dict (bug_id, task_id, reply_to, code_doc_id)
        mentions: List of mentioned @names

    Returns:
        The message ID (auto-timestamped on insert).
    """
    msg = MessageInput(
        author=author,
        message_type=message_type,
        content=content,
        refs=refs,
        mentions=mentions or [],
    )

    conn = get_connection()
    try:
        cursor = conn.execute(
            """
            INSERT INTO messages (author, message_type, content, refs, mentions)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                msg.author,
                msg.message_type,
                msg.content,
                msg.refs_json(),
                msg.mentions_json(),
            ),
        )
        conn.commit()
        return cursor.lastrowid
    finally:
        conn.close()


def query_messages(
    author: Optional[str] = None,
    message_type: Optional[str] = None,
    resolved: Optional[bool] = None,
    after: Optional[str] = None,
    mentions: Optional[str] = None,
    limit: int = 100,
) -> List[Dict[str, Any]]:
    """
    Query board messages.

    Args:
        author: Filter by author
        message_type: Filter by message type
        resolved: Filter by resolved status (True/False/None for all)
        after: Filter messages after this date (YYYY-MM-DD)
        mentions: Filter by mentioned @name (partial match)
        limit: Maximum number of results

    Returns:
        List of matching messages, newest first.
    """
    conditions = []
    params = []

    if author:
        conditions.append("author = ?")
        params.append(author)

    if message_type:
        conditions.append("message_type = ?")
        params.append(message_type)

    if resolved is not None:
        conditions.append("resolved = ?")
        params.append(1 if resolved else 0)

    if after:
        conditions.append("date(created_at) >= ?")
        params.append(after)

    if mentions:
        conditions.append("mentions LIKE ?")
        params.append(f"%{mentions}%")

    where_clause = " AND ".join(conditions) if conditions else "1=1"

    conn = get_connection()
    try:
        cursor = conn.execute(
            f"""
            SELECT * FROM messages
            WHERE {where_clause}
            ORDER BY created_at DESC
            LIMIT ?
            """,
            params + [limit],
        )
        return [dict(row) for row in cursor.fetchall()]
    finally:
        conn.close()


def resolve_message(message_id: int) -> bool:
    """
    Mark a message as resolved.

    Args:
        message_id: The message ID to resolve

    Returns:
        True if the message was resolved.
    """
    conn = get_connection()
    try:
        cursor = conn.execute(
            "UPDATE messages SET resolved = 1 WHERE id = ?",
            (message_id,),
        )
        conn.commit()
        return cursor.rowcount > 0
    finally:
        conn.close()


def get_open_messages(message_type: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Get all unresolved messages, optionally filtered by type.

    Args:
        message_type: Optional filter by message type

    Returns:
        List of unresolved messages, oldest first.
    """
    conditions = ["resolved = 0"]
    params = []

    if message_type:
        conditions.append("message_type = ?")
        params.append(message_type)

    where_clause = " AND ".join(conditions)

    conn = get_connection()
    try:
        cursor = conn.execute(
            f"""
            SELECT * FROM messages
            WHERE {where_clause}
            ORDER BY created_at ASC
            """,
            params,
        )
        return [dict(row) for row in cursor.fetchall()]
    finally:
        conn.close()


def render_board_md() -> str:
    """
    Render messages as markdown for human reading.

    Returns:
        Markdown-formatted board content.
    """
    conn = get_connection()
    try:
        cursor = conn.execute(
            """
            SELECT * FROM messages
            WHERE resolved = 0
            ORDER BY created_at DESC
            LIMIT 50
            """
        )
        messages = cursor.fetchall()

        lines = [
            "# Team Board",
            "",
            "_Auto-generated from team.db. Do not edit directly._",
            "",
            "---",
            "",
        ]

        for msg in messages:
            timestamp = msg["created_at"][:16] if msg["created_at"] else "?"
            msg_type = msg["message_type"].upper()
            author = msg["author"]
            content = msg["content"]
            mentions_str = ""
            if msg["mentions"]:
                try:
                    mentions = json.loads(msg["mentions"])
                    if mentions:
                        mentions_str = f" -> {', '.join(mentions)}"
                except:
                    pass

            lines.append(f"### [{msg_type}] {author}{mentions_str}")
            lines.append(f"_{timestamp}_")
            lines.append("")
            lines.append(content)
            lines.append("")
            lines.append("---")
            lines.append("")

        return "\n".join(lines)
    finally:
        conn.close()


# =============================================================================
# STATISTICS
# =============================================================================

def get_stats() -> Dict[str, Any]:
    """Get statistics about the knowledge base."""
    conn = get_connection()
    try:
        stats = {}

        # Code docs count by area
        cursor = conn.execute(
            "SELECT area, COUNT(*) as count FROM code_docs GROUP BY area"
        )
        stats["code_docs_by_area"] = {row["area"]: row["count"] for row in cursor.fetchall()}

        # Bugs count by status
        cursor = conn.execute(
            "SELECT status, COUNT(*) as count FROM bugs GROUP BY status"
        )
        stats["bugs_by_status"] = {row["status"]: row["count"] for row in cursor.fetchall()}

        # Messages count by type (unresolved only)
        cursor = conn.execute(
            "SELECT message_type, COUNT(*) as count FROM messages WHERE resolved = 0 GROUP BY message_type"
        )
        stats["open_messages_by_type"] = {row["message_type"]: row["count"] for row in cursor.fetchall()}

        # Total counts
        for table in ["code_docs", "bugs", "changelog", "learnings", "tasks", "messages"]:
            cursor = conn.execute(f"SELECT COUNT(*) as count FROM {table}")
            stats[f"total_{table}"] = cursor.fetchone()["count"]

        return stats
    finally:
        conn.close()


# =============================================================================
# CODE CALLS (Dependency Tree)
# =============================================================================

def store_nested_code_doc(
    file_path: str,
    symbol_name: str,
    symbol_type: str,
    parent_id: int,
    line_start: int,
    line_end: Optional[int] = None,
    signature: Optional[str] = None,
    purpose: str = "TODO: Document",
    area: str = "lib",
) -> int:
    """
    Store a nested function as a code_doc with parent_id.

    Args:
        file_path: Path to the source file
        symbol_name: Name of the nested function
        symbol_type: Type (callback, arrow, function, handler)
        parent_id: Code doc ID of the parent function
        line_start: Starting line number
        line_end: Ending line number
        signature: Function signature
        purpose: What the function does
        area: Area that owns this code

    Returns:
        The ID of the inserted row.
    """
    doc = NestedCodeDocInput(
        file_path=file_path,
        symbol_name=symbol_name,
        symbol_type=symbol_type,
        parent_id=parent_id,
        line_start=line_start,
        line_end=line_end,
        signature=signature,
        purpose=purpose,
        area=area,
    )

    conn = get_connection()
    try:
        cursor = conn.execute(
            """
            INSERT INTO code_docs (
                file_path, symbol_name, symbol_type, parent_id,
                line_start, line_end, signature, purpose, area,
                connections, last_verified
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(file_path, symbol_name, line_start) DO UPDATE SET
                symbol_type = excluded.symbol_type,
                parent_id = excluded.parent_id,
                line_end = excluded.line_end,
                signature = excluded.signature,
                purpose = excluded.purpose,
                area = excluded.area,
                updated_at = CURRENT_TIMESTAMP
            """,
            (
                doc.file_path,
                doc.symbol_name,
                doc.symbol_type,
                doc.parent_id,
                doc.line_start,
                doc.line_end,
                doc.signature,
                doc.purpose,
                doc.area,
                "[]",  # Empty connections
                datetime.now().isoformat(),
            ),
        )
        conn.commit()
        return cursor.lastrowid
    finally:
        conn.close()


def store_call(
    caller_id: int,
    callee_name: str,
    call_type: str = "direct",
    callee_id: Optional[int] = None,
    line_number: Optional[int] = None,
) -> int:
    """
    Store a function call relationship.

    Args:
        caller_id: Code doc ID of the calling function
        callee_name: Name of the called function
        call_type: Type of call (direct, hook, method, callback, import, internal)
        callee_id: Code doc ID of called function (None if external)
        line_number: Line where the call occurs

    Returns:
        The ID of the inserted row.
    """
    call = CodeCallInput(
        caller_id=caller_id,
        callee_id=callee_id,
        callee_name=callee_name,
        call_type=call_type,
        line_number=line_number,
    )

    conn = get_connection()
    try:
        cursor = conn.execute(
            """
            INSERT INTO code_calls (caller_id, callee_id, callee_name, call_type, line_number)
            VALUES (?, ?, ?, ?, ?)
            """,
            (call.caller_id, call.callee_id, call.callee_name, call.call_type, call.line_number),
        )
        conn.commit()
        return cursor.lastrowid
    finally:
        conn.close()


def query_calls(
    caller_id: Optional[int] = None,
    callee_id: Optional[int] = None,
    callee_name: Optional[str] = None,
    call_type: Optional[str] = None,
    limit: int = 100,
) -> List[Dict[str, Any]]:
    """
    Query function call relationships.

    Args:
        caller_id: Filter by caller code_doc ID
        callee_id: Filter by callee code_doc ID
        callee_name: Filter by callee function name (partial match)
        call_type: Filter by call type
        limit: Maximum number of results

    Returns:
        List of matching call relationships.
    """
    conditions = []
    params = []

    if caller_id:
        conditions.append("c.caller_id = ?")
        params.append(caller_id)

    if callee_id:
        conditions.append("c.callee_id = ?")
        params.append(callee_id)

    if callee_name:
        conditions.append("c.callee_name LIKE ?")
        params.append(f"%{callee_name}%")

    if call_type:
        conditions.append("c.call_type = ?")
        params.append(call_type)

    where_clause = " AND ".join(conditions) if conditions else "1=1"

    conn = get_connection()
    try:
        cursor = conn.execute(
            f"""
            SELECT
                c.*,
                caller.symbol_name as caller_name,
                caller.file_path as caller_file,
                callee.symbol_name as callee_symbol_name,
                callee.file_path as callee_file
            FROM code_calls c
            JOIN code_docs caller ON c.caller_id = caller.id
            LEFT JOIN code_docs callee ON c.callee_id = callee.id
            WHERE {where_clause}
            ORDER BY c.line_number
            LIMIT ?
            """,
            params + [limit],
        )
        return [dict(row) for row in cursor.fetchall()]
    finally:
        conn.close()


def get_calls_from(code_doc_id: int) -> List[Dict[str, Any]]:
    """
    Get all functions called by a given function.

    Args:
        code_doc_id: The code_doc ID to get calls from

    Returns:
        List of called functions with their details.
    """
    return query_calls(caller_id=code_doc_id, limit=1000)


def get_calls_to(code_doc_id: int) -> List[Dict[str, Any]]:
    """
    Get all functions that call a given function.

    Args:
        code_doc_id: The code_doc ID to find callers of

    Returns:
        List of calling functions with their details.
    """
    return query_calls(callee_id=code_doc_id, limit=1000)


def get_call_tree(
    code_doc_id: int,
    depth: int = 3,
    direction: str = "down",
) -> Dict[str, Any]:
    """
    Build a call tree from a starting function.

    Args:
        code_doc_id: Starting code_doc ID
        depth: Maximum depth to traverse
        direction: "down" for calls made, "up" for callers

    Returns:
        Nested dict representing the call tree.
    """
    conn = get_connection()
    try:
        # Get the starting node
        cursor = conn.execute(
            "SELECT * FROM code_docs WHERE id = ?",
            (code_doc_id,)
        )
        root = cursor.fetchone()
        if not root:
            return {}

        result = {
            "id": root["id"],
            "name": root["symbol_name"],
            "type": root["symbol_type"],
            "file": root["file_path"],
            "children": [],
        }

        if depth > 0:
            if direction == "down":
                # Get functions this one calls
                cursor = conn.execute(
                    """
                    SELECT c.*, d.id as doc_id, d.symbol_name, d.symbol_type, d.file_path
                    FROM code_calls c
                    LEFT JOIN code_docs d ON c.callee_id = d.id
                    WHERE c.caller_id = ?
                    ORDER BY c.line_number
                    """,
                    (code_doc_id,)
                )
            else:
                # Get functions that call this one
                cursor = conn.execute(
                    """
                    SELECT c.*, d.id as doc_id, d.symbol_name, d.symbol_type, d.file_path
                    FROM code_calls c
                    JOIN code_docs d ON c.caller_id = d.id
                    WHERE c.callee_id = ?
                    ORDER BY c.line_number
                    """,
                    (code_doc_id,)
                )

            for row in cursor.fetchall():
                child = {
                    "name": row["callee_name"] if direction == "down" else row["symbol_name"],
                    "type": row["call_type"],
                    "line": row["line_number"],
                    "external": row["doc_id"] is None if direction == "down" else False,
                }

                # Recurse if we have a code_doc for this call
                child_id = row["callee_id"] if direction == "down" else row["caller_id"]
                if child_id and depth > 1:
                    subtree = get_call_tree(child_id, depth - 1, direction)
                    if subtree.get("children"):
                        child["children"] = subtree["children"]

                result["children"].append(child)

        return result
    finally:
        conn.close()


def get_code_doc_by_name(
    symbol_name: str,
    file_path: Optional[str] = None,
) -> Optional[Dict[str, Any]]:
    """
    Look up a code_doc by symbol name.

    Args:
        symbol_name: The function/component name
        file_path: Optional file path to narrow the search

    Returns:
        The code_doc dict if found, None otherwise.
    """
    conn = get_connection()
    try:
        if file_path:
            cursor = conn.execute(
                """
                SELECT * FROM code_docs
                WHERE symbol_name = ? AND file_path LIKE ?
                LIMIT 1
                """,
                (symbol_name, f"%{file_path}%")
            )
        else:
            cursor = conn.execute(
                """
                SELECT * FROM code_docs
                WHERE symbol_name = ?
                ORDER BY
                    CASE WHEN parent_id IS NULL THEN 0 ELSE 1 END,
                    id
                LIMIT 1
                """,
                (symbol_name,)
            )
        row = cursor.fetchone()
        return dict(row) if row else None
    finally:
        conn.close()


def get_nested_functions(parent_id: int) -> List[Dict[str, Any]]:
    """
    Get all nested functions for a parent code_doc.

    Args:
        parent_id: The parent code_doc ID

    Returns:
        List of nested function code_docs.
    """
    conn = get_connection()
    try:
        cursor = conn.execute(
            """
            SELECT * FROM code_docs
            WHERE parent_id = ?
            ORDER BY line_start
            """,
            (parent_id,)
        )
        return [dict(row) for row in cursor.fetchall()]
    finally:
        conn.close()
