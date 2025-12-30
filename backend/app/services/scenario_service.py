"""Scenario loading and management service."""

import logging
from pathlib import Path
from typing import Optional

import yaml

from app.models.scenario import Difficulty, ScenarioFile, ScenarioSummary, Topic

logger = logging.getLogger(__name__)


class ScenarioService:
    """Service for loading and filtering practice scenarios."""

    def __init__(self, scenarios_path: str):
        self.scenarios_path = Path(scenarios_path)
        self.scenarios: dict[str, ScenarioFile] = {}
        self._load_scenarios()

    def _load_scenarios(self) -> None:
        """Load all scenario files from disk."""
        if not self.scenarios_path.exists():
            logger.warning(f"Scenarios directory not found: {self.scenarios_path}")
            return

        for yaml_file in self.scenarios_path.glob("*.yaml"):
            try:
                with open(yaml_file, encoding="utf-8") as f:
                    data = yaml.safe_load(f)
                scenario = ScenarioFile(**data)
                self.scenarios[scenario.id] = scenario
                logger.info(f"Loaded scenario: {scenario.id}")
            except Exception as e:
                logger.error(f"Failed to load scenario {yaml_file}: {e}")

        logger.info(f"Loaded {len(self.scenarios)} scenarios")

    def list_scenarios(
        self,
        topics: Optional[list[Topic]] = None,
        difficulty: Optional[Difficulty] = None,
    ) -> list[ScenarioSummary]:
        """List scenarios with optional filtering."""
        results = []

        for scenario in self.scenarios.values():
            # Filter by topics (if any selected topic matches)
            if topics and not any(t in scenario.topics for t in topics):
                continue

            # Filter by difficulty
            if difficulty and scenario.difficulty != difficulty:
                continue

            results.append(
                ScenarioSummary(
                    id=scenario.id,
                    title=scenario.title,
                    description=scenario.description,
                    topics=scenario.topics,
                    difficulty=scenario.difficulty,
                    estimated_minutes=scenario.estimated_minutes,
                    points=scenario.points,
                )
            )

        # Sort by difficulty, then by ID
        difficulty_order = {Difficulty.BEGINNER: 0, Difficulty.INTERMEDIATE: 1, Difficulty.ADVANCED: 2}
        results.sort(key=lambda s: (difficulty_order[s.difficulty], s.id))

        return results

    def get_scenario(self, scenario_id: str) -> Optional[ScenarioFile]:
        """Get a scenario by ID."""
        return self.scenarios.get(scenario_id)

    def count_scenarios_by_topic(self, topic: Topic) -> int:
        """Count scenarios that include a specific topic."""
        return sum(1 for s in self.scenarios.values() if topic in s.topics)
