import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { incidentService } from '../../services/api';
import { IncidentReport } from '../../types';
import { Sparkles, Send, Copy } from 'lucide-react';

export const CopilotWorkspace: React.FC = () => {
  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const [selectedIncidentId, setSelectedIncidentId] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const data = await incidentService.listIncidents();
        setIncidents(data);
        if (data.length > 0) {
          setSelectedIncidentId(data[0].id);
        }
      } catch (err) {
        console.error("Failed to load incidents for copilot:", err);
      }
    };
    fetchIncidents();
  }, []);

  const handleSendPrompt = async (promptToSend?: string) => {
    const q = (promptToSend || query).trim();
    if (!q || !selectedIncidentId) return;
    setLoading(true);
    try {
      const res = await api.post('/investigation/chat', {
        incident_id: selectedIncidentId,
        query: q
      });
      setChatHistory((prev) => [
        ...prev,
        {
          id: Date.now(),
          query: q,
          response: res.data.response_text,
          action_items: res.data.action_items,
          forensic_notes: res.data.forensic_notes
        }
      ]);
      setQuery('');
    } catch (err) {
      console.error("Copilot error:", err);
    } finally {
      setLoading(false);
    }
  };

  const copyText = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const selectedInc = incidents.find((i) => i.id === selectedIncidentId);

  return (
    <div className="container mx-auto px-4 py-8 space-y-6 max-w-5xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-navy-800">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs font-semibold">
            <Sparkles className="w-4 h-4" />
            <span>MODULE 12: AI INVESTIGATION COPILOT WORKSPACE</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white mt-1">Analyst Case Copilot</h1>
          <p className="text-xs text-slate-400">
            Advisory assistant for formal police complaints, cross-syndicate correlation, and forensic preservation.
          </p>
        </div>

        {/* Incident Selector */}
        <div className="flex items-center space-x-2 font-mono text-xs">
          <span className="text-slate-400">Active Case:</span>
          <select
            value={selectedIncidentId}
            onChange={(e) => setSelectedIncidentId(e.target.value)}
            className="bg-navy-900 border border-navy-700 rounded-lg px-3 py-1.5 text-cyan-300 font-bold focus:outline-none focus:border-cyan-400"
          >
            {incidents.map((inc) => (
              <option key={inc.id} value={inc.id}>
                {inc.reference_code} — {inc.category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedInc && (
        <div className="p-3 bg-navy-900/60 rounded-lg border border-navy-800 text-xs text-slate-300 flex items-center justify-between font-mono">
          <div>
            Case: <span className="text-white font-bold">{selectedInc.reference_code}</span> ({selectedInc.title})
          </div>
          <span className="text-cyan-400 uppercase">{selectedInc.category}</span>
        </div>
      )}

      {/* Quick Prompt Chips */}
      <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
        <span className="text-slate-400 text-[11px]">Quick Directives:</span>
        <button
          onClick={() => handleSendPrompt("Draft formal police FIR complaint memo under Section 66D IT Act")}
          className="px-3 py-1 bg-navy-800 hover:bg-navy-700 border border-cyan-800/80 rounded-lg text-cyan-300 transition"
        >
          Draft FIR Complaint Memo
        </button>
        <button
          onClick={() => handleSendPrompt("Provide digital forensic triage protocol and device isolation")}
          className="px-3 py-1 bg-navy-800 hover:bg-navy-700 border border-amber-800/80 rounded-lg text-amber-300 transition"
        >
          Device Forensic Triage
        </button>
        <button
          onClick={() => handleSendPrompt("Analyze cross-campaign infrastructure correlation")}
          className="px-3 py-1 bg-navy-800 hover:bg-navy-700 border border-purple-800/80 rounded-lg text-purple-300 transition"
        >
          Correlate Threat Clusters
        </button>
      </div>

      {/* Chat / Analysis Output Stream */}
      <div className="bg-navy-900 border border-navy-800 rounded-xl p-6 min-h-[380px] max-h-[600px] overflow-y-auto space-y-6 shadow-2xl">
        {chatHistory.length === 0 ? (
          <div className="py-20 text-center text-slate-500 font-mono text-xs space-y-3">
            <Sparkles className="w-8 h-8 mx-auto text-slate-600" />
            <div>Select a directive above or ask the Copilot to synthesize evidence, draft memos, or inspect forensic angles.</div>
          </div>
        ) : (
          chatHistory.map((item, idx) => (
            <div key={item.id} className="space-y-4 pt-4 border-t first:pt-0 first:border-0 border-navy-800">
              {/* User Prompt */}
              <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
                <span className="px-1.5 py-0.5 rounded bg-navy-800 text-cyan-300 font-bold">ANALYST QUERY</span>
                <span className="text-white font-medium">{item.query}</span>
              </div>

              {/* Copilot Response Bubble */}
              <div className="bg-navy-950 border border-navy-800 p-5 rounded-xl space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-navy-800">
                  <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>CYBERSHIELD INVESTIGATION COPILOT</span>
                  </div>
                  <button
                    onClick={() => copyText(item.response, idx)}
                    className="p-1 rounded bg-navy-800 hover:bg-navy-700 text-slate-400 hover:text-white transition flex items-center space-x-1 text-[10px] font-mono"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedIdx === idx ? 'Copied' : 'Copy Memo'}</span>
                  </button>
                </div>

                <div className="text-xs text-slate-200 whitespace-pre-line leading-relaxed font-mono">
                  {item.response}
                </div>

                {item.action_items && item.action_items.length > 0 && (
                  <div className="bg-cyan-950/20 border border-cyan-800/40 p-3 rounded-lg space-y-1 text-xs">
                    <span className="font-bold text-cyan-400 uppercase font-mono text-[10px]">Recommended Operational Next Steps:</span>
                    <ul className="space-y-0.5 text-slate-200">
                      {item.action_items.map((act: string, aIdx: number) => (
                        <li key={aIdx} className="flex items-start space-x-2">
                          <span className="text-cyan-400">✓</span>
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {item.forensic_notes && (
                  <div className="text-[10px] text-slate-500 font-mono italic">
                    Legal & Forensic Context: {item.forensic_notes}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendPrompt();
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask copilot: 'Draft formal FIR complaint', 'Check shared indicators', 'Suggest Android SIM swap forensics'..."
          className="flex-1 bg-navy-950 border border-navy-700 rounded-lg px-4 py-3 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-400"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-bold rounded-lg transition disabled:opacity-50 flex items-center space-x-1.5 font-mono text-xs"
        >
          <span>{loading ? 'Synthesizing...' : 'Send'}</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
