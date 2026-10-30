import re
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from backend.app.database.models.models import ThreatIndicator

def defang_indicator(indicator_type: str, raw_value: str) -> str:
    """
    Defang malicious indicator so it cannot be accidentally clicked or executed.
    e.g., http://bad.com -> hxxp://bad[.]com
          user@scam.com -> user[at]scam[.]com
          192.168.1.1 -> 192[.]168[.]1[.]1
    """
    val = raw_value.strip()
    if indicator_type in ("DOMAIN", "IP"):
        return val.replace(".", "[.]")
    elif indicator_type == "URL":
        val = re.sub(r"^https?", lambda m: "hxxps" if m.group(0).lower() == "https" else "hxxp", val)
        return val.replace(".", "[.]")
    elif indicator_type in ("EMAIL", "UPI_VPA"):
        return val.replace("@", "[at]").replace(".", "[.]")
    elif indicator_type == "PHONE":
        if len(val) >= 8:
            return val[:-4] + "XXXX"
        return val
    return val

def normalize_indicator(indicator_type: str, raw_value: str) -> str:
    """Normalize indicators for exact deduplication."""
    val = raw_value.strip().lower()
    if indicator_type == "DOMAIN":
        val = val.replace("http://", "").replace("https://", "").split("/")[0].split(":")[0]
    elif indicator_type == "PHONE":
        # Keep digits and leading plus
        val = re.sub(r"[^\d+]", "", val)
        if len(val) == 10 and not val.startswith("+"):
            val = "+91" + val
    elif indicator_type == "URL":
        # Strip trailing slash
        val = val.rstrip("/")
    return val

def calculate_confidence_decay(
    original_confidence: float,
    last_seen: datetime,
    half_life_days: float = 30.0
) -> float:
    """
    Apply exponential half-life confidence decay.
    Confidence = Original * 2^(-delta_days / half_life)
    """
    now = datetime.now(timezone.utc)
    if last_seen.tzinfo is None:
        last_seen = last_seen.replace(tzinfo=timezone.utc)
    delta_days = max((now - last_seen).total_seconds() / 86400.0, 0.0)
    decayed = original_confidence * (0.5 ** (delta_days / half_life_days))
    return round(float(decayed), 1)

def upsert_threat_indicator(
    db: Session,
    indicator_type: str,
    raw_value: str,
    source: str = "CITIZEN_REPORT",
    initial_confidence: float = 60.0,
    tags: Optional[list] = None
) -> ThreatIndicator:
    """
    Deduplicate and insert or corroborate existing threat indicator.
    """
    normalized = normalize_indicator(indicator_type, raw_value)
    defanged = defang_indicator(indicator_type, normalized)
    now = datetime.now(timezone.utc)

    existing = db.query(ThreatIndicator).filter(
        ThreatIndicator.indicator_type == indicator_type,
        ThreatIndicator.normalized_value == normalized
    ).first()

    if existing:
        existing.times_reported += 1
        existing.last_seen = now
        # Corroboration increases confidence score
        existing.confidence_score = min(existing.confidence_score + 10.0, 99.0)
        if existing.times_reported >= 3 and existing.verification_status == "UNVERIFIED":
            existing.verification_status = "CORROBORATED"
        if tags:
            current_tags = set(existing.tags or [])
            current_tags.update(tags)
            existing.tags = list(current_tags)
        db.commit()
        db.refresh(existing)
        return existing
    else:
        new_ioc = ThreatIndicator(
            indicator_type=indicator_type,
            normalized_value=normalized,
            defanged_value=defanged,
            verification_status="UNDER_REVIEW" if source == "CITIZEN_REPORT" else "CONFIRMED",
            confidence_score=initial_confidence,
            first_seen=now,
            last_seen=now,
            source_provenance=source,
            times_reported=1,
            tags=tags or [],
            is_active=True
        )
        db.add(new_ioc)
        db.commit()
        db.refresh(new_ioc)
        return new_ioc
