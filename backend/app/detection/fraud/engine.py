from datetime import datetime, timezone
from typing import Dict, Any, List, Optional, Tuple
import numpy as np
from sklearn.ensemble import IsolationForest, RandomForestClassifier

class FinancialFraudEngine:
    """
    3-Layer Financial Fraud Detection Engine for UPI, IMPS, and Card Transactions:
    - Layer A: Rule-Based Deterministic Detection
    - Layer B: Machine Learning (Isolation Forest Anomaly Detection + Supervised RF)
    - Layer C: Risk Aggregator & Explainable Normalizer (0 to 100)
    """

    def __init__(self):
        # Initialize and pre-train Layer B baseline models on synthetic financial events
        self._init_ml_models()

    def _init_ml_models(self):
        # Generate synthetic baseline transaction feature matrix:
        # Features: [amount, log_amount, failed_logins, is_new_device, is_new_recipient, hour_of_day]
        np.random.seed(42)
        n_normal = 2000
        n_fraud = 120

        # Normal distributions: lower amounts (mean ₹1800, std ₹2500), low failed logins, few new devices
        normal_amounts = np.clip(np.random.exponential(scale=1800, size=n_normal), 10, 50000)
        normal_log_amounts = np.log1p(normal_amounts)
        normal_failed_logins = np.random.choice([0, 1, 2], size=n_normal, p=[0.90, 0.08, 0.02])
        normal_new_device = np.random.choice([0, 1], size=n_normal, p=[0.92, 0.08])
        normal_new_recipient = np.random.choice([0, 1], size=n_normal, p=[0.75, 0.25])
        normal_hour = np.random.randint(6, 23, size=n_normal)

        X_normal = np.column_stack([
            normal_amounts, normal_log_amounts, normal_failed_logins,
            normal_new_device, normal_new_recipient, normal_hour
        ])

        # Fraudulent distributions: spike amounts (₹40,000 - ₹200,000), multiple failed logins, new devices, odd hours
        fraud_amounts = np.random.uniform(40000, 200000, size=n_fraud)
        fraud_log_amounts = np.log1p(fraud_amounts)
        fraud_failed_logins = np.random.choice([2, 3, 4, 5], size=n_fraud)
        fraud_new_device = np.random.choice([0, 1], size=n_fraud, p=[0.15, 0.85])
        fraud_new_recipient = np.random.choice([0, 1], size=n_fraud, p=[0.10, 0.90])
        fraud_hour = np.random.choice([0, 1, 2, 3, 4, 23], size=n_fraud)

        X_fraud = np.column_stack([
            fraud_amounts, fraud_log_amounts, fraud_failed_logins,
            fraud_new_device, fraud_new_recipient, fraud_hour
        ])

        X_all = np.vstack([X_normal, X_fraud])
        y_all = np.array([0] * n_normal + [1] * n_fraud)

        # 1. Isolation Forest for unsupervised anomaly isolation
        self.isolation_forest = IsolationForest(
            n_estimators=100,
            contamination=0.05,
            random_state=42
        )
        self.isolation_forest.fit(X_all)

        # 2. Random Forest for supervised fraud pattern classification
        self.random_forest = RandomForestClassifier(
            n_estimators=100,
            max_depth=5,
            random_state=42
        )
        self.random_forest.fit(X_all, y_all)

    def extract_features(self, tx: Dict[str, Any]) -> np.ndarray:
        amount = float(tx.get("amount", 0.0))
        log_amount = np.log1p(max(amount, 0.0))
        failed_logins = int(tx.get("failed_auth_attempts_prior", 0))
        new_device = 1 if tx.get("is_new_device", False) else 0
        new_recipient = 1 if tx.get("is_new_recipient", False) else 0

        # Extract transaction hour
        tx_time = tx.get("timestamp")
        if isinstance(tx_time, datetime):
            hour = tx_time.hour
        elif isinstance(tx_time, str):
            try:
                hour = datetime.fromisoformat(tx_time.replace("Z", "+00:00")).hour
            except Exception:
                hour = 12
        else:
            hour = datetime.now(timezone.utc).hour

        return np.array([[amount, log_amount, failed_logins, new_device, new_recipient, hour]])

    def evaluate_rules_layer_a(self, tx: Dict[str, Any]) -> Tuple[float, List[Dict[str, str]]]:
        """
        Layer A: Deterministic Rule-Based Checks
        """
        amount = float(tx.get("amount", 0.0))
        failed_logins = int(tx.get("failed_auth_attempts_prior", 0))
        is_new_device = bool(tx.get("is_new_device", False))
        is_new_recipient = bool(tx.get("is_new_recipient", False))
        recipient_vpa = str(tx.get("recipient_vpa", "")).lower()

        indicators: List[Dict[str, str]] = []
        rule_score = 0.0

        # Rule 1: High velocity / High value single UPI transfer
        if amount >= 100000.0:
            rule_score += 40.0
            indicators.append({
                "type": "RULE_LARGE_AMOUNT",
                "name": "High Value Transfer (> ₹1,00,000)",
                "description": f"Transfer amount of ₹{amount:,.2f} exceeds standard retail risk threshold.",
                "severity": "HIGH"
            })
        elif amount >= 50000.0 and is_new_recipient:
            rule_score += 30.0
            indicators.append({
                "type": "RULE_NEW_RECIPIENT_LARGE_AMOUNT",
                "name": "First-Time High Value Beneficiary",
                "description": f"₹{amount:,.2f} routed to previously unverified beneficiary.",
                "severity": "HIGH"
            })

        # Rule 2: Brute-Force Authentication Followed by Fund Transfer
        if failed_logins >= 3:
            rule_score += 45.0
            indicators.append({
                "type": "RULE_FAILED_AUTH_BURST",
                "name": "Repeated Authentication Failures",
                "description": f"{failed_logins} consecutive authentication failures occurred prior to transaction.",
                "severity": "CRITICAL"
            })

        # Rule 3: New Device Fingerprint + High Amount Combo
        if is_new_device and amount >= 30000.0:
            rule_score += 35.0
            indicators.append({
                "type": "RULE_NEW_DEVICE_TAKEOVER",
                "name": "Unrecognized Device Fingerprint",
                "description": "High-value transfer originated from a newly registered device profile.",
                "severity": "HIGH"
            })

        # Rule 4: Suspicious VPA Keywords (Known refund/support impersonation patterns)
        suspicious_vpa_words = ["refund", "cashback", "customer", "support", "care", "helpline", "kyc"]
        if any(w in recipient_vpa for w in suspicious_vpa_words):
            rule_score += 35.0
            indicators.append({
                "type": "RULE_SUSPICIOUS_VPA",
                "name": "Impersonated Payment Address",
                "description": f"Recipient UPI handle '{recipient_vpa}' mimics official refund/support desk.",
                "severity": "CRITICAL"
            })

        return min(rule_score, 100.0), indicators

    def evaluate_ml_layer_b(self, features: np.ndarray) -> Tuple[float, float, List[Dict[str, str]]]:
        """
        Layer B: Machine Learning Anomaly Detection & Supervised Pattern Scoring
        """
        indicators: List[Dict[str, str]] = []

        # 1. Unsupervised Anomaly Isolation (Isolation Forest)
        # decision_function returns negative values for anomalies, positive for inliers
        raw_anomaly_score = self.isolation_forest.decision_function(features)[0]
        # Normalize into [0, 100] scale: lower decision function = higher anomaly
        anomaly_score = float(np.clip((0.15 - raw_anomaly_score) * 250, 0, 100))

        if anomaly_score > 60.0:
            indicators.append({
                "type": "ML_ANOMALY_ISOLATION",
                "name": "High Statistical Anomaly (Isolation Forest)",
                "description": f"Multi-dimensional deviation score of {anomaly_score:.1f}/100 across transaction features.",
                "severity": "HIGH"
            })

        # 2. Supervised Fraud Probability (Random Forest)
        fraud_prob = float(self.random_forest.predict_proba(features)[0][1])
        pattern_score = fraud_prob * 100.0

        if pattern_score > 50.0:
            indicators.append({
                "type": "ML_FRAUD_PATTERN",
                "name": "Known Fraud Signature Match (Random Forest)",
                "description": f"Supervised pattern probability evaluated at {pattern_score:.1f}%.",
                "severity": "CRITICAL" if pattern_score >= 80 else "HIGH"
            })

        return anomaly_score, pattern_score, indicators

    def evaluate_layer_c_aggregation(
        self,
        rule_score: float,
        anomaly_score: float,
        pattern_score: float,
        indicators: List[Dict[str, str]]
    ) -> Dict[str, Any]:
        """
        Layer C: Composite Risk Aggregator
        Weight formula: 40% Rules + 30% Supervised Pattern + 30% Unsupervised Anomaly
        """
        composite_score = (0.40 * rule_score) + (0.30 * pattern_score) + (0.30 * anomaly_score)
        composite_score = float(np.clip(composite_score, 0.0, 100.0))

        # Confidence based on inter-layer agreement
        agreement = 1.0 - (abs(rule_score - pattern_score) / 100.0)
        confidence = float(np.clip(0.60 + (0.30 * agreement), 0.50, 0.98))

        # Configurable Policy Thresholds
        if composite_score >= 80.0:
            risk_level = "CRITICAL"
            explanation = (
                f"Transaction flagged as CRITICAL risk ({composite_score:.1f}/100). "
                "Strong convergence across deterministic fraud rules, high statistical anomaly, "
                "and supervised model predictions."
            )
            actions = [
                "Recommend immediate step-up multi-factor authentication (Biometric/Out-of-band verification).",
                "Notify account holder via registered primary communication channel.",
                "Prepare transaction telemetry for review in Analyst Incident Queue."
            ]
        elif composite_score >= 60.0:
            risk_level = "HIGH"
            explanation = (
                f"Transaction exhibits HIGH risk markers ({composite_score:.1f}/100) "
                "such as new device usage, high transfer velocity, or unverified beneficiary credentials."
            )
            actions = [
                "Require re-authentication or biometric confirmation before debit clearance.",
                "Display explicit beneficiary confirmation prompt to user."
            ]
        elif composite_score >= 30.0:
            risk_level = "MEDIUM"
            explanation = f"Moderate risk score ({composite_score:.1f}/100). Transaction differs slightly from baseline habits."
            actions = [
                "Log event telemetry for behavior profiling.",
                "Send standard SMS debit notification."
            ]
        else:
            risk_level = "LOW"
            explanation = f"Low risk transaction ({composite_score:.1f}/100). Parameters align with normal retail patterns."
            actions = ["Process transaction normally."]

        return {
            "analysis_type": "FINANCIAL_FRAUD",
            "predicted_category": f"FRAUD_RISK_{risk_level}",
            "risk_score": round(composite_score, 1),
            "risk_level": risk_level,
            "confidence": round(confidence, 2),
            "detection_indicators": indicators,
            "score_breakdown": {
                "layer_a_rule_score": round(rule_score, 1),
                "layer_b_anomaly_score": round(anomaly_score, 1),
                "layer_b_pattern_score": round(pattern_score, 1)
            },
            "explanation": explanation,
            "recommended_actions": actions,
            "limitations": "Analytical risk scoring. System never unilaterally freezes real customer banking accounts."
        }

    def analyze(self, tx_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute full 3-layer analysis pipeline."""
        # Layer A
        rule_score, rule_indicators = self.evaluate_rules_layer_a(tx_data)

        # Layer B
        features = self.extract_features(tx_data)
        anomaly_score, pattern_score, ml_indicators = self.evaluate_ml_layer_b(features)

        # Aggregate indicators
        all_indicators = rule_indicators + ml_indicators

        # Layer C
        return self.evaluate_layer_c_aggregation(rule_score, anomaly_score, pattern_score, all_indicators)
