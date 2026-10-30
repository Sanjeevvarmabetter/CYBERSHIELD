import React, { useState } from 'react';
import { analysisService } from '../../services/api';
import { AnalysisResult } from '../../types';
import { Cpu, CheckCircle2, Sliders } from 'lucide-react';

export const FraudAnalytics: React.FC = () => {
  const [accountId, setAccountId] = useState('ACC_90812');
  const [amount, setAmount] = useState('85000');
  const [recipientVpa, setRecipientVpa] = useState('refund-desk948@oksbi');
  const [deviceId, setDeviceId] = useState('DEV_ID_88321');
  const [isNewDevice, setIsNewDevice] = useState(true);
  const [isNewRecipient, setIsNewRecipient] = useState(true);
  const [failedLogins, setFailedLogins] = useState(3);
  const channel = 'UPI';

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await analysisService.analyzeFraudTransaction({
        account_id: accountId,
        amount: parseFloat(amount) || 0,
        recipient_vpa: recipientVpa || null,
        device_id: deviceId,
        is_new_device: isNewDevice,
        is_new_recipient: isNewRecipient,
        failed_auth_attempts_prior: failedLogins,
        channel
      });
      setResult(res);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Fraud analysis pipeline execution failed.');
    } finally {
      setLoading(false);
    }
  };

  const loadPreset = (preset: 'normal' | 'takeover' | 'refund_scam') => {
    if (preset === 'normal') {
      setAccountId('ACC_1092');
      setAmount('1250');
      setRecipientVpa('groceries@okaxis');
      setDeviceId('KNOWN_DEV_1');
      setIsNewDevice(false);
      setIsNewRecipient(false);
      setFailedLogins(0);
    } else if (preset === 'takeover') {
      setAccountId('ACC_7741');
      setAmount('145000');
      setRecipientVpa('crypto-desk@okicici');
      setDeviceId('DEV_UNKNOWN_NEW');
      setIsNewDevice(true);
      setIsNewRecipient(true);
      setFailedLogins(4);
    } else {
      setAccountId('ACC_5502');
      setAmount('62000');
      setRecipientVpa('electricity-bill-refund@oksbi');
      setDeviceId('DEV_MID_RISK');
      setIsNewDevice(true);
      setIsNewRecipient(true);
      setFailedLogins(1);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl space-y-8">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-navy-800">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs font-semibold">
            <Cpu className="w-4 h-4" />
            <span>MODULE 2: FINANCIAL FRAUD DETECTION ENGINE</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white mt-1">
            3-Layer Transaction Fraud Analytics
          </h1>
          <p className="text-xs text-slate-400">
            Deterministic rules + Isolation Forest anomaly isolation + Supervised Random Forest classification.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-mono text-slate-400">Presets:</span>
          <button
            type="button"
            onClick={() => loadPreset('normal')}
            className="px-2.5 py-1 bg-navy-800 hover:bg-navy-700 border border-emerald-800/80 rounded text-[11px] font-mono text-emerald-300 transition"
          >
            Normal Retail
          </button>
          <button
            type="button"
            onClick={() => loadPreset('takeover')}
            className="px-2.5 py-1 bg-navy-800 hover:bg-navy-700 border border-red-800/80 rounded text-[11px] font-mono text-red-300 transition"
          >
            Account Takeover
          </button>
          <button
            type="button"
            onClick={() => loadPreset('refund_scam')}
            className="px-2.5 py-1 bg-navy-800 hover:bg-navy-700 border border-amber-800/80 rounded text-[11px] font-mono text-amber-300 transition"
          >
            Spoofed Refund
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Parameters Form */}
        <div className="bg-navy-900 border border-navy-800 rounded-xl p-6 shadow-xl space-y-4">
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2 pb-2 border-b border-navy-800">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>Transaction Telemetry Input</span>
          </h2>

          <form onSubmit={handleEvaluate} className="space-y-4 text-xs font-mono">
            <div>
              <label className="block text-slate-400 mb-1">Account Identifier</label>
              <input
                type="text"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full bg-navy-950 border border-navy-700 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Amount (INR ₹)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-navy-950 border border-navy-700 rounded px-3 py-2 text-white font-bold focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Beneficiary UPI VPA</label>
              <input
                type="text"
                value={recipientVpa}
                onChange={(e) => setRecipientVpa(e.target.value)}
                placeholder="user@oksbi"
                className="w-full bg-navy-950 border border-navy-700 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Device Fingerprint ID</label>
              <input
                type="text"
                value={deviceId}
                onChange={(e) => setDeviceId(e.target.value)}
                className="w-full bg-navy-950 border border-navy-700 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Failed Auth Attempts Prior</label>
              <input
                type="number"
                min={0}
                max={10}
                value={failedLogins}
                onChange={(e) => setFailedLogins(parseInt(e.target.value) || 0)}
                className="w-full bg-navy-950 border border-navy-700 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="space-y-2 pt-2 border-t border-navy-800">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isNewDevice}
                  onChange={(e) => setIsNewDevice(e.target.checked)}
                  className="rounded bg-navy-950 border-navy-700 text-cyan-400"
                />
                <span className="text-slate-300">Is New Device Profile</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isNewRecipient}
                  onChange={(e) => setIsNewRecipient(e.target.checked)}
                  className="rounded bg-navy-950 border-navy-700 text-cyan-400"
                />
                <span className="text-slate-300">Is First-Time Beneficiary</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-bold rounded-lg transition disabled:opacity-50 flex items-center justify-center space-x-2 mt-4"
            >
              <span>{loading ? 'Executing Models...' : 'Run 3-Layer Detection'}</span>
              <Cpu className="w-4 h-4" />
            </button>
          </form>

          {error && <div className="p-3 bg-red-950 text-red-300 rounded text-xs">{error}</div>}
        </div>

        {/* Real-time Detection Layer Results */}
        <div className="lg:col-span-2 space-y-4">
          {result ? (
            <div className="bg-navy-900 border border-navy-800 rounded-xl p-6 shadow-2xl space-y-6">
              {/* Aggregated Score Bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-navy-800 gap-3">
                <div>
                  <div className="text-xs font-mono text-slate-400 uppercase">Layer C Aggregated Verdict</div>
                  <h3 className="text-2xl font-black text-white font-mono mt-0.5">
                    Risk Score: {result.risk_score} / 100
                  </h3>
                </div>
                <div className="flex items-center space-x-3">
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

              {/* Multi-Layer Diagnostic Breakdown Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
                <div className="p-4 rounded-xl bg-navy-950 border border-navy-800 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase">Layer A: Rules</span>
                  <div className="text-xl font-bold text-cyan-400">
                    {(result as any).score_breakdown?.layer_a_rule_score ?? '—'}
                  </div>
                  <div className="text-[10px] text-slate-500">Deterministic triggers</div>
                </div>

                <div className="p-4 rounded-xl bg-navy-950 border border-navy-800 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase">Layer B: Anomaly (IF)</span>
                  <div className="text-xl font-bold text-purple-400">
                    {(result as any).score_breakdown?.layer_b_anomaly_score ?? '—'}
                  </div>
                  <div className="text-[10px] text-slate-500">Isolation Forest dev.</div>
                </div>

                <div className="p-4 rounded-xl bg-navy-950 border border-navy-800 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase">Layer B: Pattern (RF)</span>
                  <div className="text-xl font-bold text-amber-400">
                    {(result as any).score_breakdown?.layer_b_pattern_score ?? '—'}
                  </div>
                  <div className="text-[10px] text-slate-500">Random Forest prob.</div>
                </div>
              </div>

              {/* Explanation */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
                  Machine-Readable Decision Explanation
                </h4>
                <p className="text-xs text-slate-200 leading-relaxed bg-navy-950 p-4 rounded-lg border border-navy-800 font-mono">
                  {result.explanation}
                </p>
              </div>

              {/* Detected Indicators List */}
              {result.detection_indicators && result.detection_indicators.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
                    Contributing Risk Indicators
                  </h4>
                  <div className="space-y-2">
                    {result.detection_indicators.map((ind, idx) => (
                      <div key={idx} className="bg-navy-950 p-3 rounded-lg border border-navy-800 flex items-start justify-between gap-3 text-xs">
                        <div className="space-y-0.5">
                          <div className="font-bold text-cyan-300 font-mono">{ind.name}</div>
                          <div className="text-slate-300 text-[11px]">{ind.description}</div>
                        </div>
                        <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-navy-800 text-slate-400 font-bold flex-shrink-0">
                          {ind.severity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Policy Actions */}
              <div className="bg-cyan-950/20 border border-cyan-800/40 p-4 rounded-lg space-y-2">
                <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Enforcement & Stepped Authentication Actions</span>
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

              <div className="text-[11px] text-slate-500 italic">
                * Note: In accordance with core engineering principles, CYBERSHIELD provides analytical risk indicators and does not unilaterally initiate account debits or freeze external accounts.
              </div>
            </div>
          ) : (
            <div className="bg-navy-900 border border-navy-800 rounded-xl p-12 text-center text-slate-500 font-mono text-xs space-y-3">
              <Cpu className="w-8 h-8 mx-auto text-slate-600" />
              <div>Configure transaction parameters on the left and click "Run 3-Layer Detection" to execute the pipeline.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
