# CYBERSHIELD — Security Policy & Controls

## 1. Vulnerability Reporting

If you identify a security vulnerability within CYBERSHIELD, please report it privately to `security@cybershield.org`. Do not disclose security vulnerabilities publicly until an authorized patch has been deployed.

---

## 2. Core Security Controls

### 2.1 Password Hashing & Authentication
- All passwords are encrypted using **Argon2id** (the winner of the Password Hashing Competition) configured with modern memory and iteration parameters (`m=65536, t=3, p=4`).
- Constant-time verification prevents side-channel timing attacks.
- JSON Web Tokens (JWT) are signed using HMAC-SHA256 with minimum 256-bit entropy keys.

### 2.2 Server-Side Request Forgery (SSRF) Protection Layer
- CYBERSHIELD never blindly initiates HTTP connections to untrusted submitted URLs.
- Pre-flight DNS resolution validates all resolved A and AAAA records against prohibited network spaces:
  - Loopback (`127.0.0.0/8`, `::1`)
  - Private Networks (RFC 1918: `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`)
  - Link-Local & Cloud Metadata (`169.254.0.0/16`, `fe80::/10`)
  - Carrier-Grade NAT (`100.64.0.0/10`)
  - Reserved, Multicast, and Unspecified addresses (`0.0.0.0`, `224.0.0.0/4`)
  - Explicit Cloud Metadata hostnames (`metadata.google.internal`, `169.254.169.254`, `instance-data`).

### 2.3 Evidence Storage & Path Traversal Mitigations
- Original uploaded filenames are stripped using `Path(filename).name` to eliminate directory traversal sequences (`../`).
- Target filenames are mapped to cryptographically randomized UUIDs (`uuid.uuid4().hex + ext`).
- Files are stored outside of the web root in private directories.
- Canonical target paths are validated to ensure they strictly start with the designated base storage root directory.

### 2.4 Secure HTTP Response Headers
Every HTTP response issued by FastAPI carries defense-in-depth security headers:
```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';
```
