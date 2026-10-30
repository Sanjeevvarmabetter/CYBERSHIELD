# CYBERSHIELD — Dataset & Synthetic Generation Documentation

## 1. Data Integrity Principle
CYBERSHIELD strictly differentiates synthetic demonstration data, actual citizen-submitted reports, and externally verified threat feeds.
**Live victim reports or personal identifiable information are NEVER fabricated.**

---

## 2. Synthetic Data Generators

To train Layer B machine learning models (Isolation Forest & Random Forest) in a reproducible manner without exposing private banking telemetry:

### 2.1 Synthetic Financial Transaction Events
- **Normal Baseline (2,000 samples):**
  - Amount: Exponential distribution ($\mu = ₹1,800$, $\sigma = ₹2,500$, bounded between ₹10 and ₹50,000).
  - Failed Logins: Poisson/Categorical ($0: 90\%, 1: 8\%, 2: 2\%$).
  - New Device: Bernoulli ($p = 0.08$).
  - New Recipient: Bernoulli ($p = 0.25$).
  - Transaction Hour: Uniform retail hours (6 AM to 11 PM).
- **Fraudulent Patterns (120 samples):**
  - Amount: Uniform spike transfers ($₹40,000$ to $₹2,00,000$).
  - Failed Logins: High burst ($2$ to $5$ consecutive failures).
  - New Device: Bernoulli ($p = 0.85$).
  - New Recipient: Bernoulli ($p = 0.90$).
  - Transaction Hour: Off-hours clustering (12 AM to 5 AM).

---

## 3. Public Reference Datasets & Attribution
When configured with external feed adapters:
- **URLhaus:** Abuse.ch open threat feed for malicious and malware distribution URLs.
- **PhishTank:** Collaborative clearing house for verified phishing URLs.
- **CERT-In Bulletins:** Indian Computer Emergency Response Team advisories and malicious IP/domain lists.
