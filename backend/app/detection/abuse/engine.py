import re
from typing import Dict, Any, List, Set

class AbuseDetectionEngine:
    """
    Context-aware Online Abuse & Exploitation Classifier.
    Multi-label detection supporting:
    - SEXTORTION_COERCION (intimidation, intimate video threats, extortion)
    - THREATENING_COMMUNICATION (death/violence threats, stalking)
    - DOXXING_PRIVACY_VIOLATION (leaking private home address, phone numbers)
    - CYBERBULLYING_HARASSMENT (targeted degradation, hate speech)
    """

    CATEGORIES = {
        "SEXTORTION_COERCION": {
            "name": "Sextortion & Sexual Coercion",
            "regex": [
                r"\b(recorded (you|your)|saved your video|video call (recording|clip|video)|explicit clip|nude|morphed)\b",
                r"\b(pay|send money|transfer)\b.*\b(or i will (send|leak|post|upload))\b",
                r"\b(leak|send|upload|post|share)\b.*\b(video|clip|recording|photos?|pics?)\b.*\b(unless you pay|pay|send money)\b",
                r"\b(ruin your life|send to your parents|family|friends|contacts)\b",
                r"\b(blackmail|destroy your reputation)\b"
            ],
            "severity": "CRITICAL",
            "actions": [
                "DO NOT send money or comply with extortion demands. Blackmailers routinely demand more after initial payment.",
                "Take screenshots that include the blackmailer's handle, phone number, and timestamp as evidence.",
                "File an emergency complaint at https://cybercrime.gov.in under 'Report Women/Child Related Crime'.",
                "Use StopNCII.org (supported by major tech platforms) to prevent non-consensual images from circulating."
            ]
        },
        "THREATENING_COMMUNICATION": {
            "name": "Threatening Communication & Cyberstalking",
            "regex": [
                r"\b(i will kill you|kill yourself|gonna hurt you|beat you|break your legs)\b",
                r"\b(i know where you live|i am watching you|following you|outside your house)\b",
                r"\b(you won't be safe|watch your back|end you)\b"
            ],
            "severity": "CRITICAL",
            "actions": [
                "If you feel in immediate physical danger, dial 112 (Emergency Police) immediately.",
                "Preserve all incoming messages, timestamps, and voicemail without deleting.",
                "Do not engage with or provoke the stalker further."
            ]
        },
        "DOXXING_PRIVACY_LEAK": {
            "name": "Doxxing & Private Data Leak",
            "regex": [
                r"\b(here is (their|her|his) address|home address|ip address|aadhar|pan card)\b.*\b\d+",
                r"\b(leaking (their|her|his) number|call (him|her) up|raid (their|her|his) house)\b"
            ],
            "severity": "HIGH",
            "actions": [
                "Report the offending post directly to the social platform's trust and safety team for immediate take-down.",
                "Secure personal social media profiles and enable two-factor authentication (2FA).",
                "Document the URL where the private information was publicly shared."
            ]
        },
        "CYBERBULLYING_HARASSMENT": {
            "name": "Cyberbullying & Severe Harassment",
            "regex": [
                r"\b(worthless|nobody loves you|go die|ugly piece of|slup|trash)\b",
                r"\b(spamming you|won't leave you alone|mass report)\b"
            ],
            "severity": "HIGH",
            "actions": [
                "Block the harassing accounts across all communication platforms.",
                "Set social media privacy settings to restrict comments from non-followers.",
                "Speak with a trusted counselor, guardian, or cyber safety support service."
            ]
        }
    }

    # Contextual quotation markers: Checks if text is victim reporting what was said to them
    QUOTATION_MARKERS = [
        r"^(he said|she said|they texted me|the scammer wrote|i received this message|someone sent me|they are threatening me with):\s*[\"']",
        r"[\"'].*[\"']\s*(was sent to me|was received)"
    ]

    def analyze(self, text: str, context_type: str = "DIRECT_MESSAGE") -> Dict[str, Any]:
        text_lower = text.lower().strip()

        # Check for victim-quoted context
        is_quoted_report = any(re.search(pat, text_lower) for pat in self.QUOTATION_MARKERS)

        matched_labels: List[str] = []
        indicators: List[Dict[str, str]] = []
        max_severity = "LOW"
        severity_score = 0.0

        for cat_key, cat_data in self.CATEGORIES.items():
            hits = 0
            for pattern in cat_data["regex"]:
                if re.search(pattern, text_lower, re.IGNORECASE):
                    hits += 1

            if hits > 0:
                matched_labels.append(cat_key)
                sev = cat_data["severity"]
                if sev == "CRITICAL":
                    max_severity = "CRITICAL"
                    severity_score = max(severity_score, 92.0)
                elif sev == "HIGH" and max_severity != "CRITICAL":
                    max_severity = "HIGH"
                    severity_score = max(severity_score, 75.0)

                indicators.append({
                    "type": "ABUSE_LABEL",
                    "name": cat_data["name"],
                    "description": f"Detected {hits} indicators matching {cat_data['name'].lower()}.",
                    "severity": sev
                })

        if not matched_labels:
            return {
                "analysis_type": "ONLINE_ABUSE",
                "predicted_category": "BENIGN_COMMUNICATION",
                "multi_labels": [],
                "risk_score": 10.0,
                "risk_level": "LOW",
                "confidence": 0.70,
                "detection_indicators": [],
                "is_victim_quotation": is_quoted_report,
                "explanation": "No markers of harassment, threatening language, sextortion, or doxxing were recognized.",
                "recommended_actions": [
                    "Maintain standard digital safety habits.",
                    "If you encounter uncomfortable interactions, exercise your platform's block and report options."
                ],
                "limitations": "Automated text classifier. Contextual nuance and intent may vary."
            }

        # Gather actions from highest-severity matched category
        primary_cat = matched_labels[0]
        recommended_actions = self.CATEGORIES[primary_cat]["actions"]

        explanation_prefix = "Victim quotation detected. " if is_quoted_report else ""
        explanation = (
            f"{explanation_prefix}Communication matches {len(matched_labels)} abuse classification categories: "
            f"{', '.join([self.CATEGORIES[c]['name'] for c in matched_labels])}. "
            f"Highest evaluated severity: {max_severity}."
        )

        return {
            "analysis_type": "ONLINE_ABUSE",
            "predicted_category": primary_cat,
            "multi_labels": matched_labels,
            "risk_score": round(severity_score, 1),
            "risk_level": max_severity,
            "confidence": 0.88,
            "detection_indicators": indicators,
            "is_victim_quotation": is_quoted_report,
            "explanation": explanation,
            "recommended_actions": recommended_actions,
            "limitations": "Contextual classification for citizen protection. Automated results do not serve as proof of criminal guilt."
        }
