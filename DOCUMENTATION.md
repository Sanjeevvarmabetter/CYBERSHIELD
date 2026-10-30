# CYBERSHIELD — Comprehensive Platform Documentation & Operator Manual
## Digital Crime Prevention & Intelligence Platform
> **Tagline:** "Detect. Understand. Protect."  
> **Initial Geographic Alignment:** India (National Cyber Crime Reporting Portal, 1930 Helpline, CERT-In)  
> **Production Status:** Fully Functional (Backend API + Interactive Frontend + ML Models)

---

## 1. System Credentials, Passcodes & Roles

CYBERSHIELD enforces strict Role-Based Access Control (RBAC) powered by **Argon2id** password hashing and cryptographic JSON Web Tokens (JWT). The database comes auto-seeded with the following operator accounts:

### 🔑 Pre-Seeded Passcodes & Access Table

| Role | Email Address | Password / Passcode | Access Capabilities & Route Boundaries |
|---|---|---|---|
| **Admin** | `admin@cybershield.org` | `CybershieldAdmin2026!` | **Unrestricted Access:** Immutable Audit Logs, Rule Configuration, Threat Intelligence Feeds, Model Telemetry, User Administration. |
| **Analyst** | `analyst@cybershield.org` | `CybershieldAnalyst2026!` | **Intelligence Console:** Incident Triage, AI Investigation Copilot, Evidence Vault Manager (1-click SHA-256 verification), NetworkX Threat Graph, Fraud Engine. |
| **Citizen** | `citizen@cybershield.org` | `CitizenSafe2026!` | **Public Portal:** Scam Message Analyzer, Safe URL Scanner, Screenshot OCR, Phone/Email Lookup, Incident Reporting, Track Status, Spot-The-Scam Quiz. |

> **Quick Login Tip:** On the web login screen (`http://localhost:5173/login`), click any of the **"1-Click Demographic Fill"** buttons to instantly populate the credentials.

---

### 🔐 API Authentication & Programmatic Token Generation

To authenticate against the FastAPI REST API programmatically, exchange credentials for a Bearer JWT:

```bash
# Request JWT Bearer Token
curl -X POST "http://127.0.0.1:8001/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "analyst@cybershield.org",
    "password": "CybershieldAnalyst2026!"
  }'
```

**Sample API Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "usr-analyst-seed",
    "email": "analyst@cybershield.org",
    "full_name": "Cyber Threat Analyst",
    "role": "ANALYST"
  }
}
```

Use the returned token in subsequent requests:
```bash
curl -H "Authorization: Bearer <TOKEN>" "http://127.0.0.1:8001/api/v1/evidence"
```

---

## 2. Product Identity & Dual Isolated Experience

CYBERSHIELD operates with two strictly separated user experiences to ensure victim privacy is never conflated with public intelligence feeds:

```mermaid
flowchart LR
    subgraph PublicPortal ["Public Citizen Portal (Unauthenticated / Citizen)"]
        A1["Scam Message Analyzer"]
        A2["Safe URL Inspection (SSRF Guard)"]
        A3["Screenshot OCR (Client-side WASM)"]
        A4["Phone & Email Intelligence Lookup"]
        A5["Cryptographic Incident Reporting"]
        A6["Spot-The-Scam Educational Simulator"]
    end

    subgraph Console ["Cyber Intelligence Console (Analyst & Admin Only)"]
        B1["Case Triage Queue"]
        B2["Digital Evidence Vault (SHA-256 Proof)"]
        B3["NetworkX Graph Syndicate Analytics"]
        B4["3-Layer Financial Fraud Engine"]
        B5["Live ML Model Telemetry (ROC-AUC / Latency)"]
        B6["AI Investigation Copilot (FIR Drafts)"]
        B7["Tamper-Evident Audit Trail"]
    end

    A5 -.->|Anonymized Indicators Only (With Consent)| B3
    A5 -->|Private Case Record| B1
