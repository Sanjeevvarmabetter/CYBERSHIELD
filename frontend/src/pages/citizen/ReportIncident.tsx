import React, { useState } from 'react';
import { incidentService } from '../../services/api';
import api from '../../services/api';
import { IncidentReport } from '../../types';
import { ShieldAlert, CheckCircle2, AlertTriangle, ArrowRight, Copy, Upload, FileText, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ReportIncident: React.FC = () => {
  const [category, setCategory] = useState('FINANCIAL_FRAUD');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [contactEmail, setContactEmail] = useState('');
  const [consentShareIntel, setConsentShareIntel] = useState(true);
  const [indicatorsText, setIndicatorsText] = useState('');
  const [transactionRef, setTransactionRef] = useState('');

  // Evidence file state with in-browser SHA-256 calculation
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [fileSha256, setFileSha256] = useState<string | null>(null);
  const [calculatingHash, setCalculatingHash] = useState(false);

  const [loading, setLoading] = useState(false);
  const [submittedReport, setSubmittedReport] = useState<IncidentReport | null>(null);
  const [uploadedEvidenceId, setUploadedEvidenceId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleFileChange = async (file: File) => {
    setEvidenceFile(file);
    setCalculatingHash(true);
    try {
      const buffer = await file.arrayBuffer();
      const digestBuffer = await crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(digestBuffer));
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
      setFileSha256(hashHex);
    } catch (err) {
      console.error("Hash calculation error:", err);
    } finally {
      setCalculatingHash(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (description.length < 20) {
      setError('Please provide a detailed description (at least 20 characters) to assist with correlation.');
      return;
    }
    setLoading(true);
    try {
      const indicators = indicatorsText
        .split('\n')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      // 1. Submit incident
      const inc = await incidentService.submitIncident({
        category,
        title,
        description,
        is_anonymous: isAnonymous,
        contact_email: isAnonymous ? null : contactEmail || null,
        consent_share_intel: consentShareIntel,
        indicators_involved: indicators,
        transaction_reference: transactionRef || null
      });

      // 2. If evidence file attached, upload directly to Evidence Vault
      if (evidenceFile) {
        const formData = new FormData();
        formData.append('incident_id', inc.id);
        formData.append('file', evidenceFile);
        const evRes = await api.post('/evidence/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setUploadedEvidenceId(evRes.data.evidence_id);
      }

      setSubmittedReport(inc);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit incident report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyRefCode = () => {
    if (submittedReport) {
      navigator.clipboard.writeText(submittedReport.reference_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (submittedReport) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="bg-navy-900 border border-emerald-800/80 rounded-xl p-8 shadow-2xl text-center space-y-6">
          <div className="p-4 rounded-full bg-emerald-950/60 text-emerald-400 w-fit mx-auto border border-emerald-800">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white">Incident Recorded & Fingerprinted</h2>
            <p className="text-xs text-slate-300">
              Your report and attached evidence have been cryptographically secured in the evidence vault.
            </p>
          </div>

          {/* Reference Code Box */}
          <div className="bg-navy-950 p-6 rounded-xl border border-navy-800 space-y-2">
            <div className="text-xs font-mono text-slate-400 uppercase tracking-widest">
              Your Incident Tracking Reference
            </div>
            <div className="flex items-center justify-center space-x-3">
              <span className="text-2xl md:text-3xl font-black font-mono text-cyan-400 tracking-wider">
                {submittedReport.reference_code}
              </span>
              <button
                onClick={copyRefCode}
                className="p-2 rounded bg-navy-800 hover:bg-navy-700 text-slate-300 hover:text-white transition"
                title="Copy reference code"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            {copied && <div className="text-xs text-emerald-400">Copied to clipboard!</div>}

            {fileSha256 && (
              <div className="pt-2 border-t border-navy-900 text-left font-mono text-[11px] space-y-1">
                <span className="text-slate-400">Evidence SHA-256 Hash:</span>
                <div className="text-cyan-300 break-all select-all bg-navy-900 p-2 rounded border border-navy-800">
                  {fileSha256}
                </div>
                {uploadedEvidenceId && (
                  <div className="text-[10px] text-slate-400 pt-1">
                    Vault Evidence ID: <span className="text-cyan-400">{uploadedEvidenceId}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-amber-950/30 border border-amber-900/40 p-4 rounded-lg text-xs text-amber-200 text-left space-y-1">
            <strong>Official National Reporting:</strong>
            <p>
              If money was debited from your account, report to <strong>1930</strong> (Financial Cyber Fraud Helpline) immediately to initiate a lien hold.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <a
              href={`/api/v1/evidence/report/${submittedReport.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-navy-800 hover:bg-navy-700 border border-cyan-800 text-cyan-300 font-bold rounded-lg transition flex items-center justify-center space-x-1.5 text-xs font-mono"
            >
              <FileText className="w-4 h-4" />
              <span>Download PDF Assistance Report</span>
            </a>
            <Link
              to={`/track-status?ref=${submittedReport.reference_code}`}
              className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-bold rounded-lg transition text-xs font-mono flex items-center justify-center"
            >
              Track Incident Status
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl space-y-8">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-navy-800 border border-red-500/30 text-xs font-mono text-red-400">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>MODULE 6 & 7: CITIZEN REPORTING & EVIDENCE VAULT</span>
        </div>
        <h1 className="text-3xl font-black text-white">Report a Cybercrime Incident</h1>
        <p className="text-sm text-slate-300 max-w-xl mx-auto">
          Securely submit details of fraud, extortion, or phishing. Computes cryptographic hashes in your browser before upload to guarantee evidence integrity.
        </p>
      </div>

      <div className="bg-navy-900 border border-navy-700 rounded-xl p-6 md:p-8 shadow-2xl space-y-6">
        {error && (
          <div className="p-3.5 bg-red-950/60 border border-red-800 rounded-lg text-xs text-red-300 flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 text-sm">
          {/* Incident Category */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Incident Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-navy-950 border border-navy-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="FINANCIAL_FRAUD">Financial Fraud & UPI Scams</option>
              <option value="PHISHING">Phishing / Malicious Website</option>
              <option value="FAKE_JOB">Fake Job & Recruitment Scam</option>
              <option value="IDENTITY_THEFT">Identity Theft / Impersonation</option>
              <option value="HARASSMENT">Online Harassment & Cyberbullying</option>
              <option value="CYBERSTALKING">Cyberstalking & Threatening Messages</option>
              <option value="SEXTORTION">Sextortion & Online Exploitation</option>
              <option value="OTHER">Other Cybercrime Vector</option>
            </select>
          </div>

          {/* Title */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Summary Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Deducted ₹25,000 via fake electricity bill SMS"
              className="w-full bg-navy-950 border border-navy-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Incident Description & Chronology
            </label>
            <textarea
              rows={5}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what occurred, how the scammer contacted you, which apps or links were involved, and any monetary amounts..."
              className="w-full bg-navy-950 border border-navy-700 rounded-lg p-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Evidence File Drag-and-Drop Vault */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Attach Evidence File (Screenshot / Chat Export / PDF)
            </label>
            <div className="border-2 border-dashed border-navy-700 hover:border-cyan-500/50 rounded-xl p-5 text-center bg-navy-950/60 transition">
              <input
                type="file"
                accept=".png,.jpg,.jpeg,.pdf,.txt"
                onChange={(e) => e.target.files && handleFileChange(e.target.files[0])}
                className="hidden"
                id="evidence-file-input"
              />
              <label htmlFor="evidence-file-input" className="cursor-pointer space-y-1.5 block">
                <Upload className="w-6 h-6 text-cyan-400 mx-auto" />
                <div className="text-xs font-bold text-white">
                  {evidenceFile ? evidenceFile.name : "Click to select or drop evidence file here"}
                </div>
                <div className="text-[11px] text-slate-400">
                  {evidenceFile ? `Size: ${(evidenceFile.size / 1024).toFixed(1)} KB` : "Supports PNG, JPG, PDF, TXT (Max 15MB)"}
                </div>
              </label>
            </div>

            {/* In-Browser Real-Time SHA-256 Display */}
            {calculatingHash && (
              <div className="text-[11px] font-mono text-cyan-400 animate-pulse">
                Calculating SHA-256 cryptographic digest in browser...
              </div>
            )}
            {fileSha256 && (
              <div className="p-3 bg-navy-950 rounded-lg border border-navy-800 text-[11px] font-mono space-y-1">
                <div className="flex items-center space-x-1.5 text-emerald-400 font-bold">
                  <Lock className="w-3.5 h-3.5" />
                  <span>SHA-256 Hash Computed (Client-Side Verification):</span>
                </div>
                <div className="text-slate-300 break-all select-all">{fileSha256}</div>
              </div>
            )}
          </div>

          {/* Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Suspicious Indicators (One per line)
              </label>
              <textarea
                rows={3}
                value={indicatorsText}
                onChange={(e) => setIndicatorsText(e.target.value)}
                placeholder="Phone numbers, URLs, UPI handles, or domains involved..."
                className="w-full bg-navy-950 border border-navy-700 rounded-lg p-2.5 text-xs font-mono text-cyan-300 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Transaction Reference / UTR (Optional)
              </label>
              <input
                type="text"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                placeholder="e.g., 402918239012 (UPI 12-digit Ref / Bank UTR)"
                className="w-full bg-navy-950 border border-navy-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 font-mono text-xs focus:outline-none focus:border-cyan-400"
              />
              <p className="text-[11px] text-slate-400 pt-1">
                Helpful for correlating repeated recipient scam accounts across multiple victims.
              </p>
            </div>
          </div>

          {/* Privacy & Consent Controls */}
          <div className="bg-navy-950 p-4 rounded-xl border border-navy-800 space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="anon"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="rounded bg-navy-900 border-navy-700 text-cyan-500 focus:ring-0"
              />
              <label htmlFor="anon" className="text-xs text-slate-300 font-medium cursor-pointer">
                Submit this incident anonymously (No personal details recorded)
              </label>
            </div>

            {!isAnonymous && (
              <div>
                <label className="block text-xs text-slate-400 mb-1">Contact Email (for case updates)</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="your.email@domain.com"
                  className="w-full bg-navy-900 border border-navy-700 rounded px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>
            )}

            <div className="flex items-center space-x-2 pt-1 border-t border-navy-900">
              <input
                type="checkbox"
                id="consent"
                checked={consentShareIntel}
                onChange={(e) => setConsentShareIntel(e.target.checked)}
                className="rounded bg-navy-900 border-navy-700 text-cyan-500 focus:ring-0"
              />
              <label htmlFor="consent" className="text-xs text-slate-300 cursor-pointer">
                I consent to anonymized extraction of technical indicators (domains, scam phone numbers, handles) to help protect others from this threat pattern.
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition disabled:opacity-50 flex items-center justify-center space-x-2 shadow-lg shadow-red-950/50"
          >
            <span>{loading ? 'Securing & Registering Incident...' : 'Submit Incident & Lock Evidence'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
