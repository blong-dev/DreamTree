"""
Code ID Annotator - embeds code_id comments in source files.

Creates bidirectional links between source code and team.db documentation
by adding inline `// code_id:XXX` comments to function/component declarations.
"""

import re
from pathlib import Path
from typing import Dict, List, Optional, Any

from .storage import (
    store_code_doc,
    query_code_docs,
    store_nested_code_doc,
    store_call,
    get_code_doc_by_name,
)
from .crawler import extract_symbols_regex, Symbol
from .deep_crawler import extract_nested_functions, extract_function_calls, NestedSymbol, FunctionCall
from .constants import VALID_AREAS


def infer_area(file_path: str) -> str:
    """
    Infer area from file path patterns.

    Args:
        file_path: Relative path like 'src/components/workbook/WorkbookView.tsx'

    Returns:
        Valid area string from VALID_AREAS
    """
    path = file_path.lower().replace('\\', '/')

    # Component areas
    if '/components/workbook/' in path: return 'workbook'
    if '/components/conversation/' in path: return 'conversation'
    if '/components/tools/' in path: return 'tools'
    if '/components/shell/' in path: return 'shell'
    if '/components/overlays/' in path: return 'shell'
    if '/components/dashboard/' in path: return 'features'
    if '/components/onboarding/' in path: return 'features'
    if '/components/profile/' in path: return 'features'
    if '/components/landing/' in path: return 'features'
    if '/components/forms/' in path: return 'ui-primitives'
    if '/components/feedback/' in path: return 'ui-primitives'
    if '/components/icons/' in path: return 'ui-primitives'

    # Library areas
    if '/lib/db/' in path: return 'database'
    if '/lib/auth/' in path: return 'auth'
    if '/lib/connections/' in path: return 'database'

    # API routes
    if '/app/api/' in path: return 'api'

    # Types
    if '/types/' in path: return 'types'

    # Design system
    if 'globals.css' in path: return 'design-system'

    # Hooks
    if '/hooks/' in path: return 'lib'

    # Default
    return 'lib'


def auto_create_doc(
    file_path: str,
    symbol: Dict[str, Any],
    source_dir: str = ''
) -> int:
    """
    Create placeholder code_doc entry for an undocumented symbol.

    Args:
        file_path: Relative file path
        symbol: Symbol dict with name, type, line_start, line_end, signature
        source_dir: Base directory for resolving paths

    Returns:
        New code_doc ID
    """
    # Clean up file path to be relative
    clean_path = file_path.replace('\\', '/')
    if source_dir:
        source_dir = source_dir.replace('\\', '/')
        if clean_path.startswith(source_dir):
            clean_path = clean_path[len(source_dir):].lstrip('/')

    # Ensure path starts with src/
    if not clean_path.startswith('src/'):
        if '/src/' in clean_path:
            clean_path = 'src/' + clean_path.split('/src/', 1)[1]

    area = infer_area(clean_path)
    symbol_type = symbol.get('type', 'function')
    symbol_name = symbol.get('name', 'unknown')

    # Create placeholder purpose
    purpose = f"TODO: Document {symbol_name}"

    code_id = store_code_doc(
        file_path=clean_path,
        symbol_name=symbol_name,
        symbol_type=symbol_type,
        line_start=symbol.get('line_start'),
        line_end=symbol.get('line_end'),
        purpose=purpose,
        why=None,
        connections=[],
        area=area,
        signature=symbol.get('signature'),
    )

    return code_id


