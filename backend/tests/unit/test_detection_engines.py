import pytest
from backend.app.detection.scam.engine import ScamMessageEngine
from backend.app.detection.phishing.engine import PhishingURLEngine
from backend.app.detection.fraud.engine import FinancialFraudEngine
from backend.app.detection.abuse.engine import AbuseDetectionEngine

def test_scam_message_fake_job():
    engine = ScamMessageEngine()
    text = (
        "Congratulations! You are selected for part-time work from home review tasks. "
        "Earn ₹5000 daily. Join our official Telegram channel: t.me/vip_task_admin. "
        "Immediate payout to UPI."
    )
    result = engine.analyze(text)
    assert result["predicted_category"] == "FAKE_JOB_TASK"
    assert result["risk_score"] >= 60.0
    assert result["risk_level"] in ("HIGH", "CRITICAL")
    assert len(result["detection_indicators"]) >= 2
    assert "urls" in result["extracted_indicators"]

def test_scam_message_banking_kyc():
    engine = ScamMessageEngine()
    text = (
        "Dear SBI customer, your netbanking account will be blocked today within 2 hours. "
        "Update your KYC urgently by clicking http://sbi-kyc-verify-update.com or call 9876543210."
    )
    result = engine.analyze(text)
    assert result["predicted_category"] == "BANKING_KYC_OTP"
    assert result["risk_score"] >= 70.0
    assert result["risk_level"] in ("HIGH", "CRITICAL")

def test_phishing_url_brand_typosquat():
    engine = PhishingURLEngine()
    result = engine.analyze("http://sbi-kyc-update-portal.xyz/login")
    assert result["risk_score"] >= 70.0
    assert result["risk_level"] in ("HIGH", "CRITICAL")
    assert any(ind["type"] == "BRAND_TYPOSQUAT" for ind in result["detection_indicators"])

def test_phishing_url_ssrf_blocking():
    engine = PhishingURLEngine()
    result = engine.analyze("http://169.254.169.254/latest/meta-data/")
    assert result["predicted_category"] == "SSRF_PROHIBITED_TARGET"
    assert result["risk_score"] == 99.0
    assert result["risk_level"] == "CRITICAL"

    # Also test localhost
    result_local = engine.analyze("http://127.0.0.1:9000/keys")
    assert result_local["predicted_category"] == "SSRF_PROHIBITED_TARGET"

def test_financial_fraud_engine_three_layers():
    engine = FinancialFraudEngine()
    
    # Suspicious event: large amount, 4 failed logins, new device, suspicious VPA
    fraud_tx = {
        "account_id": "ACC_9921",
        "amount": 125000.0,
        "recipient_vpa": "helpline-refund-support@oksbi",
        "device_id": "DEV_NEW_9812",
        "is_new_device": True,
        "is_new_recipient": True,
        "failed_auth_attempts_prior": 4,
        "channel": "UPI"
    }
    result = engine.analyze(fraud_tx)
    assert result["risk_score"] >= 75.0
    assert result["risk_level"] in ("HIGH", "CRITICAL")
    assert "score_breakdown" in result
    assert result["score_breakdown"]["layer_a_rule_score"] > 50.0

    # Normal event: small amount, 0 failed logins, known device
    normal_tx = {
        "account_id": "ACC_1102",
        "amount": 450.0,
        "recipient_vpa": "grocery@okaxis",
        "device_id": "DEV_KNOWN_1",
        "is_new_device": False,
        "is_new_recipient": False,
        "failed_auth_attempts_prior": 0,
        "channel": "UPI"
    }
    res_normal = engine.analyze(normal_tx)
    assert res_normal["risk_score"] < 40.0
    assert res_normal["risk_level"] in ("LOW", "MEDIUM")

def test_abuse_detection_engine():
    engine = AbuseDetectionEngine()
    text = (
        "I recorded your video call clip. Send ₹50,000 to my UPI or I will ruin your life "
        "and leak the explicit video to your family and friends."
    )
    result = engine.analyze(text)
    assert "SEXTORTION_COERCION" in result["multi_labels"]
    assert result["risk_score"] >= 80.0
    assert result["risk_level"] == "CRITICAL"
    assert len(result["recommended_actions"]) > 0
