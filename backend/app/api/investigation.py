from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from backend.app.database.connection import get_db
from backend.app.database.models.models import Incident, User
from backend.app.investigations.assistant import AIInvestigationAssistant
from backend.app.dependencies import require_role
from backend.app.core.permissions import UserRole

router = APIRouter(prefix="/investigation", tags=["AI Investigation Assistant"])
assistant = AIInvestigationAssistant()

@router.get("/synthesize/{incident_id}")
def synthesize_incident(
    incident_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.ANALYST))
):
    """
    AI Investigation Assistant synthesis endpoint for authorized analysts.
    Generates structured timelines, indicator correlation, and investigation inquiries.
    """
    incident = db.query(Incident).filter(
        (Incident.id == incident_id) | (Incident.reference_code == incident_id)
    ).first()

    if not incident:
        raise HTTPException(status_code=404, detail="Incident record not found")

    return assistant.synthesize_incident(incident, db)
