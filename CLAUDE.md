# Claude Code Instructions for OAS Practice

This file provides context and guidelines for AI coding agents working on the OAS Practice project.

## Project Overview

OAS Practice is an interactive web application for practicing OpenAPI 3.0 specification writing. Users select scenarios, write YAML in an editor, and receive feedback on whether their solution meets the requirements.

## Architecture Summary

- **Backend**: Python 3.11+ with FastAPI
- **Frontend**: React 18 with TypeScript, Vite, Monaco Editor
- **State**: Zustand with localStorage persistence
- **Styling**: Tailwind CSS
- **Deployment**: Docker Compose

Full architecture details: `docs/ARCHITECTURE.md`

## Key Directories

```
backend/
  app/
    main.py              # FastAPI application entry
    api/routes/          # API endpoint handlers
    models/              # Pydantic models
    services/            # Business logic
  scenarios/             # Practice scenario YAML files
  tests/                 # pytest tests

frontend/
  src/
    components/          # React components
    store/               # Zustand state management
    services/            # API client, validators
    types/               # TypeScript types
```

## Development Commands

### Backend
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload      # Run server
pytest                              # Run tests
ruff check .                        # Lint
ruff format .                       # Format
```

### Frontend
```bash
cd frontend
npm run dev      # Development server
npm run build    # Production build
npm test         # Run tests
npm run lint     # Lint
```

## Common Tasks

### Adding a New API Endpoint

1. Create route handler in `backend/app/api/routes/`
2. Define Pydantic models in `backend/app/models/`
3. Implement service logic in `backend/app/services/`
4. Register route in `backend/app/api/routes/__init__.py`
5. Add tests in `backend/tests/`

### Adding a New React Component

1. Create component in appropriate `frontend/src/components/` subdirectory
2. Export from directory index if applicable
3. Use TypeScript interfaces from `frontend/src/types/`
4. Follow existing patterns for hooks and state access

### Adding a New Scenario

1. Create YAML file in `backend/scenarios/` following naming convention: `{topic}-{subtopic}-{sequence}.yaml`
2. Follow schema in `docs/SCENARIO_AUTHORING.md`
3. Test with validation script: `python scripts/validate-scenarios.py`
4. Ensure example_solution passes all validation rules

## Code Patterns

### Backend Patterns

```python
# Route handlers use dependency injection
from fastapi import APIRouter, Depends
from app.services.scenario_service import ScenarioService

router = APIRouter()

@router.get("/scenarios")
async def list_scenarios(
    service: ScenarioService = Depends(get_scenario_service)
):
    return await service.list_all()
```

```python
# Services contain business logic
class ScenarioService:
    def __init__(self, scenarios_path: str):
        self.scenarios_path = scenarios_path

    async def list_all(self) -> list[ScenarioSummary]:
        # Implementation
```

### Frontend Patterns

```typescript
// Components use Zustand store via hooks
import { useAppStore } from '../../store';

export function ScenarioList() {
  const { scenarios, selectedTopics } = useAppStore();
  // Component logic
}
```

```typescript
// API calls use the api service
import { api } from '../../services/api';

const scenarios = await api.getScenarios({ topics: ['paths'] });
```

## Validation Rules

The validation engine supports these rule types:
- `json_path_exists`: Check path exists
- `json_path_equals`: Check exact value
- `json_path_contains`: Check contains values
- `json_path_matches`: Check regex match
- `schema_validates`: Validate against JSON Schema
- `custom`: Use registered custom validator

See `backend/app/services/validation_service.py` for implementation.

## Testing Guidelines

- Backend: Use pytest with async support
- Frontend: Use Vitest with Testing Library
- Scenarios: Each must have example_solution that passes all rules
- Integration: Test API endpoints with TestClient

## Important Constraints

1. **OpenAPI 3.0 Focus**: Application targets OpenAPI 3.0.x, not 3.1
2. **No Database MVP**: Progress stored in browser localStorage
3. **Static Scenarios**: Scenarios are YAML files, not database records
4. **Client-Side YAML Validation**: Real-time syntax checking in browser
5. **Server-Side Semantic Validation**: Requirement checking on backend

## Error Handling

- Backend returns structured errors: `{"error": "code", "message": "..."}`
- Frontend displays errors via toast notifications or inline messages
- Validation errors include specific requirement results

## Security Considerations

- CORS configured via environment variable
- No authentication in MVP
- Rate limiting recommended for production
- Input validation via Pydantic models

## Reference Material

The OpenAPI 3.0.4 specification is available at `OpenAPI-Specification/versions/3.0.4.md` (symlinked, gitignored). Use this for accurate specification details when creating scenarios or implementing validation logic.

## Getting Help

- Architecture decisions: `docs/ARCHITECTURE.md`
- Scenario creation: `docs/SCENARIO_AUTHORING.md`
- Deployment: `docs/DEPLOYMENT.md`
- Contributing: `docs/CONTRIBUTING.md`
