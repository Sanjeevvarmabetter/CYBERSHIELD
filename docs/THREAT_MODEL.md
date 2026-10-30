# CYBERSHIELD — Security Threat Model (STRIDE)

This document delineates the threat model, attacker profiles, trust boundaries, and defensive mitigations implemented across CYBERSHIELD.

---

## 1. Threat Actors & Attacker Profiles

1. **Opportunistic Cybercriminals & Scammers:** Attempt to submit crafted URLs and payload texts to probe detection signatures, evade classifier thresholds, or identify automated blocking rules.
2. **Infrastructure Reconnaissance Attackers:** Attempt to abuse the safe URL analyzer to perform Server-Side Request Forgery (SSRF), scanning internal LAN networks or harvesting cloud instance metadata (`169.254.169.254`).
3. **Malicious Citizen Users:** Attempt to upload malicious file payloads (web shells, polyglot PDFs, executable binaries) or exploit path traversal to overwrite backend files.
4. **Adversarial Feed Poisoners:** Attempt to flood incident reporting with fraudulent or misleading allegations to poison threat intelligence correlation and frame benign entities.
5. **Unauthorized Internal Actors:** Attempt to bypass role hierarchies to access private victim evidence or unauthorized incident cases without an audit trail.

---

## 2. STRIDE Threat Assessment & Mitigations

### 2.1 Spoofing (Identity & Origin)
- **Threat:** Attacker spoofs citizen identity or registers multiple duplicate accounts to spam analysis engines.
- **Mitigation:** Argon2id password hashing with modern work factors, constant-time token comparison, rate limiting per IP and per endpoint, and anonymous reporting support that never trusts client-supplied identity claims.

### 2.2 Tampering (Data & Evidence Integrity)
- **Threat:** Evidentiary screenshot or chat log modified post-submission to fabricate legal evidence.
- **Mitigation:** Immediate SHA-256 cryptographic digest calculation upon file stream ingestion; hash permanently recorded in immutable database record; original file stored in isolated, read-only storage directory; PDF Assistance Reports embed verified hashes.

### 2.3 Repudiation (Auditability)
- **Threat:** Malicious analyst views or alters incident triage state and denies having accessed the record.
- **Mitigation:** Dedicated `AuditLog` service automatically records every state change, report download, evidence access, and login attempt with timestamp, IP address, and actor ID.

### 2.4 Information Disclosure (Privacy & PII Leakage)
- **Threat:** Citizen personal names, phone numbers, or private extortion materials leaked into public threat intelligence feeds or public graph views.
- **Mitigation:** Strict separation of citizen reports from public indicator feeds; PII is stripped prior to correlation; threat intelligence values are defanged (`[.]`, `hxxp`, `[at]`); public graph endpoints omit victim metadata.

### 2.5 Denial of Service (DoS & Resource Exhaustion)
- **Threat:** Attacker submits massive files, nested zip bombs, or URLs pointing to endless infinite streams.
- **Mitigation:** Strict 15MB file size ceiling enforced during streaming; URL inspection capped at 512KB response chunk; socket timeouts restricted to 3.0 seconds; pre-flight DNS resolution prevents hang states.

### 2.6 Elevation of Privilege (SSRF & Authorization Bypass)
- **Threat:** Attacker submits `http://169.254.169.254/latest/meta-data/` to retrieve AWS IAM credentials or submits internal IP `http://192.168.1.1` to map internal infrastructure.
- **Mitigation:** Dedicated `validate_target_url` pre-flight resolver actively checks resolved IPs against `ipaddress.is_private`, `is_loopback`, `is_link_local`, carrier NAT (100.64.0.0/10), and explicit metadata hostnames. Unsafe requests fail immediately with `SSRF_ATTEMPT` logging.
