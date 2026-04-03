# Sniffer Analysis Service

FastAPI-based image analysis engine for the Sniffer platform.

## Setup

```bash
# Create and activate a virtual environment
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

## Run

```bash
# Development (hot-reload)
uvicorn main:app --reload --port 8000

# Or via pnpm from the monorepo root
pnpm dev:api
```

## API Docs

Interactive docs available at http://localhost:8000/docs once running.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/cases/` | Create a new verification case |
| GET | `/api/cases/{case_id}` | Retrieve a case |
| POST | `/api/analysis/{case_id}/run` | Run image analysis for a case |
| POST | `/api/registry/` | Register an original image |
| GET | `/api/registry/check/{file_hash}` | Check if a hash matches a registered image |
| GET | `/api/dashboard/` | Get analytics metrics |
| GET | `/health` | Health check |
