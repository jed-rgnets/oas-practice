# OAS Practice

Interactive OpenAPI 3.0 Specification practice labs for exam preparation.

## Overview

OAS Practice is a web application that helps users learn and practice writing OpenAPI 3.0 specifications. It provides:

- **Pre-authored scenarios** covering all aspects of OpenAPI 3.0
- **Granular topic selection** to focus on specific areas
- **Real-time YAML validation** for immediate feedback
- **Semantic validation** to verify solutions meet requirements
- **Progress tracking** stored locally in your browser

Perfect for certification exam preparation or learning OpenAPI from scratch.

## Features

- **Practice Scenarios**: 80+ scenarios covering paths, operations, parameters, schemas, security, and more
- **Interactive Editor**: Monaco-based editor with YAML syntax highlighting and validation
- **Difficulty Levels**: Beginner, intermediate, and advanced scenarios
- **Progress Tracking**: Local storage persistence with draft auto-save
- **Self-Hostable**: Deploy anywhere with Docker

## Quick Start

### Using Docker

```bash
# Clone the repository
git clone https://github.com/your-org/oas-practice.git
cd oas-practice

# Start the application
docker-compose up

# Open http://localhost:3000 in your browser
```

### Local Development

See [Development Setup](#development-setup) below.

## Documentation

| Document | Description |
|----------|-------------|
| [Architecture](./docs/ARCHITECTURE.md) | System design, API contracts, data models |
| [Scenario Authoring](./docs/SCENARIO_AUTHORING.md) | How to create practice scenarios |
| [Contributing](./docs/CONTRIBUTING.md) | Contribution guidelines |
| [Deployment](./docs/DEPLOYMENT.md) | Production deployment guide |

## Development Setup

### Prerequisites

- Python 3.11+
- Node.js 18+

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Technology Stack

- **Backend**: Python, FastAPI, Pydantic
- **Frontend**: React, TypeScript, Vite, Monaco Editor, Zustand
- **Styling**: Tailwind CSS
- **Deployment**: Docker, Nginx

## Project Structure

```
oas-practice/
├── backend/               # Python FastAPI backend
│   ├── app/               # Application code
│   └── scenarios/         # Practice scenario files
├── frontend/              # React TypeScript frontend
│   └── src/
│       ├── components/    # React components
│       ├── store/         # Zustand state management
│       └── services/      # API and validation services
├── docs/                  # Documentation
└── docker-compose.yml     # Local development
```

## Topics Covered

- **Paths & Operations**: URL structure, HTTP methods
- **Parameters**: Path, query, header, cookie parameters
- **Request Bodies**: JSON, form data, multipart
- **Responses**: Status codes, content types, headers
- **Schemas**: JSON Schema, $ref, composition
- **Components**: Reusable schemas, parameters, responses
- **Security**: API keys, OAuth2, OpenID Connect
- **And more**: Tags, servers, callbacks, links

## Contributing

We welcome contributions! See [CONTRIBUTING.md](./docs/CONTRIBUTING.md) for guidelines.

The most impactful contribution is adding new scenarios. See [SCENARIO_AUTHORING.md](./docs/SCENARIO_AUTHORING.md).

## License

[Apache 2.0](./LICENSE)

## Acknowledgments

- [OpenAPI Initiative](https://www.openapis.org/) for the OpenAPI Specification
- The open source community for the excellent tools and libraries
