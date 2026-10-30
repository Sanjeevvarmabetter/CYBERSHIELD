import React, { useEffect, useState } from 'react';
import { intelligenceService } from '../../services/api';
import { ThreatIndicator } from '../../types';
import { Terminal, Shield, AlertTriangle, Activity, Database, Network, Search, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ConsoleDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [indicators, setIndicators] = useState<ThreatIndicator[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [m, ind] = await Promise.all([
        intelligenceService.getDashboardMetrics(),
        intelligenceService.getIndicators()
      ]);
      setMetrics(m);
      setIndicators(ind);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredIndicators = indicators.filter((ioc) => {
    const matchesSearch =
      ioc.normalized_value.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ioc.defanged_value.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'ALL' || ioc.indicator_type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Console Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-navy-800">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs font-semibold">
            <Terminal className="w-4 h-4" />
            <span>CYBERSHIELD INTELLIGENCE OPERATIONS CONSOLE</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white mt-1">Threat Intelligence & Triage Matrix</h1>
          <p className="text-xs text-slate-400">
            Cross-incident correlation, malicious infrastructure clusters, and verified IOC ingestion.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchData}
            disabled={loading}
            className="px-3.5 py-2 bg-navy-800 hover:bg-navy-700 border border-navy-700 rounded-lg text-xs font-mono text-slate-300 hover:text-white flex items-center space-x-1.5 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Feeds</span>
          </button>
          <Link
            to="/console/graph"
            className="px-3.5 py-2 bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-bold rounded-lg text-xs font-mono flex items-center space-x-1.5 transition"
          >
            <Network className="w-3.5 h-3.5" />
            <span>Graph Analytics</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-navy-900 border border-navy-800 p-5 rounded-xl shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase">
            <span>Total Reported Incidents</span>
            <Database className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-black text-white font-mono">
            {metrics?.total_incidents ?? '—'}
          </div>
          <div className="text-[11px] text-cyan-400 flex items-center">
            <span>Active Citizen & Anonymized Submissions</span>
          </div>
        </div>

        <div className="bg-navy-900 border border-navy-800 p-5 rounded-xl shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase">
            <span>Triage Queue</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-400 font-mono">
            {metrics?.incidents_under_review ?? '—'}
          </div>
          <div className="text-[11px] text-slate-400">
            Pending analyst review or correlation
          </div>
        </div>

        <div className="bg-navy-900 border border-navy-800 p-5 rounded-xl shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase">
            <span>Critical / High Threats</span>
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-3xl font-black text-red-400 font-mono">
            {metrics?.high_risk_analyses ?? '—'}
          </div>
          <div className="text-[11px] text-red-400/80">
            Detected via heuristic & ML engines
          </div>
        </div>

        <div className="bg-navy-900 border border-navy-800 p-5 rounded-xl shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase">
            <span>Active Indicators (IOCs)</span>
            <Shield className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400 font-mono">
            {metrics?.active_indicators ?? '—'}
          </div>
          <div className="text-[11px] text-slate-400">
            Normalized domains, VPAs, numbers & URLs
          </div>
        </div>
      </div>

      {/* Threat Indicators Table */}
      <div className="bg-navy-900 border border-navy-800 rounded-xl overflow-hidden shadow-xl space-y-4 p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Database className="w-4 h-4 text-cyan-400" />
              <span>Correlated Threat Indicators Database</span>
            </h2>
            <p className="text-xs text-slate-400">
              Defanged indicator representations with verification provenance and confidence metrics.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search indicator..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-navy-950 border border-navy-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full sm:w-auto bg-navy-950 border border-navy-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-400"
            >
              <option value="ALL">All IOC Types</option>
              <option value="DOMAIN">Domains</option>
              <option value="URL">URLs</option>
              <option value="UPI_VPA">UPI Handles</option>
              <option value="PHONE">Phone Numbers</option>
              <option value="IP">IP Addresses</option>
            </select>
          </div>
        </div>

        {/* IOC Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-navy-800 bg-navy-950/60 text-slate-400 font-mono">
                <th className="py-2.5 px-3">TYPE</th>
                <th className="py-2.5 px-3">DEFANGED VALUE</th>
                <th className="py-2.5 px-3">VERIFICATION STATUS</th>
                <th className="py-2.5 px-3">CONFIDENCE</th>
                <th className="py-2.5 px-3">PROVENANCE</th>
                <th className="py-2.5 px-3">REPORTS</th>
                <th className="py-2.5 px-3">TAGS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/60 font-mono">
              {filteredIndicators.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No threat indicators match current query filters.
                  </td>
                </tr>
              ) : (
                filteredIndicators.map((ioc) => (
                  <tr key={ioc.id} className="hover:bg-navy-800/40 transition">
                    <td className="py-2.5 px-3">
                      <span className="px-1.5 py-0.5 rounded bg-navy-800 text-[10px] text-cyan-300 border border-navy-700">
                        {ioc.indicator_type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-200">
                      {ioc.defanged_value}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          ioc.verification_status === 'CONFIRMED'
                            ? 'bg-red-950 text-red-400 border border-red-800'
                            : ioc.verification_status === 'CORROBORATED'
                            ? 'bg-amber-950 text-amber-400 border border-amber-800'
                            : 'bg-blue-950 text-blue-400 border border-blue-800'
                        }`}
                      >
                        {ioc.verification_status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-cyan-400 font-bold">
                      {ioc.confidence_score.toFixed(0)}%
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                      {ioc.source_provenance}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">
                      {ioc.times_reported}x
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex flex-wrap gap-1">
                        {ioc.tags.map((t, idx) => (
                          <span key={idx} className="text-[10px] px-1.5 py-0.5 rounded bg-navy-950 text-slate-400 border border-navy-800">
                            #{t}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