def find_declaration_line(lines: List[str], start_line: int) -> Optional[int]:
    """
    Find the line containing the function BODY opening `{`.

    For multi-line declarations, finds the `{` that comes AFTER the `)` closing
    the parameter list, not destructuring `{` inside params.

    Args:
        lines: List of source lines (0-indexed)
        start_line: 1-indexed line number where symbol starts

    Returns:
        0-indexed line number with the body `{`, or None if not found
    """
    if start_line < 1 or start_line > len(lines):
        return None

    # Convert to 0-indexed
    idx = start_line - 1

    # Scan forward (max 20 lines for multi-line declarations)
    for i in range(idx, min(idx + 20, len(lines))):
        line = lines[i]
        stripped = line.rstrip()

        # Remove existing code_id comment for pattern matching
        # This handles idempotency - already annotated lines should still match
        stripped_no_comment = re.sub(r'\s*//\s*code_id:\d+\s*$', '', stripped)

        # Look for patterns that indicate the function body opening:
        # - `) {` or `){` - params closed, body opens
        # - `=> {` - arrow function body
        # - `: Type) {` or `: Type) => {` - with return type

        # Pattern: ) followed by { (with optional space/type annotation)
        if re.search(r'\)\s*(?::\s*\S+\s*)?\{$', stripped_no_comment):
            return i

        # Pattern: ) => { for arrow functions
        if re.search(r'\)\s*=>\s*\{', stripped_no_comment):
            return i

        # Pattern: standalone { after we've seen ) on a previous line
        # (for cases where { is on its own line)
        if stripped_no_comment == '{' and i > idx:
            # Check if previous non-empty line ended with )
            for j in range(i - 1, idx - 1, -1):
                prev = lines[j].rstrip()
                prev_no_comment = re.sub(r'\s*//\s*code_id:\d+\s*$', '', prev)
                if prev_no_comment:
                    if prev_no_comment.endswith(')') or re.search(r'\)\s*$', prev_no_comment):
                        return i
                    break

    return None


def insert_code_id(line: str, code_id: int) -> str:
    """
    Insert // code_id:XXX at end of line.

    Handles:
    - Lines ending with `{`
    - Lines with existing trailing comments
    - Windows/Unix line endings

    Args:
        line: Source line (may include newline)
        code_id: The code_doc ID to insert

    Returns:
        Modified line with code_id comment
    """
    # Preserve line ending
    ending = ''
    if line.endswith('\r\n'):
        ending = '\r\n'
        line = line[:-2]
    elif line.endswith('\n'):
        ending = '\n'
        line = line[:-1]
    elif line.endswith('\r'):
        ending = '\r'
        line = line[:-1]

    # Check if already annotated
    if '// code_id:' in line:
        return line + ending

    # Add the code_id comment
    # If line already has a trailing comment, append after it
    line = line.rstrip()
    line = f"{line} // code_id:{code_id}"

    return line + ending


