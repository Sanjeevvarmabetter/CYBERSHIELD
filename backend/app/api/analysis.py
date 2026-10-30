from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import Optional

from backend.app.database.connection import get_db
from backend.app.database.models.models import AnalysisRecord, User
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

router = APIRouter(prefix="/analysis", tags=["Online Crime & Fraud Analysis"])

# Instantiate engines as singletons
scam_engine = ScamMessageEngine()
phishing_engine = PhishingURLEngine()
fraud_engine = FinancialFraudEngine()
abuse_engine = AbuseDetectionEngine()

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
