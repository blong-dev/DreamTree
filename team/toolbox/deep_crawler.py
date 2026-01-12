"""
Deep Crawler - extracts nested functions and call graphs from source code.

Extends the basic crawler to capture:
1. Nested functions (callbacks, hooks, internal helpers)
2. Function calls (which functions call which)
"""

import re
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass, field

from .crawler import Symbol, extract_symbols_regex


@dataclass
class NestedSymbol:
    """A function defined inside another function."""
    name: str
    type: str  # callback, arrow, function
    line_start: int
    line_end: int
    parent_line_start: int  # Line where parent function starts
    signature: Optional[str] = None


@dataclass
class FunctionCall:
    """A function call made within a function body."""
    caller_name: str
    caller_line_start: int
    callee_name: str
    call_type: str  # direct, hook, method, import
    line_number: int


def extract_nested_functions(
    source: str,
    parent: Symbol,
) -> List[NestedSymbol]:
    """
    Extract functions defined inside a parent function.

    Looks for:
    - const name = useCallback(() => { ... })
    - const name = () => { ... }
    - const name = function() { ... }
    - function name() { ... } (inside parent)

    Args:
        source: Full source code
        parent: Parent symbol to search within

    Returns:
        List of nested symbols found
    """
    nested = []
    lines = source.split('\n')

    # Get the body of the parent function
    if parent.line_start is None or parent.line_end is None:
        return nested

    start_idx = parent.line_start - 1  # 0-indexed
    end_idx = min(parent.line_end, len(lines))
    body_lines = lines[start_idx:end_idx]
    body = '\n'.join(body_lines)

    # Pattern for useCallback/useMemo with named result
    # const name = useCallback(() => { ... }, [deps])
    callback_pattern = r'const\s+(\w+)\s*=\s*use(?:Callback|Memo)\s*\(\s*\('
    for match in re.finditer(callback_pattern, body):
        name = match.group(1)
        # Find line number within parent
        pos = match.start()
        line_in_body = body[:pos].count('\n')
        actual_line = parent.line_start + line_in_body

        # Find end of callback (approximate - look for closing })
        end_line = find_callback_end(body, pos, parent.line_start)

        nested.append(NestedSymbol(
            name=name,
            type='callback',
            line_start=actual_line,
            line_end=end_line,
            parent_line_start=parent.line_start,
            signature=f"const {name} = useCallback(() => ...)",
        ))

    # Pattern for arrow functions: const name = (...) => {
    arrow_pattern = r'const\s+(\w+)\s*=\s*(?:\([^)]*\)|[a-zA-Z_]\w*)\s*=>\s*\{'
    for match in re.finditer(arrow_pattern, body):
        name = match.group(1)

        # Skip if this is the parent function itself (prevents self-referencing)
        if name == parent.name:
            continue

        # Skip if it's a useCallback (already captured)
        if f'useCallback' in body[max(0, match.start()-20):match.start()]:
            continue
        if f'useMemo' in body[max(0, match.start()-20):match.start()]:
            continue

        pos = match.start()
        line_in_body = body[:pos].count('\n')
        actual_line = parent.line_start + line_in_body
        end_line = find_arrow_end(body, pos, parent.line_start)

        nested.append(NestedSymbol(
            name=name,
            type='arrow',
            line_start=actual_line,
            line_end=end_line,
            parent_line_start=parent.line_start,
            signature=f"const {name} = (...) => {{ ... }}",
        ))

    # Pattern for named function expressions
    func_pattern = r'const\s+(\w+)\s*=\s*function\s*\([^)]*\)\s*\{'
    for match in re.finditer(func_pattern, body):
        name = match.group(1)
        pos = match.start()
        line_in_body = body[:pos].count('\n')
        actual_line = parent.line_start + line_in_body

        nested.append(NestedSymbol(
            name=name,
            type='function',
            line_start=actual_line,
            line_end=actual_line + 10,  # Approximate
            parent_line_start=parent.line_start,
            signature=f"const {name} = function() {{ ... }}",
        ))

    # Pattern for event handlers: onSomething = () => { or handleSomething = () => {
    handler_pattern = r'(?:const\s+)?(on[A-Z]\w+|handle[A-Z]\w+)\s*=\s*(?:\([^)]*\)|[a-zA-Z_]\w*)?\s*=>\s*\{'
    for match in re.finditer(handler_pattern, body):
        name = match.group(1)

        # Skip if this is the parent function itself (prevents self-referencing)
        if name == parent.name:
            continue

        # Check if already captured
        if any(n.name == name for n in nested):
            continue

        pos = match.start()
        line_in_body = body[:pos].count('\n')
        actual_line = parent.line_start + line_in_body

        nested.append(NestedSymbol(
            name=name,
            type='handler',
            line_start=actual_line,
            line_end=actual_line + 5,  # Approximate
            parent_line_start=parent.line_start,
            signature=f"{name} = () => {{ ... }}",
        ))

    return nested


