"""
Markdown parsers for migrating historical data to the Team Knowledge Base.

Parses:
- BUGS.md → bugs table
- FIX-QUEUE.md → bugs table (IMP-* entries)
- BOARD.md / BOARD_HISTORY.md → messages table
- CLAUDE.md learnings → learnings table
- CLAUDE.md decisions → decisions table
"""

import re
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime

from .storage import (
    store_bug,
    store_changelog,
    store_learning,
    store_code_doc,
    query_code_docs,
    get_connection,
)
from .schemas import BugInput, ChangelogInput, LearningInput, MessageInput


# =============================================================================
# BUGS.MD PARSER
# =============================================================================

def parse_bugs_md(file_path: str) -> List[Dict[str, Any]]:
    """
    Parse BUGS.md and extract all bug entries.

    Returns list of dicts ready for store_bug().
    """
    content = Path(file_path).read_text(encoding="utf-8")
    bugs = []

    # Split by bug headers (### BUG-XXX or ### IMP-XXX)
    bug_pattern = r"^### ((?:BUG|IMP)-\d+):\s*(.+?)$"

    # Find all bug sections
    sections = re.split(r"(?=^### (?:BUG|IMP)-\d+:)", content, flags=re.MULTILINE)

    for section in sections:
        if not section.strip():
            continue

        # Extract bug ID and title
        header_match = re.match(bug_pattern, section, re.MULTILINE)
        if not header_match:
            continue

        bug_id = header_match.group(1)
        title = header_match.group(2).strip()

        bug = {
            "id": bug_id,
            "title": title,
            "status": "done",  # Default, will be overwritten
            "priority": "medium",
            "area": None,
            "owner": None,
            "trivial": False,
            "description": None,
            "expected_behavior": None,
            "root_cause": None,
            "fix_applied": None,
            "files_changed": [],
            "acceptance_criteria": [],
            "found_by": None,
            "verified_by": None,
        }

        # Extract fields
        bug["status"] = extract_field(section, r"\*\*Status\*\*:\s*`?([^`\n]+)`?")
        bug["priority"] = extract_field(section, r"\*\*Priority\*\*:\s*`?([^`\n]+)`?") or "medium"
        bug["area"] = extract_field(section, r"\*\*Area\*\*:\s*(\w+)")
        bug["owner"] = extract_field(section, r"\*\*(?:Assigned|Owner)\*\*:\s*(\w+(?:\s+\w+)?)")
        bug["found_by"] = extract_field(section, r"\*\*Found by\*\*:\s*(.+?)(?:\n|$)")
        bug["verified_by"] = extract_field(section, r"\*\*Verified by\*\*:\s*(.+?)(?:\n|$)")

        # Extract multi-line sections
        bug["description"] = extract_section(section, "Description")
        bug["expected_behavior"] = extract_section(section, "Expected Behavior")
        bug["root_cause"] = extract_section(section, "Root Cause Found") or extract_section(section, "Root Cause")
        bug["fix_applied"] = extract_section(section, "Fix Applied")

        # Extract files changed
        files_section = extract_section(section, "Files Changed")
        if files_section:
            # Match file paths like `src/path/file.tsx` or `src/path/file.tsx:123`
            bug["files_changed"] = re.findall(r"`([^`]+\.(?:tsx?|css|sql|md))[^`]*`", files_section)

        # Extract acceptance criteria
        criteria_section = extract_section(section, "Acceptance Criteria")
        if criteria_section:
            # Match checkbox items
            criteria = re.findall(r"- \[[ x]\]\s*(.+?)(?:\n|$)", criteria_section)
            bug["acceptance_criteria"] = criteria

        # Normalize status
        status = bug["status"].lower() if bug["status"] else "done"
        if "done" in status or "complete" in status:
            bug["status"] = "done"
        elif "progress" in status:
            bug["status"] = "in_progress"
        elif "review" in status:
            bug["status"] = "review"
        elif "invalid" in status:
            bug["status"] = "done"  # Treat invalid as closed
        else:
            bug["status"] = "open"

        # Normalize priority
        priority = bug["priority"].lower() if bug["priority"] else "medium"
        if "critical" in priority:
            bug["priority"] = "critical"
        elif "high" in priority:
            bug["priority"] = "high"
        elif "low" in priority:
            bug["priority"] = "low"
        else:
            bug["priority"] = "medium"

        # Normalize owner
        owner_map = {
            "fizz": "Fizz",
            "buzz": "Buzz",
            "pazz": "Pazz",
            "rizz": "Rizz",
            "queen": "Queen Bee",
            "queen bee": "Queen Bee",
        }
        if bug["owner"]:
            bug["owner"] = owner_map.get(bug["owner"].lower(), bug["owner"])

        bugs.append(bug)

    return bugs


