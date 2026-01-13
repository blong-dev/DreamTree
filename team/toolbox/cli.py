"""
Command Line Interface for the Team Knowledge Base.

Usage:
    python -m team.toolbox.cli <command> [options]

Commands:
    init            Initialize the database
    docs            Query code documentation
    bugs            Query or manage bugs
    history         Query changelog
    learn           Query learnings
    stats           Show statistics
    crawl           Run AST crawler (Phase 2)
"""

import argparse
import json
import sys
from typing import List, Dict, Any

from .storage import (
    init_db,
    store_code_doc,
    query_code_docs,
    store_bug,
    query_bugs,
    update_bug,
    store_changelog,
    query_changelog,
    store_learning,
    query_learnings,
    link_bug_to_code,
    get_bugs_for_code,
    get_code_for_bug,
    get_stats,
    store_message,
    query_messages,
    resolve_message,
    get_open_messages,
    render_board_md,
    query_calls,
    get_calls_from,
    get_calls_to,
    get_call_tree,
    get_code_doc_by_name,
    get_nested_functions,
    update_message_routing,
)
from .constants import (
    VALID_AREAS,
    VALID_BUG_STATUSES,
    VALID_PRIORITIES,
    VALID_OWNERS,
    VALID_AUTHORS,
    VALID_MESSAGE_TYPES,
)


def sanitize_for_console(text: str) -> str:
    """Replace unicode characters that Windows console can't display."""
    replacements = {
        '\u2705': '[OK]',      # ✅
        '\u274c': '[X]',       # ❌
        '\u2714': '[v]',       # ✔
        '\u2718': '[x]',       # ✘
        '\u2192': '->',        # →
        '\u2190': '<-',        # ←
        '\u2022': '*',         # •
        '\u2013': '-',         # –
        '\u2014': '--',        # —
    }
    for char, replacement in replacements.items():
        text = text.replace(char, replacement)
    # Fallback: replace any remaining non-ASCII with '?'
    return text.encode('ascii', 'replace').decode('ascii')


def format_table(rows: List[Dict[str, Any]], columns: List[str], max_width: int = 50) -> str:
    """Format rows as a simple table."""
    if not rows:
        return "No results found."

    # Calculate column widths
    widths = {}
    for col in columns:
        widths[col] = min(
            max_width,
            max(len(col), max(len(str(row.get(col, ""))[:max_width]) for row in rows))
        )

    # Build header
    header = " | ".join(col.ljust(widths[col]) for col in columns)
    separator = "-+-".join("-" * widths[col] for col in columns)

    # Build rows
    lines = [header, separator]
    for row in rows:
        line = " | ".join(
            sanitize_for_console(str(row.get(col, "")))[:widths[col]].ljust(widths[col])
            for col in columns
        )
        lines.append(line)

    return "\n".join(lines)


def cmd_init(args: argparse.Namespace) -> int:
    """Initialize the database (safe - only creates missing tables)."""
    try:
        init_db()
        return 0
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        return 1


def cmd_docs(args: argparse.Namespace) -> int:
    """Query code documentation."""
    results = query_code_docs(
        file_path=args.file,
        symbol_name=args.symbol,
        symbol_type=args.type,
        area=args.area,
        search=args.search,
        limit=args.limit,
    )

    if args.json:
        print(json.dumps(results, indent=2))
    else:
        columns = ["id", "file_path", "symbol_name", "symbol_type", "area", "purpose"]
        print(format_table(results, columns))

    return 0


