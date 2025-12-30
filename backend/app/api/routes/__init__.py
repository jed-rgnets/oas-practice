"""API routes package."""

from fastapi import APIRouter

from app.api.routes import health, scenarios, validation

router = APIRouter()
router.include_router(health.router, tags=["health"])
router.include_router(scenarios.router, prefix="/scenarios", tags=["scenarios"])
router.include_router(validation.router, tags=["validation"])
