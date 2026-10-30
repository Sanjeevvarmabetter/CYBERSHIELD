from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime

# --- Auth Schemas ---
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, description="Argon2id secured password")
    full_name: str = Field(..., min_length=2)
    role: Optional[str] = "CITIZEN"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    email: str
    role: str
    full_name: str

class UserProfile(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    email: str
    full_name: str
    role: str
    is_active: bool
    created_at: datetime

# --- Analysis Schemas ---
class ScamAnalysisRequest(BaseModel):
    text: str = Field(..., min_length=5, max_length=15000, description="Suspicious text message, email or offer")
    channel: Optional[str] = "SMS"  # SMS, WHATSAPP, EMAIL, SOCIAL_MEDIA, JOB_PORTAL

class URLAnalysisRequest(BaseModel):
    url: str = Field(..., description="Target URL to safely inspect")

class FraudTransactionRequest(BaseModel):
    transaction_id: Optional[str] = None
    account_id: str = Field(..., description="User account identifier")
    amount: float = Field(..., gt=0, description="Transaction amount in INR")
    timestamp: Optional[datetime] = None
    recipient_vpa: Optional[str] = None  # e.g., user@okhdfcbank
    recipient_account: Optional[str] = None
    device_id: str = Field(..., description="Device fingerprint")
    ip_address: Optional[str] = "127.0.0.1"
    is_new_device: bool = False
    is_new_recipient: bool = False
    failed_auth_attempts_prior: int = Field(default=0, ge=0)
    channel: str = "UPI"  # UPI, IMPS, NEFT, CARD, NETBANKING

class AbuseAnalysisRequest(BaseModel):
    text: str = Field(..., min_length=3, max_length=15000)
    context_type: Optional[str] = "DIRECT_MESSAGE"  # DIRECT_MESSAGE, PUBLIC_COMMENT, EMAIL

class IndicatorItem(BaseModel):
    type: str
    name: str
    description: str
    severity: str  # LOW, MEDIUM, HIGH, CRITICAL

class AnalysisResponse(BaseModel):
    analysis_type: str
    predicted_category: str
    risk_score: float = Field(..., ge=0, le=100)
    risk_level: str  # LOW, MEDIUM, HIGH, CRITICAL
    confidence: float
    detection_indicators: List[IndicatorItem]
    explanation: str
    recommended_actions: List[str]
    limitations: Optional[str] = None
    reference_id: Optional[str] = None

# --- Incident Reporting Schemas ---
class IncidentCreate(BaseModel):
    category: str = Field(..., description="FINANCIAL_FRAUD, PHISHING, FAKE_JOB, IDENTITY_THEFT, HARASSMENT, CYBERSTALKING, SEXTORTION, OTHER")
    title: str = Field(..., min_length=5, max_length=200)
    description: str = Field(..., min_length=20, max_length=10000)
    priority: Optional[str] = "MEDIUM"
    is_anonymous: bool = False
    consent_share_intel: bool = False
    contact_email: Optional[EmailStr] = None
    indicators_involved: Optional[List[str]] = []
    transaction_reference: Optional[str] = None
    metadata_json: Optional[Dict[str, Any]] = {}

class IncidentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    reference_code: str
    category: str
    title: str
    description: str
    status: str
    priority: str
    is_anonymous: bool
    consent_share_intel: bool
    contact_email: Optional[str]
    created_at: datetime
    updated_at: datetime

class IncidentStatusUpdate(BaseModel):
    status: str  # SUBMITTED, RECEIVED, UNDER_REVIEW, INFO_REQUIRED, CLOSED, REFERRED
    priority: Optional[str] = None
    analyst_note: Optional[str] = None

# --- Threat Intelligence Schemas ---
class ThreatIndicatorResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    indicator_type: str
    normalized_value: str
    defanged_value: str
    verification_status: str
    confidence_score: float
    first_seen: datetime
    last_seen: datetime
    source_provenance: str
    times_reported: int
    tags: List[str]

# --- Dashboard Schemas ---
class DashboardMetrics(BaseModel):
    total_incidents: int
    incidents_under_review: int
    high_risk_analyses: int
    active_indicators: int
    category_breakdown: Dict[str, int]
    risk_level_breakdown: Dict[str, int]
    recent_activity: List[Dict[str, Any]]