def cmd_bugs(args: argparse.Namespace) -> int:
    """Query or manage bugs."""
    if args.action == "list" or args.action is None:
        results = query_bugs(
            bug_id=args.id,
            status=args.status,
            area=args.area,
            owner=args.owner,
            priority=args.priority,
            limit=args.limit,
        )

        if args.json:
            print(json.dumps(results, indent=2))
        else:
            columns = ["id", "title", "status", "priority", "area", "owner"]
            print(format_table(results, columns))

    elif args.action == "add":
        if not args.title:
            print("Error: --title is required for adding bugs", file=sys.stderr)
            return 1

        # Generate next bug ID
        existing = query_bugs(limit=1000)
        bug_ids = [b["id"] for b in existing if b["id"].startswith("BUG-")]
        if bug_ids:
            max_num = max(int(bid.split("-")[1]) for bid in bug_ids)
            next_id = f"BUG-{max_num + 1:03d}"
        else:
            next_id = "BUG-001"

        bug_id = store_bug({
            "id": next_id,
            "title": args.title,
            "area": args.area,
            "priority": args.priority or "medium",
            "owner": args.owner,
            "description": args.description,
        })
        print(f"Created bug: {bug_id}")

    elif args.action == "update":
        if not args.id:
            print("Error: --id is required for updating bugs", file=sys.stderr)
            return 1

        updates = {}
        if args.status:
            updates["status"] = args.status
        if args.priority:
            updates["priority"] = args.priority
        if args.owner:
            updates["owner"] = args.owner
        if args.root_cause:
            updates["root_cause"] = args.root_cause
        if args.fix_applied:
            updates["fix_applied"] = args.fix_applied
        if args.verified_by:
            updates["verified_by"] = args.verified_by

        if updates:
            success = update_bug(args.id, **updates)
            if success:
                print(f"Updated bug: {args.id}")
            else:
                print(f"Bug not found: {args.id}", file=sys.stderr)
                return 1
        else:
            print("No updates specified", file=sys.stderr)
            return 1

    elif args.action == "link":
        if not args.id or not args.code_doc:
            print("Error: --id and --code-doc are required for linking", file=sys.stderr)
            return 1

        ref_id = link_bug_to_code(
            bug_id=args.id,
            code_doc_id=args.code_doc,
            relationship=args.relationship or "related",
        )
        print(f"Created link: {ref_id}")

    elif args.action == "code":
        if not args.id:
            print("Error: --id is required", file=sys.stderr)
            return 1

        results = get_code_for_bug(args.id)
        if args.json:
            print(json.dumps(results, indent=2))
        else:
            columns = ["id", "file_path", "symbol_name", "relationship", "purpose"]
            print(format_table(results, columns))

    return 0


def cmd_history(args: argparse.Namespace) -> int:
    """Query changelog."""
    if args.action == "list" or args.action is None:
        results = query_changelog(
            days=args.days,
            file_path=args.file,
            bug_id=args.bug,
            limit=args.limit,
        )

        if args.json:
            print(json.dumps(results, indent=2))
        else:
            columns = ["id", "date", "title", "why"]
            print(format_table(results, columns))

    elif args.action == "add":
        if not all([args.title, args.what_changed, args.why]):
            print("Error: --title, --what-changed, and --why are required", file=sys.stderr)
            return 1

        from datetime import datetime
        entry_id = store_changelog({
            "date": args.date or datetime.now().strftime("%Y-%m-%d"),
            "title": args.title,
            "what_changed": args.what_changed,
            "what_it_was": args.what_it_was,
            "why": args.why,
            "files_affected": args.files.split(",") if args.files else [],
            "related_bug_id": args.bug,
        })
        print(f"Created changelog entry: {entry_id}")

    return 0


def cmd_learn(args: argparse.Namespace) -> int:
    """Query learnings."""
    if args.action == "list" or args.action is None:
        results = query_learnings(
            category=args.category,
            search=args.search,
            limit=args.limit,
        )

        if args.json:
            print(json.dumps(results, indent=2))
        else:
            columns = ["id", "category", "learning", "context"]
            print(format_table(results, columns))

    elif args.action == "add":
        if not all([args.category, args.learning]):
            print("Error: --category and --learning are required", file=sys.stderr)
            return 1

        learning_id = store_learning({
            "category": args.category,
            "learning": args.learning,
            "context": args.context,
            "related_bug_id": args.bug,
        })
        print(f"Created learning: {learning_id}")

    return 0


