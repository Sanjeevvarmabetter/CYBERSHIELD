from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status, Request, Response
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from pathlib import Path
from typing import Optional, List

from backend.app.database.connection import get_db
from backend.app.database.models.models import Evidence, Incident, User
from backend.app.evidence.storage import save_uploaded_evidence
from backend.app.evidence.hashing import verify_file_integrity
from backend.app.evidence.export_pdf import generate_evidence_assistance_pdf
from backend.app.core.audit import record_audit_log
from backend.app.dependencies import get_current_user_optional, require_role
from backend.app.core.permissions import UserRole

router = APIRouter(prefix="/evidence", tags=["Digital Evidence Vault"])

@router.get("", response_model=List[dict])
def list_evidence_inventory(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.ANALYST))
):
    """List all secured evidentiary items across cases for authorized analysts."""
    items = db.query(Evidence).order_by(Evidence.created_at.desc()).limit(100).all()
    out = []
    for ev in items:
        inc = db.query(Incident).filter(Incident.id == ev.incident_id).first()
        out.append({
            "id": ev.id,
            "incident_id": ev.incident_id,
            "reference_code": inc.reference_code if inc else "UNKNOWN",
            "file_name": ev.file_name,
            "file_size": ev.file_size,
            "mime_type": ev.mime_type,
            "sha256_hash": ev.sha256_hash,
            "created_at": ev.created_at.isoformat()
        })
    return out

@router.get("/{evidence_id}/verify")
def verify_evidence_integrity(
    evidence_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.ANALYST))
):
    """Perform cryptographic SHA-256 integrity check against stored binary file."""
    item = db.query(Evidence).filter(Evidence.id == evidence_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Evidence item not found")

    is_valid = verify_file_integrity(item.storage_path, item.sha256_hash)
    return {
        "evidence_id": item.id,
        "file_name": item.file_name,
        "recorded_sha256": item.sha256_hash,
        "file_exists_on_disk": Path(item.storage_path).exists(),
        "integrity_verified": is_valid,
        "verification_timestamp": Path(item.storage_path).stat().st_mtime if Path(item.storage_path).exists() else None
    }

@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_evidence(
    incident_id: str = Form(...),
    file: UploadFile = File(...),
    request: Request = None,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Upload an evidence file (screenshot, chat export, or document).
    Computes cryptographic SHA-256 hash immediately, saves in isolated storage,
    and links to the incident record.
    """
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Incident '{incident_id}' not found."
        )

    stored_path, sha256_hash, file_size, orig_name = save_uploaded_evidence(file)

    evidence_item = Evidence(
        incident_id=incident.id,
        file_name=orig_name,
        file_size=file_size,
        mime_type=file.content_type or "application/octet-stream",
        sha256_hash=sha256_hash,
        storage_path=stored_path,
        derived_indicators={}
    )
    db.add(evidence_item)
    db.commit()
    db.refresh(evidence_item)

    record_audit_log(
        db=db,
        action="EVIDENCE_UPLOADED",
        target_entity="Evidence",
        target_id=evidence_item.id,
        user_id=current_user.id if current_user else None,
        ip_address=request.client.host if request and request.client else None,
        details={
            "incident_id": incident.id,
            "filename": orig_name,
            "sha256": sha256_hash,
            "size_bytes": file_size
        }
    )

    return {
        "status": "success",
        "evidence_id": evidence_item.id,
        "file_name": orig_name,
        "sha256_hash": sha256_hash,
        "file_size": file_size,
        "created_at": evidence_item.created_at
    }

@router.get("/report/{incident_id}")
def download_assistance_report_pdf(
    incident_id: str,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Generate and stream an official Evidence Assistance PDF document
    for formal police submission and victim assistance.
    """
    incident = db.query(Incident).filter(
        (Incident.id == incident_id) | (Incident.reference_code == incident_id)
    ).first()

    if not incident:
        raise HTTPException(status_code=404, detail="Incident record not found.")

    pdf_bytes = generate_evidence_assistance_pdf(incident)

    record_audit_log(
        db=db,
        action="PDF_REPORT_GENERATED",
        target_entity="Incident",
        target_id=incident.id,
        ip_address=request.client.host if request.client else None,
        details={"reference_code": incident.reference_code}
    )

    filename = f"CYBERSHIELD_Evidence_Report_{incident.reference_code}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    )

@router.get("/{evidence_id}/download")
def download_evidence_file(
    evidence_id: str,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.ANALYST))
):
    """Authorized download of original evidentiary binary file with access logging."""
    item = db.query(Evidence).filter(Evidence.id == evidence_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Evidence item not found")

    file_path = Path(item.storage_path)
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Evidentiary file missing from object vault")

    record_audit_log(
        db=db,
        action="EVIDENCE_DOWNLOADED",
        target_entity="Evidence",
        target_id=item.id,
        user_id=current_user.id,
        ip_address=request.client.host if request.client else None,
        details={"sha256": item.sha256_hash, "file_name": item.file_name}
    )

    return FileResponse(
        path=str(file_path),
        filename=item.file_name,
        media_type=item.mime_type
    )
