import React, { useState } from 'react';
import { incidentService } from '../../services/api';
import { IncidentReport } from '../../types';
import { ShieldAlert, CheckCircle2, AlertTriangle, ArrowRight, Copy } from 'lucide-react';
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
  const [loading, setLoading] = useState(false);
  const [submittedReport, setSubmittedReport] = useState<IncidentReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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

      const res = await incidentService.submitIncident({
        category,
        title,
        description,
        is_anonymous: isAnonymous,
        contact_email: isAnonymous ? null : contactEmail || null,
        consent_share_intel: consentShareIntel,
        indicators_involved: indicators,
        transaction_reference: transactionRef || null
      });
      setSubmittedReport(res);
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
            <h2 className="text-2xl font-black text-white">Incident Recorded Successfully</h2>
            <p className="text-xs text-slate-300">
              Your report has been secured and queued for threat pattern correlation and evidence preservation.
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
            <p className="text-xs text-slate-400 pt-1">
              Save this code. You can use it anytime on our Track Status page to review updates without needing an account.
            </p>
          </div>

          <div className="bg-amber-950/30 border border-amber-900/40 p-4 rounded-lg text-xs text-amber-200 text-left space-y-1">
            <strong>Legal Notice & Official Assistance:</strong>
            <p>
              CYBERSHIELD is an assistance and intelligence platform. If you have suffered a financial loss, report immediately to the National Cybercrime Portal (<strong>cybercrime.gov.in</strong>) or dial <strong>1930</strong>.
            </p>
          </div>

          <div className="flex justify-center space-x-4">
            <Link
              to={`/track-status?ref=${submittedReport.reference_code}`}
              className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-bold rounded-lg transition"
            >
              View Incident Status
            </Link>
            <button
              onClick={() => {
                setSubmittedReport(null);
                setTitle('');
                setDescription('');
                setIndicatorsText('');
                setTransactionRef('');
              }}
              className="px-5 py-2.5 bg-navy-800 hover:bg-navy-700 text-slate-300 rounded-lg transition"
            >
              Submit Another Report
            </button>
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
          <span>MODULE 6: CITIZEN INCIDENT REPORTING PORTAL</span>
        </div>
        <h1 className="text-3xl font-black text-white">Report a Cybercrime Incident</h1>
        <p className="text-sm text-slate-300 max-w-xl mx-auto">
          Securely submit details of fraud, extortion, or phishing. Your submission enables pattern correlation across malicious campaigns while safeguarding victim privacy.
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

          <div className="bg-navy-950/40 p-3 rounded text-[11px] text-slate-400 italic">
            <strong>Disclaimers:</strong> CYBERSHIELD does not guarantee fund recovery and is not a formal substitute for a First Information Report (FIR). For formal legal and monetary relief, report to 1930 and cybercrime.gov.in.
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition disabled:opacity-50 flex items-center justify-center space-x-2 shadow-lg shadow-red-950/50"
          >
            <span>{loading ? 'Securing & Registering Incident...' : 'Submit Incident & Generate Reference'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
