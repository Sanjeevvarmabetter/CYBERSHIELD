import re
from typing import Dict, Any, List, Tuple

class ScamMessageEngine:
    """
    Multi-faceted scam message and fraudulent solicitation detection engine.
    Combines deterministic regex pattern detection, behavioral linguistic markers,
    urgency scoring, and extracted threat indicators.
    """

    CATEGORIES = {
        "FAKE_JOB_TASK": {
            "name": "Fake Job & Work-From-Home Task Scam",
            "regex": [
                r"\b(part[- ]?time|work[- ]?from[- ]?home|daily[- ]?earning|daily[- ]?income)\b.*\b(₹|\binr\b|rs\.?|\bpay\b|\bearn\b)",
                r"\b(like|subscribe|review|rating)\b.*\b(youtube|google map|hotel|video|tasks?)\b",
                r"(telegram|t\.me).*?(task|recharge|salary|bonus|vip|admin|review)",
                r"\b(prepaid task|crypto task|deposit to unlock|withdrawal fee)\b"
            ],
            "weight": 35.0,
            "actions": [
                "Do not deposit or 'recharge' any money to receive earnings or unlock withdrawal balances.",
                "Legitimate corporate hiring never happens exclusively over anonymous Telegram groups.",
                "Cease communication and block the sender across WhatsApp and Telegram."
            ]
        },
        "BANKING_KYC_OTP": {
            "name": "Banking KYC & OTP Theft Phishing",
            "regex": [
                r"\b(sbi|hdfc|icici|axis|pnb|bob|bank)\b.*\b(kyc|pan|aadhaar|debit card|blocked|suspended|terminate)\b",
                r"\b(update|verify|validate)\b.*\b(kyc|netbanking|card)\b.*\b(click|link|http|apk)\b",
                r"\b(share|send|enter)\b.*\b(otp|one time password|upi pin|cvv|expiry)\b",
                r"\b(your account|netbanking)\b.*\b(will be closed|deactivated within \d+ hours?)\b"
            ],
            "weight": 40.0,
            "actions": [
                "NEVER share your OTP, UPI PIN, or debit card CVV with anyone.",
                "Banks in India never send SMS from 10-digit mobile numbers demanding KYC link clicks.",
                "Log in strictly through your official bank mobile app to verify account standing."
            ]
        },
        "UTILITY_BILL_SCAM": {
            "name": "Electricity & Utility Disconnection Scam",
            "regex": [
                r"\b(electricity|power|bijli|bses|bescom|tneb|mseb|bill)\b.*\b(disconnected|cut off|terminated)\b.*\b(tonight|today|immediately)\b",
                r"\b(contact|call|urgent)\b.*\b(officer|helpline|electricity department)\b.*\b(\d{10})\b",
                r"\b(unpaid bill|previous month bill)\b.*\b(not updated|not received)\b"
            ],
            "weight": 35.0,
            "actions": [
                "Do not dial the phone number provided in unsolicited disconnection SMS alerts.",
                "Check bill payment status exclusively on your official electricity board portal or Bharat BillPay (BBPS).",
                "Official utility boards send notices through government-registered alphanumeric headers, not 10-digit personal numbers."
            ]
        },
        "INVESTMENT_CRYPTO_FRAUD": {
            "name": "High-Yield Investment & Crypto Scam",
            "regex": [
                r"\b(guaranteed|risk[- ]?free|100% profit|double your money)\b.*\b(investment|trading|forex|crypto|bitcoin)\b",
                r"\b(invest ₹?\d+.*get ₹?\d+)\b",
                r"\b(mining pool|automated trading bot|wealth manager)\b.*\b(daily return|weekly return)\b"
            ],
            "weight": 30.0,
            "actions": [
                "Any financial offering promising 'guaranteed' zero-risk returns is fraudulent.",
                "Verify whether the investment entity is registered with SEBI (Securities and Exchange Board of India).",
                "Do not transfer funds into personal bank accounts for 'institutional trading'."
            ]
        },
        "ADVANCE_FEE_LOTTERY": {
            "name": "Advance-Fee & Lottery / Prize Scam",
            "regex": [
                r"\b(congratulations|lucky winner|selected)\b.*\b(won|prize|lottery|cheque|car|kbc)\b.*\b(₹|crore|lakh)",
                r"\b(pay|transfer|deposit)\b.*\b(customs duty|processing fee|tax|clearance fee)\b.*\b(to claim|to release)\b"
            ],
            "weight": 30.0,
            "actions": [
                "You cannot win a lottery or prize contest you did not intentionally enter.",
                "Never send money to 'claim' a prize or release a package held at customs.",
                "Report the message and block the sender."
            ]
        },
        "SEXTORTION_COERCION": {
            "name": "Sextortion & Intimidation Extortion",
            "regex": [
                r"\b(recorded your video|video call recording|explicit clip|nude|morphed)\b",
                r"\b(send money|pay up|transfer)\b.*\b(or else|to your friends|family|facebook|youtube)\b",
                r"\b(ruin your life|defame you|cyber cell officer)\b"
            ],
            "weight": 45.0,
            "actions": [
                "DO NOT send money. Paying blackmailers never stops the extortion; it invites repeated demands.",
                "Do not delete chat logs: preserve screenshots as evidence.",
                "Report immediately to https://cybercrime.gov.in (Report Women/Child Related Crime) or call 1930.",
                "Use StopNCII.org to prevent non-consensual images from being posted online."
            ]
        }
    }

    # Behavioral urgency markers
    URGENCY_PATTERNS = [
        r"\b(urgent|immediately|within \d+ (hours?|minutes?)|today itself|final notice|last warning|account terminated)\b",
        r"\b(act fast|limited time|don't ignore|emergency)\b"
    ]

    # Extraction patterns
    URL_PATTERN = re.compile(r"(?:https?://|www\.|t\.me/|wa\.me/)(?:[-\w.]|(?:%[\da-fA-F]{2}))+[^\s]*", re.IGNORECASE)
    PHONE_PATTERN = re.compile(r"(?:\+?91[\-\s]?)?[6789]\d{9}\b")
    UPI_PATTERN = re.compile(r"\b[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}\b")
    AMOUNT_PATTERN = re.compile(r"(?:₹|rs\.?|inr)\s?(\d+(?:,\d+)*(?:\.\d{2})?)", re.IGNORECASE)

    def extract_indicators(self, text: str) -> Dict[str, List[str]]:
        urls = self.URL_PATTERN.findall(text)
        phones = self.PHONE_PATTERN.findall(text)
        upis = self.UPI_PATTERN.findall(text)
        amounts = self.AMOUNT_PATTERN.findall(text)
        return {
            "urls": list(set(urls)),
            "phone_numbers": list(set(phones)),
            "upi_handles": list(set(upis)),
            "amounts_mentioned": list(set(amounts))
        }

    def analyze(self, text: str, channel: str = "SMS") -> Dict[str, Any]:
        """
        Analyze text for malicious scam patterns and produce explainable verdict.
        """
        text_lower = text.lower()
        extracted = self.extract_indicators(text)
        
        detection_indicators: List[Dict[str, str]] = []
        category_scores: Dict[str, float] = {}
        
        # 1. Category-specific pattern detection
        for cat_key, cat_data in self.CATEGORIES.items():
            matched_rules = 0
            for regex_str in cat_data["regex"]:
                if re.search(regex_str, text_lower, re.IGNORECASE | re.DOTALL):
                    matched_rules += 1
            if matched_rules > 0:
                score = min(cat_data["weight"] * matched_rules, 85.0)
                category_scores[cat_key] = score
                detection_indicators.append({
                    "type": "PATTERN_MATCH",
                    "name": cat_data["name"],
                    "description": f"Triggered {matched_rules} recognized linguistic signatures of this scam vector.",
                    "severity": "HIGH" if score >= 40 else "MEDIUM"
                })

        # 2. Urgency manipulation detection
        urgency_hits = 0
        for urg in self.URGENCY_PATTERNS:
            if re.search(urg, text_lower, re.IGNORECASE):
                urgency_hits += 1
        if urgency_hits > 0:
            detection_indicators.append({
                "type": "BEHAVIORAL_MANIPULATION",
                "name": "Artificial Urgency Trigger",
                "description": "Message applies artificial time pressure to bypass critical reasoning.",
                "severity": "HIGH"
            })

        # 3. Indicator presence checks
        if extracted["urls"]:
            detection_indicators.append({
                "type": "SUSPICIOUS_LINK",
                "name": "Embedded Web Link",
                "description": f"Contains link(s): {', '.join(extracted['urls'][:2])}",
                "severity": "MEDIUM"
            })
        if extracted["phone_numbers"]:
            detection_indicators.append({
                "type": "CALLBACK_NUMBER",
                "name": "Unsolicited Callback Contact",
                "description": f"Directs target to dial phone number: {', '.join(extracted['phone_numbers'][:2])}",
                "severity": "MEDIUM"
            })
        if extracted["upi_handles"]:
            detection_indicators.append({
                "type": "PAYMENT_HANDLE",
                "name": "UPI Payment Address",
                "description": f"Requests money to UPI VPA: {', '.join(extracted['upi_handles'][:2])}",
                "severity": "HIGH"
            })

        # Calculate final risk score and predicted category
        if category_scores:
            top_category = max(category_scores, key=category_scores.get)
            base_score = category_scores[top_category]
            # Add additive risk modifiers
            modifier = (
                (urgency_hits * 10) +
                (10 if extracted["urls"] else 0) +
                (10 if extracted["phone_numbers"] else 0) +
                (10 if extracted["amounts_mentioned"] else 0) +
                (15 if extracted["upi_handles"] else 0)
            )
            final_score = min(base_score + modifier, 98.0)
            confidence = min(0.65 + (0.08 * len(detection_indicators)), 0.95)
            cat_info = self.CATEGORIES[top_category]
            predicted_name = cat_info["name"]
            recommended_actions = cat_info["actions"]
            explanation = (
                f"High probability scam detected matching '{predicted_name}'. "
                f"The message exhibits {len(detection_indicators)} distinct deception indicators including "
                f"{'urgency manipulation and ' if urgency_hits else ''}solicitation patterns."
            )
        else:
            top_category = "BENIGN_OR_UNCORRELATED"
            final_score = 15.0 if (extracted["urls"] or extracted["phone_numbers"]) else 5.0
            confidence = 0.50
            predicted_name = "Low Risk / Uncorrelated Message"
            recommended_actions = [
                "Always verify unexpected communications through independent official channels.",
                "Never share OTPs, passwords, or PINs with unverified third parties."
            ]
            explanation = (
                "No known high-confidence scam patterns or coercive phrases were detected in this message. "
                "However, maintain routine vigilance for unverified contacts."
            )

        # Risk level categorization
        if final_score >= 80:
            risk_level = "CRITICAL"
        elif final_score >= 60:
            risk_level = "HIGH"
        elif final_score >= 30:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"

        return {
            "analysis_type": "SCAM_MESSAGE",
            "predicted_category": top_category,
            "category_name": predicted_name,
            "risk_score": round(final_score, 1),
            "risk_level": risk_level,
            "confidence": round(confidence, 2),
            "detection_indicators": detection_indicators,
            "extracted_indicators": extracted,
            "explanation": explanation,
            "recommended_actions": recommended_actions,
            "limitations": "Deterministic and heuristic linguistic analysis indicates high scam probability. It is not formal judicial evidence."
        }
