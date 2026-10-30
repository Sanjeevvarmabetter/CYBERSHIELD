import math
import re
from urllib.parse import urlparse, parse_qs
from typing import Dict, Any, List, Optional
from backend.app.core.ssrf import validate_target_url

# Targeted institutions commonly spoofed in Indian cybercrime
TARGETED_ENTITIES = {
    "sbi": ["sbi", "onlinesbi", "statebankofindia", "sbicard"],
    "hdfc": ["hdfcbank", "hdfc"],
    "icici": ["icicibank", "icici"],
    "axis": ["axisbank"],
    "pnb": ["pnbindia", "pnb"],
    "paytm": ["paytm"],
    "phonepe": ["phonepe"],
    "googlepay": ["pay.google"],
    "incometax": ["incometax.gov.in", "incometax"],
    "electricity": ["bescom", "mseb", "bses", "tneb", "bijli"],
    "aadhaar": ["uidai.gov.in", "aadhaar", "uidai"]
}

# Suspicious keywords in domain or path
PHISHING_KEYWORDS = [
    "kyc", "update", "verify", "verification", "login", "signin", "authenticate",
    "banking", "secure", "support", "helpdesk", "refund", "claim", "reward",
    "portal", "bill", "electricity", "disconnection", "apk", "download"
]

SUSPICIOUS_TLDS = {
    ".xyz", ".top", ".club", ".work", ".site", ".online", ".icu", ".buzz",
    ".fit", ".rest", ".monster", ".gq", ".cf", ".tk", ".ml", ".ga"
}

KNOWN_SHORTENERS = {
    "bit.ly", "tinyurl.com", "goo.gl", "t.co", "is.gd", "buff.ly", "ow.ly", "cutt.ly"
}

def calculate_shannon_entropy(text: str) -> float:
    """Calculate Shannon entropy to identify randomly generated domains (DGA)."""
    if not text:
        return 0.0
    entropy = 0.0
    length = len(text)
    counts = {}
    for char in text:
        counts[char] = counts.get(char, 0) + 1
    for count in counts.values():
        p = count / length
        entropy -= p * math.log2(p)
    return entropy

