# CYBERSHIELD — Detection Engineering & Threat Heuristics

## 1. Detection Methodology Overview

CYBERSHIELD strictly avoids opaque, single-point machine learning classifications. Every detection follows an explainable, multi-tiered architecture that pairs deterministic domain knowledge with machine learning anomaly detection.

---

## 2. Detection Engines

### 2.1 Scam Message Classifier (`backend/app/detection/scam/engine.py`)
- **Deterministic Heuristic Rules:** Analyzes linguistic signatures across:
  - Fake Job & Part-time Work Scams (Telegram review tasks, daily payouts)
  - Banking KYC & OTP Theft Phishing (Urgent suspension threats, unverified KYC links)
  - Electricity & Utility Disconnection Scams (Urgent evening cut-off notices)
  - Investment & Crypto Scams (Guaranteed returns, doubling funds)
  - Advance-Fee & Lottery Scams (Customs clearance, fake prizes)
  - Sextortion & Video Blackmail
- **Behavioral Urgency Scoring:** Detects psychological time pressure ("within 2 hours", "account terminated tonight").
- **Indicator Extraction:** Normalizes and extracts URLs, phone numbers, UPI handles, and currency values.

### 2.2 Safe Phishing URL Analyzer (`backend/app/detection/phishing/engine.py`)
- **Zero-Trust SSRF Pre-flight Validation:** Blocks all attempts to probe internal IPs, localhost, or cloud metadata endpoints.
- **Lexical & Structural Analysis:**
  - Unencrypted HTTP on financial/credential paths (+15.0 risk)
  - Raw IP literal hostname (+45.0 risk)
  - Punycode / IDN homoglyph spoofing (+35.0 risk)
  - High-abuse disposable TLDs (+25.0 risk)
  - Subdomain stacking (+20.0 risk)
  - Brand typosquatting of Indian banks/UPI services (+45.0 risk)
  - Shannon entropy calculation for DGA (Domain Generation Algorithm) detection (+15.0 risk).

### 2.3 Financial Fraud Engine (`backend/app/detection/fraud/engine.py`)
- **Layer A (Rules):** Evaluates high transaction amount spikes (> ₹1,00,000), multiple failed authentication attempts, new device fingerprints, and suspicious recipient VPA handles.
- **Layer B (Machine Learning):**
  - *Isolation Forest:* Unsupervised multi-dimensional anomaly detection on normalized feature vectors.
  - *Random Forest:* Supervised pattern classifier evaluating fraud likelihood.
- **Layer C (Risk Aggregator):**
  $$\text{Composite Score} = 0.40 \cdot \text{Score}_{\text{Rules}} + 0.30 \cdot \text{Score}_{\text{Anomaly}} + 0.30 \cdot \text{Score}_{\text{Pattern}}$$
  - 0–29: LOW Risk
  - 30–59: MEDIUM Risk
  - 60–79: HIGH Risk
  - 80–100: CRITICAL Risk.

### 2.4 Online Abuse & Exploitation Classifier (`backend/app/detection/abuse/engine.py`)
- Context-aware multi-label detection for:
  - Sextortion & Sexual Coercion
  - Threatening Language & Cyberstalking
  - Doxxing & Private Data Leaks
  - Cyberbullying & Harassment
- **Quotation Resilience:** Detects when a victim quotes an abusive phrase received in an incident report, ensuring victims are never misclassified as perpetrators.
