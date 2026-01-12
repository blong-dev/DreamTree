"""
Pydantic models for validating inputs to the Team Knowledge Base.

These models ensure consistent data structure before database insertion.
"""

from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, field_validator
import json

from .constants import (
    VALID_AREAS,
    VALID_SYMBOL_TYPES,
    VALID_OWNERS,
    VALID_AUTHORS,
    VALID_MESSAGE_TYPES,
    VALID_BUG_STATUSES,
    VALID_PRIORITIES,
    VALID_TASK_STATUSES,
    VALID_RELATIONSHIPS,
    VALID_CHANGE_TYPES,
    VALID_DOC_CATEGORIES,
    VALID_LEARNING_CATEGORIES,
    VALID_CALL_TYPES,
    VALID_NESTED_TYPES,
)


class CodeDocInput(BaseModel):
    """Input model for storing code documentation."""

    file_path: str = Field(..., description="Path to the source file")
    symbol_name: Optional[str] = Field(None, description="Function/class name, None for file-level")
    symbol_type: str = Field(..., description="Type of symbol (file, function, class, etc.)")
    line_start: Optional[int] = Field(None, ge=1, description="Starting line number")
    line_end: Optional[int] = Field(None, ge=1, description="Ending line number")
    signature: Optional[str] = Field(None, description="Function signature if applicable")
    purpose: str = Field(..., min_length=10, description="What the code does")
    why: Optional[str] = Field(None, description="Design rationale")
    connections: List[str] = Field(default_factory=list, description="Related code references")
    area: str = Field(..., description="Area that owns this code")

    @field_validator("symbol_type")
    @classmethod
    def validate_symbol_type(cls, v: str) -> str:
        if v not in VALID_SYMBOL_TYPES:
            raise ValueError(f"symbol_type must be one of {VALID_SYMBOL_TYPES}")
        return v

    @field_validator("area")
    @classmethod
    def validate_area(cls, v: str) -> str:
        if v not in VALID_AREAS:
            raise ValueError(f"area must be one of {VALID_AREAS}")
        return v

    @field_validator("line_end")
    @classmethod
    def validate_line_end(cls, v: Optional[int], info) -> Optional[int]:
        if v is not None and info.data.get("line_start") is not None:
            if v < info.data["line_start"]:
                raise ValueError("line_end must be >= line_start")
        return v

    def connections_json(self) -> str:
        """Return connections as JSON string for database storage."""
        return json.dumps(self.connections)


