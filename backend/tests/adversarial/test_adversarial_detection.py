import pytest
from backend.app.detection.scam.engine import ScamMessageEngine
from backend.app.detection.phishing.engine import PhishingURLEngine

def test_homoglyph_punycode_url_detection():
    engine = PhishingURLEngine()
    # Internationalized Punycode homoglyph mimicking bank login
    puny_url = "http://xn--sb-login-kyc-verify-45a.xyz/auth"
    result = engine.analyze(puny_url)
    assert result["risk_score"] >= 65.0
    assert any(ind["type"] in ("HOMOGLYPH_PUNYCODE", "SUSPICIOUS_TLD", "PHISHING_VOCABULARY") for ind in result["detection_indicators"])

def test_obfuscated_banking_scam_message():
    engine = ScamMessageEngine()
    # Message with punctuation insertions and leetspeak
    obfuscated_text = (
        "Dear SBI customer, your a/c is BLOCKED due to pending PAN k.y.c update! "
        "Click http://sbi-kyc-fix.site immediately or dial 9876543210. Final warning."
    )
    result = engine.analyze(obfuscated_text)
    assert result["predicted_category"] == "BANKING_KYC_OTP"
    assert result["risk_score"] >= 65.0
    assert result["risk_level"] in ("HIGH", "CRITICAL")

def test_benign_communication_resilience():
    engine = ScamMessageEngine()
    # Normal meeting invitation or transactional confirmation
    benign_text = (
        "Hi Team, please find attached the agenda for our project review meeting on Tuesday at 3 PM. "
        "Looking forward to discussing the quarterly engineering milestones. Regards, Rahul."
    )
    result = engine.analyze(benign_text)
    assert result["predicted_category"] == "BENIGN_OR_UNCORRELATED"
    assert result["risk_score"] <= 20.0
    assert result["risk_level"] == "LOW"

def test_benign_ecommerce_delivery_notification():
    engine = ScamMessageEngine()
    # Typical OTP for package delivery from legitimate vendor
    delivery_msg = (
        "Your Amazon delivery partner will arrive today. Share OTP 4821 with delivery agent "
        "only upon receiving the physical package."
    )
    result = engine.analyze(delivery_msg)
    # Shouldn't trigger high-risk banking scam
    assert result["risk_score"] < 50.0
