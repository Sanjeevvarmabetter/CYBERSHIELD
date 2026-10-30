import React, { useEffect, useState } from 'react';
import { educationService } from '../../services/api';
import { SafetyGuide } from '../../types';
import { ShieldCheck, AlertCircle, PhoneCall, CheckCircle2, ChevronDown, ChevronUp, ExternalLink, HelpCircle } from 'lucide-react';

export const SafetyCenter: React.FC = () => {
  const [guides, setGuides] = useState<SafetyGuide[]>([]);
  const [emergency, setEmergency] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedId, setExpandedId] = useState<string | null>("upi-fraud");

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const [guidesRes, emergRes] = await Promise.all([
          educationService.getGuides(),
          educationService.getEmergencyResources()
        ]);
        setGuides(guidesRes.guides);
        setEmergency(emergRes.resources);
      } catch (err) {
        console.error("Failed to load education modules:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchResources();
  }, []);

  const toggleGuide = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl space-y-10">
      {/* Title & Helplines */}
      <div className="space-y-4 text-center">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-navy-800 border border-cyan-500/30 text-xs font-mono text-cyan-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>OFFICIAL PREVENTION & RECOVERY DIRECTIVES</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-white">Public Cyber Safety Center</h1>
        <p className="text-slate-300 max-w-2xl mx-auto text-sm md:text-base">
          Practical, actionable guidance on identifying scam tactics, protecting your digital assets, and knowing exactly what steps to take if targeted.
        </p>
      </div>

      {/* Emergency Contacts Banner */}
      <div className="bg-navy-900 border border-red-900/40 rounded-xl p-6 shadow-xl space-y-4">
        <div className="flex items-center space-x-2 text-red-400 font-bold text-sm">
          <PhoneCall className="w-4 h-4" />
          <span>AUTHORITATIVE INDIAN EMERGENCY CHANNELS</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-navy-950/80 border border-navy-700">
            <div className="text-xs text-slate-400 font-medium">Financial Fraud Helpline</div>
            <div className="text-2xl font-black text-red-400 font-mono mt-1">{emergency?.india?.financial_fraud_helpline || "1930"}</div>
            <div className="text-[11px] text-slate-400 mt-1">Direct line to stop banking/UPI fund diversion</div>
          </div>
          <div className="p-4 rounded-lg bg-navy-950/80 border border-navy-700">
            <div className="text-xs text-slate-400 font-medium">National Cyber Portal</div>
            <a
              href={emergency?.india?.national_cybercrime_portal || "https://cybercrime.gov.in"}
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg font-bold text-cyan-400 hover:underline flex items-center mt-1"
            >
              cybercrime.gov.in <ExternalLink className="w-3.5 h-3.5 ml-1" />
            </a>
            <div className="text-[11px] text-slate-400 mt-1">Official central complaint repository</div>
          </div>
          <div className="p-4 rounded-lg bg-navy-950/80 border border-navy-700">
            <div className="text-xs text-slate-400 font-medium">CERT-In Emergency</div>
            <a
              href={emergency?.india?.cert_in || "https://www.cert-in.org.in"}
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg font-bold text-cyan-400 hover:underline flex items-center mt-1"
            >
              cert-in.org.in <ExternalLink className="w-3.5 h-3.5 ml-1" />
            </a>
            <div className="text-[11px] text-slate-400 mt-1">Incident Response Advisory</div>
          </div>
          <div className="p-4 rounded-lg bg-navy-950/80 border border-navy-700">
            <div className="text-xs text-slate-400 font-medium">Women Cyber Safety</div>
            <div className="text-xl font-black text-amber-400 font-mono mt-1">{emergency?.india?.national_commission_for_women || "7827170170"}</div>
            <div className="text-[11px] text-slate-400 mt-1">National Commission for Women Helpline</div>
          </div>
        </div>
      </div>

      {/* Interactive Safety Guides Accordion */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <HelpCircle className="w-5 h-5 text-cyan-400" />
          <span>Threat Vector Guides</span>
        </h2>

        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading safety guides from knowledge base...</div>
        ) : (
          <div className="space-y-3">
            {guides.map((guide) => {
              const isExpanded = expandedId === guide.id;
              return (
                <div
                  key={guide.id}
                  className="bg-navy-900 border border-navy-700 rounded-xl overflow-hidden transition"
                >
                  <button
                    onClick={() => toggleGuide(guide.id)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-navy-800/50 transition"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-3">
                        <span className="font-bold text-white text-base md:text-lg">{guide.title}</span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                            guide.severity === 'CRITICAL'
                              ? 'bg-red-950 text-red-400 border border-red-800'
                              : 'bg-amber-950 text-amber-400 border border-amber-800'
                          }`}
                        >
                          {guide.severity} RISK
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{guide.subtitle}</p>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="px-6 pb-6 pt-2 border-t border-navy-800/80 space-y-6 text-sm">
                      <p className="text-slate-300 leading-relaxed">{guide.overview}</p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* How it Operates */}
                        <div className="bg-navy-950/60 p-4 rounded-lg border border-navy-800 space-y-2">
                          <h4 className="font-bold text-slate-200 text-xs tracking-wider uppercase flex items-center space-x-1.5 text-cyan-400">
                            <span>How Fraudsters Execute It</span>
                          </h4>
                          <ul className="space-y-1.5 text-slate-300 text-xs">
                            {guide.how_it_operates.map((step, idx) => (
                              <li key={idx} className="flex items-start space-x-2">
                                <span className="font-mono text-cyan-500 font-bold">{idx + 1}.</span>
                                <span>{step}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Warning Signs */}
                        <div className="bg-navy-950/60 p-4 rounded-lg border border-navy-800 space-y-2">
                          <h4 className="font-bold text-slate-200 text-xs tracking-wider uppercase flex items-center space-x-1.5 text-amber-400">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Warning Signs</span>
                          </h4>
                          <ul className="space-y-1.5 text-slate-300 text-xs">
                            {guide.warning_signs.map((sign, idx) => (
                              <li key={idx} className="flex items-start space-x-2">
                                <span className="text-amber-500 font-bold">•</span>
                                <span>{sign}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Action Steps */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-emerald-950/20 border border-emerald-900/30 p-4 rounded-lg space-y-2">
                          <h4 className="font-bold text-emerald-400 text-xs uppercase flex items-center space-x-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Prevention Protocols</span>
                          </h4>
                          <ul className="space-y-1 text-slate-300 text-xs">
                            {guide.prevention_steps.map((prev, idx) => (
                              <li key={idx}>✓ {prev}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="bg-red-950/20 border border-red-900/30 p-4 rounded-lg space-y-2">
                          <h4 className="font-bold text-red-400 text-xs uppercase flex items-center space-x-1.5">
                            <PhoneCall className="w-3.5 h-3.5" />
                            <span>If Targeted / Immediate Action</span>
                          </h4>
                          <ul className="space-y-1 text-slate-300 text-xs">
                            {guide.if_affected.map((act, idx) => (
                              <li key={idx}>⚡ {act}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
