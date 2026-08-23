from pathlib import Path

from fastapi.testclient import TestClient

from app.config import DEFAULT_MANIFEST_PATH
from app.main import app


def test_default_manifest_points_to_compiled_app_manifest():
    manifest_path = Path(DEFAULT_MANIFEST_PATH)
    assert manifest_path.name == "system_manifest.json"
    assert "apps/test-app/manifests/system_manifest.json" in str(manifest_path)
    assert manifest_path.exists()


def test_runtime_health_and_manifest_loading_via_fastapi():
    client = TestClient(app)
    response = client.get("/health")

    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "online"
    assert payload["manifest_loaded"] is True
