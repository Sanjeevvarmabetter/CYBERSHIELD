# CYBERSHIELD — Architecture & Engineering Specification

## 1. Architectural Philosophy

CYBERSHIELD is designed around five non-negotiable architectural tenets:

1. **Dual-Experience Isolation:** Public citizen safety workflows are completely decoupled from restricted intelligence consoles. Citizen personal identifiable information (PII) is never mirrored into public threat intelligence feeds or publicly queryable graph topologies.
2. **Zero-Trust External Egress:** Unverified external URLs submitted by users are never fetched without rigorous, pre-flight DNS and socket-level SSRF validation blocking private, loopback, link-local, carrier-grade NAT, and cloud metadata addresses (169.254.169.254).
3. **Forensic Evidence Integrity:** Every evidentiary file uploaded by victims is cryptographically fingerprinted using SHA-256 upon arrival and stored with random UUID filenames outside the web root to eliminate path traversal attacks.
4. **Explainable Multi-Layer Detection:** Financial and scam detection does not rely on opaque LLM predictions. Instead, deterministic heuristic rules, unsupervised statistical anomaly isolation (Isolation Forest), and supervised pattern classification (Random Forest) converge into an auditable composite score with machine-readable indicators.
5. **Graph Pattern Correlation:** NetworkX builds a multi-relational graph correlating disconnected incidents through shared infrastructure (UPI handles, domains, phone numbers), running degree centrality and community detection to illuminate organized syndicates.

---

## 2. Component Architecture

### 2.1 Backend Services
- **FastAPI API Gateway (`backend/app/main.py`):** Configures security middlewares (HSTS, CSP, X-Frame-Options, strict CORS) and mounts versioned routers (`/api/v1/*`).
- **Core Security & Auth (`backend/app/core/`):**
  - Argon2id password hashing via `argon2-cffi`.
  - JWT claim validation with role-based access control (`CITIZEN`, `ANALYST`, `ADMIN`).
  - Zero-trust SSRF protection layer (`ssrf.py`).
  - Immutable audit logging (`audit.py`).
- **Detection Subsystems (`backend/app/detection/`):**
  - `scam/engine.py`: Linguistic pattern rules, behavioral urgency scoring, indicator extraction.
  - `phishing/engine.py`: Lexical parsing, Shannon entropy (DGA detection), punycode/IDN inspection, Indian bank/UPI typosquatting.
  - `fraud/engine.py`: 3-layer architecture (Layer A Rules, Layer B ML Anomaly & Supervised Classifier, Layer C Risk Aggregator).
  - `abuse/engine.py`: Context-aware multi-label classifier (harassment, sextortion, doxxing, stalking).
- **Intelligence & Correlation (`backend/app/intelligence/`):**
  - Normalization, defanging, deduplication, and exponential half-life confidence decay.
- **Graph Engine (`backend/app/graph_engine/`):**
  - NetworkX graph builder, degree centrality calculation, greedy modularity community clustering.
- **Evidence Vault (`backend/app/evidence/`):**
  - SHA-256 stream hashing, path traversal sanitization, ReportLab PDF assistance report generation.

### 2.2 Frontend Client Architecture
- Built with **React 18 + TypeScript + Vite + Tailwind CSS**.
- Pure, clean security UI: Dark navy background (`#070C18`), cyan accents (`#00B4D8`), restrained risk indicators.
- Client state managed via typed React Context (`AuthContext`) and Axios interceptors with automatic JWT bearer token injection.
- Interactive SVG NetworkX topology visualizer with real-time entity inspection and zoom controls.

---

## 3. Database Schema

- **Users:** UUID PK, Argon2id hash, role, timestamps.
- **Incidents:** Reference code (`CS-2026-XXXXX`), category, narrative, status, priority, anonymous flag, consent flag, metadata JSON.
- **Evidence:** Incident FK, original filename, file size, mime type, SHA-256 hash, storage path.
- **Threat Indicators:** Indicator type, normalized value, defanged value, verification status, confidence score, provenance, tags, report count.
- **Analysis Records:** Analysis type, input preview, risk score, risk level, confidence, indicators JSON, recommendations JSON.
- **Investigation Cases:** Incident FK, assigned analyst FK, status, internal notes, audit timeline events.
- **Audit Logs:** Action, target entity, target ID, user ID, IP address, timestamp, details JSON.
