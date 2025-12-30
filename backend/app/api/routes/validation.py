"""Validation API endpoints."""

from fastapi import APIRouter, Depends, HTTPException

from app.api.dependencies import get_scenario_service, get_validation_service
from app.models.validation import ValidationRequest, ValidationResponse
from app.services.scenario_service import ScenarioService
from app.services.validation_service import ValidationService

router = APIRouter()


@router.post("/scenarios/{scenario_id}/validate", response_model=ValidationResponse)
async def validate_solution(
    scenario_id: str,
    request: ValidationRequest,
    scenario_service: ScenarioService = Depends(get_scenario_service),
    validation_service: ValidationService = Depends(get_validation_service),
) -> ValidationResponse:
    """Validate a user's solution against scenario requirements."""
    scenario = scenario_service.get_scenario(scenario_id)
    if not scenario:
        raise HTTPException(
            status_code=404,
            detail={"error": "scenario_not_found", "message": f"Scenario '{scenario_id}' not found"},
        )

    return validation_service.validate_solution(scenario, request)
