# CYBERSHIELD — Privacy Engineering & Data Principles

## 1. Privacy-First Architecture

CYBERSHIELD was engineered to assist victims of cybercrime without subjecting them to secondary surveillance, unauthorized commercial profiling, or public doxxing.

---

## 2. Fundamental Privacy Rules

### 2.1 Complete Separation of Victim Reports from Threat Intelligence
- An incident report submitted by a citizen is strictly private.
- Victim personal details (names, personal email addresses, private communications) are **never** shared with third parties, external threat feeds, or public query endpoints.
- Threat intelligence indicators are only derived when the citizen explicitly grants consent (`consent_share_intel: true`).
- Derived indicators are strictly limited to technical infrastructure (e.g., suspicious domain names, scam UPI handles, predatory phone numbers) and are completely detached from victim identity.

### 2.2 Anonymous Reporting Option
- Citizens are never forced to create an account or provide personal phone numbers to report a scam.
- Every citizen can submit an incident anonymously and track status using a randomized tracking code (`CS-2026-XXXXX`).

### 2.3 Sextortion & Sensitive Exploitation Safeguards
- Under no circumstances does CYBERSHIELD display, store, or re-transmit explicit intimate imagery.
- Victims of image-based sexual abuse are directed to official resources such as **StopNCII.org**, which generates local cryptographic perceptual hashes without the intimate photo ever leaving the victim's device.

### 2.4 Data Retention & Deletion
- Victims maintain the right to request deletion of their submitted reports and evidence files.
- Stored evidence is deleted from object storage using secure unlinking routines upon case closure or verified victim request.
