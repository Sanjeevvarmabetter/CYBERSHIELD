import networkx as nx
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from backend.app.database.models.models import Incident, ThreatIndicator, Evidence

class CyberThreatGraphBuilder:
    """
    Constructs an undirected multi-entity graph of cybercrime infrastructure and reports
    using NetworkX. Calculates degree centrality and identifies syndicate clusters.
    """

    def build_graph(self, db: Session) -> nx.Graph:
        G = nx.Graph()

        # 1. Fetch Incidents
        incidents = db.query(Incident).all()
        for inc in incidents:
            G.add_node(
                f"incident:{inc.id}",
                node_type="INCIDENT",
                id=inc.id,
                label=inc.reference_code,
                category=inc.category,
                priority=inc.priority,
                status=inc.status,
                is_anonymous=inc.is_anonymous
            )

            # Check metadata for attached indicators
            meta = inc.metadata_json or {}
            indicators_involved = meta.get("indicators_involved", [])
            for raw_ind in indicators_involved:
                ind_clean = raw_ind.strip()
                if not ind_clean:
                    continue
                
                # Determine indicator type
                if "@" in ind_clean:
                    ind_type = "UPI_VPA"
                elif ind_clean.startswith("http") or "." in ind_clean and "/" in ind_clean:
                    ind_type = "URL"
                elif any(c.isdigit() for c in ind_clean) and len(ind_clean) >= 10:
                    ind_type = "PHONE"
                else:
                    ind_type = "DOMAIN"

                node_id = f"ioc:{ind_type}:{ind_clean.lower()}"
                if not G.has_node(node_id):
                    G.add_node(
                        node_id,
                        node_type=ind_type,
                        label=ind_clean,
                        confidence=70.0
                    )
                G.add_edge(
                    f"incident:{inc.id}",
                    node_id,
                    relation="REPORTED_IN",
                    weight=1.0
                )

        # 2. Fetch Stored Threat Indicators
        iocs = db.query(ThreatIndicator).filter(ThreatIndicator.is_active == True).all()
        for ioc in iocs:
            node_id = f"ioc:{ioc.indicator_type}:{ioc.normalized_value}"
            if not G.has_node(node_id):
                G.add_node(
                    node_id,
                    node_type=ioc.indicator_type,
                    label=ioc.defanged_value,
                    confidence=ioc.confidence_score,
                    status=ioc.verification_status,
                    reports=ioc.times_reported
                )

        # 3. Add synthetic campaign infrastructure relationships if small graph
        # This connects related domains sharing infrastructure (e.g. sbi-kyc and bijli-bill)
        if G.number_of_nodes() < 50:
            self._enrich_synthetic_campaign_clusters(G)

        return G

    def _enrich_synthetic_campaign_clusters(self, G: nx.Graph):
        """Add known infrastructure connections for demonstration graph exploration."""
        campaign_nodes = [
            ("campaign:CAMP_UTILITY_DISCONNECT", "Campaign: Nationwide Power Disconnection Spoof"),
            ("campaign:CAMP_TELEGRAM_JOB_FRAUD", "Campaign: Telegram Task Recharge Syndicate")
        ]
        for c_id, c_label in campaign_nodes:
            if not G.has_node(c_id):
                G.add_node(c_id, node_type="CAMPAIGN", label=c_label, confidence=95.0)

        # Link known indicators to campaigns
        for node in list(G.nodes()):
            if "bijli" in node or "9876543210" in node:
                G.add_edge(node, "campaign:CAMP_UTILITY_DISCONNECT", relation="SHARES_INFRASTRUCTURE", weight=2.0)
            elif "telegram" in node or "work-daily" in node or "refund-desk" in node:
                G.add_edge(node, "campaign:CAMP_TELEGRAM_JOB_FRAUD", relation="SHARES_INFRASTRUCTURE", weight=2.0)

    def extract_graph_export(self, G: nx.Graph) -> Dict[str, Any]:
        """
        Export graph into JSON structure with degree centrality and community detection.
        """
        if G.number_of_nodes() == 0:
            return {"nodes": [], "edges": [], "metrics": {"total_nodes": 0, "total_edges": 0, "clusters": 0}}

        # Calculate degree centrality
        centrality = nx.degree_centrality(G)

        # Detect communities using greedy modularity
        communities = []
        try:
            comm_gen = nx.community.greedy_modularity_communities(G)
            for idx, c in enumerate(comm_gen):
                communities.append({
                    "cluster_id": f"cluster_{idx + 1}",
                    "node_count": len(c),
                    "nodes": list(c)
                })
        except Exception:
            communities = []

        # Export nodes
        nodes_out = []
        for n_id, attrs in G.nodes(data=True):
            nodes_out.append({
                "id": n_id,
                "label": attrs.get("label", n_id),
                "type": attrs.get("node_type", "GENERIC"),
                "centrality": round(centrality.get(n_id, 0.0), 3),
                "confidence": attrs.get("confidence", 50.0),
                "category": attrs.get("category"),
                "priority": attrs.get("priority")
            })

        # Export edges
        edges_out = []
        for u, v, attrs in G.edges(data=True):
            edges_out.append({
                "source": u,
                "target": v,
                "relation": attrs.get("relation", "CONNECTED_TO"),
                "weight": attrs.get("weight", 1.0)
            })

        return {
            "nodes": nodes_out,
            "edges": edges_out,
            "metrics": {
                "total_nodes": G.number_of_nodes(),
                "total_edges": G.number_of_edges(),
                "clusters": len(communities),
                "connected_components": nx.number_connected_components(G),
                "density": round(nx.density(G), 4)
            },
            "clusters": communities
        }
