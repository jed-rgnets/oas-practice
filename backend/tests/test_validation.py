"""Validation service tests."""

import pytest

from app.models.scenario import Difficulty, Requirement, ScenarioFile, Topic, ValidationRule
from app.models.validation import ValidationRequest
from app.services.validation_service import ValidationService


@pytest.fixture
def validation_service():
    """Create a validation service instance."""
    return ValidationService()


@pytest.fixture
def sample_scenario():
    """Create a sample scenario for testing."""
    return ScenarioFile(
        id="test-scenario",
        title="Test Scenario",
        description="A test scenario for validation",
        topics=[Topic.PATHS, Topic.RESPONSES],
        difficulty=Difficulty.BEGINNER,
        estimated_minutes=5,
        points=10,
        instructions="Test instructions",
        requirements=[
            Requirement(
                id="req-1",
                description="Define a GET operation at /users",
                points=5,
            ),
            Requirement(
                id="req-2",
                description="Return a 200 response",
                points=5,
            ),
        ],
        validation_rules=[
            ValidationRule(
                type="json_path_exists",
                config={"path": "$.paths['/users'].get"},
            ),
            ValidationRule(
                type="json_path_exists",
                config={"path": "$.paths['/users'].get.responses['200']"},
            ),
        ],
        starter_code="openapi: '3.0.3'\ninfo:\n  title: Test\n  version: '1.0.0'\npaths: {}",
        example_solution=None,
    )


def test_valid_solution(validation_service, sample_scenario):
    """Test validation of a correct solution."""
    solution = """
openapi: "3.0.3"
info:
  title: Test API
  version: "1.0.0"
paths:
  /users:
    get:
      responses:
        '200':
          description: Success
"""
    request = ValidationRequest(solution=solution)
    result = validation_service.validate_solution(sample_scenario, request)

    assert result.valid is True
    assert result.score == 10
    assert result.max_score == 10
    assert len(result.results) == 2
    assert all(r.passed for r in result.results)


def test_invalid_yaml_syntax(validation_service, sample_scenario):
    """Test validation of invalid YAML."""
    solution = """
openapi: "3.0.3"
info:
  title: Test
  invalid yaml: here
    nested: wrong
"""
    request = ValidationRequest(solution=solution)
    result = validation_service.validate_solution(sample_scenario, request)

    assert result.valid is False
    assert result.score == 0
    assert len(result.syntax_errors) > 0


def test_partial_solution(validation_service, sample_scenario):
    """Test validation of a partial solution."""
    solution = """
openapi: "3.0.3"
info:
  title: Test API
  version: "1.0.0"
paths:
  /users:
    get:
      responses:
        '201':
          description: Created
"""
    request = ValidationRequest(solution=solution)
    result = validation_service.validate_solution(sample_scenario, request)

    assert result.valid is False
    assert result.score == 5  # Only first requirement passes
    assert result.max_score == 10
    # First requirement passes, second fails
    assert result.results[0].passed is True
    assert result.results[1].passed is False
