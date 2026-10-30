from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from backend.app.database.models.models import AuditLog

def record_audit_log(
    db: Session,
    action: str,
    target_entity: str,
    user_id: Optional[str] = None,
    target_id: Optional[str] = None,
    ip_address: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None
) -> AuditLog:
    """Record an immutable audit log entry."""
    entry = AuditLog(
        user_id=user_id,
        action=action,
        target_entity=target_entity,
        target_id=target_id,
        ip_address=ip_address,
        details=details or {}
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry
