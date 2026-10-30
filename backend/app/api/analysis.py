import re
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, EmailStr, Field
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.database.connection import get_db
from backend.app.database.models.models import AnalysisRecord, ThreatIndicator, User
from backend.app.schemas.schemas import (
    ScamAnalysisRequest,
    URLAnalysisRequest,
    FraudTransactionRequest,
    AbuseAnalysisRequest,
    AnalysisResponse
)
from backend.app.dependencies import get_current_user_optional
from backend.app.detection.scam.engine import ScamMessageEngine
from backend.app.detection.phishing.engine import PhishingURLEngine
from backend.app.detection.fraud.engine import FinancialFraudEngine
from backend.app.detection.abuse.engine import AbuseDetectionEngine
from backend.app.intelligence.indicators import normalize_indicator, defang_indicator

router = APIRouter(prefix="/analysis", tags=["Online Crime & Fraud Analysis"])

scam_engine = ScamMessageEngine()
phishing_engine = PhishingURLEngine()
fraud_engine = FinancialFraudEngine()
abuse_engine = AbuseDetectionEngine()

# Disposable email domains commonly used in disposable scam operations
DISPOSABLE_EMAIL_DOMAINS = {
    "mailinator.com", "tempmail.com", "10minutemail.com", "guerrillamail.com",
    "sharklasers.com", "throwawaymail.com", "yopmail.com", "getairmail.com",
    "dispostable.com", "trashmail.com", "fakeinbox.com", "mytemp.email"
}

# High-risk foreign country codes frequently used in unsolicited WhatsApp job scams in India
HIGH_RISK_CALLING_CODES = {
    "+62": "Indonesia (Common WhatsApp task scam source)",
    "+84": "Vietnam (Common task scam source)",
    "+234": "Nigeria (Advance-fee scam vector)",
    "+254": "Kenya",
    "+92": "Pakistan",
    "+880": "Bangladesh"
}

class IdentityLookupRequest(BaseModel):
    phone_number: Optional[str] = None
    email_address: Optional[str] = None

class IdentityLookupResponse(BaseModel):
    target_type: str
    target_defanged: str
    risk_score: float
    risk_level: str
    confidence: float
    reputation_status: str
    is_disposable_or_spoofed: bool
    details: Dict[str, Any]
    detected_indicators: List[Dict[str, str]]
    recommendations: List[str]
    disclaimer: str

