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


def init_db(force: bool = False) -> bool:
    """
    Initialize the database by running schema.sql.

    Args:
        force: If True, recreate tables even if they exist.

    Returns:
        True if initialization succeeded.
    """
    db_path = get_db_path()
    schema_path = get_schema_path()

    if not schema_path.exists():
        raise FileNotFoundError(f"Schema file not found: {schema_path}")

    if db_path.exists() and not force:
        print(f"Database already exists at {db_path}")
        return True

    schema_sql = schema_path.read_text()

    conn = get_connection()
    try:
        conn.executescript(schema_sql)
        conn.commit()
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

        # Total counts
        for table in ["code_docs", "bugs", "changelog", "learnings", "tasks", "messages"]:
            cursor = conn.execute(f"SELECT COUNT(*) as count FROM {table}")
            stats[f"total_{table}"] = cursor.fetchone()["count"]

        return stats
    finally:
        conn.close()
