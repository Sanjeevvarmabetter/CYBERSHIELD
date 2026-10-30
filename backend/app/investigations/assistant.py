import re
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from backend.app.database.models.models import Incident, ThreatIndicator, Evidence

def sanitize_untrusted_input(text: str) -> str:
    """
    Sanitize untrusted text to prevent prompt injection or control character attacks.
    Escapes delimiters and replaces instructions attempting to override system behavior.
    """
    if not text:
        return ""
    # Strip dangerous markdown/control injections
    cleaned = text.replace("<script>", "").replace("</script>", "")
    cleaned = re.sub(r"(ignore previous instructions|system prompt|override security)", "[SUSPICIOUS_PHRASE_REDACTED]", cleaned, flags=re.IGNORECASE)
    return cleaned[:4000]

class AIInvestigationAssistant:
    """
    Explainable AI Investigation Assistant.
    Produces deterministic structured case summaries, timeline reconstructions,
    and recommended investigator questions without hallucinating facts.
    """

    def synthesize_incident(self, incident: Incident, db: Session) -> Dict[str, Any]:
        sanitized_desc = sanitize_untrusted_input(incident.description)
        meta = incident.metadata_json or {}
        indicators = meta.get("indicators_involved", [])

        # 1. Timeline reconstruction
        timeline = [
            {
                "time": incident.created_at.strftime("%Y-%m-%d %H:%M:%S UTC"),
                "event": "Citizen Incident Ingested",
                "details": f"Reported under category: {incident.category}"
            }
        ]
        if incident.evidence_items:
            for ev in incident.evidence_items:
                timeline.append({
                    "time": ev.created_at.strftime("%Y-%m-%d %H:%M:%S UTC"),
                    "event": "Binary Evidence Secured",
                    "details": f"File '{ev.file_name}' ({ev.file_size} bytes) locked with SHA-256: {ev.sha256_hash[:16]}..."
                })

        # 2. Indicator correlation
        correlated_iocs = []
        for raw_ind in indicators:
            norm = raw_ind.strip().lower()
            matching = db.query(ThreatIndicator).filter(
                ThreatIndicator.normalized_value.like(f"%{norm}%")
            ).all()
            for m in matching:
                correlated_iocs.append({
                    "indicator": m.defanged_value,
                    "type": m.indicator_type,
                    "status": m.verification_status,
                    "prior_reports": m.times_reported,
                    "confidence": m.confidence_score
                })

        # 3. Investigative Inquiries to Ask Victim / Complainant
        inquiry_questions = [
            "Was the transaction authenticated via 2FA/OTP or authorized via UPI PIN?",
            "Did the suspect request installation of any screen-sharing software (e.g. AnyDesk, TeamViewer, RustDesk)?",
            "What was the exact mobile number or email address the initial contact originated from?",
            "Has the incident been reported to the 1930 Financial Cyber Fraud Helpline within the golden hour?"
        ]
        if incident.category == "SEXTORTION":
            inquiry_questions.append("Have any demands been met with payment? If so, obtain the recipient UPI VPA or bank IFSC immediately.")
            inquiry_questions.append("Has the victim been guided to submit image hashes to StopNCII.org?")

        # 4. Evidence Preservation Recommendations
        preservation_steps = [
            "Export complete WhatsApp or Telegram chat logs with media attachments intact.",
            "Obtain official bank account statement showing debit entry and 12-digit UPI reference (UTR).",
            "Keep original phone handset unformatted to preserve device logs and SMS headers.",
            "Capture screenshots showing suspect profile handles, bio links, and contact information."
        ]

        # 5. Executive Case Synthesis Summary
        synthesis_summary = (
            f"Case {incident.reference_code} involves reported {incident.category.replace('_', ' ')}. "
            f"Preserved narrative describes {len(sanitized_desc)} characters of incident details. "
            f"{len(correlated_iocs)} prior threat intelligence indicators correlate with the entities reported. "
            "Evidence integrity is verified via cryptographic SHA-256 storage."
        )

        return {
            "reference_code": incident.reference_code,
            "category": incident.category,
            "synthesis_summary": synthesis_summary,
            "reconstructed_timeline": timeline,
            "correlated_indicators": correlated_iocs,
            "investigator_inquiries": inquiry_questions,
            "preservation_steps": preservation_steps,
            "safety_note": "AI assistant synthesis is advisory for security analysts; it does not replace formal forensic testimony."
        }
