"""Pytest configuration and fixtures."""

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def client():
    """Create a test client for the FastAPI application."""
    return TestClient(app)


@pytest.fixture
def sample_valid_openapi():
    """A minimal valid OpenAPI 3.0 spec."""
    return """
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
          content:
            application/json:
              schema:
                type: array
"""


@pytest.fixture
def sample_invalid_yaml():
    """Invalid YAML syntax."""
    return """
openapi: "3.0.3"
info:
  title: Test
  version: 1.0.0
  invalid yaml here
"""
