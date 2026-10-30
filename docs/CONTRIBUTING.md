# Contributing to CYBERSHIELD

We welcome contributions from security engineers, researchers, and developers committed to fighting digital crime.

---

## 1. Development Principles
- **Defense in Depth:** Treat all inputs, uploaded files, and URLs as untrusted.
- **Explainability:** All detections must provide machine-readable indicators, not black-box guesses.
- **Privacy First:** Never log, expose, or mirror victim PII into threat intelligence feeds.

---

## 2. Pull Request Process
1. Fork the repository and create your feature branch: `git checkout -b feature/my-feature`.
2. Ensure all tests pass: `PYTHONPATH=. pytest backend/tests -v`.
3. Verify formatting and security: run Bandit SAST scan.
4. Ensure frontend builds cleanly: `cd frontend && npm run build`.
5. Submit your pull request with a detailed description of the detection heuristics or security controls added.
