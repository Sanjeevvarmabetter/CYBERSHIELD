# CYBERSHIELD — API Reference & Integration Guide

Base URL: `http://localhost:8000/api/v1`  
Interactive OpenAPI / Swagger UI: `http://localhost:8000/api/docs`

---

## 1. Authentication Endpoints

### `POST /auth/register`
Register a citizen or analyst user account.
```json
{
  "email": "user@example.com",
  "password": "SecurePassword2026!",
  "full_name": "Pooja Sharma",
  "role": "CITIZEN"
}
```

### `POST /auth/login`
Authenticate with Argon2id check, returning JWT Bearer token.
```json
{
  "email": "analyst@cybershield.org",
  "password": "CybershieldAnalyst2026!"
}
```

---

## 2. Analysis Endpoints

### `POST /analysis/scam`
Analyze suspicious text messages, job offers, or emails.
```json
// Request
{
  "text": "Selected for part-time YouTube review work. Earn ₹5000 daily. Join Telegram: t.me/vip_task_review.",
  "channel": "SMS"
}

// Response
{
  "analysis_type": "SCAM_MESSAGE",
  "predicted_category": "FAKE_JOB_TASK",
  "risk_score": 85.0,
  "risk_level": "CRITICAL",
  "confidence": 0.89,
  "detection_indicators": [
    {
      "type": "PATTERN_MATCH",
      "name": "Fake Job & Work-From-Home Task Scam",
      "description": "Triggered recognized linguistic signatures.",
      "severity": "HIGH"
    }
  ],
  "recommended_actions": [
    "Do not deposit or recharge any money to unlock earnings.",
    "Cease communication and block the sender."
  ]
}
```

### `POST /analysis/phishing`
Safely inspect URLs with zero-trust SSRF protection.
```json
// Request
{
  "url": "http://sbi-kyc-update-portal.xyz/login"
}

// Response
{
  "analysis_type": "PHISHING_URL",
  "predicted_category": "CONFIRMED_PHISHING_SBI",
  "risk_score": 95.0,
  "risk_level": "CRITICAL",
  "confidence": 0.95,
  "detection_indicators": [
    {
      "type": "BRAND_TYPOSQUAT",
      "name": "Brand Spoofing (SBI)",
      "description": "Domain mimics SBI without matching official infrastructure.",
      "severity": "CRITICAL"
    }
  ]
}
```

### `POST /analysis/fraud`
Evaluate financial transactions across Layer A, Layer B, and Layer C.
```json
// Request
{
  "account_id": "ACC_9921",
  "amount": 75000.0,
  "recipient_vpa": "refund-desk948@oksbi",
  "device_id": "DEV_NEW_1",
  "is_new_device": true,
  "is_new_recipient": true,
  "failed_auth_attempts_prior": 3
}
```

---

## 3. Incident & Evidence Endpoints

- `POST /incidents`: Submit report, returns unique tracking code `CS-2026-XXXXX`.
- `GET /incidents/track/{ref}`: Public status lookup by tracking code.
- `POST /evidence/upload`: Secure file upload with SHA-256 calculation.
- `GET /evidence/report/{incident_id}`: Stream generated PDF Evidence Assistance Report.
- `GET /intelligence/indicators`: Query active IOCs with real-time confidence decay.
- `GET /graph/data`: Retrieve NetworkX graph topology and community clusters.
- `GET /dashboard/metrics`: Operational metrics across incidents, analyses, and active indicators.
