# CYBERSHIELD — Testing Strategy & Verification Guide

Testing in CYBERSHIELD is non-negotiable. Every detection model, security boundary, and data pipeline is backed by automated tests.

---

## 1. Test Architecture

The test suite is structured into four distinct layers in `backend/tests/`:

```
backend/tests/
├── unit/
│   ├── test_auth.py                 # Argon2id hashing, token signing, role decoding
│   ├── test_ssrf.py                 # Egress validation & IP boundary checks
│   └── test_detection_engines.py    # Scam, URL, Fraud 3-layer, and Abuse engines
├── integration/
│   └── test_api_workflows.py        # End-to-end incident submission, evidence upload, PDF generation, AI synthesis
├── security/
│   └── test_security_controls.py    # Comprehensive SSRF bypass, path traversal, RBAC route isolation
└── adversarial/
    └── test_adversarial_detection.py # Punycode homoglyphs, obfuscated text, benign baseline resilience
```

---

## 2. Running Tests

```bash
# Activate Python 3.11 environment
source backend/venv/bin/activate

# Execute complete test suite (22 automated tests)
PYTHONPATH=. pytest backend/tests -v

# Run with test coverage report
PYTHONPATH=. pytest backend/tests --cov=backend/app --cov-report=term-missing
```

---

## 3. Test Categories & Verification Scope

| Test Suite | Tests | Purpose |
|---|---|---|
| **Unit Tests** | 8 | Validates Argon2id password hashing, constant-time verification, JWT claims, deterministic fraud rules, and individual detection engine heuristics. |
| **Integration Tests** | 3 | Validates end-to-end user workflows: submitting an incident, calculating SHA-256 evidence hashes, downloading exportable PDF assistance reports, and running the AI assistant. |
| **Security Tests** | 4 | Probes SSRF prevention against cloud metadata (`169.254.169.254`), loopbacks, link-local, carrier-grade NAT, path traversal in file uploads, and unauthorized analyst route protection. |
| **Adversarial Tests** | 4 | Probes detection robustness against homoglyph punycode domains, leetspeak scam patterns, and verifies benign messages are never falsely flagged. |
