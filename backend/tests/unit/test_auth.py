import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.database.connection import init_db, SessionLocal
from backend.app.database.seed import seed_initial_data
from backend.app.core.security import verify_password, get_password_hash, create_access_token, decode_access_token

@pytest.fixture(autouse=True)
def setup_database():
    init_db()
    with SessionLocal() as db:
        seed_initial_data(db)

def test_password_hashing():
    raw = "SuperSecretPassword123!"
    hashed = get_password_hash(raw)
    assert hashed != raw
    assert "$argon2id$" in hashed
    assert verify_password(raw, hashed) is True
    assert verify_password("WrongPassword!", hashed) is False

def test_token_creation_and_decoding():
    token = create_access_token(subject="user-12345", role="CITIZEN")
    payload = decode_access_token(token)
    assert payload is not None
    assert payload["sub"] == "user-12345"
    assert payload["role"] == "CITIZEN"

def test_auth_endpoints():
    with TestClient(app) as client:
        # Test register
        reg_payload = {
            "email": "new_citizen_test@example.com",
            "password": "SecurePassword2026!",
            "full_name": "Test Citizen",
            "role": "CITIZEN"
        }
        res = client.post("/api/v1/auth/register", json=reg_payload)
        assert res.status_code in (201, 400)
        
        # Test login with seeded admin
        login_payload = {
            "email": "admin@cybershield.org",
            "password": "CybershieldAdmin2026!"
        }
        res_login = client.post("/api/v1/auth/login", json=login_payload)
        assert res_login.status_code == 200
        data = res_login.json()
        assert "access_token" in data
        assert data["role"] == "ADMIN"
        
        # Test /me endpoint with token
        headers = {"Authorization": f"Bearer {data['access_token']}"}
        res_me = client.get("/api/v1/auth/me", headers=headers)
        assert res_me.status_code == 200
        assert res_me.json()["email"] == "admin@cybershield.org"
