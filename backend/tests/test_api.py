"""API endpoint tests."""


def test_health_check(client):
    """Test the health endpoint."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data
    assert "scenarios_loaded" in data


def test_list_scenarios(client):
    """Test listing scenarios."""
    response = client.get("/api/v1/scenarios")
    assert response.status_code == 200
    data = response.json()
    assert "scenarios" in data
    assert "total" in data
    assert "topics" in data


def test_list_topics(client):
    """Test listing topics."""
    response = client.get("/api/v1/scenarios/topics")
    assert response.status_code == 200
    data = response.json()
    assert "topics" in data
    assert len(data["topics"]) > 0
    for topic in data["topics"]:
        assert "id" in topic
        assert "name" in topic
        assert "description" in topic
        assert "scenario_count" in topic


def test_get_nonexistent_scenario(client):
    """Test getting a scenario that doesn't exist."""
    response = client.get("/api/v1/scenarios/nonexistent-scenario")
    assert response.status_code == 404
