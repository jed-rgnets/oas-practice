"""Shared API dependencies."""

from functools import lru_cache

from app.config import settings
from app.services.scenario_service import ScenarioService
from app.services.validation_service import ValidationService


@lru_cache
def get_scenario_service() -> ScenarioService:
    """Get the scenario service singleton."""
    return ScenarioService(settings.scenarios_path)


@lru_cache
def get_validation_service() -> ValidationService:
    """Get the validation service singleton."""
    return ValidationService()
