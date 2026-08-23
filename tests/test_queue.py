import os

os.environ["EMAIL_DRY_RUN"] = "true"
os.environ["DATABASE_URL"] = "sqlite:///./test_barbershop.db"

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_checkin_and_position():
    response = client.post(
        "/queue/checkin",
        json={"name": "Alice", "phone": "555-0100"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["position"] >= 1
    assert data["status"] == "waiting"
    assert data["customer"]["name"] == "Alice"


def test_call_next():
    client.post(
        "/queue/checkin",
        json={"name": "Bob", "phone": "555-0101"},
    )
    response = client.post("/queue/call-next")
    assert response.status_code in (200, 400)
