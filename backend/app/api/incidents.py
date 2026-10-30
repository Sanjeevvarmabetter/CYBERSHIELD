import random
import string
from fastapi import APIRouter, Depends, HTTPException, Query, status, Request
from sqlalchemy.orm import Session
from typing import List, Optional

from backend.app.database.connection import get_db
from backend.app.database.models.models import Incident, User, InvestigationCase
from backend.app.schemas.schemas import (
    IncidentCreate,
    IncidentResponse,
    IncidentStatusUpdate
)
from backend.app.dependencies import get_current_user_optional, require_role
from backend.app.core.permissions import UserRole
from backend.app.core.audit import record_audit_log
from backend.app.intelligence.indicators import upsert_threat_indicator

router = APIRouter(prefix="/incidents", tags=["Citizen Incident Reporting"])

def generate_reference_code() -> str:
    """Generate unique tracking code: CS-2026-XXXXX"""
    suffix = "".join(random.choices(string.digits, k=5))
    return f"CS-2026-{suffix}"

@router.post("", response_model=IncidentResponse, status_code=status.HTTP_201_CREATED)
def submit_incident(
    payload: IncidentCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Citizen incident reporting endpoint.
    Supports anonymous submissions or authenticated user attribution.
    Generates unique reference code and correlates indicators if consent granted.
    """
    # Ensure reference code uniqueness
    for _ in range(5):
        ref_code = generate_reference_code()
        if not db.query(Incident).filter(Incident.reference_code == ref_code).first():
            break

    meta = payload.metadata_json or {}
    meta["indicators_involved"] = payload.indicators_involved or []
    if payload.transaction_reference:
        meta["transaction_reference"] = payload.transaction_reference

    is_anon = payload.is_anonymous or (current_user is None and not payload.contact_email)
    reporter_id = None if is_anon else (current_user.id if current_user else None)

    incident = Incident(
        reference_code=ref_code,
        reporter_user_id=reporter_id,
        category=payload.category,
        title=payload.title,
        description=payload.description,
        status="SUBMITTED",
        priority=payload.priority or "MEDIUM",
        is_anonymous=is_anon,
        consent_share_intel=payload.consent_share_intel,
        contact_email=None if is_anon else payload.contact_email,
        metadata_json=meta
    )
    db.add(incident)
    db.commit()
    db.refresh(incident)

    # Automatically create investigation case placeholder
    case = InvestigationCase(
        incident_id=incident.id,
        status="TRIAGED",
        timeline_events=[{
            "timestamp": incident.created_at.isoformat(),
            "event": "INCIDENT_SUBMITTED",
            "actor": "CITIZEN_REPORTER" if not is_anon else "ANONYMOUS_REPORTER"
        }]
    )
    db.add(case)

    # If consent was granted to share intelligence, extract and correlate indicators into Threat Indicator DB
    if payload.consent_share_intel and payload.indicators_involved:
        for raw_ind in payload.indicators_involved:
            ind_clean = raw_ind.strip()
            if not ind_clean:
                continue
            if "@" in ind_clean:
                ind_type = "UPI_VPA"
            elif ind_clean.startswith("http") or ("." in ind_clean and "/" in ind_clean):
                ind_type = "URL"
            elif any(c.isdigit() for c in ind_clean) and len(ind_clean) >= 10:
                ind_type = "PHONE"
            else:
                ind_type = "DOMAIN"

            upsert_threat_indicator(
                db=db,
                indicator_type=ind_type,
                raw_value=ind_clean,
                source="CITIZEN_INCIDENT_REPORT",
                initial_confidence=65.0,
                tags=[payload.category.lower(), "incident_extracted"]
            )

    db.commit()

    record_audit_log(
        db=db,
        action="INCIDENT_SUBMITTED",
        target_entity="Incident",
        target_id=incident.id,
        user_id=current_user.id if current_user else None,
        ip_address=request.client.host if request.client else None,
        details={"reference_code": incident.reference_code, "category": incident.category}
    )

    return incident

@router.get("/track/{reference_code}", response_model=IncidentResponse)
def track_incident_by_code(reference_code: str, db: Session = Depends(get_db)):
    """Public lookup endpoint allowing citizens to track progress using their reference code."""
    incident = db.query(Incident).filter(Incident.reference_code == reference_code.strip().upper()).first()
    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No incident found matching reference code '{reference_code}'."
        )
    return incident

@router.get("", response_model=List[IncidentResponse])
def list_incidents(
    category: Optional[str] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.ANALYST))
):
    """List and filter incidents for authorized analysts and administrators."""
    query = db.query(Incident)
    if category:
        query = query.filter(Incident.category == category)
    if status_filter:
        query = query.filter(Incident.status == status_filter)
    return query.order_by(Incident.created_at.desc()).limit(limit).all()

@router.get("/{incident_id}", response_model=IncidentResponse)
def get_incident_detail(
    incident_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.ANALYST))
):
    """Retrieve full incident details for analyst triage."""
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident

@router.patch("/{incident_id}/status", response_model=IncidentResponse)
def update_incident_status(
    incident_id: str,
    payload: IncidentStatusUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.ANALYST))
):
    """Update incident status and priority (Analyst triage action)."""
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    incident.status = payload.status
    if payload.priority:
        incident.priority = payload.priority

    # Record in case timeline
    case = db.query(InvestigationCase).filter(InvestigationCase.incident_id == incident.id).first()
    if case:
        case.status = payload.status
        timeline = list(case.timeline_events or [])
        timeline.append({
            "timestamp": incident.updated_at.isoformat(),
            "event": f"STATUS_UPDATED_TO_{payload.status}",
            "actor": current_user.email,
            "note": payload.analyst_note or ""
        })
        case.timeline_events = timeline

    db.commit()
    db.refresh(incident)

    record_audit_log(
        db=db,
        action="INCIDENT_STATUS_UPDATE",
        target_entity="Incident",
        target_id=incident.id,
        user_id=current_user.id,
        ip_address=request.client.host if request.client else None,
        details={"status": payload.status, "priority": payload.priority, "note": payload.analyst_note}
    )

    return incident
