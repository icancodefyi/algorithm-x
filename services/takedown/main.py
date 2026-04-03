import time
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import config
from engine.loader import load_dataset
from routers import guidance


@asynccontextmanager
async def lifespan(app: FastAPI):
    count = load_dataset(config.DATA_PATH)
    print(f"[takedown] startup — {count} domains indexed from {config.DATA_PATH}")
    yield
    print("[takedown] shutdown")


app = FastAPI(
    title=config.SERVICE_NAME,
    version=config.VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url=None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["*"],
)

app.include_router(
    guidance.router,
    prefix="/api/v1/takedown",
    tags=["Takedown"],
)


@app.get("/", include_in_schema=False)
def root():
    return {
        "service": config.SERVICE_NAME,
        "status": "running",
        "version": config.VERSION,
    }


@app.get("/health", include_in_schema=False)
def health():
    return {"status": "ok", "timestamp": time.time()}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=config.PORT, reload=True)
