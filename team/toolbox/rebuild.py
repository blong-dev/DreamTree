"""
Nightly documentation rebuild.

Keeps code_docs and code_calls fresh by:
1. Running the annotator to update/create docs
2. Rebuilding the call graph
3. Cleaning orphaned docs (deleted files)

Run: python -m team.toolbox.rebuild
"""

from pathlib import Path
from .annotator import annotate_codebase
from .crawler import extract_symbols_regex
from .deep_crawler import extract_function_calls
from .storage import get_connection, query_code_docs, store_call


def rebuild_docs(verbose: bool = True):
    """Full rebuild of code_docs and code_calls."""

    if verbose:
        print("=" * 60)
        print("NIGHTLY DOCUMENTATION REBUILD")
        print("=" * 60)
        print()

    # 1. Clear stale code_calls (will rebuild fresh)
    if verbose:
        print("Clearing old code_calls...")
    conn = get_connection()
    conn.execute("DELETE FROM code_calls")
    conn.commit()
    conn.close()

    # 2. Run annotator - creates/updates code_docs, adds code_id comments
    if verbose:
        print("\n=== PHASE 1: ANNOTATE CODEBASE ===\n")

    src_dir = Path(__file__).parent.parent.parent / 'src'
    result = annotate_codebase(str(src_dir), dry_run=False, verbose=verbose)

    if verbose:
        print(f"\n--- Annotation Summary ---")
        print(f"Files processed: {result['files']}")
        print(f"Symbols annotated: {result['annotated']}")
        print(f"New docs created: {result['created']}")
        print(f"Skipped (already done): {result['skipped']}")
        print(f"Errors: {result['errors']}")

    # 3. Rebuild code_calls from fresh AST
    if verbose:
        print(f"\n=== PHASE 2: REBUILD CALL GRAPH ===\n")

    calls_created = rebuild_call_graph(src_dir, verbose)

    if verbose:
        print(f"\n--- Call Graph Summary ---")
        print(f"Call relationships created: {calls_created}")

    # 4. Clean orphaned docs (file no longer exists)
    if verbose:
        print(f"\n=== PHASE 3: CLEAN ORPHANS ===\n")

    orphaned = clean_orphans(verbose)

    if verbose:
        print(f"\n--- Cleanup Summary ---")
        print(f"Orphaned docs removed: {orphaned}")

    if verbose:
        print("\n" + "=" * 60)
        print("REBUILD COMPLETE")
        print("=" * 60)

    return {
        'files': result['files'],
        'annotated': result['annotated'],
        'created': result['created'],
        'calls': calls_created,
        'orphans_cleaned': orphaned,
    }


def rebuild_call_graph(src_dir: Path, verbose: bool = True) -> int:
    """Rebuild code_calls table from fresh AST analysis."""
    calls_created = 0

    # Get all code_docs to map symbol names to IDs
    all_docs = query_code_docs(limit=10000)
    symbol_to_id = {}
    for doc in all_docs:
        key = f"{doc['file_path']}:{doc['symbol_name']}"
        symbol_to_id[key] = doc['id']

    # Find all TS/TSX files
    patterns = ['**/*.ts', '**/*.tsx']
    files = []
    for pattern in patterns:
        files.extend(src_dir.glob(pattern))

    for file_path in sorted(files):
        rel_path = str(file_path.relative_to(src_dir.parent)).replace('\\', '/')

        try:
            content = file_path.read_text(encoding='utf-8')
        except Exception as e:
            if verbose:
                print(f"  Error reading {rel_path}: {e}")
            continue

        # First extract symbols from the file
        try:
            symbols = extract_symbols_regex(content, rel_path)
        except Exception as e:
            if verbose:
                print(f"  Error extracting symbols from {rel_path}: {e}")
            continue

        # For each symbol, extract function calls
        for symbol in symbols:
            try:
                calls = extract_function_calls(content, symbol)

                for call in calls:
                    # Find caller and callee IDs
                    caller_key = f"{rel_path}:{call.caller_name}"
                    callee_key = f"{rel_path}:{call.callee_name}"  # Same file for now

                    caller_id = symbol_to_id.get(caller_key)
                    callee_id = symbol_to_id.get(callee_key)

                    if caller_id and callee_id and caller_id != callee_id:
                        store_call(
                            caller_id=caller_id,
                            callee_name=call.callee_name,
                            call_type=call.call_type,
                            callee_id=callee_id,
                            line_number=call.line_number,
                        )
                        calls_created += 1

            except Exception as e:
                if verbose:
                    print(f"  Error extracting calls from {symbol.name} in {rel_path}: {e}")

    return calls_created


def clean_orphans(verbose: bool = True) -> int:
    """Remove docs for files/symbols that no longer exist."""
    all_docs = query_code_docs(limit=10000)
    orphaned = 0
    base_dir = Path(__file__).parent.parent.parent

    for doc in all_docs:
        file_path = base_dir / doc['file_path']

        if not file_path.exists():
            # File deleted - remove doc
            if verbose:
                print(f"  Removing orphan: {doc['symbol_name']} ({doc['file_path']})")

            conn = get_connection()
            conn.execute("DELETE FROM code_docs WHERE id = ?", (doc['id'],))
            conn.commit()
            conn.close()
            orphaned += 1

    return orphaned


def main():
    """CLI entry point."""
    import sys

    verbose = '--quiet' not in sys.argv
    rebuild_docs(verbose=verbose)


if __name__ == '__main__':
    main()
