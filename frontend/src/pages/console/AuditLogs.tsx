import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Shield, RefreshCw, Search } from 'lucide-react';

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/dashboard/audit-logs');
      setLogs(res.data);
    } catch (err) {
      console.error("Audit fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const q = search.toLowerCase();
    return (
      log.action.toLowerCase().includes(q) ||
      log.target_entity.toLowerCase().includes(q) ||
      (log.ip_address && log.ip_address.includes(q))
    );
  });

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-navy-800">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs font-semibold">
            <Shield className="w-4 h-4" />
            <span>IMMUTABLE SYSTEM AUDIT TRAIL</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white mt-1">Security Audit Logs</h1>
          <p className="text-xs text-slate-400">
            Cryptographic authentication, evidence access, and status changes recorded with IP and timestamp telemetry.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="px-3.5 py-2 bg-navy-800 hover:bg-navy-700 border border-navy-700 rounded-lg text-xs font-mono text-slate-300 hover:text-white flex items-center space-x-1.5 transition self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Logs</span>
        </button>
      </div>

      <div className="bg-navy-900 border border-navy-800 rounded-xl overflow-hidden shadow-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search action or entity..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-navy-950 border border-navy-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
            />
          </div>
          <span className="text-xs font-mono text-slate-400">Showing {filteredLogs.length} events</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-navy-800 bg-navy-950/60 text-slate-400 font-mono">
                <th className="py-2.5 px-3">TIMESTAMP</th>
                <th className="py-2.5 px-3">ACTION</th>
                <th className="py-2.5 px-3">TARGET ENTITY</th>
                <th className="py-2.5 px-3">TARGET ID</th>
                <th className="py-2.5 px-3">IP ADDRESS</th>
                <th className="py-2.5 px-3">DETAILS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/60 font-mono">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No audit events match search filters.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-navy-800/40 transition">
                    <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-navy-800 text-cyan-300 border border-navy-700">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-200">{log.target_entity}</td>
                    <td className="py-2.5 px-3 text-slate-400 text-[11px] truncate max-w-xs">{log.target_id || '—'}</td>
                    <td className="py-2.5 px-3 text-slate-400 text-[11px]">{log.ip_address || '127.0.0.1'}</td>
                    <td className="py-2.5 px-3 text-slate-400 text-[10px] truncate max-w-xs">
                      {JSON.stringify(log.details)}
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
