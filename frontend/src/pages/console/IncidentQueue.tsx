import React, { useEffect, useState } from 'react';
import { incidentService } from '../../services/api';
import { IncidentReport } from '../../types';
import api from '../../services/api';
import { ShieldAlert, Search, RefreshCw, FileText, Sparkles, ArrowRight } from 'lucide-react';

export const IncidentQueue: React.FC = () => {
  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<IncidentReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // AI Assistant state
  const [aiSynthesis, setAiSynthesis] = useState<any>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  // Status update state
  const [newStatus, setNewStatus] = useState('UNDER_REVIEW');
  const [analystNote, setAnalystNote] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (categoryFilter !== 'ALL') params.category = categoryFilter;
      if (statusFilter !== 'ALL') params.status = statusFilter;
      const data = await incidentService.listIncidents(params);
      setIncidents(data);
      if (data.length > 0 && !selectedIncident) {
        setSelectedIncident(data[0]);
      }
    } catch (err) {
      console.error("Failed to load incidents:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [categoryFilter, statusFilter]);

  const handleSelectIncident = (inc: IncidentReport) => {
    setSelectedIncident(inc);
    setNewStatus(inc.status);
    setAiSynthesis(null);
    setAnalystNote('');
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIncident) return;
    setUpdating(true);
    try {
      const updated = await incidentService.updateStatus(selectedIncident.id, {
        status: newStatus,
        analyst_note: analystNote
      });
      setSelectedIncident(updated);
      setIncidents((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      setAnalystNote('');
    } catch (err) {
      console.error("Status update error:", err);
    } finally {
      setUpdating(false);
    }
  };

  const runAiSynthesis = async () => {
    if (!selectedIncident) return;
    setLoadingAi(true);
    try {
      const res = await api.get(`/investigation/synthesize/${selectedIncident.id}`);
      setAiSynthesis(res.data);
    } catch (err) {
      console.error("AI Assistant error:", err);
    } finally {
      setLoadingAi(false);
    }
  };

  const filteredIncidents = incidents.filter((inc) => {
    const q = search.toLowerCase();
    return (
      inc.reference_code.toLowerCase().includes(q) ||
      inc.title.toLowerCase().includes(q) ||
      inc.category.toLowerCase().includes(q)
    );
  });

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-navy-800">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs font-semibold">
            <ShieldAlert className="w-4 h-4" />
            <span>MODULE 9: CASE MANAGEMENT & INCIDENT TRIAGE</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white mt-1">Incident Triage Queue</h1>
          <p className="text-xs text-slate-400">
            Review reported cybercrimes, inspect cryptographic evidence hashes, and run AI-assisted synthesis.
          </p>
        </div>

        <button
          onClick={fetchIncidents}
          className="px-3.5 py-2 bg-navy-800 hover:bg-navy-700 border border-navy-700 rounded-lg text-xs font-mono text-slate-300 hover:text-white flex items-center space-x-1.5 transition self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-navy-900 border border-navy-800 p-4 rounded-xl flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search reference code or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-navy-950 border border-navy-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto text-xs font-mono">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-navy-950 border border-navy-700 rounded-lg px-2.5 py-2 text-slate-300 focus:outline-none focus:border-cyan-400"
          >
            <option value="ALL">All Categories</option>
            <option value="FINANCIAL_FRAUD">Financial Fraud</option>
            <option value="PHISHING">Phishing</option>
            <option value="FAKE_JOB">Fake Job Scam</option>
            <option value="SEXTORTION">Sextortion</option>
            <option value="HARASSMENT">Harassment</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-navy-950 border border-navy-700 rounded-lg px-2.5 py-2 text-slate-300 focus:outline-none focus:border-cyan-400"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUBMITTED">SUBMITTED</option>
            <option value="UNDER_REVIEW">UNDER REVIEW</option>
            <option value="CLOSED">CLOSED</option>
            <option value="REFERRED">REFERRED</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Queue on left, Inspector on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Incident List Table */}
        <div className="lg:col-span-5 bg-navy-900 border border-navy-800 rounded-xl overflow-hidden shadow-xl max-h-[700px] flex flex-col">
          <div className="p-3 bg-navy-950 border-b border-navy-800 text-xs font-mono text-slate-400 flex justify-between">
            <span>INCIDENT QUEUE ({filteredIncidents.length})</span>
            <span>SORT: RECENT</span>
          </div>

          <div className="divide-y divide-navy-800/80 overflow-y-auto flex-1 font-mono">
            {filteredIncidents.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No incidents found in this filter range.
              </div>
            ) : (
              filteredIncidents.map((inc) => {
                const isSelected = selectedIncident?.id === inc.id;
                return (
                  <div
                    key={inc.id}
                    onClick={() => handleSelectIncident(inc)}
                    className={`p-3.5 cursor-pointer transition ${
                      isSelected
                        ? 'bg-navy-800/90 border-l-4 border-cyan-400'
                        : 'hover:bg-navy-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-cyan-300">{inc.reference_code}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-navy-950 text-slate-400 border border-navy-800">
                        {inc.status}
                      </span>
                    </div>
                    <div className="text-xs font-sans text-slate-200 font-semibold truncate mt-1">
                      {inc.title}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                      <span>{inc.category.replace(/_/g, ' ')}</span>
                      <span>{new Date(inc.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Incident Detail & AI Assistant Panel */}
        <div className="lg:col-span-7 space-y-6">
          {selectedIncident ? (
            <div className="bg-navy-900 border border-navy-800 rounded-xl p-6 shadow-2xl space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-navy-800 gap-3">
                <div>
                  <div className="text-xs font-mono text-cyan-400">
                    CASE REF: {selectedIncident.reference_code}
                  </div>
                  <h2 className="text-xl font-bold text-white mt-0.5">{selectedIncident.title}</h2>
                  <div className="text-xs text-slate-400 mt-1">
                    Category: <span className="text-slate-200">{selectedIncident.category}</span> • Priority: <span className="text-amber-400 font-bold">{selectedIncident.priority}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <a
                    href={`/api/v1/evidence/report/${selectedIncident.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-navy-800 hover:bg-navy-700 border border-cyan-800 rounded text-xs font-mono text-cyan-300 flex items-center space-x-1 transition"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>PDF Report</span>
                  </a>
                  <button
                    onClick={runAiSynthesis}
                    disabled={loadingAi}
                    className="px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-navy-950 font-bold rounded text-xs font-mono flex items-center space-x-1 shadow-md transition"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{loadingAi ? 'Synthesizing...' : 'AI Assistant'}</span>
                  </button>
                </div>
              </div>

              {/* Narrative Description */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
                  Preserved Chronology & Narrative
                </h4>
                <div className="p-4 bg-navy-950 rounded-lg border border-navy-800 text-xs text-slate-200 whitespace-pre-line leading-relaxed">
                  {selectedIncident.description}
                </div>
              </div>

              {/* AI Assistant Output Card (if synthesized) */}
              {aiSynthesis && (
                <div className="bg-navy-950 border border-cyan-800/80 rounded-xl p-5 space-y-4 shadow-xl">
                  <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs font-bold">
                    <Sparkles className="w-4 h-4" />
                    <span>AI INVESTIGATION ASSISTANT SYNTHESIS</span>
                  </div>

                  <p className="text-xs text-slate-300 italic bg-navy-900/60 p-3 rounded border border-navy-800">
                    "{aiSynthesis.synthesis_summary}"
                  </p>

                  {/* Reconstructed Timeline */}
                  {aiSynthesis.reconstructed_timeline && (
                    <div className="space-y-1.5">
                      <h5 className="text-[11px] font-mono text-slate-400 uppercase">Reconstructed Case Timeline:</h5>
                      <div className="space-y-1 font-mono text-xs">
                        {aiSynthesis.reconstructed_timeline.map((evt: any, idx: number) => (
                          <div key={idx} className="flex items-start space-x-2 text-[11px] text-slate-300">
                            <span className="text-cyan-400">[{evt.time}]</span>
                            <span className="font-bold text-white">{evt.event}:</span>
                            <span className="text-slate-400">{evt.details}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggested Investigator Inquiries */}
                  {aiSynthesis.investigator_inquiries && (
                    <div className="space-y-1.5 pt-2 border-t border-navy-900">
                      <h5 className="text-[11px] font-mono text-amber-400 uppercase">Suggested Investigative Inquiries:</h5>
                      <ul className="space-y-1 text-xs text-slate-300 list-disc list-inside">
                        {aiSynthesis.investigator_inquiries.map((q: string, idx: number) => (
                          <li key={idx}>{q}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Status Update Form for Analyst */}
              <form onSubmit={handleUpdateStatus} className="bg-navy-950 p-4 rounded-xl border border-navy-800 space-y-3 font-mono text-xs">
                <div className="font-bold text-slate-300 uppercase">Update Case Triage State</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Status Transition</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full bg-navy-900 border border-navy-700 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-cyan-400"
                    >
                      <option value="SUBMITTED">SUBMITTED</option>
                      <option value="RECEIVED">RECEIVED</option>
                      <option value="UNDER_REVIEW">UNDER REVIEW</option>
                      <option value="INFO_REQUIRED">INFO REQUIRED</option>
                      <option value="REFERRED">REFERRED TO POLICE (1930)</option>
                      <option value="CLOSED">CLOSED</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Analyst Notes</label>
                    <input
                      type="text"
                      placeholder="Add investigation record note..."
                      value={analystNote}
                      onChange={(e) => setAnalystNote(e.target.value)}
                      className="w-full bg-navy-900 border border-navy-700 rounded px-2.5 py-1.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-bold rounded transition disabled:opacity-50 flex items-center space-x-1.5"
                >
                  <span>{updating ? 'Saving...' : 'Apply Status Update'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-navy-900 border border-navy-800 rounded-xl p-12 text-center text-slate-500 font-mono text-xs">
              Select an incident from the queue on the left to review details and evidence.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