def _save_record(
    db: Session,
    analysis_type: str,
    input_preview: str,
    result: dict,
    user: Optional[User] = None
) -> AnalysisRecord:
    record = AnalysisRecord(
        user_id=user.id if user else None,
        analysis_type=analysis_type,
        input_preview=input_preview[:450],
        risk_score=result["risk_score"],
        risk_level=result["risk_level"],
        predicted_category=result["predicted_category"],
        confidence=result["confidence"],
        detection_indicators=result.get("detection_indicators", []),
        recommendations=result.get("recommended_actions", []),
        limitations=result.get("limitations")
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record

@router.post("/scam", response_model=AnalysisResponse)
def analyze_scam_message(
    payload: ScamAnalysisRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Analyze suspicious text messages, job offers, or emails for fraudulent signatures."""
    res = scam_engine.analyze(payload.text, channel=payload.channel or "SMS")
    rec = _save_record(db, "SCAM_MESSAGE", payload.text, res, current_user)
    res["reference_id"] = rec.id
    return res

@router.post("/phishing", response_model=AnalysisResponse)
def analyze_phishing_url(
    payload: URLAnalysisRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Safely inspect suspicious URLs with zero-trust SSRF protection and lexical feature extraction."""
    res = phishing_engine.analyze(payload.url)
    rec = _save_record(db, "PHISHING_URL", payload.url, res, current_user)
    res["reference_id"] = rec.id
    return res

@router.post("/fraud", response_model=AnalysisResponse)
def analyze_financial_fraud(
    payload: FraudTransactionRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Execute 3-Layer Financial Fraud Detection on transaction metadata (Rules + ML + Aggregator)."""
    tx_data = payload.model_dump()
    res = fraud_engine.analyze(tx_data)
    preview = f"Tx {payload.account_id} -> {payload.recipient_vpa or 'Direct'}: ₹{payload.amount}"
    rec = _save_record(db, "FRAUD_TX", preview, res, current_user)
    res["reference_id"] = rec.id
    return res

@router.post("/abuse", response_model=AnalysisResponse)
def analyze_online_abuse(
    payload: AbuseAnalysisRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Context-aware multi-label classifier for harassment, cyberstalking, and sextortion."""
    res = abuse_engine.analyze(payload.text, context_type=payload.context_type or "DIRECT_MESSAGE")
    rec = _save_record(db, "ABUSE_TEXT", payload.text, res, current_user)
    res["reference_id"] = rec.id
    return res

@router.post("/lookup", response_model=IdentityLookupResponse)
def lookup_phone_or_email_intelligence(
    payload: IdentityLookupRequest,
    db: Session = Depends(get_db)
):
    """
    Phone Number and Email Intelligence Lookup.
    Evaluates disposable VoIP/domains, country code anomaly, and previous incident corroborations.
    STRICT PRIVACY POLICY: Never provides doxxing, reverse lookups, or private personal identities.
    """
    indicators = []
    score = 0.0
    details = {}

    if payload.phone_number:
        target_type = "PHONE"
        norm_phone = normalize_indicator("PHONE", payload.phone_number)
        defanged = defang_indicator("PHONE", norm_phone)
        
        # Check Country Code
        is_high_risk_code = False
        country_name = "India (+91)"
        if not norm_phone.startswith("+91"):
            for code, desc in HIGH_RISK_CALLING_CODES.items():
                if norm_phone.startswith(code):
                    is_high_risk_code = True
                    country_name = desc
                    score += 45.0
                    indicators.append({
                        "type": "ANOMALOUS_COUNTRY_CODE",
                        "name": f"International Calling Code ({code})",
                        "description": f"Target utilizes calling code from {desc}. High prevalence in unsolicited job/task solicitation targeting Indian residents.",
                        "severity": "HIGH"
                    })
                    break

        details["country_origin"] = country_name
        details["formatted_dial"] = norm_phone[:6] + "XXXX" if len(norm_phone) >= 10 else norm_phone

        # Check existing Threat Indicator DB corroborations
        db_matches = db.query(ThreatIndicator).filter(
            ThreatIndicator.indicator_type == "PHONE",
            ThreatIndicator.normalized_value == norm_phone
        ).first()

        if db_matches:
            score += min(db_matches.times_reported * 20.0, 50.0)
            indicators.append({
                "type": "KNOWN_CORROBORATION",
                "name": f"Repeated Cybercrime Reports ({db_matches.times_reported}x)",
                "description": f"This contact number has been reported in {db_matches.times_reported} verified prior cybercrime incidents.",
                "severity": "CRITICAL"
            })
            reputation = "CONFIRMED_MALICIOUS_REPORTER" if db_matches.times_reported >= 3 else "SUSPICIOUS_REPORTED"
        else:
            reputation = "SUSPICIOUS_FOREIGN_SOLICITATION" if is_high_risk_code else "NEUTRAL_UNREPORTED"

    elif payload.email_address:
        target_type = "EMAIL"
        raw_email = payload.email_address.strip().lower()
        defanged = defang_indicator("EMAIL", raw_email)
        domain = raw_email.split("@")[-1] if "@" in raw_email else ""

        is_disposable = domain in DISPOSABLE_EMAIL_DOMAINS
        if is_disposable:
            score += 50.0
            indicators.append({
                "type": "DISPOSABLE_EMAIL_PROVIDER",
                "name": f"Ephemeral / Disposable Inbox ({domain})",
                "description": f"Domain '{domain}' provides throwaway disposable inboxes commonly used to register burner accounts for fraud.",
                "severity": "CRITICAL"
            })

        # Check existing Threat Indicator DB corroborations
        db_matches = db.query(ThreatIndicator).filter(
            ThreatIndicator.indicator_type == "EMAIL",
            ThreatIndicator.normalized_value == raw_email
        ).first()

        if db_matches:
            score += min(db_matches.times_reported * 25.0, 50.0)
            indicators.append({
                "type": "KNOWN_CORROBORATION",
                "name": f"Corroborated Scam Correspondence ({db_matches.times_reported}x)",
                "description": f"Address flagged in {db_matches.times_reported} previous extortion or phishing reports.",
                "severity": "CRITICAL"
            })
            reputation = "KNOWN_SCAM_SENDER"
        else:
            reputation = "DISPOSABLE_BURNER" if is_disposable else "NEUTRAL_UNREPORTED"

        details["domain"] = domain
        details["is_disposable"] = is_disposable

    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Must provide either 'phone_number' or 'email_address' to evaluate."
        )

    final_score = min(max(score, 5.0), 99.0)
    if final_score >= 70.0:
        risk_level = "CRITICAL" if final_score >= 85 else "HIGH"
        recommendations = [
            "Block incoming calls, SMS, and WhatsApp messages from this sender immediately.",
            "Do not click any web links or scan QR codes sent by this contact.",
            "Report number to your telecom provider (e.g. 1909 DND complaint in India)."
        ]
    elif final_score >= 35.0:
        risk_level = "MEDIUM"
        recommendations = [
            "Exercise strong caution. Confirm identity through independent corporate channels.",
            "Never share OTPs or banking credentials with unknown callers."
        ]
    else:
        risk_level = "LOW"
        recommendations = [
            "No prior threat intelligence flags found.",
            "Maintain standard digital safety awareness."
        ]

    return IdentityLookupResponse(
        target_type=target_type,
        target_defanged=defanged,
        risk_score=round(final_score, 1),
        risk_level=risk_level,
        confidence=0.85,
        reputation_status=reputation,
        is_disposable_or_spoofed=score >= 35.0,
        details=details,
        detected_indicators=indicators,
        recommendations=recommendations,
        disclaimer="CYBERSHIELD provides defensive reputation intelligence and does not expose private owner identity or enable doxxing."
    )
