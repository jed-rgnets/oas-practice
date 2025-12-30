"""Health check endpoint."""

from fastapi import APIRouter, Depends

from app.api.dependencies import get_scenario_service
from app.config import settings
from app.services.scenario_service import ScenarioService

router = APIRouter()


@router.get("/health")
async def health_check(
    scenario_service: ScenarioService = Depends(get_scenario_service),
) -> dict:
    """Health check endpoint."""
    return {
        "status": "healthy",
        "version": settings.app_version,
        "scenarios_loaded": len(scenario_service.scenarios),
    }