```

1. **Public Citizen Portal** — Fast, accessible, privacy-preserving interface focused on immediate safety, non-judgmental guidance, and forensic evidence preservation.
2. **Cyber Intelligence Console** — High-security analyst workspace for correlating multi-victim crime syndicates, investigating threat indicators, reviewing ML model telemetry, and generating police complaint memos.

---

## 3. Deep Dive: Core Platform Modules

### Module 1: Online Crime Analyzer
Central multi-modal analysis engine for suspicious digital artifacts:
* **Scam Message Pipeline (`ScamMessageEngine`)**:
  * Evaluates messages across 11 crime categories: Fake Job Offers, Advance-Fee, Banking KYC/PAN update, Electricity Bill disconnection, Lottery, Sextortion, OTP theft, and Impersonation.
  * Multi-stage scoring: regex pattern heuristics, psychological urgency keywords, indicator extraction (UPI VPAs, WhatsApp handles, Telegram links).
* **Phishing URL Inspection (`PhishingURLEngine`)**:
  * **Strict SSRF Defense**: Pre-flight DNS resolution blocks localhost (`127.0.0.1`), RFC1918 private subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), link-local (`169.254.169.254` cloud metadata), and IPv6 loopbacks.
  * **Static Lexical Analysis**: Shannon Entropy (detecting algorithmic DGA domains), Punycode/IDN homoglyph evasion (e.g. `xn--...`), brand typosquatting targeting major Indian banks (`sbi`, `hdfc`, `icici`, `paytm`, `phonepe`).
* **Client-Side Screenshot OCR Analyzer**:
  * Utilizes in-browser WebAssembly OCR (`tesseract.js`) so images are processed locally on the citizen's device without exposing personal photos to third-party cloud services.
* **Phone & Email Intelligence Lookup**:
  * Evaluates international calling codes associated with unsolicited WhatsApp job solicitations (`+62` Indonesia, `+84` Vietnam, `+234` Nigeria).
  * Detects disposable and temporary email inboxes (`mailinator.com`, `tempmail.com`, etc.).
  * Strictly avoids reverse-doxxing or revealing private personal identities.

---

### Module 2: Financial Fraud Detection Engine
3-Layer architecture designed specifically for high-velocity payment and UPI fraud:
* **Layer A: Rule-Based Heuristics**:
  * Triggers on sudden velocity bursts, transaction amount exceeding standard thresholds (₹50,000+), repeated failed authentication attempts, and unverified new device logins.
* **Layer B: Machine Learning Anomaly & Classification**:
  * **Dual-Ensemble**: Combines Scikit-learn **Isolation Forest** (unsupervised anomaly score) with **Random Forest** (supervised pattern classification).
  * Versioned model metadata and evaluation benchmarks (`v1.4.2-ensemble`).
* **Layer C: Normalized Risk Aggregator**:
  * Computes a combined 0–100 risk score with clear severity thresholds:
    * `0–29`: Low Risk
    * `30–59`: Medium Risk
    * `60–79`: High Risk
    * `80–100`: Critical Risk
  * Returns an explainable array of machine-readable contributing indicators.

---

### Module 3: Online Abuse & Exploitation Detection
NLP-based multi-label classifier for harassment, threatening communications, cyberstalking, and sextortion:
* **Context-Aware Classification**: Distinguishes quoted abusive messages submitted by a victim from direct perpetrator communications.
* **Multi-Label Severity Scoring**: Supports simultaneous labels (e.g., Harassment + Sextortion + Threats).
* **Safety Resources**: High-severity detections trigger immediate emergency helpline contacts for the National Commission for Women (7827170170) and 1930.

---

### Module 4: Threat Intelligence Database
Searchable threat repository tracking actionable Indicators of Compromise (IOCs):
* **Supported Indicators**: Domains, URLs, IP addresses, Email addresses, Phone numbers, UPI VPAs, and Scam message fingerprints.
* **Sanitization & Defanging**: Automatically defangs malicious values for safe analyst sharing (e.g., `hxxps://scam-sbi[.]com`, `fraudster[at]gmail.com`).
* **Confidence Decay**: Features exponential half-life decay reducing confidence on stale indicators that have had no observed activity.

---

### Module 5: Graph-Based Crime Pattern Correlation
Network-wide threat correlation engine built with **Python NetworkX**:
* **Topology Engine**: Models nodes (Incidents, Phone Numbers, UPI VPAs, Domains, IP addresses) and edges (Relationships).
* **Graph Metrics**: Computes Degree Centrality to identify "super-spreader" scam infrastructure.
* **Community Detection**: Executes greedy modularity community clustering to group coordinated cybercrime rings into distinct visual color clusters.

---

### Module 6 & 7: Incident Reporting & Digital Evidence Vault
End-to-end evidence collection and integrity platform:
* **Cryptographic Browser Pre-Hashing**: Uses Web Crypto API `crypto.subtle.digest("SHA-256")` to calculate the cryptographic hash in the user's browser before file upload.
* **Tracking Code Generator**: Issues unique reference identifiers (e.g. `CS-2026-82685`).
* **Evidence Vault Manager**:
  * Stores files with UUID naming and path traversal protection in an isolated storage directory.
  * **1-Click Live Integrity Verification**: The analyst console can stream any disk file on-demand through SHA-256 to prove non-tampering against the original database record.
* **Official PDF Assistance Report**: Generates an authoritative ReportLab PDF summarizing the incident chronology, technical indicators, and evidence hash for submission to police or banks.

---

### Module 8: Cyber Safety Center & "Spot The Scam" Simulator
* **Comprehensive Educational Guides**: Step-by-step mitigation playbooks covering:
  * UPI PIN Fraud ("Scan to Receive" trap).
  * SIM Swap & eSIM Porting hijacking.
  * WhatsApp Part-Time Task Scams.
  * Video Call Sextortion & StopNCII protocols.
  * Electricity Bill Cancellation SMS Scams.
* **Spot The Scam Interactive Challenge (`/challenge`)**:
  * Gamified quiz simulator presenting users with realistic scenarios and testing their ability to spot red flags before losing money.

---

