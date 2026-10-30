from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional

from backend.app.database.connection import get_db
from backend.app.database.models.models import ThreatIndicator, User
from backend.app.schemas.schemas import ThreatIndicatorResponse
from backend.app.intelligence.indicators import calculate_confidence_decay, upsert_threat_indicator
from backend.app.dependencies import require_role
from backend.app.core.permissions import UserRole

router = APIRouter(prefix="/intelligence", tags=["Threat Intelligence"])

@router.get("/indicators", response_model=List[ThreatIndicatorResponse])
def get_indicators(
    type: Optional[str] = Query(None, description="Filter by indicator type (DOMAIN, URL, UPI_VPA, etc.)"),
    status: Optional[str] = Query(None, description="Filter by status (CONFIRMED, CORROBORATED, etc.)"),
    search: Optional[str] = Query(None, description="Search indicator text"),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    """Retrieve verified threat intelligence indicators with real-time confidence decay calculation."""
    query = db.query(ThreatIndicator).filter(ThreatIndicator.is_active == True)
    if type and type != "ALL":
        query = query.filter(ThreatIndicator.indicator_type == type.upper())
    if status:
        query = query.filter(ThreatIndicator.verification_status == status.upper())
    if search:
        s = f"%{search.lower()}%"
        query = query.filter(ThreatIndicator.normalized_value.like(s) | ThreatIndicator.defanged_value.like(s))

    iocs = query.order_by(ThreatIndicator.last_seen.desc()).limit(limit).all()

    # Apply confidence decay dynamically
    results = []
    for ioc in iocs:
        decayed_score = calculate_confidence_decay(ioc.confidence_score, ioc.last_seen)
        results.append(ThreatIndicatorResponse(
            id=ioc.id,
            indicator_type=ioc.indicator_type,
            normalized_value=ioc.normalized_value,
            defanged_value=ioc.defanged_value,
            verification_status=ioc.verification_status,
            confidence_score=decayed_score,
            first_seen=ioc.first_seen,
            last_seen=ioc.last_seen,
            source_provenance=ioc.source_provenance,
            times_reported=ioc.times_reported,
            tags=ioc.tags or []
        ))
    return results

@router.post("/indicators", response_model=ThreatIndicatorResponse, status_code=status.HTTP_201_CREATED)
def create_indicator(
    indicator_type: str,
    value: str,
    source: str = "ANALYST_SUBMISSION",
    confidence: float = 85.0,
    tags: Optional[List[str]] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.ANALYST))
):
    """Add or corroborate a threat indicator (Authorized Analysts and Admins only)."""
    ioc = upsert_threat_indicator(
        db=db,
        indicator_type=indicator_type.upper(),
        raw_value=value,
        source=source,
        initial_confidence=confidence,
        tags=tags or []
    )
    return ioc
