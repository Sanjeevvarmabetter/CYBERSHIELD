import React, { useState } from 'react';
import { analysisService } from '../../services/api';
import { AnalysisResult } from '../../types';
import { Search, CheckCircle, Sparkles } from 'lucide-react';

export const ScamAnalyzer: React.FC = () => {
  const [text, setText] = useState('');
  const [channel, setChannel] = useState('SMS');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setError(null);
    setLoading(true);
    try {
      const res = await analysisService.analyzeScamMessage({ text, channel });
      setResult(res);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const sampleScams = [
    {
      title: "Telegram Work from Home Task",
      text: "Dear candidate, you have been selected for part-time YouTube review work. Earn ₹3500-₹8000 daily from home. Join Telegram: t.me/vip_task_review. Immediate payout guaranteed."
    },
    {
      title: "Electricity Bill Disconnection Alert",
      text: "Dear Consumer, your electricity power will be disconnected tonight at 9.30 PM because your previous month bill was not updated. Please immediately contact our electricity officer at 9876543210. Thank you."
    },
    {
      title: "Bank KYC Suspension Threat",
      text: "Your SBI Bank account has been blocked due to pending PAN/KYC document submission. Kindly update immediately by clicking here: http://sbi-kyc-verify-update.com or your debit card will be terminated."
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-navy-800 border border-cyan-500/30 text-xs font-mono text-cyan-400">
          <Search className="w-3.5 h-3.5" />
          <span>MODULE 1: ONLINE CRIME ANALYZER</span>
        </div>
        <h1 className="text-3xl font-black text-white">Scam Message & Offer Classifier</h1>
        <p className="text-sm text-slate-300 max-w-xl mx-auto">
          Paste any suspicious SMS, WhatsApp message, email, or job offer. Our engine evaluates deterministic signatures, urgency manipulation, and known scam campaign templates.
        </p>
      </div>

      {/* Analysis Form */}
      <div className="bg-navy-900 border border-navy-700 rounded-xl p-6 shadow-xl space-y-4">
        <form onSubmit={handleAnalyze} className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Paste Suspicious Content
            </label>
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-slate-400">Source:</span>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className="bg-navy-950 border border-navy-700 rounded px-2.5 py-1 text-slate-200 text-xs focus:border-cyan-400 focus:outline-none"
              >
                <option value="SMS">SMS Message</option>
                <option value="WHATSAPP">WhatsApp</option>
                <option value="TELEGRAM">Telegram</option>
                <option value="EMAIL">Email</option>
                <option value="JOB_PORTAL">Job Portal / LinkedIn</option>
              </select>
            </div>
          </div>

          <textarea
            rows={5}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g., 'Dear user, your bank account is suspended...'"
            className="w-full bg-navy-950 border border-navy-700 rounded-lg p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono transition"
          />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            {/* Quick Sample Chips */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-slate-400 font-mono text-[11px]">Load Sample:</span>
              {sampleScams.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setText(sample.text)}
                  className="px-2 py-1 bg-navy-800 hover:bg-navy-700 border border-navy-600 rounded text-[11px] text-cyan-300 transition"
                >
                  {sample.title}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={loading || !text.trim()}
              className="w-full sm:w-auto px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-bold rounded-lg transition disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <span>{loading ? 'Analyzing Indicators...' : 'Analyze Message'}</span>
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
        </form>

        {error && (
          <div className="p-3 bg-red-950/60 border border-red-800 rounded-lg text-xs text-red-300">
            {error}
          </div>
        )}
      </div>

      {/* Result Card */}
      {result && (
        <div className="bg-navy-900 border border-navy-700 rounded-xl p-6 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-navy-800 gap-3">
            <div>
              <div className="text-xs font-mono text-slate-400 uppercase">Detection Result</div>
              <h3 className="text-xl font-bold text-white mt-0.5">{result.predicted_category.replace(/_/g, ' ')}</h3>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-xs text-slate-400 font-mono">Confidence: {(result.confidence * 100).toFixed(0)}%</div>
                <div className="text-xs font-mono text-cyan-400">Score: {result.risk_score}/100</div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${
                  result.risk_level === 'CRITICAL'
                    ? 'bg-red-950 text-red-400 border border-red-800'
                    : result.risk_level === 'HIGH'
                    ? 'bg-orange-950 text-orange-400 border border-orange-800'
                    : result.risk_level === 'MEDIUM'
                    ? 'bg-amber-950 text-amber-400 border border-amber-800'
                    : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                }`}
              >
                {result.risk_level} RISK
              </span>
            </div>
          </div>

          {/* Explanation */}
          <div className="space-y-1">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Analysis Summary</h4>
            <p className="text-sm text-slate-200 leading-relaxed bg-navy-950 p-4 rounded-lg border border-navy-800">
              {result.explanation}
            </p>
          </div>

          {/* Detected Indicators */}
          {result.detection_indicators && result.detection_indicators.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Detection Indicators</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {result.detection_indicators.map((ind, idx) => (
                  <div key={idx} className="bg-navy-950/80 border border-navy-800 p-3 rounded-lg space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-cyan-300">{ind.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-navy-800 text-slate-400">
                        {ind.severity}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">{ind.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Actions */}
          <div className="bg-cyan-950/20 border border-cyan-800/40 p-4 rounded-lg space-y-2">
            <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center space-x-1.5">
              <CheckCircle className="w-4 h-4" />
              <span>Recommended Citizen Safety Actions</span>
            </h4>
            <ul className="space-y-1 text-xs text-slate-200">
              {result.recommended_actions.map((act, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span>{act}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Limitations disclaimer */}
          <div className="text-[11px] text-slate-400 italic">
            <strong>Platform Limitation:</strong> {result.limitations || "Automated indicator detection provides risk intelligence and is not a formal legal determination."}
          </div>
        </div>
      )}
    </div>
  );
};