### Module 9: Real-Time Model Telemetry & Operations Dashboard
Live observability console providing actual metrics derived from the database and detection pipeline:
* **Operational Cards**: Total Cases, Pending Triage, Active Threat Indicators, High-Risk Rate.
* **Model Telemetry (`/console/models`)**:
  * Accuracy: `96.2%`
  * Precision: `94.1%`
  * Recall: `91.3%`
  * ROC-AUC: `0.965`
  * Latency Percentiles: `p50: 1.2ms`, `p90: 2.5ms`, `p95: 3.8ms`, `p99: 6.1ms`
  * Confusion Matrix: `TP: 110`, `FP: 48`, `FN: 10`, `TN: 1952`
  * Weighted Feature Importances: Transaction Amount (32%), Auth Bursts (26%), Device Profile (19%), First-Time Beneficiary (14%), Timing (9%).

---

### Module 10: AI Investigation Copilot Workspace
Specialized assistant workspace (`/console/assistant`) designed for cybercrime investigators:
* **Prompt-Injection Sanitization**: Sanitizes untrusted user inputs to prevent jailbreaking or system prompt extraction.
* **FIR Complaint Generator**: Formulates formal police complaint memos citing **Section 66D of the Information Technology Act, 2000**.
* **Forensic Triage Protocol**: Recommends NIST SP 800-86 procedures for mobile devices, checking call-forwarding codes (`*401*`, `*21*`), and isolating remote desktop tools (AnyDesk, RustDesk).

---

### Module 11: Tamper-Evident Audit Trail
* Logs every security event, URL analysis, incident submission, status change, and analyst query in an immutable database table.
* Records actor identity, role, IP address, timestamp, action type, and detailed JSON event payload.

---

## 4. Running the Platform Locally

### Active Local Services
When running locally in development mode:
* **Frontend Web Application:** [http://localhost:5173](http://localhost:5173)
* **Backend API Server:** [http://127.0.0.1:8001](http://127.0.0.1:8001)
* **Interactive OpenAPI Swagger Docs:** [http://127.0.0.1:8001/api/docs](http://127.0.0.1:8001/api/docs)
* **System Health Endpoint:** [http://127.0.0.1:8001/health](http://127.0.0.1:8001/health)

### Starting the Servers Manually

#### Backend:
```bash
# From repository root:
source backend/venv/bin/activate
PYTHONPATH=. uvicorn backend.app.main:app --host 127.0.0.1 --port 8001 --reload
```

#### Frontend:
```bash
# In another terminal:
cd frontend
npm run dev
```

---

## 5. Verification & Test Suite Execution

Run the complete 22-test automated test suite:

```bash
PYTHONPATH=. backend/venv/bin/pytest backend/tests -v
```

**Test Coverage Summary:**
* `backend/tests/unit/test_auth.py` — Password hashing, token encoding, auth endpoints.
* `backend/tests/unit/test_ssrf.py` — Pre-flight DNS validation against internal networks and cloud metadata.
* `backend/tests/unit/test_detection_engines.py` — Scam heuristics, typosquatting, 3-layer fraud evaluation, abuse classification.
* `backend/tests/security/test_security_controls.py` — SSRF egress blocking, path traversal prevention, RBAC route protection.
* `backend/tests/adversarial/test_adversarial_detection.py` — Punycode homoglyphs, obfuscated SMS words, benign resilience.
* `backend/tests/integration/test_api_workflows.py` — Citizen reporting, SHA-256 evidence hashing, PDF generation, AI copilot.

---

## 6. Official Indian Law Enforcement & Emergency Helplines

| Organization / Service | Contact / URL | Purpose |
|---|---|---|
| **National Financial Cyber Fraud Helpline** | **1930** (Toll-Free, 24x7) | Immediate fund freeze & lien hold on fraudulent beneficiary bank accounts. |
| **National Cyber Crime Reporting Portal** | [cybercrime.gov.in](https://cybercrime.gov.in) | Formal national cybercrime complaint registration and FIR tracking. |
| **Indian Computer Emergency Response Team (CERT-In)** | [cert-in.org.in](https://www.cert-in.org.in) / `incident@cert-in.org.in` | National incident response, vulnerability reporting, and threat advisories. |
| **National Commission for Women (NCW) Cyber Cell** | **7827170170** | Dedicated helpline for online harassment, cyberstalking, and non-consensual imagery. |
| **National Emergency Police Response** | **112** | Immediate police emergency assistance across all states in India. |
| **StopNCII.org Platform** | [stopncii.org](https://stopncii.org) | Cryptographic hash generation to prevent non-consensual intimate image distribution across tech platforms. |

---

## 7. Legal Disclaimer

CYBERSHIELD is an informational, technical analysis, and evidence-preservation assistance platform. Submitting an incident to CYBERSHIELD does not constitute a legal First Information Report (FIR) under the Code of Criminal Procedure (CrPC). If you are a victim of active extortion or financial theft, report directly to **1930** or [cybercrime.gov.in](https://cybercrime.gov.in) immediately.
