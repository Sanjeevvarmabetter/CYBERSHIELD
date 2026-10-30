from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.database.connection import get_db
from backend.app.graph_engine.builder import CyberThreatGraphBuilder

router = APIRouter(prefix="/graph", tags=["Graph Intelligence"])
graph_builder = CyberThreatGraphBuilder()

@router.get("/data")
def get_graph_topology(db: Session = Depends(get_db)):
    """
    Generate NetworkX graph of reported incidents, shared infrastructure, and campaign clusters.
    Returns nodes, edges, centrality metrics, and community detection partitions.
    """
    G = graph_builder.build_graph(db)
    return graph_builder.extract_graph_export(G)
