"""Scenario API endpoints."""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from app.api.dependencies import get_scenario_service
from app.models.scenario import Difficulty, ScenarioDetail, ScenarioSummary, Topic, TopicInfo
from app.services.scenario_service import ScenarioService

router = APIRouter()


@router.get("", response_model=dict)
async def list_scenarios(
    topics: Optional[str] = Query(None, description="Comma-separated topic filter"),
    difficulty: Optional[Difficulty] = Query(None, description="Difficulty filter"),
    service: ScenarioService = Depends(get_scenario_service),
) -> dict:
    """List all scenarios with optional filtering."""
    topic_list: Optional[list[Topic]] = None
    if topics:
        topic_list = [Topic(t.strip()) for t in topics.split(",")]

    scenarios = service.list_scenarios(topics=topic_list, difficulty=difficulty)

    return {
        "scenarios": scenarios,
        "total": len(scenarios),
        "topics": [t.value for t in Topic],
    }


@router.get("/topics", response_model=dict)
async def list_topics(
    service: ScenarioService = Depends(get_scenario_service),
) -> dict:
    """Get all available topics with descriptions and scenario counts."""
    topic_descriptions = {
        Topic.PATHS: ("Paths", "URL paths and path templating"),
        Topic.OPERATIONS: ("Operations", "HTTP methods (GET, POST, PUT, DELETE, etc.)"),
        Topic.PARAMETERS_PATH: ("Path Parameters", "Parameters embedded in the URL path"),
        Topic.PARAMETERS_QUERY: ("Query Parameters", "URL query string parameters"),
        Topic.PARAMETERS_HEADER: ("Header Parameters", "HTTP header parameters"),
        Topic.PARAMETERS_COOKIE: ("Cookie Parameters", "Cookie-based parameters"),
        Topic.REQUEST_BODIES: ("Request Bodies", "Request body definitions"),
        Topic.RESPONSES: ("Responses", "Response definitions"),
        Topic.MEDIA_TYPES: ("Media Types", "Content type handling"),
        Topic.SCHEMAS: ("Schemas", "JSON Schema definitions"),
        Topic.COMPONENTS: ("Components", "Reusable component definitions"),
        Topic.REFERENCES: ("References ($ref)", "Using $ref for reusability"),
        Topic.SECURITY: ("Security", "Security schemes and requirements"),
        Topic.TAGS: ("Tags", "Operation tagging and grouping"),
        Topic.SERVERS: ("Servers", "Server definitions and variables"),
        Topic.INFO: ("Info", "API metadata"),
        Topic.DISCRIMINATOR: ("Discriminator", "Polymorphism support"),
        Topic.CALLBACKS: ("Callbacks", "Webhook definitions"),
        Topic.LINKS: ("Links", "Operation linking"),
    }

    topics = []
    for topic in Topic:
        name, description = topic_descriptions.get(topic, (topic.value, ""))
        count = service.count_scenarios_by_topic(topic)
        topics.append(
            TopicInfo(
                id=topic.value,
                name=name,
                description=description,
                scenario_count=count,
            )
        )

    return {"topics": topics}


@router.get("/{scenario_id}", response_model=ScenarioDetail)
async def get_scenario(
    scenario_id: str,
    service: ScenarioService = Depends(get_scenario_service),
) -> ScenarioDetail:
    """Get full scenario details by ID."""
    scenario = service.get_scenario(scenario_id)
    if not scenario:
        raise HTTPException(
            status_code=404,
            detail={"error": "scenario_not_found", "message": f"Scenario '{scenario_id}' not found"},
        )

    return ScenarioDetail(
        id=scenario.id,
        title=scenario.title,
        description=scenario.description,
        topics=scenario.topics,
        difficulty=scenario.difficulty,
        estimated_minutes=scenario.estimated_minutes,
        points=scenario.points,
        instructions=scenario.instructions,
        requirements=scenario.requirements,
        starter_code=scenario.starter_code,
    )