def annotate_file(
    file_path: str,
    docs_by_file: Dict[str, List[Dict]],
    source_dir: str = '',
    dry_run: bool = False,
    verbose: bool = True,
) -> Dict[str, int]:
    """
    Annotate a single file with code_ids.

    Args:
        file_path: Absolute or relative path to source file
        docs_by_file: Pre-loaded code_docs grouped by file path
        source_dir: Base directory for resolving relative paths
        dry_run: If True, don't write changes
        verbose: If True, print progress

    Returns:
        {annotated: int, created: int, skipped: int, errors: int}
    """
    result = {'annotated': 0, 'created': 0, 'skipped': 0, 'errors': 0}

    path = Path(file_path)
    if not path.exists():
        if verbose:
            print(f"  ! File not found: {file_path}")
        result['errors'] += 1
        return result

    # Read source
    try:
        source = path.read_text(encoding='utf-8')
    except Exception as e:
        if verbose:
            print(f"  ! Error reading {file_path}: {e}")
        result['errors'] += 1
        return result

    lines = source.splitlines(keepends=True)

    # Extract symbols from source
    symbols = extract_symbols_regex(source, str(file_path))

    if not symbols:
        return result

    # Get relative path for matching
    rel_path = str(file_path).replace('\\', '/')
    if source_dir:
        source_dir_clean = source_dir.replace('\\', '/')
        if rel_path.startswith(source_dir_clean):
            rel_path = rel_path[len(source_dir_clean):].lstrip('/')

    # Ensure src/ prefix
    if not rel_path.startswith('src/'):
        if '/src/' in rel_path:
            rel_path = 'src/' + rel_path.split('/src/', 1)[1]

    # Get existing docs for this file
    existing_docs = docs_by_file.get(rel_path, [])
    docs_by_name = {d['symbol_name']: d for d in existing_docs if d.get('symbol_name')}

    modified = False

    for symbol in symbols:
        # Symbol is a dataclass, access attributes directly
        sym_name = symbol.name
        sym_type = symbol.type

        # Skip certain types that don't have bodies
        if sym_type in ('interface', 'type', 'constant'):
            if verbose:
                print(f"  - {sym_name} ({sym_type}) -> skipped (no body)")
            result['skipped'] += 1
            continue

        # Find or create code_doc entry
        if sym_name in docs_by_name:
            code_id = docs_by_name[sym_name]['id']
            created = False
        else:
            if dry_run:
                code_id = 0  # Placeholder for dry run
                created = True
            else:
                # Convert dataclass to dict for auto_create_doc
                sym_dict = {
                    'name': symbol.name,
                    'type': symbol.type,
                    'line_start': symbol.line_start,
                    'line_end': symbol.line_end,
                    'signature': symbol.signature,
                }
                code_id = auto_create_doc(rel_path, sym_dict, source_dir)
                created = True

        # Find the declaration line
        decl_line_idx = find_declaration_line(lines, symbol.line_start)

        if decl_line_idx is None:
            if verbose:
                print(f"  ? {sym_name} ({sym_type}) -> couldn't find declaration")
            result['errors'] += 1
            continue

        # Check if already annotated
        if '// code_id:' in lines[decl_line_idx]:
            if verbose:
                print(f"  = {sym_name} ({sym_type}) -> already annotated")
            result['skipped'] += 1
            continue

        # Insert code_id
        if not dry_run:
            lines[decl_line_idx] = insert_code_id(lines[decl_line_idx], code_id)
            modified = True

        status = '[CREATED]' if created else ''
        if verbose:
            print(f"  + {sym_name} ({sym_type}) -> code_id:{code_id} {status}")

        if created:
            result['created'] += 1
        result['annotated'] += 1

    # Write back if modified
    if modified and not dry_run:
        try:
            path.write_text(''.join(lines), encoding='utf-8')
        except Exception as e:
            if verbose:
                print(f"  ! Error writing {file_path}: {e}")
            result['errors'] += 1

    return result


def annotate_codebase(
    src_dir: str,
    dry_run: bool = False,
    verbose: bool = True,
    file_filter: Optional[str] = None,
) -> Dict[str, int]:
    """
    Annotate all TypeScript/TSX files in src directory.

    Args:
        src_dir: Path to src directory
        dry_run: If True, don't write changes
        verbose: If True, print progress
        file_filter: If set, only process files matching this pattern

    Returns:
        {annotated: int, created: int, skipped: int, errors: int, files: int}
    """
    totals = {'annotated': 0, 'created': 0, 'skipped': 0, 'errors': 0, 'files': 0}

    src_path = Path(src_dir)
    if not src_path.exists():
        print(f"Error: Source directory not found: {src_dir}")
        return totals

    # Load all code_docs upfront
    if verbose:
        print("Loading code_docs from database...")

    all_docs = query_code_docs(limit=10000)
    docs_by_file: Dict[str, List[Dict]] = {}
    for doc in all_docs:
        fp = doc.get('file_path', '')
        docs_by_file.setdefault(fp, []).append(doc)

    if verbose:
        print(f"Loaded {len(all_docs)} code_docs across {len(docs_by_file)} files")
        print()

    # Find all TS/TSX files
    patterns = ['**/*.ts', '**/*.tsx']
    files = []
    for pattern in patterns:
        files.extend(src_path.glob(pattern))

    # Filter if needed
    if file_filter:
        files = [f for f in files if file_filter in str(f)]

    # Sort for consistent output
    files = sorted(files)

    if verbose:
        print(f"Found {len(files)} files to process")
        print()

    for file_path in files:
        if verbose:
            print(f"{file_path.relative_to(src_path.parent)}")

        result = annotate_file(
            str(file_path),
            docs_by_file,
            str(src_path.parent),
            dry_run=dry_run,
            verbose=verbose,
        )

        totals['annotated'] += result['annotated']
        totals['created'] += result['created']
        totals['skipped'] += result['skipped']
        totals['errors'] += result['errors']
        totals['files'] += 1

        if verbose:
            print()

    return totals


