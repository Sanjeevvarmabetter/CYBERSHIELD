# CYBERSHIELD — Machine Learning Model Cards

## 1. Financial Fraud Anomaly Isolation Model (Isolation Forest)

### 1.1 Model Details
- **Architecture:** Unsupervised Isolation Forest (`sklearn.ensemble.IsolationForest`).
- **Estimators:** 100 Trees.
- **Contamination:** 0.05.
- **Input Features (6):** `amount`, `log1p(amount)`, `failed_auth_attempts`, `is_new_device`, `is_new_recipient`, `transaction_hour`.
- **Intended Use:** Identifies statistical outliers in multi-dimensional transaction telemetry without requiring ground-truth labels.
- **Limitations:** An outlier is an anomaly, not guaranteed fraud. Must be paired with Layer A deterministic rules and Layer C risk aggregation.

---

## 2. Financial Fraud Pattern Classifier (Random Forest)

### 2.1 Model Details
- **Architecture:** Supervised Random Forest Classifier (`sklearn.ensemble.RandomForestClassifier`).
- **Estimators:** 100 Trees.
- **Max Depth:** 5.
- **Target:** Binary classification (0: Legitimate Retail Event, 1: High-Confidence Fraud Pattern).
- **Training Strategy:** Trained on synthetic transaction baseline distributions representing account takeovers, brute-force auth precedes, and spoofed refund transfers.

### 2.2 Performance Metrics (Evaluation Set)
- **Precision:** 0.94
- **Recall:** 0.91
- **F1 Score:** 0.925
- **ROC-AUC:** 0.965
- **Inference Latency:** < 5 ms per transaction evaluation.

---

## 3. Responsible AI Principles
1. Automated decisions are explainable: every model inference outputs contributing feature indicators.
2. Models never automatically debit or freeze real user bank accounts.
3. Models undergo continuous adversarial robustness testing against obfuscated URLs and misspelled messages.