def route_message(msg_id: int, msg_type: str, content: str, data: dict) -> tuple:
    """
    Route a message to its target table based on type.

    Returns:
        Tuple of (routed_to, routed_id) or (None, None) if no routing needed.
    """
    if msg_type == "bug":
        # Route to bugs table
        bug_id = f"BUG-{msg_id}"
        bug_data = {
            "id": bug_id,
            "title": content,
            "area": data.get("area", "general"),
            "priority": data.get("priority", "medium"),
            "status": "open",
            "description": data.get("description"),
            "owner": data.get("owner"),
        }
        try:
            store_bug(bug_data)
            return ("bugs", bug_id)
        except Exception as e:
            print(f"Warning: Failed to route to bugs: {e}", file=sys.stderr)
            return (None, None)

    elif msg_type == "decision":
        # Route to decisions table (if it exists)
        # For now, just log - decisions table routing can be added later
        return (None, None)

    elif msg_type == "learning":
        # Route to learnings table
        learning_data = {
            "category": data.get("category", "general"),
            "learning": content,
            "context": data.get("context"),
            "related_bug_id": data.get("bug_id"),
        }
        try:
            learning_id = store_learning(learning_data)
            return ("learnings", str(learning_id))
        except Exception as e:
            print(f"Warning: Failed to route to learnings: {e}", file=sys.stderr)
            return (None, None)

    # Types that don't route: status, assignment, question, blocker, etc.
    return (None, None)


def cmd_board(args: argparse.Namespace) -> int:
    """Post to or query the board."""
    if args.action == "post":
        if not all([args.author, args.type, args.content]):
            print("Error: --author, --type, and --content are required for posting", file=sys.stderr)
            return 1

        refs = {}
        if args.bug:
            refs["bug_id"] = args.bug
        if args.task:
            refs["task_id"] = args.task
        if args.reply_to:
            refs["reply_to"] = args.reply_to

        mentions = []
        if args.mentions:
            mentions = [m.strip() for m in args.mentions.split(",")]

        # Parse --data JSON if provided
        data = None
        if args.data:
            try:
                data = json.loads(args.data)
            except json.JSONDecodeError as e:
                print(f"Error: Invalid JSON in --data: {e}", file=sys.stderr)
                return 1

        msg_id = store_message(
            author=args.author,
            message_type=args.type,
            content=args.content,
            refs=refs if refs else None,
            mentions=mentions,
            data=data,
        )

        # Auto-route based on message type
        routed_to, routed_id = route_message(msg_id, args.type, args.content, data or {})

        if routed_to:
            update_message_routing(msg_id, routed_to, routed_id)
            print(f"Posted message: {msg_id} -> {routed_id}")
        else:
            print(f"Posted message: {msg_id}")

    elif args.action == "resolve":
        if not args.id:
            print("Error: message ID is required for resolve", file=sys.stderr)
            return 1

        success = resolve_message(int(args.id))
        if success:
            print(f"Resolved message: {args.id}")
        else:
            print(f"Message not found: {args.id}", file=sys.stderr)
            return 1

    elif args.action == "render":
        md = render_board_md()
        print(md)

    else:  # list (default)
        # Parse resolved flag
        resolved = None
        if args.resolved is not None:
            resolved = args.resolved == "1" or args.resolved.lower() == "true"

        # Check for --today shortcut
        after = args.after
        if args.today:
            from datetime import datetime
            after = datetime.now().strftime("%Y-%m-%d")

        results = query_messages(
            author=args.author,
            message_type=args.type,
            resolved=resolved,
            after=after,
            mentions=args.mentions,
            limit=args.limit,
        )

        if args.json:
            print(json.dumps(results, indent=2))
        else:
            columns = ["id", "created_at", "author", "message_type", "content", "resolved"]
            print(format_table(results, columns))

    return 0


def cmd_stats(args: argparse.Namespace) -> int:
    """Show statistics."""
    stats = get_stats()

    if args.json:
        print(json.dumps(stats, indent=2))
    else:
        print("Team Knowledge Base Statistics")
        print("=" * 40)
        print(f"Code docs:   {stats.get('total_code_docs', 0)}")
        print(f"Bugs:        {stats.get('total_bugs', 0)}")
        print(f"Changelog:   {stats.get('total_changelog', 0)}")
        print(f"Learnings:   {stats.get('total_learnings', 0)}")
        print(f"Tasks:       {stats.get('total_tasks', 0)}")
        print(f"Messages:    {stats.get('total_messages', 0)}")

        if stats.get("code_docs_by_area"):
            print("\nCode docs by area:")
            for area, count in sorted(stats["code_docs_by_area"].items()):
                print(f"  {area}: {count}")

        if stats.get("bugs_by_status"):
            print("\nBugs by status:")
            for status, count in stats["bugs_by_status"].items():
                print(f"  {status}: {count}")

    return 0


