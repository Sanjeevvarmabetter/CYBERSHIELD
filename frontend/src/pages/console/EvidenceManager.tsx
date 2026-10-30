import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { FileLock2, RefreshCw, CheckCircle2, XCircle, Search, Download, FileText } from 'lucide-react';

interface EvidenceItem {
  id: string;
  incident_id: string;
  reference_code: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  sha256_hash: string;
  created_at: string;
}

export const EvidenceManager: React.FC = () => {
  const [items, setItems] = useState<EvidenceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<{ [id: string]: boolean }>({});

  const fetchEvidence = async () => {
    setLoading(true);
    try {
      const res = await api.get('/evidence');
      setItems(res.data);
    } catch (err) {
      console.error("Failed to load evidence inventory:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvidence();
  }, []);

  const handleVerifyIntegrity = async (id: string) => {
    setVerifyingId(id);
    try {
      const res = await api.get(`/evidence/${id}/verify`);
      setVerificationResult((prev) => ({ ...prev, [id]: res.data.integrity_verified }));
    } catch (err) {
      console.error("Verification failed:", err);
      setVerificationResult((prev) => ({ ...prev, [id]: false }));
    } finally {
      setVerifyingId(null);
    }
  };

  const filteredItems = items.filter((item) => {
    const q = search.toLowerCase();
    return (
      item.file_name.toLowerCase().includes(q) ||
      item.reference_code.toLowerCase().includes(q) ||
      item.sha256_hash.toLowerCase().includes(q)
    );
  });

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-navy-800">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs font-semibold">
            <FileLock2 className="w-4 h-4" />
            <span>MODULE 7: DIGITAL EVIDENCE MANAGEMENT & INTEGRITY</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white mt-1">Cryptographic Evidence Vault</h1>
          <p className="text-xs text-slate-400">
            Immutable custody logs, SHA-256 cryptographic verification, and exportable legal assistance reports.
          </p>
        </div>

        <button
          onClick={fetchEvidence}
          className="px-3.5 py-2 bg-navy-800 hover:bg-navy-700 border border-navy-700 rounded-lg text-xs font-mono text-slate-300 hover:text-white flex items-center space-x-1.5 transition self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Vault</span>
        </button>
      </div>

      <div className="bg-navy-900 border border-navy-800 rounded-xl overflow-hidden shadow-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search filename, reference code, or hash..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-navy-950 border border-navy-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
            />
          </div>
          <span className="text-xs font-mono text-slate-400">
            Secured Items: {filteredItems.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-navy-800 bg-navy-950/60 text-slate-400 font-mono">
                <th className="py-2.5 px-3">CASE REF</th>
                <th className="py-2.5 px-3">FILE NAME</th>
                <th className="py-2.5 px-3">SIZE</th>
                <th className="py-2.5 px-3">SHA-256 CRYPTOGRAPHIC HASH</th>
                <th className="py-2.5 px-3">INTEGRITY STATUS</th>
                <th className="py-2.5 px-3">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/60 font-mono">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No evidence items currently secured in vault.
                  </td>
                </tr>
              ) : (
                filteredItems.map((ev) => {
                  const verified = verificationResult[ev.id];
                  return (
                    <tr key={ev.id} className="hover:bg-navy-800/40 transition">
                      <td className="py-2.5 px-3 font-bold text-cyan-300">
                        {ev.reference_code}
                      </td>
                      <td className="py-2.5 px-3 text-slate-200">
                        {ev.file_name}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                        {(ev.file_size / 1024).toFixed(1)} KB
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 text-[10px]">
                        <span className="bg-navy-950 px-2 py-0.5 rounded border border-navy-800 select-all">
                          {ev.sha256_hash}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        {verified === true ? (
                          <span className="inline-flex items-center text-emerald-400 text-[11px] font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                            VERIFIED MATCH
                          </span>
                        ) : verified === false ? (
                          <span className="inline-flex items-center text-red-400 text-[11px] font-bold">
                            <XCircle className="w-3.5 h-3.5 mr-1" />
                            INTEGRITY FAILED
                          </span>
                        ) : (
                          <button
                            onClick={() => handleVerifyIntegrity(ev.id)}
                            disabled={verifyingId === ev.id}
                            className="px-2 py-1 bg-navy-800 hover:bg-navy-700 border border-cyan-800/80 rounded text-[10px] text-cyan-300 transition"
                          >
                            {verifyingId === ev.id ? 'Checking Hash...' : 'Verify Hash'}
                          </button>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center space-x-2">
                          <a
                            href={`/api/v1/evidence/${ev.id}/download`}
                            title="Download original file"
                            className="p-1 rounded bg-navy-800 hover:bg-navy-700 text-slate-300 hover:text-white"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                          <a
                            href={`/api/v1/evidence/report/${ev.incident_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Download PDF Assistance Report"
                            className="p-1 rounded bg-navy-800 hover:bg-navy-700 text-cyan-400 hover:text-cyan-300"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