class BugInput(BaseModel):
    """Input model for storing bug reports."""

    id: str = Field(..., pattern=r"^(BUG|IMP)-\d+$", description="Bug ID (BUG-001 or IMP-001)")
    title: str = Field(..., min_length=5, description="Short description of the bug")
    status: str = Field(default="open", description="Current status")
    priority: str = Field(default="medium", description="Priority level")
    area: Optional[str] = Field(None, description="Affected area")
    owner: Optional[str] = Field(None, description="Assigned team member")
    trivial: bool = Field(default=False, description="Skip QA review if True")
    description: Optional[str] = Field(None, description="Full bug description")
    expected_behavior: Optional[str] = Field(None, description="What should happen")
    root_cause: Optional[str] = Field(None, description="Why the bug occurred")
    fix_applied: Optional[str] = Field(None, description="How it was fixed")
    files_changed: List[str] = Field(default_factory=list, description="Modified files")
    acceptance_criteria: List[str] = Field(default_factory=list, description="Test criteria")
    found_by: Optional[str] = Field(None, description="Who found the bug")
    verified_by: Optional[str] = Field(None, description="Who verified the fix")

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        if v not in VALID_BUG_STATUSES:
            raise ValueError(f"status must be one of {VALID_BUG_STATUSES}")
        return v

    @field_validator("priority")
    @classmethod
    def validate_priority(cls, v: str) -> str:
        if v not in VALID_PRIORITIES:
            raise ValueError(f"priority must be one of {VALID_PRIORITIES}")
        return v

    @field_validator("area")
    @classmethod
    def validate_area(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in VALID_AREAS:
            raise ValueError(f"area must be one of {VALID_AREAS}")
        return v

    @field_validator("owner")
    @classmethod
    def validate_owner(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in VALID_OWNERS:
            raise ValueError(f"owner must be one of {VALID_OWNERS}")
        return v

    def files_changed_json(self) -> str:
        return json.dumps(self.files_changed)

    def acceptance_criteria_json(self) -> str:
        return json.dumps(self.acceptance_criteria)


class ChangelogInput(BaseModel):
    """Input model for changelog entries."""

    date: str = Field(..., description="Date of the change (YYYY-MM-DD)")
    title: str = Field(..., min_length=5, description="Short description of the change")
    what_changed: str = Field(..., min_length=10, description="Description of the change")
    what_it_was: Optional[str] = Field(None, description="Previous behavior/value")
    why: str = Field(..., min_length=10, description="Rationale for the change")
    files_affected: List[str] = Field(default_factory=list, description="Modified files")
    related_bug_id: Optional[str] = Field(None, description="Related bug ID")

    @field_validator("date")
    @classmethod
    def validate_date(cls, v: str) -> str:
        try:
            datetime.strptime(v, "%Y-%m-%d")
        except ValueError:
            raise ValueError("date must be in YYYY-MM-DD format")
        return v

    def files_affected_json(self) -> str:
        return json.dumps(self.files_affected)


class LearningInput(BaseModel):
    """Input model for learnings."""

    category: str = Field(..., description="Category of the learning")
    learning: str = Field(..., min_length=10, description="The learning itself")
    context: Optional[str] = Field(None, description="Where/when discovered")
    related_bug_id: Optional[str] = Field(None, description="Related bug ID")

    @field_validator("category")
    @classmethod
    def validate_category(cls, v: str) -> str:
        if v not in VALID_LEARNING_CATEGORIES:
            raise ValueError(f"category must be one of {VALID_LEARNING_CATEGORIES}")
        return v


class TaskInput(BaseModel):
    """Input model for tasks."""

    id: str = Field(..., pattern=r"^TASK-\d+$", description="Task ID (TASK-001)")
    bug_id: Optional[str] = Field(None, description="Related bug ID")
    title: str = Field(..., min_length=5, description="Task title")
    owner: str = Field(..., description="Assigned team member")
    status: str = Field(default="pending", description="Task status")
    priority: int = Field(default=2, ge=1, le=3, description="Priority (1=high, 2=medium, 3=low)")
    notes: Optional[str] = Field(None, description="Additional notes")
    files_editing: List[str] = Field(default_factory=list, description="Files being edited")

    @field_validator("owner")
    @classmethod
    def validate_owner(cls, v: str) -> str:
        if v not in VALID_OWNERS:
            raise ValueError(f"owner must be one of {VALID_OWNERS}")
        return v

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        if v not in VALID_TASK_STATUSES:
            raise ValueError(f"status must be one of {VALID_TASK_STATUSES}")
        return v

    def files_editing_json(self) -> str:
        return json.dumps(self.files_editing)


class MessageInput(BaseModel):
    """Input model for board messages (append-only, DB is source of truth)."""

    author: str = Field(..., description="Message author (Queen, Fizz, Buzz, Pazz, Rizz)")
    message_type: str = Field(..., description="Type of message")
    content: str = Field(..., min_length=1, description="Message content")
    refs: Optional[Dict[str, Any]] = Field(default=None, description="References: {bug_id, task_id, reply_to}")
    mentions: List[str] = Field(default_factory=list, description="Mentioned @names")

    @field_validator("author")
    @classmethod
    def validate_author(cls, v: str) -> str:
        if v not in VALID_AUTHORS:
            raise ValueError(f"author must be one of {VALID_AUTHORS}")
        return v

    @field_validator("message_type")
    @classmethod
    def validate_message_type(cls, v: str) -> str:
        if v not in VALID_MESSAGE_TYPES:
            raise ValueError(f"message_type must be one of {VALID_MESSAGE_TYPES}")
        return v

    def refs_json(self) -> Optional[str]:
        return json.dumps(self.refs) if self.refs else None

    def mentions_json(self) -> str:
        return json.dumps(self.mentions)


class DocsIndexInput(BaseModel):
    """Input model for documentation index entries."""

    path: str = Field(..., description="Path to the documentation file")
    category: str = Field(..., description="Documentation category")
    title: str = Field(..., min_length=3, description="Document title")
    purpose: Optional[str] = Field(None, description="What the document covers")
    when_to_read: Optional[str] = Field(None, description="When to reference this doc")
    keywords: List[str] = Field(default_factory=list, description="Search keywords")

    @field_validator("category")
    @classmethod
    def validate_category(cls, v: str) -> str:
        if v not in VALID_DOC_CATEGORIES:
            raise ValueError(f"category must be one of {VALID_DOC_CATEGORIES}")
        return v

    def keywords_json(self) -> str:
        return json.dumps(self.keywords)


class BugCodeRefInput(BaseModel):
    """Input model for bug-to-code references."""

    bug_id: str = Field(..., description="Bug ID")
    code_doc_id: int = Field(..., ge=1, description="Code doc ID")
    relationship: str = Field(..., description="Type of relationship")
    notes: Optional[str] = Field(None, description="Additional notes")

    @field_validator("relationship")
    @classmethod
    def validate_relationship(cls, v: str) -> str:
        if v not in VALID_RELATIONSHIPS:
            raise ValueError(f"relationship must be one of {VALID_RELATIONSHIPS}")
        return v


class ChangelogCodeRefInput(BaseModel):
    """Input model for changelog-to-code references."""

    changelog_id: int = Field(..., ge=1, description="Changelog entry ID")
    code_doc_id: int = Field(..., ge=1, description="Code doc ID")
    change_type: str = Field(..., description="Type of change")

    @field_validator("change_type")
    @classmethod
    def validate_change_type(cls, v: str) -> str:
        if v not in VALID_CHANGE_TYPES:
            raise ValueError(f"change_type must be one of {VALID_CHANGE_TYPES}")
        return v


class CodeCallInput(BaseModel):
    """Input model for function call relationships."""

    caller_id: int = Field(..., ge=1, description="Code doc ID of the calling function")
    callee_id: Optional[int] = Field(None, ge=1, description="Code doc ID of called function (None if external)")
    callee_name: str = Field(..., min_length=1, description="Name of the called function")
    call_type: str = Field(default="direct", description="Type of call")
    line_number: Optional[int] = Field(None, ge=1, description="Line where the call occurs")

    @field_validator("call_type")
    @classmethod
    def validate_call_type(cls, v: str) -> str:
        if v not in VALID_CALL_TYPES:
            raise ValueError(f"call_type must be one of {VALID_CALL_TYPES}")
        return v


class NestedCodeDocInput(BaseModel):
    """Input model for nested/sub-function code documentation."""

    file_path: str = Field(..., description="Path to the source file")
    symbol_name: str = Field(..., min_length=1, description="Function name")
    symbol_type: str = Field(..., description="Type of nested symbol")
    parent_id: int = Field(..., ge=1, description="Code doc ID of parent function")
    line_start: int = Field(..., ge=1, description="Starting line number")
    line_end: Optional[int] = Field(None, ge=1, description="Ending line number")
    signature: Optional[str] = Field(None, description="Function signature")
    purpose: str = Field(default="TODO: Document", description="What the function does")
    area: str = Field(..., description="Area that owns this code")

    @field_validator("symbol_type")
    @classmethod
    def validate_symbol_type(cls, v: str) -> str:
        if v not in VALID_NESTED_TYPES:
            raise ValueError(f"symbol_type must be one of {VALID_NESTED_TYPES}")
        return v

    @field_validator("area")
    @classmethod
    def validate_area(cls, v: str) -> str:
        if v not in VALID_AREAS:
            raise ValueError(f"area must be one of {VALID_AREAS}")
        return v
