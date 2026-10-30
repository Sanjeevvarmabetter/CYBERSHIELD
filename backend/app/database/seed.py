from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from backend.app.database.models.models import User, ThreatIndicator, Incident, Evidence
from backend.app.core.security import get_password_hash

def seed_initial_data(db: Session):
    """Seed default accounts and baseline threat intelligence if empty."""
    # Seed default users
    admin = db.query(User).filter(User.email == "admin@cybershield.org").first()
    if not admin:
        admin = User(
            email="admin@cybershield.org",
            password_hash=get_password_hash("CybershieldAdmin2026!"),
            full_name="Chief Security Officer",
            role="ADMIN",
            is_active=True
        )
        db.add(admin)

    analyst = db.query(User).filter(User.email == "analyst@cybershield.org").first()
    if not analyst:
        analyst = User(
            email="analyst@cybershield.org",
            password_hash=get_password_hash("CybershieldAnalyst2026!"),
            full_name="Lead Cyber Threat Analyst",
            role="ANALYST",
            is_active=True
        )
        db.add(analyst)

    citizen = db.query(User).filter(User.email == "citizen@cybershield.org").first()
    if not citizen:
        citizen = User(
            email="citizen@cybershield.org",
            password_hash=get_password_hash("CitizenSafe2026!"),
            full_name="Pooja Sharma",
            role="CITIZEN",
            is_active=True
        )
        db.add(citizen)

    # Seed baseline threat indicators
    existing_indicator = db.query(ThreatIndicator).first()
    if not existing_indicator:
        sample_iocs = [
            {
                "indicator_type": "DOMAIN",
                "normalized_value": "sbi-kyc-verify-update.com",
                "defanged_value": "sbi-kyc-verify-update[.]com",
                "verification_status": "CONFIRMED",
                "confidence_score": 96.0,
                "source_provenance": "CERT_IN_BULLETIN",
                "times_reported": 18,
                "tags": ["phishing", "banking", "sbi", "credential_harvester"]
            },
            {
                "indicator_type": "UPI_VPA",
                "normalized_value": "refund-desk948@oksbi",
                "defanged_value": "refund-desk948[at]oksbi",
                "verification_status": "CORROBORATED",
                "confidence_score": 88.0,
                "source_provenance": "CITIZEN_REPORTS_AGGREGATED",
                "times_reported": 12,
                "tags": ["upi_fraud", "refund_scam", "olx_scam"]
            },
            {
                "indicator_type": "PHONE",
                "normalized_value": "+919876543210",
                "defanged_value": "+91-98765-XXXXX",
                "verification_status": "UNDER_REVIEW",
                "confidence_score": 75.0,
                "source_provenance": "INCIDENT_REPORTS",
                "times_reported": 5,
                "tags": ["electricity_bill_scam", "spoofed_caller"]
            },
            {
                "indicator_type": "DOMAIN",
                "normalized_value": "telegram-work-daily-payout.site",
                "defanged_value": "telegram-work-daily-payout[.]site",
                "verification_status": "CONFIRMED",
                "confidence_score": 94.0,
                "source_provenance": "URLHAUS_FEED",
                "times_reported": 27,
                "tags": ["fake_job", "task_scam", "telegram_fraud"]
            },
            {
                "indicator_type": "URL",
                "normalized_value": "http://bijli-bill-alert-portal.xyz/pay",
                "defanged_value": "hxxp://bijli-bill-alert-portal[.]xyz/pay",
                "verification_status": "CONFIRMED",
                "confidence_score": 98.0,
                "source_provenance": "AUTHORITATIVE_FEED",
                "times_reported": 34,
                "tags": ["utility_scam", "credential_theft"]
            }
        ]
        now = datetime.now(timezone.utc)
        for ioc in sample_iocs:
            ind = ThreatIndicator(
                indicator_type=ioc["indicator_type"],
                normalized_value=ioc["normalized_value"],
                defanged_value=ioc["defanged_value"],
                verification_status=ioc["verification_status"],
                confidence_score=ioc["confidence_score"],
                first_seen=now - timedelta(days=5),
                last_seen=now,
                source_provenance=ioc["source_provenance"],
                times_reported=ioc["times_reported"],
                tags=ioc["tags"],
                is_active=True
            )
            db.add(ind)

    db.commit()