def extract_field(text: str, pattern: str) -> Optional[str]:
    """Extract a single-line field value."""
    match = re.search(pattern, text, re.IGNORECASE)
    if match:
        return match.group(1).strip()
    return None


def extract_section(text: str, header: str) -> Optional[str]:
    """Extract a multi-line section after a header."""
    # Match **Header**: or **Header**:\n
    pattern = rf"\*\*{header}\*\*:?\s*\n?([\s\S]*?)(?=\n\*\*|\n---|\n###|\Z)"
    match = re.search(pattern, text, re.IGNORECASE)
    if match:
        content = match.group(1).strip()
        # Remove leading/trailing whitespace and empty lines
        lines = [line.strip() for line in content.split("\n") if line.strip()]
        return "\n".join(lines) if lines else None
    return None


def migrate_bugs(bugs_md_path: str, dry_run: bool = False) -> Tuple[int, List[str]]:
    """
    Migrate bugs from BUGS.md to the database.

    Args:
        bugs_md_path: Path to BUGS.md
        dry_run: If True, don't actually store, just return what would be stored

    Returns:
        Tuple of (count stored, list of bug IDs)
    """
    bugs = parse_bugs_md(bugs_md_path)
    stored_ids = []

    for bug in bugs:
        if dry_run:
            # Handle unicode safely for Windows console
            title = bug['title'].encode('ascii', 'replace').decode('ascii')
            print(f"Would store: {bug['id']} - {title}")
            stored_ids.append(bug["id"])
        else:
            try:
                store_bug(bug)
                stored_ids.append(bug["id"])
                print(f"Stored: {bug['id']} - {bug['title']}")
            except Exception as e:
                print(f"Error storing {bug['id']}: {e}")

    return len(stored_ids), stored_ids


# =============================================================================
# BOARD.MD PARSER
# =============================================================================

def parse_board_md(file_path: str, archived: bool = False) -> List[Dict[str, Any]]:
    """
    Parse BOARD.md and extract messages.

    Messages format:
    ### [Author] Message Title — Date
    or
    [timestamp] [author]: message

    Returns list of dicts ready for messages table.
    """
    content = Path(file_path).read_text(encoding="utf-8")
    messages = []

    # Pattern for section headers like ### [Fizz] Status Update — 2026-01-09
    section_pattern = r"^###\s*\[([^\]]+)\]\s*(.+?)(?:\s*[—-]\s*(.+?))?$"

    # Split into sections
    sections = re.split(r"(?=^### \[)", content, flags=re.MULTILINE)

    for section in sections:
        if not section.strip() or "## Messages" in section or "## Protocol" in section:
            continue

        # Try to match header
        header_match = re.match(section_pattern, section, re.MULTILINE)
        if header_match:
            author = header_match.group(1).strip()
            title = header_match.group(2).strip()
            timestamp = header_match.group(3).strip() if header_match.group(3) else ""

            # Extract content (everything after header until next section)
            content_start = header_match.end()
            message_content = section[content_start:].strip()

            # Clean up content - remove separator lines
            message_content = re.sub(r"^---+\s*$", "", message_content, flags=re.MULTILINE).strip()

            if message_content:
                messages.append({
                    "timestamp": timestamp or datetime.now().strftime("%Y-%m-%d"),
                    "author": normalize_author(author),
                    "content": f"**{title}**\n\n{message_content}" if title else message_content,
                    "tags": extract_tags(message_content),
                    "archived": archived,
                    "source_file": Path(file_path).name,
                })

    return messages


def normalize_author(author: str) -> str:
    """Normalize author name to valid owner."""
    author_map = {
        "fizz": "Fizz",
        "buzz": "Buzz",
        "pazz": "Pazz",
        "rizz": "Rizz",
        "queen bee": "Queen Bee",
        "queen": "Queen Bee",
    }
    return author_map.get(author.lower(), author)


def extract_tags(content: str) -> List[str]:
    """Extract @mentions from content."""
    return re.findall(r"@(\w+)", content)


