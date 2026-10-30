import React, { useEffect, useState, useRef } from 'react';
import { intelligenceService } from '../../services/api';
import { Network, ZoomIn, ZoomOut, RefreshCw, Info } from 'lucide-react';

interface GraphNode {
  id: string;
  label: string;
  type: string;
  centrality: number;
  confidence: number;
  category?: string;
  priority?: string;
  x?: number;
  y?: number;
}

interface GraphEdge {
  source: string;
  target: string;
  relation: string;
  weight: number;
}

export const GraphView: React.FC = () => {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL');
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const fetchGraph = async () => {
    setLoading(true);
    try {
      const data = await intelligenceService.getGraphData();
      
      // Compute circular/force coordinates for nodes
      const rawNodes: GraphNode[] = data.nodes || [];
      const count = rawNodes.length;
      const radius = Math.min(300, 40 + count * 15);
      const centerX = 400;
      const centerY = 300;

      const positionedNodes = rawNodes.map((n, i) => {
        // Position campaigns near center, indicators in outer orbit
        const isCampaign = n.type === 'CAMPAIGN';
        const r = isCampaign ? radius * 0.35 : radius;
        const angle = (2 * Math.PI * i) / count;
        return {
          ...n,
          x: centerX + r * Math.cos(angle) + (Math.sin(i * 3) * 20),
          y: centerY + r * Math.sin(angle) + (Math.cos(i * 3) * 20)
        };
      });

      setNodes(positionedNodes);
      setEdges(data.edges || []);
      setMetrics(data.metrics || {});
      if (positionedNodes.length > 0) {
        setSelectedNode(positionedNodes[0]);
      }
    } catch (err) {
      console.error("Failed to load graph data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraph();
  }, []);

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'CAMPAIGN':
        return '#EF4444'; // Red
      case 'INCIDENT':
        return '#00B4D8'; // Cyan
      case 'UPI_VPA':
        return '#F59E0B'; // Amber
      case 'DOMAIN':
      case 'URL':
        return '#8B5CF6'; // Purple
      case 'PHONE':
        return '#10B981'; // Emerald
      default:
        return '#3A506B'; // Navy blue
    }
  };

  const filteredNodes = nodes.filter(
    (n) => filterType === 'ALL' || n.type === filterType
  );

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-navy-800">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs font-semibold">
            <Network className="w-4 h-4" />
            <span>MODULE 5: GRAPH-BASED CRIME PATTERN CORRELATION</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white mt-1">
            Suspicious Infrastructure Topology
          </h1>
          <p className="text-xs text-slate-400">
            NetworkX-driven graph analytics identifying multi-incident syndicates, shared UPI VPAs, and domain clusters.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchGraph}
            className="px-3 py-1.5 bg-navy-800 hover:bg-navy-700 border border-navy-700 rounded-lg text-xs font-mono text-slate-300 hover:text-white flex items-center space-x-1 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Recalculate Topology</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs font-mono">
        <div className="p-3 rounded-lg bg-navy-900 border border-navy-800">
          <span className="text-slate-400">Total Entities:</span>
          <div className="text-xl font-bold text-white mt-0.5">{metrics?.total_nodes ?? 0}</div>
        </div>
        <div className="p-3 rounded-lg bg-navy-900 border border-navy-800">
          <span className="text-slate-400">Correlated Edges:</span>
          <div className="text-xl font-bold text-cyan-400 mt-0.5">{metrics?.total_edges ?? 0}</div>
        </div>
        <div className="p-3 rounded-lg bg-navy-900 border border-navy-800">
          <span className="text-slate-400">Syndicate Clusters:</span>
          <div className="text-xl font-bold text-amber-400 mt-0.5">{metrics?.clusters ?? 0}</div>
        </div>
        <div className="p-3 rounded-lg bg-navy-900 border border-navy-800">
          <span className="text-slate-400">Components:</span>
          <div className="text-xl font-bold text-purple-400 mt-0.5">{metrics?.connected_components ?? 0}</div>
        </div>
        <div className="p-3 rounded-lg bg-navy-900 border border-navy-800">
          <span className="text-slate-400">Graph Density:</span>
          <div className="text-xl font-bold text-emerald-400 mt-0.5">{metrics?.density ?? 0}</div>
        </div>
      </div>

      {/* Main Canvas & Details Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Graph Canvas Container */}
        <div className="lg:col-span-3 bg-navy-900/90 border border-navy-800 rounded-xl overflow-hidden relative shadow-2xl h-[560px] flex flex-col">
          {/* Canvas Controls Toolbar */}
          <div className="p-3 bg-navy-950/80 border-b border-navy-800 flex items-center justify-between text-xs z-10">
            <div className="flex items-center space-x-2">
              <span className="text-slate-400 font-mono text-[11px]">Filter Entity:</span>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-navy-900 border border-navy-700 rounded px-2 py-1 text-slate-200 text-xs focus:border-cyan-400 focus:outline-none"
              >
                <option value="ALL">All Entities</option>
                <option value="CAMPAIGN">Campaigns</option>
                <option value="INCIDENT">Incidents</option>
                <option value="DOMAIN">Domains</option>
                <option value="UPI_VPA">UPI Handles</option>
                <option value="PHONE">Phone Numbers</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setZoomLevel((z) => Math.min(z + 0.15, 2.0))}
                className="p-1 rounded bg-navy-800 hover:bg-navy-700 text-slate-300"
                title="Zoom in"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel((z) => Math.max(z - 0.15, 0.6))}
                className="p-1 rounded bg-navy-800 hover:bg-navy-700 text-slate-300"
                title="Zoom out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-[10px] text-slate-400">{(zoomLevel * 100).toFixed(0)}%</span>
            </div>
          </div>

          {/* Interactive SVG Graph Area */}
          <div className="flex-1 overflow-hidden relative flex items-center justify-center bg-[#050914]">
            {loading ? (
              <div className="text-slate-400 font-mono text-xs flex items-center space-x-2">
                <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                <span>Computing graph topology and centrality...</span>
              </div>
            ) : (
              <svg
                ref={svgRef}
                viewBox="0 0 800 600"
                className="w-full h-full cursor-grab active:cursor-grabbing transition-transform"
                style={{ transform: `scale(${zoomLevel})` }}
              >
                {/* Edges */}
                <g className="edges">
                  {edges.map((e, idx) => {
                    const src = nodes.find((n) => n.id === e.source);
                    const tgt = nodes.find((n) => n.id === e.target);
                    if (!src || !tgt || !src.x || !src.y || !tgt.x || !tgt.y) return null;
                    return (
                      <line
                        key={idx}
                        x1={src.x}
                        y1={src.y}
                        x2={tgt.x}
                        y2={tgt.y}
                        stroke="#1C2541"
                        strokeWidth={e.weight * 1.5}
                        strokeDasharray={e.relation === 'SHARES_INFRASTRUCTURE' ? '4 2' : 'none'}
                        className="transition-colors hover:stroke-cyan-400"
                      />
                    );
                  })}
                </g>

                {/* Nodes */}
                <g className="nodes">
                  {filteredNodes.map((n) => {
                    if (!n.x || !n.y) return null;
                    const isSelected = selectedNode?.id === n.id;
                    const radius = n.type === 'CAMPAIGN' ? 18 : Math.max(9, 8 + n.centrality * 20);
                    return (
                      <g
                        key={n.id}
                        transform={`translate(${n.x},${n.y})`}
                        onClick={() => setSelectedNode(n)}
                        className="cursor-pointer group"
                      >
                        <circle
                          r={radius + (isSelected ? 4 : 0)}
                          fill={getNodeColor(n.type)}
                          fillOpacity={isSelected ? 0.95 : 0.75}
                          stroke={isSelected ? '#ffffff' : '#070C18'}
                          strokeWidth={isSelected ? 2.5 : 1.5}
                          className="transition-all"
                        />
                        <text
                          dy={radius + 12}
                          textAnchor="middle"
                          fill={isSelected ? '#00B4D8' : '#94A3B8'}
                          fontSize={9}
                          fontFamily="monospace"
                          fontWeight={isSelected ? 'bold' : 'normal'}
                          className="pointer-events-none select-none"
                        >
                          {n.label.length > 18 ? n.label.substring(0, 16) + '...' : n.label}
                        </text>
                      </g>
                    );
                  })}
                </g>
              </svg>
            )}

            {/* Bottom Legend Overlay */}
            <div className="absolute bottom-3 left-3 bg-navy-950/90 border border-navy-800 p-2.5 rounded-lg text-[10px] flex flex-wrap gap-3 font-mono">
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span className="text-slate-300">Campaign</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                <span className="text-slate-300">Incident</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-slate-300">UPI VPA</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                <span className="text-slate-300">Domain/URL</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-slate-300">Phone</span>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Entity Inspector Panel */}
        <div className="bg-navy-900 border border-navy-800 rounded-xl p-5 shadow-2xl space-y-4">
          <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs pb-3 border-b border-navy-800">
            <Info className="w-4 h-4" />
            <span>ENTITY INSPECTOR</span>
          </div>

          {selectedNode ? (
            <div className="space-y-4 text-xs font-mono">
              <div>
                <span className="text-slate-400 text-[10px] uppercase">Entity Identity</span>
                <div className="text-sm font-bold text-white break-all mt-0.5">{selectedNode.label}</div>
                <div className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-navy-800 text-cyan-300 border border-navy-700">
                  {selectedNode.type}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-navy-800">
                <div className="p-2.5 rounded bg-navy-950 border border-navy-800">
                  <span className="text-slate-400 text-[10px]">Degree Centrality</span>
                  <div className="text-base font-bold text-cyan-400 mt-0.5">
                    {selectedNode.centrality.toFixed(3)}
                  </div>
                </div>
                <div className="p-2.5 rounded bg-navy-950 border border-navy-800">
                  <span className="text-slate-400 text-[10px]">Confidence</span>
                  <div className="text-base font-bold text-emerald-400 mt-0.5">
                    {selectedNode.confidence}%
                  </div>
                </div>
              </div>

              {selectedNode.category && (
                <div>
                  <span className="text-slate-400 text-[10px]">Incident Category:</span>
                  <div className="text-slate-200 mt-0.5">{selectedNode.category}</div>
                </div>
              )}

              {/* Connected Relationships in Graph */}
              <div className="space-y-1.5 pt-2 border-t border-navy-800">
                <span className="text-slate-400 text-[10px] uppercase">Connected Graph Edges:</span>
                <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                  {edges
                    .filter((e) => e.source === selectedNode.id || e.target === selectedNode.id)
                    .map((e, idx) => {
                      const peerId = e.source === selectedNode.id ? e.target : e.source;
                      const peerNode = nodes.find((n) => n.id === peerId);
                      return (
                        <div key={idx} className="p-2 rounded bg-navy-950 border border-navy-800 text-[11px] space-y-0.5">
                          <div className="text-cyan-400 font-bold">{e.relation}</div>
                          <div className="text-slate-300 truncate">{peerNode?.label || peerId}</div>
                        </div>
                      );
                    })}
                </div>
              </div>

              <div className="p-3 rounded bg-amber-950/30 border border-amber-900/40 text-[10px] text-amber-300 leading-relaxed">
                <strong>Forensic Disclaimer:</strong> Shared infrastructure or correlation indicates pattern linkage, not definitive judicial proof of criminal collaboration.
              </div>
            </div>
          ) : (
            <div className="text-slate-500 text-xs py-12 text-center font-mono">
              Click any node in the topology canvas to inspect relationships and centrality metrics.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
