import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { incidentService } from '../../services/api';
import { IncidentReport } from '../../types';
import { Search, Clock, AlertCircle, FileText, Download } from 'lucide-react';

export const TrackStatus: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [refCode, setRefCode] = useState(searchParams.get('ref') || '');
  const [report, setReport] = useState<IncidentReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initialRef = searchParams.get('ref');
    if (initialRef) {
      handleSearch(initialRef);
    }
  }, [searchParams]);

  const handleSearch = async (codeToSearch?: string) => {
    const code = (codeToSearch || refCode).trim();
    if (!code) return;
    setError(null);
    setLoading(true);
    try {
      const res = await incidentService.trackIncident(code);
      setReport(res);
    } catch (err: any) {
      setReport(null);
      setError(err.response?.data?.detail || 'Incident reference not found. Please verify the code.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return <span className="px-2.5 py-1 rounded font-mono text-xs font-bold bg-blue-950 text-blue-400 border border-blue-800">SUBMITTED</span>;
      case 'RECEIVED':
        return <span className="px-2.5 py-1 rounded font-mono text-xs font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">RECEIVED</span>;
      case 'UNDER_REVIEW':
        return <span className="px-2.5 py-1 rounded font-mono text-xs font-bold bg-amber-950 text-amber-400 border border-amber-800">UNDER REVIEW</span>;
      case 'INFO_REQUIRED':
        return <span className="px-2.5 py-1 rounded font-mono text-xs font-bold bg-orange-950 text-orange-400 border border-orange-800">ADDITIONAL INFO REQUIRED</span>;
      case 'CLOSED':
        return <span className="px-2.5 py-1 rounded font-mono text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">CLOSED</span>;
      case 'REFERRED':
        return <span className="px-2.5 py-1 rounded font-mono text-xs font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">REFERRED TO OFFICIAL CHANNELS</span>;
      default:
        return <span className="px-2.5 py-1 rounded font-mono text-xs font-bold bg-navy-800 text-slate-300">{status}</span>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl space-y-8">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-navy-800 border border-cyan-500/30 text-xs font-mono text-cyan-400">
          <Clock className="w-3.5 h-3.5" />
          <span>INCIDENT LIFECYCLE TRACKER</span>
        </div>
        <h1 className="text-3xl font-black text-white">Track Incident Status</h1>
        <p className="text-sm text-slate-300 max-w-md mx-auto">
          Enter your unique reference code (e.g. CS-2026-XXXXX) to check current triage progress, analyst review notes, and evidence preservation logs.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="bg-navy-900 border border-navy-700 rounded-xl p-6 shadow-xl space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={refCode}
              onChange={(e) => setRefCode(e.target.value.toUpperCase())}
              placeholder="e.g. CS-2026-98124"
              className="w-full bg-navy-950 border border-navy-700 rounded-lg px-4 py-2.5 text-white font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !refCode.trim()}
            className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-bold rounded-lg transition disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            <Search className="w-4 h-4" />
            <span>{loading ? 'Searching...' : 'Track'}</span>
          </button>
        </form>

        {error && (
          <div className="p-3 bg-red-950/60 border border-red-800 rounded-lg text-xs text-red-300 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Report Status Detail */}
      {report && (
        <div className="bg-navy-900 border border-navy-700 rounded-xl p-6 md:p-8 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-navy-800 gap-3">
            <div>
              <div className="text-xs font-mono text-cyan-400">REFERENCE: {report.reference_code}</div>
              <h2 className="text-xl font-bold text-white mt-0.5">{report.title}</h2>
              <div className="text-xs text-slate-400 mt-1">
                Category: <span className="text-slate-200">{report.category.replace(/_/g, ' ')}</span> • Reported on {new Date(report.created_at).toLocaleDateString()}
              </div>
            </div>
            <div>{getStatusBadge(report.status)}</div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Report Description</h4>
            <p className="text-sm text-slate-200 bg-navy-950 p-4 rounded-lg border border-navy-800 whitespace-pre-line">
              {report.description}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-lg bg-navy-950 border border-navy-800 space-y-1">
              <span className="text-slate-400">Privacy Status:</span>
              <div className="text-slate-200 font-medium">
                {report.is_anonymous ? 'Anonymous Report' : 'Identified with Contact Info'}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-navy-950 border border-navy-800 space-y-1">
              <span className="text-slate-400">Threat Correlation Consent:</span>
              <div className="text-slate-200 font-medium">
                {report.consent_share_intel ? 'Granted (Anonymized IOCs correlated)' : 'Withheld (Private only)'}
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-navy-800 flex items-center justify-between">
            <a
              href={`/api/v1/evidence/report/${report.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300 bg-navy-950 px-3.5 py-2 rounded-lg border border-cyan-800/60 hover:border-cyan-400 transition"
            >
              <FileText className="w-4 h-4" />
              <span>Download Official PDF Assistance Report</span>
              <Download className="w-3.5 h-3.5" />
            </a>
            <span className="text-[11px] text-slate-500 font-mono">SHA-256 Verified Vault</span>
          </div>
        </div>
      )}
    </div>
  );
};
