import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, AlertTriangle, Search, FileLock2, ArrowRight, CheckCircle2, PhoneCall, ExternalLink, Lock } from 'lucide-react';

export const Home: React.FC = () => {
  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 overflow-hidden">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#00B4D8_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-navy-800/80 border border-cyan-500/30 text-xs font-mono text-cyan-400">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>ACTIVE THREAT PROTECTION • INDIA & GLOBAL</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
              Defend Yourself Against <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">Digital Crime</span>.
            </h1>

            <p className="text-lg md:text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto">
              An intelligent, privacy-first cybersecurity platform that helps citizens recognize financial scams, safely inspect malicious URLs, preserve incident evidence, and access rapid reporting resources.
            </p>

            {/* Quick Action CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                to="/analyze"
                className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-navy-950 font-bold rounded-lg shadow-lg shadow-cyan-500/25 flex items-center justify-center space-x-2 transition"
              >
                <Search className="w-5 h-5" />
                <span>Analyze Suspicious Message</span>
              </Link>
              <Link
                to="/phishing-check"
                className="w-full sm:w-auto px-6 py-3.5 bg-navy-800 hover:bg-navy-700 border border-slate-700 hover:border-cyan-500/50 text-white font-medium rounded-lg flex items-center justify-center space-x-2 transition"
              >
                <Lock className="w-5 h-5 text-cyan-400" />
                <span>Safe URL Inspector</span>
              </Link>
              <Link
                to="/report"
                className="w-full sm:w-auto px-6 py-3.5 bg-red-950/60 hover:bg-red-900/60 border border-red-700/60 text-red-300 font-semibold rounded-lg flex items-center justify-center space-x-2 transition"
              >
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <span>Report an Incident</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Guidance Strip */}
      <section className="container mx-auto px-4">
        <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-navy-900 border border-navy-700 rounded-xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center space-x-2 text-red-400 font-bold text-sm tracking-wide">
              <AlertTriangle className="w-4 h-4" />
              <span>VICTIM OF FINANCIAL FRAUD? ACT IN THE GOLDEN HOUR</span>
            </div>
            <h3 className="text-xl font-bold text-white">Every minute counts to freeze stolen funds.</h3>
            <p className="text-sm text-slate-300">
              Under Indian cyber defense directives, reporting UPI or banking cyber fraud to <strong>1930</strong> within 2 hours enables financial intermediaries to place lien holds on recipient scam accounts.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <a
              href="tel:1930"
              className="px-5 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg flex items-center justify-center space-x-2 transition shadow-md shadow-red-900/50"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Call Helpline 1930</span>
            </a>
            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 bg-navy-700 hover:bg-navy-600 border border-slate-600 text-slate-200 font-medium rounded-lg flex items-center justify-center space-x-2 transition"
            >
              <span>National Portal</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Core Defense Capabilities */}
      <section className="container mx-auto px-4 space-y-8">
        <div className="text-center space-y-3">
          <h2 className="text-2xl md:text-3xl font-black text-white">How CYBERSHIELD Protects You</h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-base">
            Multi-tiered cybersecurity capabilities designed for real-world threat vectors targeting citizens and institutions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-navy-900/90 border border-navy-700/80 hover:border-cyan-500/40 rounded-xl p-6 space-y-4 transition group">
            <div className="p-3 w-fit rounded-lg bg-navy-800 text-cyan-400 group-hover:scale-105 transition-transform">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Scam Pattern Classification</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Analyze unsolicited SMS, WhatsApp messages, and fake job letters. Evaluates urgency triggers, advance-fee traps, impersonation indicators, and known fraudulent signatures.
            </p>
            <Link to="/analyze" className="inline-flex items-center text-xs font-semibold text-cyan-400 group-hover:underline">
              Test suspicious text <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          <div className="bg-navy-900/90 border border-navy-700/80 hover:border-cyan-500/40 rounded-xl p-6 space-y-4 transition group">
            <div className="p-3 w-fit rounded-lg bg-navy-800 text-cyan-400 group-hover:scale-105 transition-transform">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Zero-Trust URL Sandboxing</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Safely inspect suspicious links without exposing your computer or device. Strict SSRF protection and lexical heuristics detect banking typosquats and credential harvesters.
            </p>
            <Link to="/phishing-check" className="inline-flex items-center text-xs font-semibold text-cyan-400 group-hover:underline">
              Scan URL safely <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          <div className="bg-navy-900/90 border border-navy-700/80 hover:border-cyan-500/40 rounded-xl p-6 space-y-4 transition group">
            <div className="p-3 w-fit rounded-lg bg-navy-800 text-cyan-400 group-hover:scale-105 transition-transform">
              <FileLock2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Cryptographic Evidence Vault</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Preserve screenshots, transaction UTRs, and chat logs with SHA-256 cryptographic hashes. Generate an official Evidence Assistance PDF ready for formal police complaint filing.
            </p>
            <Link to="/report" className="inline-flex items-center text-xs font-semibold text-cyan-400 group-hover:underline">
              Report & preserve evidence <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* Privacy First Commitment */}
      <section className="container mx-auto px-4">
        <div className="bg-navy-900/50 border border-navy-800 rounded-xl p-8 max-w-4xl mx-auto space-y-6">
          <div className="flex items-center space-x-3 text-cyan-400">
            <ShieldCheck className="w-6 h-6" />
            <h3 className="text-xl font-bold text-white">Our Privacy-First Architecture</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-300">
            <div className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              <span><strong>Victim Data Isolation:</strong> Citizen evidence is never published to public threat feeds or exposed without consent.</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              <span><strong>Anonymous Reporting:</strong> Citizens can report scams and preserve evidence without revealing identity.</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              <span><strong>No Arbitrary Egress:</strong> Backend URL inspection strictly blocks internal networks, cloud metadata, and private IP ranges.</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              <span><strong>Transparent Explanations:</strong> Detections always provide clear indicators, not black-box automated accusations.</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
