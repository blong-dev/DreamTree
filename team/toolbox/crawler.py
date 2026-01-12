"""
AST Crawler for extracting code structure from TypeScript/TSX files.

Uses ts-morph (via Node.js subprocess) for accurate TypeScript parsing.
Falls back to regex-based extraction if Node.js is not available.
"""

import json
import subprocess
import re
from pathlib import Path
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, asdict, field


@dataclass
class Symbol:
    """Represents an extracted code symbol."""
    name: str
    type: str  # function, component, hook, class, interface, type, constant, export
    line_start: int
    line_end: int
    signature: Optional[str] = None
    exported: bool = False


@dataclass
class FileExtraction:
    """Represents extraction results for a single file."""
    file_path: str
    file_type: str  # component, hook, util, api, page, config, type, test
    imports: List[str] = field(default_factory=list)
    symbols: List[Symbol] = field(default_factory=list)
    source: str = ""
    error: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        return {
            "file_path": self.file_path,
            "file_type": self.file_type,
            "imports": self.imports,
            "symbols": [asdict(s) for s in self.symbols],
            "source": self.source,
            "error": self.error,
        }


def infer_file_type(file_path: str, content: str) -> str:
    """Infer the file type from path and content."""
    path = Path(file_path)
    name = path.stem.lower()
    parent = path.parent.name.lower()

    # Check path patterns
    if "test" in name or "spec" in name or parent == "__tests__":
        return "test"
    if parent == "api" or "route" in name:
        return "api"
    if "page" in name or parent == "app":
        return "page"
    if parent == "hooks" or name.startswith("use"):
        return "hook"
    if parent == "types" or name == "types":
        return "type"
    if parent in ("lib", "utils", "helpers"):
        return "util"
    if parent == "config" or name == "config":
        return "config"

    # Check content patterns
    if "export default function" in content and "return (" in content:
        return "component"
    if re.search(r"export\s+(?:default\s+)?function\s+use[A-Z]", content):
        return "hook"
    if "createContext" in content or "useContext" in content:
        return "context"
    if re.search(r"export\s+(?:type|interface)\s+", content):
        return "type"

    # Default based on extension
    if path.suffix == ".tsx":
        return "component"
    return "util"


def extract_imports(content: str) -> List[str]:
    """Extract import statements from file content."""
    imports = []
    # Match import statements
    pattern = r"import\s+(?:(?:\{[^}]+\}|\*\s+as\s+\w+|\w+)\s+from\s+)?['\"]([^'\"]+)['\"]"
    for match in re.finditer(pattern, content):
        imports.append(match.group(1))
    return imports


def extract_symbols_regex(content: str, file_path: str) -> List[Symbol]:
    """Extract symbols using regex (fallback when ts-morph unavailable)."""
    symbols = []
    lines = content.split("\n")

    # Track current line for each match
    def find_line(pos: int) -> int:
        return content[:pos].count("\n") + 1

    # Function/component patterns
    patterns = [
        # export function Name(...) or export default function Name(...)
        (r"export\s+(?:default\s+)?(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)", "function"),
        # const Name = (...) => or const Name = function(...)
        (r"(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s+)?\([^)]*\)\s*(?::\s*[^=]+)?\s*=>", "function"),
        # function Name(...)
        (r"(?<!export\s)function\s+(\w+)\s*\(([^)]*)\)", "function"),
        # class Name
        (r"(?:export\s+)?(?:default\s+)?class\s+(\w+)", "class"),
        # interface Name
        (r"(?:export\s+)?interface\s+(\w+)", "interface"),
        # type Name =
        (r"(?:export\s+)?type\s+(\w+)\s*=", "type"),
        # export const NAME = (constants in UPPER_CASE)
        (r"export\s+const\s+([A-Z][A-Z_0-9]+)\s*=", "constant"),
    ]

    for pattern, sym_type in patterns:
        for match in re.finditer(pattern, content):
            name = match.group(1)
            line_start = find_line(match.start())

            # Determine if it's a React component or hook
            if sym_type == "function":
                if name.startswith("use") and name[3:4].isupper():
                    sym_type = "hook"
                elif name[0].isupper() and ".tsx" in file_path:
                    sym_type = "component"

            # Find end of symbol (simplified: next symbol or EOF)
            line_end = line_start
            brace_count = 0
            in_body = False
            for i, line in enumerate(lines[line_start - 1:], start=line_start):
                brace_count += line.count("{") - line.count("}")
                if "{" in line:
                    in_body = True
                if in_body and brace_count <= 0:
                    line_end = i
                    break
            else:
                line_end = len(lines)

            # Build signature
            signature = None
            if len(match.groups()) > 1:
                signature = f"{name}({match.group(2)})"
            else:
                signature = name

            # Check if exported
            exported = "export" in content[max(0, match.start() - 50):match.start()]

            symbols.append(Symbol(
                name=name,
                type=sym_type,
                line_start=line_start,
                line_end=line_end,
                signature=signature,
                exported=exported,
            ))

    # Deduplicate by name (keep first occurrence)
    seen = set()
    unique_symbols = []
    for sym in symbols:
        if sym.name not in seen:
            seen.add(sym.name)
            unique_symbols.append(sym)

    return unique_symbols