def cmd_crawl(args: argparse.Namespace) -> int:
    """Run AST crawler."""
    from .crawler import crawl_for_cli
    return crawl_for_cli(args.path, args.output)


def cmd_annotate(args: argparse.Namespace) -> int:
    """Add code_id annotations to source files."""
    from .annotator import annotate_cli
    return annotate_cli(args)


def cmd_migrate(args: argparse.Namespace) -> int:
    """Migrate historical data from markdown files."""
    from .parser import migrate_all, migrate_bugs, migrate_board, migrate_learnings, link_bugs_to_code

    if args.source == "all":
        results = migrate_all(args.team_dir or ".", args.dry_run)
        print("\n=== Summary ===")
        for key, value in results.items():
            print(f"{key}: {value.get('count', 0)} items")
    elif args.source == "bugs":
        count, ids = migrate_bugs(args.file or "BUGS.md", args.dry_run)
        print(f"Migrated {count} bugs")
    elif args.source == "board":
        count, ids = migrate_board(args.file or "BOARD.md", args.dry_run)
        print(f"Migrated {count} messages")
    elif args.source == "learnings":
        count, ids = migrate_learnings(args.file or "../CLAUDE.md", args.dry_run)
        print(f"Migrated {count} learnings")
    elif args.source == "link":
        links = link_bugs_to_code(args.dry_run)
        print(f"Created {links} bug-to-code links")

    return 0


def cmd_calls(args: argparse.Namespace) -> int:
    """Query function call relationships."""
    # Handle --from and --to arguments
    from_name = getattr(args, 'from_name', None)
    to_name = getattr(args, 'to_name', None)

    if from_name:
        # Get calls FROM a function
        doc = get_code_doc_by_name(from_name)
        if not doc:
            print(f"Function not found: {from_name}", file=sys.stderr)
            return 1

        results = get_calls_from(doc['id'])
        print(f"Functions called by {from_name} (code_id:{doc['id']}):")
        print()

        if args.json:
            print(json.dumps(results, indent=2))
        else:
            for call in results:
                ext = "" if call.get('callee_id') else " [external]"
                print(f"  -> {call['callee_name']} ({call['call_type']}) @ line {call['line_number']}{ext}")

    elif to_name:
        # Get calls TO a function
        doc = get_code_doc_by_name(to_name)
        if not doc:
            print(f"Function not found: {to_name}", file=sys.stderr)
            return 1

        results = get_calls_to(doc['id'])
        print(f"Functions that call {to_name} (code_id:{doc['id']}):")
        print()

        if args.json:
            print(json.dumps(results, indent=2))
        else:
            for call in results:
                print(f"  <- {call['caller_name']} ({call['call_type']}) @ {call['caller_file']}:{call['line_number']}")

    else:
        # General query
        results = query_calls(
            callee_name=args.name,
            call_type=args.type,
            limit=args.limit,
        )

        if args.json:
            print(json.dumps(results, indent=2))
        else:
            columns = ["caller_name", "callee_name", "call_type", "line_number"]
            print(format_table(results, columns))

    return 0


def cmd_tree(args: argparse.Namespace) -> int:
    """Show call tree for a function."""
    name = args.name
    depth = args.depth

    # Find the function
    doc = get_code_doc_by_name(name)
    if not doc:
        print(f"Function not found: {name}", file=sys.stderr)
        return 1

    direction = "up" if args.callers else "down"
    tree = get_call_tree(doc['id'], depth=depth, direction=direction)

    if args.json:
        print(json.dumps(tree, indent=2))
    else:
        print_tree(tree, direction)

    return 0


def print_tree(node: Dict[str, Any], direction: str, prefix: str = "", is_last: bool = True) -> None:
    """Recursively print a call tree."""
    # Use ASCII characters for compatibility
    connector = "`-- " if is_last else "|-- "
    continuation = "    " if is_last else "|   "

    if prefix == "":
        # Root node
        ext = f" ({node.get('type', '?')})" if node.get('type') else ""
        print(f"{node.get('name', '?')}{ext} code_id:{node.get('id', '?')}")
    else:
        ext_marker = " [external]" if node.get('external') else ""
        type_marker = f" ({node.get('type', '')})" if node.get('type') else ""
        line_marker = f" @ line {node.get('line', '')}" if node.get('line') else ""
        print(f"{prefix}{connector}{node.get('name', '?')}{type_marker}{line_marker}{ext_marker}")

    # Print children
    children = node.get('children', [])
    new_prefix = prefix + continuation
    for i, child in enumerate(children):
        is_child_last = i == len(children) - 1
        print_tree(child, direction, new_prefix, is_child_last)


