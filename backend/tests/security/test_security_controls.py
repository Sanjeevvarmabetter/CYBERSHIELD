import io
import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.core.ssrf import is_ip_prohibited, validate_target_url
from backend.app.evidence.storage import save_uploaded_evidence
from fastapi import UploadFile, HTTPException

def test_ssrf_egress_blocking_comprehensive():
    # 1. AWS/GCP/Azure link-local metadata
    assert is_ip_prohibited("169.254.169.254") is True
    assert is_ip_prohibited("169.254.1.1") is True
    
    # 2. IPv4 loopbacks
    assert is_ip_prohibited("127.0.0.1") is True
    assert is_ip_prohibited("127.12.34.56") is True
    
    # 3. IPv6 loopback and mapped
    assert is_ip_prohibited("::1") is True
    assert is_ip_prohibited("::ffff:127.0.0.1") is True
    assert is_ip_prohibited("::ffff:10.0.0.1") is True

    # 4. Carrier Grade NAT
    assert is_ip_prohibited("100.64.0.1") is True
    assert is_ip_prohibited("100.127.255.254") is True

    # 5. Multicast and 0.0.0.0
    assert is_ip_prohibited("0.0.0.0") is True
    assert is_ip_prohibited("224.0.0.1") is True

    # 6. Public IPs must NOT be blocked
    assert is_ip_prohibited("93.184.216.34") is False  # example.com
    assert is_ip_prohibited("8.8.8.8") is False

def test_scheme_and_host_validation():
    # Non-http/https schemes must be rejected
    for bad_scheme in ["file:///etc/shadow", "ftp://example.com", "gopher://127.0.0.1:70", "ldap://localhost"]:
        safe, msg, _ = validate_target_url(bad_scheme)
        assert safe is False

    # Blocked hostnames
    safe, msg, _ = validate_target_url("http://metadata.google.internal/computeMetadata/v1/")
    assert safe is False
    assert "prohibited hostname" in msg.lower() or "blocked" in msg.lower()

def test_path_traversal_in_evidence_upload():
    # Attempt path traversal via filename
    bad_filename = "../../../../etc/passwd.png"
    fake_stream = io.BytesIO(b"Fake malicious upload attempt")
    upload_file = UploadFile(filename=bad_filename, file=fake_stream)

    target_path, sha256_hash, file_size, orig_name = save_uploaded_evidence(upload_file)
    
    # Verify that the filename was sanitized to basename and placed inside storage directory
    assert ".." not in target_path
    assert "/" not in orig_name or "\\" not in orig_name
    assert orig_name == "passwd.png"

def test_rbac_analyst_route_protection():
    with TestClient(app) as client:
        # 1. Unauthenticated request to /api/v1/incidents (GET list)
        unauth_res = client.get("/api/v1/incidents")
        assert unauth_res.status_code == 401

        # 2. Authenticated as Citizen trying to access Analyst endpoint
        reg_payload = {
            "email": "standard_citizen_rbac@example.com",
            "password": "CitizenPassword123!",
            "full_name": "Standard Citizen",
            "role": "CITIZEN"
        }
        client.post("/api/v1/auth/register", json=reg_payload)
        login_res = client.post("/api/v1/auth/login", json={
            "email": "standard_citizen_rbac@example.com",
            "password": "CitizenPassword123!"
        })
        citizen_token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {citizen_token}"}

        # Attempt to access analyst queue
        forbidden_res = client.get("/api/v1/incidents", headers=headers)
        assert forbidden_res.status_code == 403
        assert "Access denied" in forbidden_res.json()["detail"] or "role" in forbidden_res.json()["detail"]
