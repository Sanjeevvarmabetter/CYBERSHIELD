import time
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from backend.app.config import settings
from backend.app.database.connection import init_db, SessionLocal
from backend.app.database.seed import seed_initial_data
from backend.app.api import auth, education, analysis, incidents, evidence, intelligence, graph, dashboard, investigation

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize DB and seeds
    init_db()
    with SessionLocal() as db:
        seed_initial_data(db)
    yield
    # Shutdown logic if any

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Digital Crime Prevention & Intelligence Platform API",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"]
)

# Security Headers & Request Timing Middleware
@app.middleware("http")
async def security_headers_and_timing_middleware(request: Request, call_next):
    start_time = time.perf_counter()
    response: Response = await call_next(request)
    process_time = time.perf_counter() - start_time
    
    # Defense-in-depth secure HTTP headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; img-src 'self' data: https:; "
        "script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
    )
    response.headers["X-Process-Time"] = f"{process_time:.4f}s"
    return response

# Include Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(education.router, prefix=settings.API_V1_STR)
app.include_router(analysis.router, prefix=settings.API_V1_STR)
app.include_router(incidents.router, prefix=settings.API_V1_STR)
app.include_router(evidence.router, prefix=settings.API_V1_STR)
app.include_router(intelligence.router, prefix=settings.API_V1_STR)
app.include_router(graph.router, prefix=settings.API_V1_STR)
app.include_router(dashboard.router, prefix=settings.API_V1_STR)
app.include_router(investigation.router, prefix=settings.API_V1_STR)

@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT
    }

@app.get("/", tags=["Root"])
def root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME} API. Visit /api/docs for OpenAPI documentation.",
        "tagline": "Detect. Understand. Protect."
    }