class PhishingURLEngine:
    """
    Production-grade URL lexical and structural analyzer with zero-trust SSRF protection.
    Evaluates typosquatting, entropy, punycode/IDN spoofing, and brand impersonation.
    """

    def analyze(self, raw_url: str) -> Dict[str, Any]:
        raw_url_clean = raw_url.strip()
        if not (raw_url_clean.startswith("http://") or raw_url_clean.startswith("https://")):
            raw_url_clean = "http://" + raw_url_clean

        # 1. Zero-trust SSRF pre-flight validation
        is_safe, ssrf_msg, resolved_ip = validate_target_url(raw_url_clean)
        if not is_safe:
            return {
                "analysis_type": "PHISHING_URL",
                "predicted_category": "SSRF_PROHIBITED_TARGET",
                "risk_score": 99.0,
                "risk_level": "CRITICAL",
                "confidence": 0.99,
                "detection_indicators": [{
                    "type": "SSRF_ATTEMPT",
                    "name": "Prohibited Network Destination",
                    "description": ssrf_msg,
                    "severity": "CRITICAL"
                }],
                "explanation": f"Security policy blocked analysis: {ssrf_msg}. Egress to private, loopback, link-local or cloud metadata ranges is strictly forbidden.",
                "recommended_actions": [
                    "Do not browse to internal network endpoints or cloud metadata services.",
                    "Verify the URL destination before submitting."
                ],
                "limitations": "SSRF guard actively blocks internal network probing."
            }

        try:
            parsed = urlparse(raw_url_clean)
        except Exception:
            return {
                "analysis_type": "PHISHING_URL",
                "predicted_category": "MALFORMED_URL",
                "risk_score": 75.0,
                "risk_level": "HIGH",
                "confidence": 0.85,
                "detection_indicators": [{
                    "type": "MALFORMED_SYNTAX",
                    "name": "Malformed URL Structure",
                    "description": "Unable to parse URL components standardly.",
                    "severity": "HIGH"
                }],
                "explanation": "The submitted URL possesses malformed syntax commonly used to confound security filters.",
                "recommended_actions": ["Do not open malformed or non-standard URLs."],
                "limitations": "Syntax parsing failure."
            }

        hostname = (parsed.hostname or "").lower()
        path = (parsed.path or "").lower()
        query = (parsed.query or "").lower()
        scheme = parsed.scheme.lower()

        indicators: List[Dict[str, str]] = []
        score = 0.0

        # Feature 1: Protocol Security (HTTP vs HTTPS)
        if scheme == "http":
            score += 15.0
            indicators.append({
                "type": "INSECURE_PROTOCOL",
                "name": "Unencrypted HTTP Scheme",
                "description": "Site uses plaintext HTTP. Legitimate financial and government portals strictly mandate HTTPS.",
                "severity": "MEDIUM"
            })

        # Feature 2: IP Address in Hostname
        ip_pattern = re.compile(r"^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$")
        if ip_pattern.match(hostname):
            score += 45.0
            indicators.append({
                "type": "IP_HOST_LITERAL",
                "name": "Raw IP Address Hostname",
                "description": "URL links directly to a numeric IP address, a common tactic for evading domain take-downs.",
                "severity": "HIGH"
            })

        # Feature 3: Punycode / Internationalized Domain Name (IDN)
        if "xn--" in hostname:
            score += 35.0
            indicators.append({
                "type": "HOMOGLYPH_PUNYCODE",
                "name": "Internationalized Domain / Homoglyph Spoofing",
                "description": "Punycode (xn--) detected. Attackers frequently use visual lookalike characters (Cyrillic/Greek) to impersonate familiar brand names.",
                "severity": "CRITICAL"
            })

        # Feature 4: URL Shortener
        if hostname in KNOWN_SHORTENERS:
            score += 20.0
            indicators.append({
                "type": "URL_SHORTENER",
                "name": "URL Shortener Cloaking",
                "description": f"URL uses shortener service '{hostname}' to obscure true destination domain.",
                "severity": "MEDIUM"
            })

        # Feature 5: Suspicious Top-Level Domain (TLD)
        for tld in SUSPICIOUS_TLDS:
            if hostname.endswith(tld):
                score += 25.0
                indicators.append({
                    "type": "SUSPICIOUS_TLD",
                    "name": f"High-Abuse TLD ({tld})",
                    "description": f"Domain utilizes '{tld}', an extension disproportionately associated with disposable scam websites.",
                    "severity": "MEDIUM"
                })
                break

        # Feature 6: Subdomain Stacking / Excessive Dots
        dot_count = hostname.count(".")
        if dot_count > 3:
            score += 20.0
            indicators.append({
                "type": "SUBDOMAIN_STACKING",
                "name": "Excessive Subdomains",
                "description": f"Hostname contains {dot_count} dots, often used to create misleading prefixes like 'sbi.bank.login.portal.xyz'.",
                "severity": "HIGH"
            })

        # Feature 7: Brand Impersonation & Typosquatting
        spoofed_entity = None
        for brand, legit_tokens in TARGETED_ENTITIES.items():
            for token in legit_tokens:
                # Check if brand token appears in hostname but is NOT the legitimate official domain
                if token in hostname:
                    is_official = False
                    if token in ("sbi", "onlinesbi") and (hostname == "sbi.co.in" or hostname.endswith(".sbi.co.in") or hostname.endswith(".sbi")):
                        is_official = True
                    elif token == "hdfcbank" and hostname.endswith(".hdfcbank.com"):
                        is_official = True
                    elif token == "icicibank" and hostname.endswith(".icicibank.com"):
                        is_official = True
                    elif token == "incometax.gov.in" and hostname.endswith(".incometax.gov.in"):
                        is_official = True
                    elif token == "uidai.gov.in" and hostname.endswith(".uidai.gov.in"):
                        is_official = True

                    if not is_official:
                        spoofed_entity = brand.upper()
                        score += 45.0
                        indicators.append({
                            "type": "BRAND_TYPOSQUAT",
                            "name": f"Brand Spoofing ({spoofed_entity})",
                            "description": f"The domain mimics '{token}' without matching the official verified domain infrastructure.",
                            "severity": "CRITICAL"
                        })
                        break

        # Feature 8: Phishing Keyword Clustering in Path or Host
        keyword_hits = [kw for kw in PHISHING_KEYWORDS if kw in hostname or kw in path or kw in query]
        if len(keyword_hits) >= 2:
            score += 20.0
            indicators.append({
                "type": "PHISHING_VOCABULARY",
                "name": "Phishing Keyword Stacking",
                "description": f"URL path/domain stacks deceptive keywords: {', '.join(keyword_hits[:3])}",
                "severity": "HIGH"
            })

        # Feature 9: Shannon Entropy Analysis
        domain_without_tld = hostname.split(".")[0]
        entropy = calculate_shannon_entropy(domain_without_tld)
        if entropy > 3.9 and len(domain_without_tld) > 8:
            score += 15.0
            indicators.append({
                "type": "HIGH_ENTROPY_DGA",
                "name": "High Character Entropy (Potential DGA)",
                "description": f"High algorithmic randomness ({entropy:.2f} bits/char) detected, indicating possible automated disposable domain generation.",
                "severity": "MEDIUM"
            })

        # Feature 10: Suspicious APK File Download
        if path.endswith(".apk"):
            score += 40.0
            indicators.append({
                "type": "MALICIOUS_DOWNLOAD",
                "name": "Direct Android APK Download",
                "description": "URL initiates direct download of an Android application package (.apk). Banking trojans widely spread via fake utility/KYC APKs.",
                "severity": "CRITICAL"
            })

        # Final Score Aggregation
        final_score = min(max(score, 5.0), 99.0)
        confidence = min(0.60 + (0.07 * len(indicators)), 0.98)

        if final_score >= 70:
            predicted_cat = f"CONFIRMED_PHISHING_{spoofed_entity}" if spoofed_entity else "HIGH_RISK_PHISHING"
            risk_level = "CRITICAL" if final_score >= 85 else "HIGH"
            explanation = (
                f"The URL presents severe indicators of malicious deception ({len(indicators)} detected factors). "
                f"{f'It actively impersonates legitimate brand {spoofed_entity}. ' if spoofed_entity else ''}"
                "Direct navigation is strongly discouraged."
            )
            actions = [
                "DO NOT open this link on your computer or mobile device.",
                "DO NOT enter any usernames, passwords, card numbers, or OTPs on this portal.",
                "If you already entered banking credentials, contact your bank immediately to freeze online accounts."
            ]
        elif final_score >= 35:
            predicted_cat = "SUSPICIOUS_DOMAIN"
            risk_level = "MEDIUM"
            explanation = (
                "The URL possesses multiple suspicious attributes (such as unencrypted protocol or atypical domain characteristics). "
                "Exercise high caution before providing credentials or personal details."
            )
            actions = [
                "Verify whether this is the official corporate domain before proceeding.",
                "Never download apps or files from untrusted links."
            ]
        else:
            predicted_cat = "LOW_RISK_URL"
            risk_level = "LOW"
            explanation = "Lexical and structural evaluation detected no overt brand spoofing, DGA randomness, or phishing markers."
            actions = [
                "Continue standard web browsing hygiene.",
                "Confirm that the browser address bar displays a valid HTTPS padlock on financial portals."
            ]

        return {
            "analysis_type": "PHISHING_URL",
            "predicted_category": predicted_cat,
            "risk_score": round(final_score, 1),
            "risk_level": risk_level,
            "confidence": round(confidence, 2),
            "detection_indicators": indicators,
            "resolved_ip": resolved_ip,
            "entropy": round(entropy, 2),
            "explanation": explanation,
            "recommended_actions": actions,
            "limitations": "Static lexical and SSRF-safe resolution inspection. Does not execute malicious JavaScript or download hostile payloads."
        }
