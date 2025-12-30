"""Validation data models."""

from pydantic import BaseModel, Field


class ValidationRequest(BaseModel):
    """Request body for solution validation."""

    solution: str = Field(..., description="User's YAML/JSON solution")


class SyntaxError(BaseModel):
    """YAML syntax error details."""

    line: int
    column: int
    message: str


class Warning(BaseModel):
    """Non-blocking warning about the spec."""

    path: str = Field(..., description="JSON path to the issue")
    message: str


class RequirementResult(BaseModel):
    """Result of checking a single requirement."""

    requirement_id: str
    passed: bool
    message: str
    points_earned: int = 0
    points_possible: int = 1


class ValidationResponse(BaseModel):
    """Response from solution validation."""

    valid: bool
    score: int
    max_score: int
    results: list[RequirementResult]
    feedback: str
    syntax_errors: list[SyntaxError]
    warnings: list[Warning]
