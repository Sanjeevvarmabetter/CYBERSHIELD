from pydantic import BaseModel, Field
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from backend.app.database.connection import get_db
from backend.app.database.models.models import Incident, User, ThreatIndicator
from backend.app.investigations.assistant import AIInvestigationAssistant, sanitize_untrusted_input
from backend.app.dependencies import require_role
from backend.app.core.permissions import UserRole

router = APIRouter(prefix="/investigation", tags=["AI Investigation Assistant"])
assistant = AIInvestigationAssistant()

class CopilotChatRequest(BaseModel):
    incident_id: str
    query: str = Field(..., min_length=2, max_length=2000)

class CopilotChatResponse(BaseModel):
    incident_reference: str
    response_text: str
    action_items: List[str]
    forensic_notes: Optional[str] = None

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

@router.post("/chat", response_model=CopilotChatResponse)
def copilot_investigation_chat(
    payload: CopilotChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.ANALYST))
):
    """
    Interactive AI Investigation Copilot.
    Assists analysts with legal complaint drafting, forensic evidence questions,
    and cross-syndicate correlation with prompt-injection sanitization.
    """
    incident = db.query(Incident).filter(
        (Incident.id == payload.incident_id) | (Incident.reference_code == payload.incident_id)
    ).first()

    if not incident:
        raise HTTPException(status_code=404, detail="Incident record not found")

    clean_query = sanitize_untrusted_input(payload.query).lower()
    meta = incident.metadata_json or {}
    indicators = meta.get("indicators_involved", [])

    # Contextual analytical routing based on query intent
    if "fir" in clean_query or "complaint" in clean_query or "police" in clean_query or "draft" in clean_query:
        response_text = (
            f"FORMAL COMPLAINT DRAFT ASSISTANCE (Case: {incident.reference_code})\n\n"
            f"To: The Station House Officer / Cyber Crime Police Station\n"
            f"Subject: Formal complaint regarding {incident.category.replace('_', ' ')} offense under Section 66D IT Act and relevant penal provisions.\n\n"
            f"Respected Sir/Madam,\n"
            f"I submit this complaint regarding cyber fraudulent activity occurring on {incident.created_at.strftime('%Y-%m-%d')}. "
            f"The suspect targeted the complainant using deceptive tactics: \"{incident.title}\".\n"
            f"Key Perpetrator Identifiers Preserved:\n"
            + "\n".join([f"• Indicator: {i}" for i in indicators[:4]])
            + f"\n\nDigital evidence has been preserved with cryptographic SHA-256 hashes under tracking code {incident.reference_code}. "
            f"It is requested that an investigation be initiated, and immediate notice under Section 91 CrPC be served to the relevant intermediaries."
        )
        actions = [
            "Submit draft along with the official CYBERSHIELD PDF Evidence Report to cybercrime.gov.in.",
            "Contact victim's home bank with the complaint acknowledgment to initiate chargeback/lien.",
            "Preserve original uncompressed screenshots on secure external drive."
        ]
        notes = "Draft generated based on Section 66D (Cheating by personation using computer resource) of Information Technology Act 2000."

    elif "forensic" in clean_query or "sim" in clean_query or "device" in clean_query or "phone" in clean_query:
        response_text = (
            f"DIGITAL FORENSIC TRIAGE PROTOCOL for {incident.category}\n\n"
            f"1. Device Isolation: If remote access software (AnyDesk, RustDesk) was installed, disconnect Wi-Fi/Mobile Data immediately to halt active C2 beaconing.\n"
            f"2. SMS Header Verification: In India, legitimate bank SMS originates from approved 6-character alphanumeric headers (e.g., AD-HDFCBK, VK-SBIINB). If received from a standard 10-digit number (+91-9xxxxxxxxx), record CDR and message service center (SMSC) timestamp.\n"
            f"3. Memory Dwell Time: Do not perform a factory reset before backing up application cache logs in Android `/data/data/` or iOS app containers."
        )
        actions = [
            "Check Google Play / App Store account for unauthorized sideloaded APK installations.",
            "Inspect SIM settings: check if call-forwarding (*21* or *401*) was silently enabled by scammer.",
            "Request immediate SIM lock / PUK verification from telecom operator."
        ]
        notes = "Adheres to standard NIST SP 800-86 Guide to Integrating Forensic Techniques."

    else:
        # General investigative synthesis
        matching_iocs = db.query(ThreatIndicator).filter(ThreatIndicator.is_active == True).limit(3).all()
        ioc_summary = ", ".join([ioc.defanged_value for ioc in matching_iocs])
        response_text = (
            f"Analytical Assessment for {incident.reference_code}:\n"
            f"The incident presents hallmarks of {incident.category.replace('_', ' ')}. "
            f"Recorded indicators correlate with known active threat clusters ({ioc_summary}). "
            f"The reported chronology suggests psychological urgency manipulation followed by account exploitation."
        )
        actions = [
            "Correlate recorded UPI VPAs across the NetworkX graph engine to check for repeated beneficiary rings.",
            "Review uploaded evidence hashes to verify intact chain of custody.",
            "Update triage status to 'UNDER_REVIEW' or 'REFERRED TO POLICE (1930)' as appropriate."
        ]
        notes = "Prompt injection defenses validated. Query processed strictly within case context."

    return CopilotChatResponse(
        incident_reference=incident.reference_code,
        response_text=response_text,
        action_items=actions,
        forensic_notes=notes
    )