def find_callback_end(body: str, start_pos: int, base_line: int) -> int:
    """Find the end line of a useCallback."""
    # Simple brace counting from start position
    depth = 0
    in_callback = False
    pos = start_pos

    while pos < len(body):
        char = body[pos]
        if char == '(':
            depth += 1
            in_callback = True
        elif char == ')':
            depth -= 1
            if in_callback and depth == 0:
                # Found the closing ) of useCallback
                line_num = body[:pos].count('\n')
                return base_line + line_num
        pos += 1

    return base_line + body[:start_pos].count('\n') + 10


def find_arrow_end(body: str, start_pos: int, base_line: int) -> int:
    """Find the end line of an arrow function."""
    # Find the opening { then count braces
    brace_pos = body.find('{', start_pos)
    if brace_pos == -1:
        return base_line + body[:start_pos].count('\n') + 5

    depth = 0
    pos = brace_pos

    while pos < len(body):
        char = body[pos]
        if char == '{':
            depth += 1
        elif char == '}':
            depth -= 1
            if depth == 0:
                line_num = body[:pos].count('\n')
                return base_line + line_num
        pos += 1

    return base_line + body[:start_pos].count('\n') + 10


def extract_function_calls(
    source: str,
    symbol: Symbol,
) -> List[FunctionCall]:
    """
    Extract all function calls made within a symbol's body.

    Args:
        source: Full source code
        symbol: Symbol to analyze

    Returns:
        List of function calls found
    """
    calls = []
    lines = source.split('\n')

    if symbol.line_start is None or symbol.line_end is None:
        return calls

    start_idx = symbol.line_start - 1
    end_idx = min(symbol.line_end, len(lines))

    for line_idx in range(start_idx, end_idx):
        line = lines[line_idx]
        line_num = line_idx + 1  # 1-indexed

        # Skip comments
        stripped = line.strip()
        if stripped.startswith('//') or stripped.startswith('/*'):
            continue

        # Extract function calls
        line_calls = extract_calls_from_line(line, line_num, symbol.name, symbol.line_start)
        calls.extend(line_calls)

    # Deduplicate by (callee_name, line_number)
    seen = set()
    unique_calls = []
    for call in calls:
        key = (call.callee_name, call.line_number)
        if key not in seen:
            seen.add(key)
            unique_calls.append(call)

    return unique_calls