def deep_annotate_file(
    file_path: str,
    source_dir: str = '',
    dry_run: bool = False,
    verbose: bool = True,
) -> Dict[str, int]:
    """
    Perform deep annotation on a file - process nested functions and call relationships.

    This should be called AFTER annotate_file to add nested functions and call graph.

    Args:
        file_path: Absolute or relative path to source file
        source_dir: Base directory for resolving relative paths
        dry_run: If True, don't write to database
        verbose: If True, print progress

    Returns:
        {nested: int, calls: int, errors: int}
    """
    result = {'nested': 0, 'calls': 0, 'errors': 0}

    path = Path(file_path)
    if not path.exists():
        if verbose:
            print(f"  ! File not found: {file_path}")
        result['errors'] += 1
        return result

    try:
        source = path.read_text(encoding='utf-8')
    except Exception as e:
        if verbose:
            print(f"  ! Error reading {file_path}: {e}")
        result['errors'] += 1
        return result

    # Get relative path for lookups
    rel_path = str(file_path).replace('\\', '/')
    if source_dir:
        source_dir_clean = source_dir.replace('\\', '/')
        if rel_path.startswith(source_dir_clean):
            rel_path = rel_path[len(source_dir_clean):].lstrip('/')

    if not rel_path.startswith('src/'):
        if '/src/' in rel_path:
            rel_path = 'src/' + rel_path.split('/src/', 1)[1]

    # Get top-level symbols to find parents
    symbols = extract_symbols_regex(source, str(file_path))

    for symbol in symbols:
        # Skip non-function symbols
        if symbol.type in ('interface', 'type', 'constant', 'variable'):
            continue

        # Look up parent code_doc
        parent_doc = get_code_doc_by_name(symbol.name, rel_path)
        if not parent_doc:
            if verbose:
                print(f"  ? No code_doc for {symbol.name} - skipping deep analysis")
            continue

        parent_id = parent_doc['id']

        # Extract nested functions
        nested_funcs = extract_nested_functions(source, symbol)
        area = infer_area(rel_path)

        for nested in nested_funcs:
            if dry_run:
                if verbose:
                    print(f"    [DRY] Would create nested: {nested.name} under {symbol.name}")
            else:
                nested_id = store_nested_code_doc(
                    file_path=rel_path,
                    symbol_name=nested.name,
                    symbol_type=nested.type,
                    parent_id=parent_id,
                    line_start=nested.line_start,
                    line_end=nested.line_end,
                    signature=nested.signature,
                    purpose=f"TODO: Document {nested.name}",
                    area=area,
                )
                if verbose:
                    print(f"    + nested: {nested.name} ({nested.type}) -> code_id:{nested_id}")
            result['nested'] += 1

        # Extract function calls
        calls = extract_function_calls(source, symbol)

        for call in calls:
            # Try to resolve callee_id
            callee_doc = get_code_doc_by_name(call.callee_name, rel_path)
            callee_id = callee_doc['id'] if callee_doc else None

            if dry_run:
                if verbose:
                    ext = "[ext]" if callee_id is None else f"[{callee_id}]"
                    print(f"    [DRY] Would store call: {symbol.name} -> {call.callee_name} {ext}")
            else:
                store_call(
                    caller_id=parent_id,
                    callee_name=call.callee_name,
                    call_type=call.call_type,
                    callee_id=callee_id,
                    line_number=call.line_number,
                )
            result['calls'] += 1

    return result


