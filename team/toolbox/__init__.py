"""
Team Knowledge Base Toolbox

A Python package for managing the DreamTree team knowledge base.
Provides AST crawling, code documentation, bug tracking, and team coordination.

Usage:
    python -m team.toolbox.cli docs WorkbookView.tsx
    python -m team.toolbox.cli bugs --status open
    python -m team.toolbox.cli crawl src/
"""

from .constants import VALID_AREAS, VALID_SYMBOL_TYPES, VALID_OWNERS
from .storage import (
    init_db,
    store_code_doc,
    store_bug,
    store_changelog,
    store_learning,
    query_code_docs,
    query_bugs,
)

__version__ = "0.1.0"

__all__ = [
    "VALID_AREAS",
    "VALID_SYMBOL_TYPES",
    "VALID_OWNERS",
    "init_db",
    "store_code_doc",
    "store_bug",
    "store_changelog",
    "store_learning",
    "query_code_docs",
    "query_bugs",
]