def main() -> int:
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="Team Knowledge Base CLI",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    # init (safe - only creates missing tables, never destroys data)
    init_parser = subparsers.add_parser("init", help="Initialize database (safe - only adds missing tables)")

    # docs
    docs_parser = subparsers.add_parser("docs", help="Query code documentation")
    docs_parser.add_argument("file", nargs="?", help="File path to search")
    docs_parser.add_argument("--symbol", help="Symbol name to search")
    docs_parser.add_argument("--type", help="Symbol type filter")
    docs_parser.add_argument("--area", choices=VALID_AREAS, help="Area filter")
    docs_parser.add_argument("--search", help="Search in purpose/why")
    docs_parser.add_argument("--limit", type=int, default=100, help="Max results")
    docs_parser.add_argument("--json", action="store_true", help="Output JSON")

    # bugs
    bugs_parser = subparsers.add_parser("bugs", help="Query or manage bugs")
    bugs_parser.add_argument("action", nargs="?", choices=["list", "add", "update", "link", "code"])
    bugs_parser.add_argument("--id", help="Bug ID")
    bugs_parser.add_argument("--title", help="Bug title (for add)")
    bugs_parser.add_argument("--status", choices=VALID_BUG_STATUSES, help="Status filter/update")
    bugs_parser.add_argument("--priority", choices=VALID_PRIORITIES, help="Priority filter/update")
    bugs_parser.add_argument("--area", choices=VALID_AREAS, help="Area filter")
    bugs_parser.add_argument("--owner", choices=VALID_OWNERS, help="Owner filter/update")
    bugs_parser.add_argument("--description", help="Bug description (for add)")
    bugs_parser.add_argument("--root-cause", help="Root cause (for update)")
    bugs_parser.add_argument("--fix-applied", help="Fix applied (for update)")
    bugs_parser.add_argument("--verified-by", help="Verified by (for update)")
    bugs_parser.add_argument("--code-doc", type=int, help="Code doc ID (for link)")
    bugs_parser.add_argument("--relationship", help="Relationship type (for link)")
    bugs_parser.add_argument("--limit", type=int, default=100, help="Max results")
    bugs_parser.add_argument("--json", action="store_true", help="Output JSON")

    # history
    history_parser = subparsers.add_parser("history", help="Query changelog")
    history_parser.add_argument("action", nargs="?", choices=["list", "add"])
    history_parser.add_argument("--days", type=int, help="Filter to last N days")
    history_parser.add_argument("--file", help="Filter by affected file")
    history_parser.add_argument("--bug", help="Filter by related bug ID")
    history_parser.add_argument("--title", help="Change title (for add)")
    history_parser.add_argument("--date", help="Date YYYY-MM-DD (for add)")
    history_parser.add_argument("--what-changed", help="What changed (for add)")
    history_parser.add_argument("--what-it-was", help="Previous behavior (for add)")
    history_parser.add_argument("--why", help="Rationale (for add)")
    history_parser.add_argument("--files", help="Comma-separated files (for add)")
    history_parser.add_argument("--limit", type=int, default=100, help="Max results")
    history_parser.add_argument("--json", action="store_true", help="Output JSON")

    # learn
    learn_parser = subparsers.add_parser("learn", help="Query learnings")
    learn_parser.add_argument("action", nargs="?", choices=["list", "add"])
    learn_parser.add_argument("--category", help="Category filter (for list) or value (for add)")
    learn_parser.add_argument("--search", help="Search in learning text")
    learn_parser.add_argument("--learning", help="Learning text (for add)")
    learn_parser.add_argument("--context", help="Context (for add)")
    learn_parser.add_argument("--bug", help="Related bug ID (for add)")
    learn_parser.add_argument("--limit", type=int, default=100, help="Max results")
    learn_parser.add_argument("--json", action="store_true", help="Output JSON")

    # stats
    stats_parser = subparsers.add_parser("stats", help="Show statistics")
    stats_parser.add_argument("--json", action="store_true", help="Output JSON")

    # board
    board_parser = subparsers.add_parser("board", help="Post to or query the board")
    board_parser.add_argument("action", nargs="?", choices=["list", "post", "resolve", "render"])
    board_parser.add_argument("--id", help="Message ID (for resolve)")
    board_parser.add_argument("--author", choices=VALID_AUTHORS, help="Author filter or value (for post)")
    board_parser.add_argument("--type", choices=VALID_MESSAGE_TYPES, help="Message type filter or value (for post)")
    board_parser.add_argument("--content", help="Message content (for post)")
    board_parser.add_argument("--data", help="JSON data for routing (e.g., '{\"area\": \"workbook\", \"priority\": \"high\"}')")
    board_parser.add_argument("--bug", help="Related bug ID (for post)")
    board_parser.add_argument("--task", help="Related task ID (for post)")
    board_parser.add_argument("--reply-to", type=int, help="Reply to message ID (for post)")
    board_parser.add_argument("--mentions", help="Comma-separated @mentions (for post) or filter (for list)")
    board_parser.add_argument("--resolved", help="Filter by resolved status: 0, 1, true, false")
    board_parser.add_argument("--after", help="Filter messages after date YYYY-MM-DD")
    board_parser.add_argument("--today", action="store_true", help="Filter to today's messages")
    board_parser.add_argument("--limit", type=int, default=50, help="Max results")
    board_parser.add_argument("--json", action="store_true", help="Output JSON")

    # crawl
    crawl_parser = subparsers.add_parser("crawl", help="Run AST crawler")
    crawl_parser.add_argument("path", help="Path to crawl")
    crawl_parser.add_argument("--output", help="Output file for queue")

    # migrate
    migrate_parser = subparsers.add_parser("migrate", help="Migrate historical data")
    migrate_parser.add_argument("source", choices=["all", "bugs", "board", "learnings", "link"],
                                help="What to migrate")
    migrate_parser.add_argument("--file", help="Source file path")
    migrate_parser.add_argument("--team-dir", help="Team directory (for 'all')")
    migrate_parser.add_argument("--dry-run", action="store_true", help="Don't actually store")

    # annotate
    annotate_parser = subparsers.add_parser("annotate", help="Add code_id annotations to source files")
    annotate_parser.add_argument("path", nargs="?", help="File path or filter pattern (optional)")
    annotate_parser.add_argument("--dry-run", action="store_true", help="Show what would be annotated")
    annotate_parser.add_argument("--deep", action="store_true", help="Also extract nested functions and call relationships")

    # calls
    calls_parser = subparsers.add_parser("calls", help="Query function call relationships")
    calls_parser.add_argument("--from", dest="from_name", help="Show functions called BY this function")
    calls_parser.add_argument("--to", dest="to_name", help="Show functions that CALL this function")
    calls_parser.add_argument("--name", help="Filter by callee name (partial match)")
    calls_parser.add_argument("--type", help="Filter by call type (direct, hook, method, etc.)")
    calls_parser.add_argument("--limit", type=int, default=100, help="Max results")
    calls_parser.add_argument("--json", action="store_true", help="Output JSON")

    # tree
    tree_parser = subparsers.add_parser("tree", help="Show call tree for a function")
    tree_parser.add_argument("name", help="Function name to show tree for")
    tree_parser.add_argument("--depth", type=int, default=3, help="Max tree depth (default: 3)")
    tree_parser.add_argument("--callers", action="store_true", help="Show callers (up) instead of callees (down)")
    tree_parser.add_argument("--json", action="store_true", help="Output JSON")

    args = parser.parse_args()

    if args.command is None:
        parser.print_help()
        return 0

    commands = {
        "init": cmd_init,
        "docs": cmd_docs,
        "bugs": cmd_bugs,
        "history": cmd_history,
        "learn": cmd_learn,
        "board": cmd_board,
        "stats": cmd_stats,
        "crawl": cmd_crawl,
        "migrate": cmd_migrate,
        "annotate": cmd_annotate,
        "calls": cmd_calls,
        "tree": cmd_tree,
    }

    return commands[args.command](args)


if __name__ == "__main__":
    sys.exit(main())