def deep_annotate_codebase(
    src_dir: str,
    dry_run: bool = False,
    verbose: bool = True,
    file_filter: Optional[str] = None,
) -> Dict[str, int]:
    """
    Perform deep annotation on all TypeScript/TSX files.

    Args:
        src_dir: Path to src directory
        dry_run: If True, don't write to database
        verbose: If True, print progress
        file_filter: If set, only process files matching this pattern

    Returns:
        {nested: int, calls: int, errors: int, files: int}
    """
    totals = {'nested': 0, 'calls': 0, 'errors': 0, 'files': 0}

    src_path = Path(src_dir)
    if not src_path.exists():
        print(f"Error: Source directory not found: {src_dir}")
        return totals

    # Find all TS/TSX files
    patterns = ['**/*.ts', '**/*.tsx']
    files = []
    for pattern in patterns:
        files.extend(src_path.glob(pattern))

    if file_filter:
        files = [f for f in files if file_filter in str(f)]

    files = sorted(files)

    if verbose:
        print(f"Deep annotating {len(files)} files...")
        print()

    for file_path in files:
        if verbose:
            print(f"{file_path.relative_to(src_path.parent)}")

        result = deep_annotate_file(
            str(file_path),
            str(src_path.parent),
            dry_run=dry_run,
            verbose=verbose,
        )

        totals['nested'] += result['nested']
        totals['calls'] += result['calls']
        totals['errors'] += result['errors']
        totals['files'] += 1

        if verbose and (result['nested'] > 0 or result['calls'] > 0):
            print()

    return totals


def annotate_cli(args) -> int:
    """
    CLI entry point for annotate command.

    Args:
        args: Parsed argparse namespace with:
            - path: Optional file or directory path
            - dry_run: Boolean
            - deep: Boolean for deep annotation

    Returns:
        Exit code (0 for success)
    """
    import os

    # Determine source directory
    # We're in team/toolbox/, src is at ../src/
    toolbox_dir = Path(__file__).parent
    team_dir = toolbox_dir.parent
    project_dir = team_dir.parent
    src_dir = project_dir / 'src'

    path = getattr(args, 'path', None)
    dry_run = getattr(args, 'dry_run', False)
    deep = getattr(args, 'deep', False)

    if dry_run:
        print("=== DRY RUN (no changes will be written) ===")
        print()

    if path:
        # Single file or filtered
        path = Path(path)
        if path.is_file():
            # Load docs
            all_docs = query_code_docs(limit=10000)
            docs_by_file: Dict[str, List[Dict]] = {}
            for doc in all_docs:
                fp = doc.get('file_path', '')
                docs_by_file.setdefault(fp, []).append(doc)

            print(f"Annotating {path}")
            result = annotate_file(
                str(path),
                docs_by_file,
                str(project_dir),
                dry_run=dry_run,
            )
            print()
            print(f"Summary: {result['annotated']} annotated, {result['created']} created, {result['skipped']} skipped")

            if deep:
                print()
                print("=== Deep Annotation ===")
                deep_result = deep_annotate_file(
                    str(path),
                    str(project_dir),
                    dry_run=dry_run,
                )
                print()
                print(f"Deep: {deep_result['nested']} nested, {deep_result['calls']} calls")
        else:
            # Treat as filter pattern
            totals = annotate_codebase(
                str(src_dir),
                dry_run=dry_run,
                file_filter=str(path),
            )
            print(f"Summary: {totals['files']} files, {totals['annotated']} annotated, {totals['created']} created, {totals['skipped']} skipped")

            if deep:
                print()
                print("=== Deep Annotation ===")
                deep_totals = deep_annotate_codebase(
                    str(src_dir),
                    dry_run=dry_run,
                    file_filter=str(path),
                )
                print(f"Deep: {deep_totals['nested']} nested, {deep_totals['calls']} calls")
    else:
        # Full codebase
        print(f"Annotating {src_dir}")
        print()
        totals = annotate_codebase(str(src_dir), dry_run=dry_run)
        print(f"Summary: {totals['files']} files, {totals['annotated']} annotated, {totals['created']} created, {totals['skipped']} skipped")

        if deep:
            print()
            print("=== Deep Annotation ===")
            deep_totals = deep_annotate_codebase(str(src_dir), dry_run=dry_run)
            print(f"Deep: {deep_totals['nested']} nested, {deep_totals['calls']} calls")

    return 0
