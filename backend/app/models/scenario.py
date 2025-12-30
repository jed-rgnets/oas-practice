"""Scenario data models."""

from enum import Enum
from typing import Any, Optional

from pydantic import BaseModel, Field


class Difficulty(str, Enum):
    """Scenario difficulty levels."""

    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class Topic(str, Enum):
    """OpenAPI specification topics."""

    PATHS = "paths"
    OPERATIONS = "operations"
    PARAMETERS_PATH = "parameters-path"
    PARAMETERS_QUERY = "parameters-query"
    PARAMETERS_HEADER = "parameters-header"
    PARAMETERS_COOKIE = "parameters-cookie"
    REQUEST_BODIES = "request-bodies"
    RESPONSES = "responses"
    MEDIA_TYPES = "media-types"
    SCHEMAS = "schemas"
    COMPONENTS = "components"
    REFERENCES = "references"
    SECURITY = "security"
    TAGS = "tags"
    SERVERS = "servers"
    INFO = "info"
    DISCRIMINATOR = "discriminator"
    CALLBACKS = "callbacks"
    LINKS = "links"


class Requirement(BaseModel):
    """A single requirement that the user must fulfill."""

    id: str = Field(..., description="Unique requirement identifier")
    description: str = Field(..., description="What the user must accomplish")
    hint: Optional[str] = Field(None, description="Optional hint for the user")
    points: int = Field(default=1, ge=1, description="Points awarded for this requirement")


class ValidationRule(BaseModel):
    """Defines how to check if a requirement is met."""

    type: str = Field(
        ...,
        description="Rule type: json_path_exists, json_path_equals, json_path_contains, "
        "json_path_matches, schema_validates, custom",
    )
    config: dict[str, Any] = Field(..., description="Rule-specific configuration")


class ScenarioFile(BaseModel):
    """Schema for scenario YAML files stored on disk."""

    id: str = Field(..., pattern=r"^[a-z0-9-]+$", description="Unique identifier")
    title: str = Field(..., min_length=5, max_length=100)
    description: str = Field(..., min_length=10, max_length=500)
    topics: list[Topic] = Field(..., min_length=1)
    difficulty: Difficulty
    estimated_minutes: int = Field(..., ge=1, le=60)
    points: int = Field(..., ge=1, le=100)
    instructions: str = Field(..., description="Markdown instructions")
    requirements: list[Requirement] = Field(..., min_length=1)
    validation_rules: list[ValidationRule] = Field(..., min_length=1)
    starter_code: str = Field(..., description="Initial YAML template")
    example_solution: Optional[str] = Field(
        None, description="Reference solution (not shown to users)"
    )


class ScenarioSummary(BaseModel):
    """Lightweight scenario info for listing."""

    id: str
    title: str
    description: str
    topics: list[Topic]
    difficulty: Difficulty
    estimated_minutes: int
    points: int


class ScenarioDetail(ScenarioSummary):
    """Full scenario details for practice view."""

    instructions: str
    requirements: list[Requirement]
    starter_code: str


class TopicInfo(BaseModel):
    """Topic metadata with scenario count."""

    id: str
    name: str
    description: str
    scenario_count: int