def migrate_board(board_md_path: str, dry_run: bool = False) -> Tuple[int, List[str]]:
    """
    Migrate messages from BOARD.md to the database.
    """
    archived = "HISTORY" in board_md_path.upper()
    messages = parse_board_md(board_md_path, archived=archived)
    stored_ids = []

    conn = get_connection()
    try:
        for msg in messages:
            if dry_run:
                print(f"Would store message from {msg['author']}: {msg['content'][:50]}...")
                stored_ids.append(str(len(stored_ids) + 1))
            else:
                import json
                cursor = conn.execute(
                    """
                    INSERT INTO messages (timestamp, author, content, tags, archived, source_file)
                    VALUES (?, ?, ?, ?, ?, ?)
                    """,
                    (
                        msg["timestamp"],
                        msg["author"],
                        msg["content"],
                        json.dumps(msg["tags"]),
                        1 if msg["archived"] else 0,
                        msg["source_file"],
                    ),
                )
                stored_ids.append(str(cursor.lastrowid))
                print(f"Stored message {cursor.lastrowid} from {msg['author']}")

        if not dry_run:
            conn.commit()
    finally:
        conn.close()

    return len(stored_ids), stored_ids


# =============================================================================
# CLAUDE.MD LEARNINGS PARSER
# =============================================================================

def parse_learnings_from_claude_md(file_path: str) -> List[Dict[str, Any]]:
    """
    Parse CLAUDE.md and extract learnings from the Learnings section.

    Format:
    ## Learnings
    ### Category
    - Learning point 1
    - Learning point 2
    """
    content = Path(file_path).read_text(encoding="utf-8")
    learnings = []

    # Find the Learnings section
    learnings_match = re.search(
        r"## Learnings.*?\n([\s\S]*?)(?=\n## [A-Z]|\Z)",
        content,
        re.IGNORECASE
    )

    if not learnings_match:
        return learnings

    learnings_section = learnings_match.group(1)

    # Split by category headers (### Category)
    categories = re.split(r"(?=^### )", learnings_section, flags=re.MULTILINE)

    for category_section in categories:
        if not category_section.strip():
            continue

        # Extract category name
        cat_match = re.match(r"^### (.+?)$", category_section, re.MULTILINE)
        if not cat_match:
            continue

        category = cat_match.group(1).strip().lower()

        # Map to valid categories
        category_map = {
            "general": "general",
            "database": "database",
            "css/styling": "design-system",
            "css": "design-system",
            "styling": "design-system",
            "components": "ui-primitives",
            "workbook": "workbook",
            "auth": "auth",
            "conversation ux": "conversation",
            "conversation": "conversation",
            "board management": "general",
            "board management (queen bee)": "general",
        }
        category = category_map.get(category, "general")

        # Extract bullet points
        bullets = re.findall(r"^- (.+?)$", category_section, re.MULTILINE)

        for bullet in bullets:
            learnings.append({
                "category": category,
                "learning": bullet.strip(),
                "context": "Extracted from CLAUDE.md",
                "related_bug_id": None,
            })

    return learnings


def migrate_learnings(claude_md_path: str, dry_run: bool = False) -> Tuple[int, List[int]]:
    """
    Migrate learnings from CLAUDE.md to the database.
    """
    learnings = parse_learnings_from_claude_md(claude_md_path)
    stored_ids = []

    for learning in learnings:
        if dry_run:
            print(f"Would store [{learning['category']}]: {learning['learning'][:50]}...")
            stored_ids.append(len(stored_ids) + 1)
        else:
            try:
                learning_id = store_learning(learning)
                stored_ids.append(learning_id)
                print(f"Stored learning {learning_id}: {learning['learning'][:50]}...")
            except Exception as e:
                print(f"Error storing learning: {e}")

    return len(stored_ids), stored_ids


# =============================================================================
# DECISIONS PARSER
# =============================================================================

def parse_decisions_from_claude_md(file_path: str) -> List[Dict[str, Any]]:
    """
    Parse CLAUDE.md and extract decisions from the Decision Log section.

    Format:
    ## Decision Log
    | Date | Decision | Rationale |
    """
    content = Path(file_path).read_text(encoding="utf-8")
    decisions = []

    # Find the Decision Log section
    decision_match = re.search(
        r"## Decision Log\s*\n([\s\S]*?)(?=\n## [A-Z]|\n---|\Z)",
        content,
        re.IGNORECASE
    )

    if not decision_match:
        return decisions

    decision_section = decision_match.group(1)

    # Parse markdown table rows (skip header and separator)
    rows = re.findall(
        r"^\|\s*(\d{4}-\d{2}-\d{2})\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|$",
        decision_section,
        re.MULTILINE
    )

    for date, decision, rationale in rows:
        decisions.append({
            "date": date.strip(),
            "decision": decision.strip(),
            "rationale": rationale.strip(),
            "alternatives_considered": None,
            "related_area": None,
        })

    return decisions