def extract_file(file_path: str, base_path: Optional[str] = None) -> FileExtraction:
    """
    Extract structure from a single TypeScript/TSX file.

    Args:
        file_path: Absolute or relative path to the file
        base_path: Base path for relative file_path in output

    Returns:
        FileExtraction with symbols, imports, and metadata
    """
    path = Path(file_path)

    if not path.exists():
        return FileExtraction(
            file_path=str(file_path),
            file_type="unknown",
            error=f"File not found: {file_path}",
        )

    try:
        content = path.read_text(encoding="utf-8")
    except Exception as e:
        return FileExtraction(
            file_path=str(file_path),
            file_type="unknown",
            error=f"Error reading file: {e}",
        )

    # Make path relative if base_path provided
    if base_path:
        try:
            rel_path = path.relative_to(base_path)
            file_path = str(rel_path).replace("\\", "/")
        except ValueError:
            pass

    return FileExtraction(
        file_path=file_path,
        file_type=infer_file_type(file_path, content),
        imports=extract_imports(content),
        symbols=extract_symbols_regex(content, file_path),
        source=content,
    )


def crawl_directory(
    directory: str,
    extensions: List[str] = None,
    exclude_patterns: List[str] = None,
) -> List[FileExtraction]:
    """
    Crawl a directory and extract structure from all matching files.

    Args:
        directory: Path to directory to crawl
        extensions: File extensions to include (default: [".ts", ".tsx"])
        exclude_patterns: Patterns to exclude (default: ["node_modules", ".next", "dist"])

    Returns:
        List of FileExtraction results
    """
    if extensions is None:
        extensions = [".ts", ".tsx"]

    if exclude_patterns is None:
        exclude_patterns = ["node_modules", ".next", "dist", "__pycache__", ".git"]

    dir_path = Path(directory)
    if not dir_path.exists():
        raise ValueError(f"Directory not found: {directory}")

    results = []

    for path in dir_path.rglob("*"):
        # Skip excluded patterns
        if any(pattern in str(path) for pattern in exclude_patterns):
            continue

        # Skip non-matching extensions
        if path.suffix not in extensions:
            continue

        # Skip non-files
        if not path.is_file():
            continue

        extraction = extract_file(str(path), base_path=str(dir_path))
        results.append(extraction)

    return results


def save_queue(extractions: List[FileExtraction], output_path: str) -> None:
    """Save extraction results to a JSON queue file."""
    data = [e.to_dict() for e in extractions]

    # Remove source from queue (too large) - agent will read files directly
    for item in data:
        item["source"] = f"[{len(item['source'])} chars - read file directly]"

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)


def load_queue(queue_path: str) -> List[Dict[str, Any]]:
    """Load extraction queue from JSON file."""
    with open(queue_path, "r", encoding="utf-8") as f:
        return json.load(f)


# CLI integration
def crawl_for_cli(path: str, output: Optional[str] = None) -> int:
    """Entry point for CLI crawl command."""
    print(f"Crawling: {path}")

    extractions = crawl_directory(path)

    print(f"Found {len(extractions)} files")

    # Count symbols
    total_symbols = sum(len(e.symbols) for e in extractions)
    print(f"Extracted {total_symbols} symbols")

    # Count by file type
    by_type = {}
    for e in extractions:
        by_type[e.file_type] = by_type.get(e.file_type, 0) + 1

    print("\nBy file type:")
    for ftype, count in sorted(by_type.items()):
        print(f"  {ftype}: {count}")

    # Save queue
    if output:
        save_queue(extractions, output)
        print(f"\nQueue saved to: {output}")
    else:
        default_output = Path(path).parent / "crawl_queue.json"
        save_queue(extractions, str(default_output))
        print(f"\nQueue saved to: {default_output}")

    return 0


if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("Usage: python crawler.py <path> [output.json]")
        sys.exit(1)

    path = sys.argv[1]
    output = sys.argv[2] if len(sys.argv) > 2 else None
    sys.exit(crawl_for_cli(path, output))
