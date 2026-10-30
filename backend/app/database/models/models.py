import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Text, Boolean, Integer, Float, DateTime, ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from backend.app.database.connection import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

def get_utc_now() -> datetime:
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(32), default="CITIZEN", index=True, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=get_utc_now, nullable=False)
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now, nullable=False)

    incidents = relationship("Incident", back_populates="reporter", cascade="all, delete-orphan")
    analysis_records = relationship("AnalysisRecord", back_populates="user")
    assigned_cases = relationship("InvestigationCase", back_populates="assigned_analyst")

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    reference_code = Column(String(32), unique=True, index=True, nullable=False)
    reporter_user_id = Column(String(36), ForeignKey("users.id"), nullable=True, index=True)
    category = Column(String(64), index=True, nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String(32), default="SUBMITTED", index=True, nullable=False)
    priority = Column(String(32), default="MEDIUM", index=True, nullable=False)
    is_anonymous = Column(Boolean, default=False, nullable=False)
    consent_share_intel = Column(Boolean, default=False, nullable=False)
    contact_email = Column(String(255), nullable=True)
    metadata_json = Column(JSON, default=dict, nullable=False)
    created_at = Column(DateTime, default=get_utc_now, nullable=False)
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now, nullable=False)

    reporter = relationship("User", back_populates="incidents")
    evidence_items = relationship("Evidence", back_populates="incident", cascade="all, delete-orphan")
    investigation_case = relationship("InvestigationCase", back_populates="incident", uselist=False, cascade="all, delete-orphan")

class Evidence(Base):
    __tablename__ = "evidence"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    incident_id = Column(String(36), ForeignKey("incidents.id"), nullable=False, index=True)
    file_name = Column(String(255), nullable=False)
    file_size = Column(Integer, nullable=False)
    mime_type = Column(String(128), nullable=False)
    sha256_hash = Column(String(64), index=True, nullable=False)
    storage_path = Column(String(512), nullable=False)
    ocr_extracted_text = Column(Text, nullable=True)
    derived_indicators = Column(JSON, default=dict, nullable=False)
    created_at = Column(DateTime, default=get_utc_now, nullable=False)

    incident = relationship("Incident", back_populates="evidence_items")

class ThreatIndicator(Base):
    __tablename__ = "threat_indicators"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    indicator_type = Column(String(32), index=True, nullable=False)  # DOMAIN, URL, IP, PHONE, EMAIL, UPI_VPA, HASH
    normalized_value = Column(String(512), index=True, nullable=False)
    defanged_value = Column(String(512), nullable=False)
    verification_status = Column(String(32), default="UNVERIFIED", index=True, nullable=False)  # UNVERIFIED, UNDER_REVIEW, CORROBORATED, CONFIRMED, REJECTED, EXPIRED
    confidence_score = Column(Float, default=50.0, nullable=False)  # 0 to 100
    first_seen = Column(DateTime, default=get_utc_now, nullable=False)
    last_seen = Column(DateTime, default=get_utc_now, nullable=False)
    source_provenance = Column(String(128), default="CITIZEN_REPORT", nullable=False)
    times_reported = Column(Integer, default=1, nullable=False)
    tags = Column(JSON, default=list, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

class AnalysisRecord(Base):
    __tablename__ = "analysis_records"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True, index=True)
    analysis_type = Column(String(32), index=True, nullable=False)  # SCAM_MESSAGE, PHISHING_URL, FRAUD_TX, ABUSE_TEXT
    input_preview = Column(String(500), nullable=False)
    risk_score = Column(Float, nullable=False)  # 0 to 100
    risk_level = Column(String(16), nullable=False)  # LOW, MEDIUM, HIGH, CRITICAL
    predicted_category = Column(String(64), nullable=False)
    confidence = Column(Float, nullable=False)
    detection_indicators = Column(JSON, default=list, nullable=False)
    recommendations = Column(JSON, default=list, nullable=False)
    limitations = Column(Text, nullable=True)
    created_at = Column(DateTime, default=get_utc_now, nullable=False)

    user = relationship("User", back_populates="analysis_records")

class InvestigationCase(Base):
    __tablename__ = "investigation_cases"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    incident_id = Column(String(36), ForeignKey("incidents.id"), unique=True, nullable=False)
    assigned_analyst_id = Column(String(36), ForeignKey("users.id"), nullable=True, index=True)
    status = Column(String(32), default="TRIAGED", index=True, nullable=False)
    internal_notes = Column(Text, default="", nullable=False)
    timeline_events = Column(JSON, default=list, nullable=False)
    created_at = Column(DateTime, default=get_utc_now, nullable=False)
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now, nullable=False)

    incident = relationship("Incident", back_populates="investigation_case")
    assigned_analyst = relationship("User", back_populates="assigned_cases")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), nullable=True, index=True)
    action = Column(String(64), index=True, nullable=False)
    target_entity = Column(String(64), nullable=False)
    target_id = Column(String(64), nullable=True)
    ip_address = Column(String(45), nullable=True)
    details = Column(JSON, default=dict, nullable=False)
    timestamp = Column(DateTime, default=get_utc_now, nullable=False)
