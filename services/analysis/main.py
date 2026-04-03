from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import hashlib
import io
import time
from typing import Optional

from routers import cases, analysis, registry, dashboard


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Sniffer Analysis Service starting up...")
    yield
    print("Sniffer Analysis Service shutting down...")


app = FastAPI(
    title="Sniffer Analysis API",
    description="Digital Media Authenticity Verification — Analysis Engine",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000","https://sniffer-analysis.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(cases.router, prefix="/api/cases", tags=["Cases"])
app.include_router(analysis.router, prefix="/api/analysis", tags=["Analysis"])
app.include_router(registry.router, prefix="/api/registry", tags=["Registry"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])


@app.get("/")
def root():
    return {"service": "Sniffer Analysis API", "status": "running", "version": "1.0.0"}


@app.get("/health")
def health():
    return {"status": "ok", "timestamp": time.time()}
