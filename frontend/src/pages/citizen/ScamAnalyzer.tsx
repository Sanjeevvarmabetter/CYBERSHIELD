import React, { useState } from 'react';
import { analysisService } from '../../services/api';
import api from '../../services/api';
import { AnalysisResult } from '../../types';
import { Search, CheckCircle, Sparkles, Image, PhoneCall, Upload, AlertTriangle, RefreshCw } from 'lucide-react';
import { createWorker } from 'tesseract.js';

export const ScamAnalyzer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'text' | 'ocr' | 'lookup'>('text');

  // Text tab state
  const [text, setText] = useState('');
  const [channel, setChannel] = useState('SMS');
  const [loadingText, setLoadingText] = useState(false);
  const [textResult, setTextResult] = useState<AnalysisResult | null>(null);

  // OCR tab state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [ocrText, setOcrText] = useState('');
  const [ocrProgress, setOcrProgress] = useState(0);
  const [loadingOcr, setLoadingOcr] = useState(false);
  const [ocrResult, setOcrResult] = useState<AnalysisResult | null>(null);

  // Lookup tab state
  const [lookupTarget, setLookupTarget] = useState('');
  const [lookupType, setLookupType] = useState<'PHONE' | 'EMAIL'>('PHONE');
  const [loadingLookup, setLoadingLookup] = useState(false);
  const [lookupResult, setLookupResult] = useState<any | null>(null);

  const [error, setError] = useState<string | null>(null);

  // --- Handlers ---
  const handleAnalyzeText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setError(null);
    setLoadingText(true);
    try {
      const res = await analysisService.analyzeScamMessage({ text, channel });
      setTextResult(res);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Analysis failed. Please try again.');
    } finally {
      setLoadingText(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setOcrText('');
      setOcrResult(null);
    }
  };

  const runOcrScan = async () => {
    if (!imageFile) return;
    setLoadingOcr(true);
    setError(null);
    setOcrProgress(10);
    try {
      const worker = await createWorker('eng');
      setOcrProgress(40);
      const ret = await worker.recognize(imageFile);
      setOcrProgress(80);
      await worker.terminate();
      setOcrProgress(100);

      const recognized = ret.data.text.trim();
      setOcrText(recognized);

      // Now run analysis on extracted OCR text
      if (recognized.length > 5) {
        const res = await analysisService.analyzeScamMessage({ text: recognized, channel: 'SCREENSHOT_OCR' });
        setOcrResult(res);
      }
    } catch (err: any) {
      console.error("OCR Error:", err);
      setError("Failed to run OCR on image. You can copy-paste the text manually.");
    } finally {
      setLoadingOcr(false);
    }
  };

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupTarget.trim()) return;
    setError(null);
    setLoadingLookup(true);
    try {
      const payload: any = {};
      if (lookupType === 'PHONE') {
        payload.phone_number = lookupTarget;
      } else {
        payload.email_address = lookupTarget;
      }
      const res = await api.post('/analysis/lookup', payload);
      setLookupResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Lookup query failed.');
    } finally {
      setLoadingLookup(false);
    }
  };

  const sampleScams = [
    {
      title: "Telegram Task Scam",
      text: "Congratulations! Selected for part-time YouTube review work. Earn ₹3500-₹8000 daily from home. Join Telegram: t.me/vip_task_review. Immediate payout to UPI."
    },
    {
      title: "Electricity Disconnection Alert",
      text: "Dear Consumer, your electricity power will be disconnected tonight at 9.30 PM because your previous month bill was not updated. Please immediately contact our electricity officer at 9876543210. Thank you."
    },
    {
      title: "Bank KYC Netbanking Suspension",
      text: "Your SBI Bank account has been blocked due to pending PAN/KYC document submission. Kindly update immediately by clicking here: http://sbi-kyc-verify-update.com or your debit card will be terminated."
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-navy-800 border border-cyan-500/30 text-xs font-mono text-cyan-400">
          <Search className="w-3.5 h-3.5" />
          <span>MODULE 1: ONLINE CRIME ANALYZER SUITE</span>
        </div>
        <h1 className="text-3xl font-black text-white">Multi-Vector Threat & Scam Analyzer</h1>
        <p className="text-sm text-slate-300 max-w-xl mx-auto">
          Comprehensive citizen defense: analyze suspicious text solicitations, extract and inspect screenshot evidence via OCR, or perform defensive phone/email intelligence checks.
        </p>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="flex border-b border-navy-800 space-x-2 text-xs font-mono">
        <button
          onClick={() => { setActiveTab('text'); setError(null); }}
          className={`py-3 px-4 font-bold border-b-2 flex items-center space-x-2 transition ${
            activeTab === 'text'
              ? 'border-cyan-400 text-cyan-400 bg-navy-900/40'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>Message & Offer Text</span>
        </button>
        <button
          onClick={() => { setActiveTab('ocr'); setError(null); }}
          className={`py-3 px-4 font-bold border-b-2 flex items-center space-x-2 transition ${
            activeTab === 'ocr'
              ? 'border-cyan-400 text-cyan-400 bg-navy-900/40'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Image className="w-4 h-4" />
          <span>Screenshot OCR & Visual Threat</span>
        </button>
        <button
          onClick={() => { setActiveTab('lookup'); setError(null); }}
          className={`py-3 px-4 font-bold border-b-2 flex items-center space-x-2 transition ${
            activeTab === 'lookup'
              ? 'border-cyan-400 text-cyan-400 bg-navy-900/40'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <PhoneCall className="w-4 h-4" />
          <span>Phone & Email Intelligence</span>
        </button>
      </div>

      {error && (
        <div className="p-3.5 bg-red-950/60 border border-red-800 rounded-lg text-xs text-red-300 flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* --- TAB 1: TEXT ANALYSIS --- */}
      {activeTab === 'text' && (
        <div className="space-y-6">
          <div className="bg-navy-900 border border-navy-700 rounded-xl p-6 shadow-xl space-y-4">
            <form onSubmit={handleAnalyzeText} className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Paste Suspicious Text Content
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
                placeholder="e.g., 'Dear customer, your bank account is suspended due to pending KYC...'"
                className="w-full bg-navy-950 border border-navy-700 rounded-lg p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono transition"
              />

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
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
                  disabled={loadingText || !text.trim()}
                  className="w-full sm:w-auto px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-bold rounded-lg transition disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  <span>{loadingText ? 'Analyzing Indicators...' : 'Analyze Message'}</span>
                  <Sparkles className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>

          {textResult && <ResultCard result={textResult} />}
        </div>
      )}

      {/* --- TAB 2: SCREENSHOT OCR SCANNER --- */}
      {activeTab === 'ocr' && (
        <div className="space-y-6">
          <div className="bg-navy-900 border border-navy-700 rounded-xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Image className="w-4 h-4 text-cyan-400" />
              <span>Upload Screenshot of Suspicious Message or Website</span>
            </h3>
            <p className="text-xs text-slate-300">
              Performs optical character recognition (OCR) securely in your browser, displays extracted text for your review, and scans for hidden scam markers.
            </p>

            <div className="border-2 border-dashed border-navy-700 hover:border-cyan-500/50 rounded-xl p-6 text-center cursor-pointer bg-navy-950/60 transition">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="ocr-upload"
              />
              <label htmlFor="ocr-upload" className="cursor-pointer space-y-2 block">
                <Upload className="w-8 h-8 text-cyan-400 mx-auto" />
                <div className="text-xs font-bold text-white">Click or drag screenshot image here</div>
                <div className="text-[11px] text-slate-400">Supports PNG, JPG, JPEG (Max 15MB)</div>
              </label>
            </div>

            {imagePreview && (
              <div className="space-y-4 pt-2">
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-navy-950 p-4 rounded-lg border border-navy-800">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-40 rounded border border-navy-700 object-contain"
                  />
                  <div className="space-y-2 text-xs">
                    <div className="font-bold text-white">{imageFile?.name}</div>
                    <div className="text-slate-400 font-mono">Size: {((imageFile?.size || 0) / 1024).toFixed(1)} KB</div>
                    <button
                      onClick={runOcrScan}
                      disabled={loadingOcr}
                      className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-bold rounded transition disabled:opacity-50 flex items-center space-x-1.5"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${loadingOcr ? 'animate-spin' : ''}`} />
                      <span>{loadingOcr ? `Processing OCR (${ocrProgress}%)...` : 'Extract Text with OCR'}</span>
                    </button>
                  </div>
                </div>

                {/* Extracted Text Review Box (Section 3.3 Requirement) */}
                {ocrText && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-300 uppercase tracking-wider">
                        Extracted Text (Review before treating as evidence):
                      </span>
                      <span className="text-[11px] text-emerald-400 font-mono">✓ OCR Succeeded</span>
                    </div>
                    <textarea
                      rows={4}
                      value={ocrText}
                      onChange={(e) => setOcrText(e.target.value)}
                      className="w-full bg-navy-950 border border-navy-700 rounded-lg p-3 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {ocrResult && <ResultCard result={ocrResult} />}
        </div>
      )}

      {/* --- TAB 3: PHONE & EMAIL LOOKUP --- */}
      {activeTab === 'lookup' && (
        <div className="space-y-6">
          <div className="bg-navy-900 border border-navy-700 rounded-xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <PhoneCall className="w-4 h-4 text-cyan-400" />
              <span>Defensive Phone & Email Reputation Check</span>
            </h3>
            <p className="text-xs text-slate-300">
              Evaluates disposable VoIP providers, burner domains, international country code anomalies, and prior incident reports.
            </p>

            <form onSubmit={handleLookup} className="space-y-4">
              <div className="flex space-x-4 text-xs font-mono">
                <label className="flex items-center space-x-1.5 cursor-pointer text-slate-300">
                  <input
                    type="radio"
                    name="lookupType"
                    checked={lookupType === 'PHONE'}
                    onChange={() => { setLookupType('PHONE'); setLookupTarget(''); setLookupResult(null); }}
                    className="text-cyan-500"
                  />
                  <span>Phone Number</span>
                </label>
                <label className="flex items-center space-x-1.5 cursor-pointer text-slate-300">
                  <input
                    type="radio"
                    name="lookupType"
                    checked={lookupType === 'EMAIL'}
                    onChange={() => { setLookupType('EMAIL'); setLookupTarget(''); setLookupResult(null); }}
                    className="text-cyan-500"
                  />
                  <span>Email Address</span>
                </label>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={lookupTarget}
                  onChange={(e) => setLookupTarget(e.target.value)}
                  placeholder={lookupType === 'PHONE' ? "+91 9876543210 or +62 812..." : "scammer@sharklasers.com or name@domain.com"}
                  className="flex-1 bg-navy-950 border border-navy-700 rounded-lg px-4 py-2.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-400"
                />
                <button
                  type="submit"
                  disabled={loadingLookup}
                  className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-bold rounded-lg text-xs font-mono transition disabled:opacity-50 flex items-center space-x-1.5"
                >
                  <span>{loadingLookup ? 'Checking...' : 'Check Reputation'}</span>
                  <Search className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>

          {lookupResult && (
            <div className="bg-navy-900 border border-navy-700 rounded-xl p-6 shadow-2xl space-y-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-navy-800 gap-3 font-mono">
                <div>
                  <div className="text-xs text-slate-400 uppercase">Evaluated Target</div>
                  <h3 className="text-lg font-bold text-white mt-0.5">{lookupResult.target_defanged}</h3>
                  <div className="text-xs text-cyan-400 mt-1">Status: {lookupResult.reputation_status}</div>
                </div>
                <div className="text-right">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      lookupResult.risk_level === 'CRITICAL'
                        ? 'bg-red-950 text-red-400 border border-red-800'
                        : lookupResult.risk_level === 'HIGH'
                        ? 'bg-orange-950 text-orange-400 border border-orange-800'
                        : lookupResult.risk_level === 'MEDIUM'
                        ? 'bg-amber-950 text-amber-400 border border-amber-800'
                        : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    }`}
                  >
                    {lookupResult.risk_level} RISK ({lookupResult.risk_score}/100)
                  </span>
                </div>
              </div>

              {lookupResult.detected_indicators && lookupResult.detected_indicators.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                    Detection Indicators:
                  </h4>
                  <div className="space-y-2">
                    {lookupResult.detected_indicators.map((ind: any, idx: number) => (
                      <div key={idx} className="bg-navy-950 p-3 rounded-lg border border-navy-800 text-xs">
                        <div className="font-bold text-cyan-300 font-mono">{ind.name}</div>
                        <div className="text-slate-300 mt-0.5">{ind.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-cyan-950/20 border border-cyan-800/40 p-4 rounded-lg space-y-1.5 text-xs">
                <div className="font-bold text-cyan-400 uppercase font-mono">Safety Instructions:</div>
                <ul className="space-y-1 text-slate-200">
                  {lookupResult.recommendations.map((rec: string, idx: number) => (
                    <li key={idx}>• {rec}</li>
                  ))}
                </ul>
              </div>

              <div className="text-[11px] text-slate-500 italic">
                {lookupResult.disclaimer}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Reusable Result Card for Text & OCR
const ResultCard: React.FC<{ result: AnalysisResult }> = ({ result }) => {
  return (
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

      <div className="space-y-1">
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">Analysis Summary</h4>
        <p className="text-sm text-slate-200 leading-relaxed bg-navy-950 p-4 rounded-lg border border-navy-800">
          {result.explanation}
        </p>
      </div>

      {result.detection_indicators && result.detection_indicators.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">Detection Indicators</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {result.detection_indicators.map((ind, idx) => (
              <div key={idx} className="bg-navy-950/80 border border-navy-800 p-3 rounded-lg space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-300 font-mono">{ind.name}</span>
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

      <div className="bg-cyan-950/20 border border-cyan-800/40 p-4 rounded-lg space-y-2">
        <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center space-x-1.5 font-mono">
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

      <div className="text-[11px] text-slate-500 italic">
        <strong>Platform Limitation:</strong> {result.limitations || "Automated indicator detection provides risk intelligence and is not formal judicial evidence."}
      </div>
    </div>
  );
};
