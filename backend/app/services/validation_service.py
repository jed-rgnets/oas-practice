"""Validation engine for checking OpenAPI solutions."""

import logging
import re
from typing import Any, Optional

import yaml
from jsonpath_ng import parse as jsonpath_parse
from jsonschema import ValidationError as JsonSchemaValidationError
from jsonschema import validate as json_validate
from openapi_spec_validator import validate
from openapi_spec_validator.validation.exceptions import OpenAPIValidationError

from app.models.scenario import Requirement, ScenarioFile, ValidationRule
from app.models.validation import (
    RequirementResult,
    SyntaxError,
    ValidationRequest,
    ValidationResponse,
    Warning,
)
from app.services.custom_validators import get_validator

logger = logging.getLogger(__name__)


class ValidationService:
    """Orchestrates the validation pipeline for OpenAPI solutions."""

    def validate_solution(
        self,
        scenario: ScenarioFile,
        request: ValidationRequest,
    ) -> ValidationResponse:
        """
        Main validation entry point.

        Pipeline:
        1. Parse YAML/JSON
        2. Validate OpenAPI structure
        3. Run semantic requirement checks
        4. Calculate score and generate feedback
        """
        # Step 1: Parse YAML
        parsed, syntax_errors = self._parse_yaml(request.solution)
        if syntax_errors:
            return ValidationResponse(
                valid=False,
                score=0,
                max_score=self._calculate_max_score(scenario),
                results=[],
                feedback="Your YAML has syntax errors. Please fix them before validation.",
                syntax_errors=syntax_errors,
                warnings=[],
            )

        # Step 2: Validate OpenAPI structure
        structure_warnings = self._validate_openapi_structure(parsed)

        # Step 3: Run semantic checks
        results = self._check_requirements(scenario, parsed)

        # Step 4: Calculate results
        score = sum(r.points_earned for r in results)
        max_score = sum(r.points_possible for r in results)
        all_passed = all(r.passed for r in results)

        return ValidationResponse(
            valid=all_passed,
            score=score,
            max_score=max_score,
            results=results,
            feedback=self._generate_feedback(results, all_passed),
            syntax_errors=[],
            warnings=structure_warnings + self._collect_warnings(parsed),
        )

    def _parse_yaml(self, content: str) -> tuple[Optional[dict], list[SyntaxError]]:
        """Parse YAML content, return parsed dict or syntax errors."""
        try:
            parsed = yaml.safe_load(content)
            if parsed is None:
                return None, [
                    SyntaxError(line=1, column=1, message="Empty document")
                ]
            if not isinstance(parsed, dict):
                return None, [
                    SyntaxError(
                        line=1, column=1, message="OpenAPI document must be an object"
                    )
                ]
            return parsed, []
        except yaml.YAMLError as e:
            line = getattr(e, "problem_mark", None)
            return None, [
                SyntaxError(
                    line=line.line + 1 if line else 1,
                    column=line.column + 1 if line else 1,
                    message=str(e),
                )
            ]

    def _validate_openapi_structure(self, spec: dict) -> list[Warning]:
        """Validate against OpenAPI 3.0 schema and return warnings."""
        warnings = []
        try:
            validate(spec)
        except OpenAPIValidationError as e:
            # Convert to warnings - we still allow semantic checking
            warnings.append(
                Warning(
                    path=str(list(e.schema_path)) if hasattr(e, "schema_path") else "",
                    message=str(e.message) if hasattr(e, "message") else str(e),
                )
            )
        except Exception as e:
            warnings.append(Warning(path="", message=f"OpenAPI validation error: {e}"))
        return warnings

    def _check_requirements(
        self,
        scenario: ScenarioFile,
        spec: dict,
    ) -> list[RequirementResult]:
        """Check each requirement using its validation rules."""
        results = []

        for req, rule in zip(scenario.requirements, scenario.validation_rules):
            result = self._evaluate_rule(req, rule, spec)
            results.append(result)

        return results

    def _evaluate_rule(
        self,
        requirement: Requirement,
        rule: ValidationRule,
        spec: dict,
    ) -> RequirementResult:
        """Evaluate a single validation rule."""
        evaluators = {
            "json_path_exists": self._eval_json_path_exists,
            "json_path_equals": self._eval_json_path_equals,
            "json_path_contains": self._eval_json_path_contains,
            "json_path_matches": self._eval_json_path_matches,
            "schema_validates": self._eval_schema_validates,
            "custom": self._eval_custom,
        }

        evaluator = evaluators.get(rule.type)
        if not evaluator:
            return RequirementResult(
                requirement_id=requirement.id,
                passed=False,
                message=f"Unknown rule type: {rule.type}",
                points_earned=0,
                points_possible=requirement.points,
            )

        try:
            return evaluator(requirement, rule.config, spec)
        except Exception as e:
            logger.error(f"Error evaluating rule {rule.type}: {e}")
            return RequirementResult(
                requirement_id=requirement.id,
                passed=False,
                message=f"Validation error: {e}",
                points_earned=0,
                points_possible=requirement.points,
            )

    def _eval_json_path_exists(
        self, req: Requirement, config: dict[str, Any], spec: dict
    ) -> RequirementResult:
        """Check if a JSON path exists in the spec."""
        path = config["path"]
        expr = jsonpath_parse(path)
        matches = expr.find(spec)

        passed = len(matches) > 0
        return RequirementResult(
            requirement_id=req.id,
            passed=passed,
            message=req.description if passed else f"Path '{path}' not found",
            points_earned=req.points if passed else 0,
            points_possible=req.points,
        )

    def _eval_json_path_equals(
        self, req: Requirement, config: dict[str, Any], spec: dict
    ) -> RequirementResult:
        """Check if a JSON path equals a specific value."""
        path = config["path"]
        expected = config["value"]

        expr = jsonpath_parse(path)
        matches = expr.find(spec)

        if not matches:
            return RequirementResult(
                requirement_id=req.id,
                passed=False,
                message=f"Path '{path}' not found",
                points_earned=0,
                points_possible=req.points,
            )

        actual = matches[0].value
        passed = actual == expected

        return RequirementResult(
            requirement_id=req.id,
            passed=passed,
            message=req.description if passed else f"Expected '{expected}', got '{actual}'",
            points_earned=req.points if passed else 0,
            points_possible=req.points,
        )

    def _eval_json_path_contains(
        self, req: Requirement, config: dict[str, Any], spec: dict
    ) -> RequirementResult:
        """Check if a JSON path contains specific values."""
        path = config["path"]
        required_values = config["values"]

        expr = jsonpath_parse(path)
        matches = expr.find(spec)

        if not matches:
            return RequirementResult(
                requirement_id=req.id,
                passed=False,
                message=f"Path '{path}' not found",
                points_earned=0,
                points_possible=req.points,
            )

        actual = matches[0].value
        if isinstance(actual, dict):
            actual_set = set(actual.keys())
        elif isinstance(actual, list):
            actual_set = set(actual)
        else:
            actual_set = {actual}

        missing = set(required_values) - actual_set
        passed = len(missing) == 0

        return RequirementResult(
            requirement_id=req.id,
            passed=passed,
            message=req.description if passed else f"Missing: {list(missing)}",
            points_earned=req.points if passed else 0,
            points_possible=req.points,
        )

    def _eval_json_path_matches(
        self, req: Requirement, config: dict[str, Any], spec: dict
    ) -> RequirementResult:
        """Check if a JSON path value matches a regex pattern."""
        path = config["path"]
        pattern = config["pattern"]

        expr = jsonpath_parse(path)
        matches = expr.find(spec)

        if not matches:
            return RequirementResult(
                requirement_id=req.id,
                passed=False,
                message=f"Path '{path}' not found",
                points_earned=0,
                points_possible=req.points,
            )

        actual = str(matches[0].value)
        passed = bool(re.match(pattern, actual))

        return RequirementResult(
            requirement_id=req.id,
            passed=passed,
            message=req.description if passed else f"Value '{actual}' doesn't match pattern",
            points_earned=req.points if passed else 0,
            points_possible=req.points,
        )

    def _eval_schema_validates(
        self, req: Requirement, config: dict[str, Any], spec: dict
    ) -> RequirementResult:
        """Validate a portion of the spec against a JSON schema."""
        path = config["path"]
        schema = config["schema"]

        expr = jsonpath_parse(path)
        matches = expr.find(spec)

        if not matches:
            return RequirementResult(
                requirement_id=req.id,
                passed=False,
                message=f"Path '{path}' not found",
                points_earned=0,
                points_possible=req.points,
            )

        try:
            json_validate(instance=matches[0].value, schema=schema)
            passed = True
            message = req.description
        except JsonSchemaValidationError as e:
            passed = False
            message = f"Schema validation failed: {e.message}"

        return RequirementResult(
            requirement_id=req.id,
            passed=passed,
            message=message,
            points_earned=req.points if passed else 0,
            points_possible=req.points,
        )

    def _eval_custom(
        self, req: Requirement, config: dict[str, Any], spec: dict
    ) -> RequirementResult:
        """Run a custom validation function."""
        validator_name = config["validator"]
        validator_args = config.get("args", {})

        validator = get_validator(validator_name)
        if not validator:
            return RequirementResult(
                requirement_id=req.id,
                passed=False,
                message=f"Unknown custom validator: {validator_name}",
                points_earned=0,
                points_possible=req.points,
            )

        passed, message = validator(spec, **validator_args)

        return RequirementResult(
            requirement_id=req.id,
            passed=passed,
            message=message if message else req.description,
            points_earned=req.points if passed else 0,
            points_possible=req.points,
        )

    def _calculate_max_score(self, scenario: ScenarioFile) -> int:
        """Calculate maximum possible score."""
        return sum(req.points for req in scenario.requirements)

    def _generate_feedback(
        self, results: list[RequirementResult], all_passed: bool
    ) -> str:
        """Generate human-friendly feedback."""
        if all_passed:
            return "Excellent work! Your OpenAPI specification meets all requirements."

        passed_count = sum(1 for r in results if r.passed)
        total_count = len(results)

        if passed_count == 0:
            return "Let's work through this step by step. Check the requirements and try again."
        elif passed_count < total_count / 2:
            return f"You're making progress! {passed_count}/{total_count} requirements met."
        else:
            return f"Almost there! {passed_count}/{total_count} requirements met. Review the failed checks."

    def _collect_warnings(self, spec: dict) -> list[Warning]:
        """Collect non-blocking warnings about the spec."""
        warnings = []

        # Warn about missing descriptions
        if "info" in spec and not spec["info"].get("description"):
            warnings.append(
                Warning(path="info.description", message="Consider adding an API description")
            )

        return warnings