def extract_calls_from_line(
    line: str,
    line_num: int,
    caller_name: str,
    caller_line_start: int,
) -> List[FunctionCall]:
    """Extract function calls from a single line."""
    calls = []

    # Pattern for function calls: name( or name<T>(
    # Excludes: if(, for(, while(, switch(, catch(
    keywords = {'if', 'for', 'while', 'switch', 'catch', 'function', 'class', 'const', 'let', 'var', 'return', 'throw', 'new', 'typeof', 'instanceof'}

    # Match function calls
    call_pattern = r'\b([a-zA-Z_]\w*)\s*(?:<[^>]*>)?\s*\('
    for match in re.finditer(call_pattern, line):
        name = match.group(1)

        # Skip keywords
        if name.lower() in keywords:
            continue

        # Skip type annotations like Props(
        if name[0].isupper() and not name.startswith('use'):
            # Might be a component call or type - include it
            pass

        # Determine call type
        call_type = 'direct'
        if name.startswith('use'):
            call_type = 'hook'
        elif '.' in line[:match.start()] and line[:match.start()].rstrip().endswith('.'):
            call_type = 'method'

        calls.append(FunctionCall(
            caller_name=caller_name,
            caller_line_start=caller_line_start,
            callee_name=name,
            call_type=call_type,
            line_number=line_num,
        ))

    # Also catch method calls: object.method(
    method_pattern = r'\.([a-zA-Z_]\w*)\s*\('
    for match in re.finditer(method_pattern, line):
        name = match.group(1)
        # Skip common methods we don't care about
        if name in ('map', 'filter', 'reduce', 'forEach', 'find', 'some', 'every',
                   'push', 'pop', 'shift', 'unshift', 'slice', 'splice', 'concat',
                   'toString', 'valueOf', 'keys', 'values', 'entries',
                   'log', 'warn', 'error', 'info', 'debug',
                   'then', 'catch', 'finally',
                   'addEventListener', 'removeEventListener',
                   'preventDefault', 'stopPropagation',
                   'current'):
            continue

        calls.append(FunctionCall(
            caller_name=caller_name,
            caller_line_start=caller_line_start,
            callee_name=name,
            call_type='method',
            line_number=line_num,
        ))

    return calls


def build_call_graph(file_path: str) -> Dict[str, Any]:
    """
    Build complete call graph for a file.

    Args:
        file_path: Path to the source file

    Returns:
        Dict with:
        - symbols: List of all symbols (including nested)
        - calls: List of all function calls
        - nested_map: Dict mapping parent names to nested symbols
    """
    path = Path(file_path)
    if not path.exists():
        return {'symbols': [], 'calls': [], 'nested_map': {}}

    source = path.read_text(encoding='utf-8')

    # Get top-level symbols
    top_level = extract_symbols_regex(source, file_path)

    all_symbols = list(top_level)
    all_calls = []
    nested_map = {}

    for symbol in top_level:
        # Extract nested functions
        nested = extract_nested_functions(source, symbol)
        nested_map[symbol.name] = nested

        # Convert nested to Symbol format for consistency
        for n in nested:
            all_symbols.append(Symbol(
                name=n.name,
                type=n.type,
                line_start=n.line_start,
                line_end=n.line_end,
                signature=n.signature,
                exported=False,
            ))

        # Extract calls from the symbol
        calls = extract_function_calls(source, symbol)
        all_calls.extend(calls)

        # Also extract calls from nested functions
        for n in nested:
            nested_symbol = Symbol(
                name=n.name,
                type=n.type,
                line_start=n.line_start,
                line_end=n.line_end,
                signature=n.signature,
                exported=False,
            )
            nested_calls = extract_function_calls(source, nested_symbol)
            all_calls.extend(nested_calls)

    return {
        'symbols': all_symbols,
        'calls': all_calls,
        'nested_map': nested_map,
    }


def analyze_file(file_path: str, verbose: bool = True) -> Dict[str, Any]:
    """
    Analyze a file and print results.

    Args:
        file_path: Path to analyze
        verbose: Print results

    Returns:
        Analysis results
    """
    result = build_call_graph(file_path)

    if verbose:
        print(f"\n=== {file_path} ===\n")

        print("Symbols:")
        for sym in result['symbols']:
            print(f"  {sym.name} ({sym.type}) @ lines {sym.line_start}-{sym.line_end}")

        print("\nNested functions:")
        for parent, nested in result['nested_map'].items():
            if nested:
                print(f"  {parent}:")
                for n in nested:
                    print(f"    - {n.name} ({n.type}) @ line {n.line_start}")

        print("\nFunction calls:")
        for call in result['calls'][:20]:  # Limit output
            print(f"  {call.caller_name} -> {call.callee_name} ({call.call_type}) @ line {call.line_number}")
        if len(result['calls']) > 20:
            print(f"  ... and {len(result['calls']) - 20} more")

    return result


if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        analyze_file(sys.argv[1])
    else:
        print("Usage: python deep_crawler.py <file_path>")