def migrate_decisions(claude_md_path: str, dry_run: bool = False) -> Tuple[int, List[int]]:
    """
    Migrate decisions from CLAUDE.md to the database.
    """
    decisions = parse_decisions_from_claude_md(claude_md_path)
    stored_ids = []

    conn = get_connection()
    try:
        for decision in decisions:
            if dry_run:
                print(f"Would store [{decision['date']}]: {decision['decision'][:50]}...")
                stored_ids.append(len(stored_ids) + 1)
            else:
                cursor = conn.execute(
                    """
                    INSERT INTO decisions (date, decision, rationale, alternatives_considered, related_area)
                    VALUES (?, ?, ?, ?, ?)
                    """,
                    (
                        decision["date"],
                        decision["decision"],
                        decision["rationale"],
                        decision["alternatives_considered"],
                        decision["related_area"],
                    ),
                )
                stored_ids.append(cursor.lastrowid)
                print(f"Stored decision {cursor.lastrowid}: {decision['decision'][:50]}...")

        if not dry_run:
            conn.commit()
    finally:
        conn.close()

    return len(stored_ids), stored_ids


# =============================================================================
# LINK BUGS TO CODE
# =============================================================================

def link_bugs_to_code(dry_run: bool = False) -> int:
    """
    After bugs and code_docs are populated, link them based on files_changed.

    For each bug with files_changed, find matching code_docs and create links.
    """
    from .storage import link_bug_to_code, query_bugs

    bugs = query_bugs(limit=1000)
    links_created = 0

    for bug in bugs:
        if not bug.get("files_changed"):
            continue

        import json
        try:
            files = json.loads(bug["files_changed"]) if isinstance(bug["files_changed"], str) else bug["files_changed"]
        except:
            continue

        for file_path in files:
            # Clean the file path (remove line numbers like :123)
            clean_path = re.sub(r":\d+(-\d+)?$", "", file_path)

            # Find matching code docs
            code_docs = query_code_docs(file_path=clean_path, limit=10)

            for doc in code_docs:
                if dry_run:
                    print(f"Would link {bug['id']} → code_doc {doc['id']} ({doc['file_path']})")
                    links_created += 1
                else:
                    try:
                        link_bug_to_code(
                            bug_id=bug["id"],
                            code_doc_id=doc["id"],
                            relationship="fix_location",
                            notes=f"From files_changed in bug report",
                        )
                        links_created += 1
                        print(f"Linked {bug['id']} → code_doc {doc['id']}")
                    except Exception as e:
                        print(f"Error linking: {e}")

    return links_created


# =============================================================================
# CLI INTEGRATION
# =============================================================================

def migrate_all(team_dir: str, dry_run: bool = False) -> Dict[str, Any]:
    """
    Run all migrations.

    Args:
        team_dir: Path to team/ directory
        dry_run: If True, just report what would be done

    Returns:
        Summary of migrations
    """
    team_path = Path(team_dir)
    results = {}

    # Migrate bugs
    bugs_path = team_path / "BUGS.md"
    if bugs_path.exists():
        print("\n=== Migrating BUGS.md ===")
        count, ids = migrate_bugs(str(bugs_path), dry_run)
        results["bugs"] = {"count": count, "ids": ids}

    # Migrate board messages
    board_path = team_path / "BOARD.md"
    if board_path.exists():
        print("\n=== Migrating BOARD.md ===")
        count, ids = migrate_board(str(board_path), dry_run)
        results["board_messages"] = {"count": count, "ids": ids}

    # Migrate board history
    history_path = team_path / "BOARD_HISTORY.md"
    if history_path.exists():
        print("\n=== Migrating BOARD_HISTORY.md ===")
        count, ids = migrate_board(str(history_path), dry_run)
        results["board_history"] = {"count": count, "ids": ids}

    # Migrate learnings from CLAUDE.md
    claude_path = team_path.parent / "CLAUDE.md"
    if claude_path.exists():
        print("\n=== Migrating CLAUDE.md learnings ===")
        count, ids = migrate_learnings(str(claude_path), dry_run)
        results["learnings"] = {"count": count, "ids": ids}

        print("\n=== Migrating CLAUDE.md decisions ===")
        count, ids = migrate_decisions(str(claude_path), dry_run)
        results["decisions"] = {"count": count, "ids": ids}

    # Link bugs to code (only if not dry run and code_docs exist)
    if not dry_run:
        from .storage import get_stats
        stats = get_stats()
        if stats.get("total_code_docs", 0) > 0:
            print("\n=== Linking bugs to code ===")
            links = link_bugs_to_code(dry_run)
            results["bug_code_links"] = {"count": links}

    return results


if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("Usage: python parser.py <team_dir> [--dry-run]")
        sys.exit(1)

    team_dir = sys.argv[1]
    dry_run = "--dry-run" in sys.argv

    results = migrate_all(team_dir, dry_run)

    print("\n=== Migration Summary ===")
    for key, value in results.items():
        print(f"{key}: {value.get('count', 0)} items")
