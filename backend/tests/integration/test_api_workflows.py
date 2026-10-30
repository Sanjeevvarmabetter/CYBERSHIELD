import io
import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.database.connection import init_db, SessionLocal
from backend.app.database.seed import seed_initial_data

@pytest.fixture(autouse=True)
def setup_db():
    init_db()
    with SessionLocal() as db:
        seed_initial_data(db)

def get_auth_token(client, email="analyst@cybershield.org", password="CybershieldAnalyst2026!"):
    res = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    assert res.status_code == 200
    return res.json()["access_token"]

def test_full_analysis_workflow():
    with TestClient(app) as client:
        # 1. Scam message analysis
        scam_res = client.post("/api/v1/analysis/scam", json={
            "text": "Dear customer, your SBI account is locked. Update KYC at http://sbi-fake.xyz now or dial 9876543210.",
            "channel": "SMS"
        })
        assert scam_res.status_code == 200
        scam_data = scam_res.json()
        assert scam_data["risk_score"] >= 60.0
        assert scam_data["predicted_category"] == "BANKING_KYC_OTP"

        # 2. Safe URL analysis
        url_res = client.post("/api/v1/analysis/phishing", json={
            "url": "http://sbi-kyc-update-portal.xyz/login"
        })
        assert url_res.status_code == 200
        assert url_res.json()["risk_level"] in ("HIGH", "CRITICAL")

        # 3. Financial fraud analysis
        fraud_res = client.post("/api/v1/analysis/fraud", json={
            "account_id": "ACC_1234",
            "amount": 75000.0,
            "recipient_vpa": "refund-desk948@oksbi",
            "device_id": "DEV_FINGERPRINT_99",
            "is_new_device": True,
            "is_new_recipient": True,
            "failed_auth_attempts_prior": 3
        })
        assert fraud_res.status_code == 200
        assert fraud_res.json()["risk_score"] >= 60.0

        # 4. Abuse analysis
        abuse_res = client.post("/api/v1/analysis/abuse", json={
            "text": "I will leak your video call clip unless you pay me ₹20,000 via UPI."
        })
        assert abuse_res.status_code == 200
        assert "SEXTORTION_COERCION" in abuse_res.json()["predicted_category"]

def test_incident_reporting_evidence_and_pdf_generation():
    with TestClient(app) as client:
        # Submit incident
        inc_res = client.post("/api/v1/incidents", json={
            "category": "FINANCIAL_FRAUD",
            "title": "Unauthorized UPI debits after fake power bill SMS",
            "description": "I received an SMS claiming electricity would be cut off. Contacted 9876543210 and was instructed to send ₹10 via UPI. Then ₹45,000 was debited.",
            "is_anonymous": False,
            "contact_email": "victim_help@example.com",
            "consent_share_intel": True,
            "indicators_involved": ["9876543210", "refund-desk948@oksbi"]
        })
        assert inc_res.status_code == 201
        inc_data = inc_res.json()
        ref_code = inc_data["reference_code"]
        inc_id = inc_data["id"]

        # Track by reference code
        track_res = client.get(f"/api/v1/incidents/track/{ref_code}")
        assert track_res.status_code == 200
        assert track_res.json()["reference_code"] == ref_code

        # Upload evidence file
        fake_file_bytes = b"Sample evidentiary screenshot content bytes for SHA256 integrity verification"
        files = {
            "file": ("evidence_screenshot.png", io.BytesIO(fake_file_bytes), "image/png")
        }
        data = {"incident_id": inc_id}
        ev_res = client.post("/api/v1/evidence/upload", data=data, files=files)
        assert ev_res.status_code == 201
        ev_data = ev_res.json()
        assert "sha256_hash" in ev_data
        assert ev_data["file_size"] == len(fake_file_bytes)

        # Download PDF Assistance Report
        pdf_res = client.get(f"/api/v1/evidence/report/{inc_id}")
        assert pdf_res.status_code == 200
        assert pdf_res.headers["content-type"] == "application/pdf"
        assert len(pdf_res.content) > 1000  # PDF generated with tables and text

def test_analyst_triage_graph_and_ai_synthesis():
    with TestClient(app) as client:
        analyst_token = get_auth_token(client)
        headers = {"Authorization": f"Bearer {analyst_token}"}

        # 1. Fetch dashboard metrics
        dash_res = client.get("/api/v1/dashboard/metrics", headers=headers)
        assert dash_res.status_code == 200
        assert dash_res.json()["total_incidents"] >= 0

        # 2. Fetch threat intelligence indicators
        intel_res = client.get("/api/v1/intelligence/indicators", headers=headers)
        assert intel_res.status_code == 200
        assert len(intel_res.json()) >= 1

        # 3. Fetch Graph topology
        graph_res = client.get("/api/v1/graph/data", headers=headers)
        assert graph_res.status_code == 200
        graph_data = graph_res.json()
        assert "nodes" in graph_data
        assert "edges" in graph_data
        assert "metrics" in graph_data

        # 4. Create an incident to test AI synthesis
        inc_res = client.post("/api/v1/incidents", json={
            "category": "FAKE_JOB",
            "title": "Telegram task review investment fraud",
            "description": "Added to Telegram group offering ₹5000 per day for hotel ratings. Asked to recharge ₹15,000 to unlock profits. Now funds frozen.",
            "consent_share_intel": True,
            "indicators_involved": ["t.me/vip_task_review", "refund-desk948@oksbi"]
        })
        inc_id = inc_res.json()["id"]

        # Run AI investigation synthesis
        synth_res = client.get(f"/api/v1/investigation/synthesize/{inc_id}", headers=headers)
        assert synth_res.status_code == 200
        synth_data = synth_res.json()
        assert "synthesis_summary" in synth_data
        assert "reconstructed_timeline" in synth_data
        assert len(synth_data["investigator_inquiries"]) > 0
